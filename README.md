# Personal Finance Copilot — Frontend

A minimal, black-and-white finance copilot. A user onboards with a few basics,
uploads their financial documents, and watches a multi-agent AI pipeline read,
categorize, and analyze them in real time — then lands on a persona-driven
dashboard with the essential graphs and prioritized recommendations, and can tap
through to a chat grounded in their own money.

This repository is the **frontend only**. It talks to a separate FastAPI backend
(FastAPI + Supabase + Groq LLMs) over a JSON HTTP API. See
[`api-reference.md`](./api-reference.md) for the full data contract and
[`frontend-brief.md`](./frontend-brief.md) for the product and design intent.

---

## Highlights

- **Watch the AI work.** The processing screen renders the four pipeline agents
  as connected nodes and animates them `pending → running → done` by polling the
  run status roughly once a second.
- **Persona-driven dashboard.** One clean scroll: a financial-personality card, a
  monochrome health gauge, two focused charts, KPI tiles, and the top
  recommendations sorted by priority.
- **Grounded chat.** A stateless copilot that answers only from the user's
  analyzed metrics. The client owns the conversation history and sends it whole
  on each turn.
- **Restrained design.** Two colors — black and white — with a full gray scale,
  subtle monochrome gradients, and light Framer Motion. Built on shadcn/ui
  (Radix + Tailwind) with the neutral theme.

---

## Tech stack

| Concern | Choice |
|---|---|
| Framework | Next.js (App Router) `16.2.10`, React `19.2` |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Components | shadcn/ui (Radix primitives) + `lucide-react` icons |
| Data fetching | TanStack Query v5 (`refetchInterval` powers run polling) |
| Charts | Recharts |
| Motion | Framer Motion |
| Toasts | Sonner |
| Fonts | Geist + Geist Mono, Playfair Display (editorial serif for headings) |

> Note: the repo pins current, non-legacy versions of Next.js and React. See
> [`AGENTS.md`](./AGENTS.md) — APIs and conventions may differ from older
> Next.js, so consult `node_modules/next/dist/docs/` when in doubt.

---

## Getting started

### Prerequisites

- Node.js 18.18+ (Node 20 LTS recommended)
- npm (a `package-lock.json` is committed)
- The Personal Finance Copilot backend running and reachable (defaults to
  `http://127.0.0.1:8000`)

### Install and run

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Configuration

The frontend needs to know where the backend lives. Set the base URL via an
environment variable (create `.env.local` in the project root):

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://127.0.0.1:8000
```

If unset, it falls back to `http://127.0.0.1:8000` (a trailing slash is
stripped automatically). See [`lib/api/client.ts`](./lib/api/client.ts).

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | Run ESLint |

---

## The user flow

The frontend drives a five-step flow, each step a route under `app/`:

```
/onboarding  ->  /upload  ->  /processing  ->  /dashboard  ->  /chat
   (create)      (upload)      (watch)          (payoff)       (copilot)
```

1. **Onboarding** ([`app/onboarding`](./app/onboarding/page.tsx)) — a calm,
   single form: name, age, monthly income, dependents, existing loans, and
   optional financial goals. On submit the backend returns a `user_id`, which is
   stored in `localStorage`.
2. **Upload** ([`app/upload`](./app/upload/page.tsx)) — drag-and-drop documents,
   one at a time, each tagged with its type (bank statement, salary slip, credit
   card statement, loan statement, investment statement). The document type is
   guessed from the filename and can be corrected. Files are only stored here;
   nothing is processed yet.
3. **Processing** ([`app/processing`](./app/processing/page.tsx)) — the signature
   moment. Triggers a pipeline run over all uploaded documents, then polls the
   run's status and renders the four agents as an animated pipeline. On `done` it
   transitions to the dashboard; on `failed` it offers a calm retry.
4. **Dashboard** ([`app/dashboard`](./app/dashboard/page.tsx)) — the payoff.
   Persona card + health gauge, KPI tiles, spending-trend line chart, category
   donut, subscriptions and debt/asset panels, and prioritized recommendations,
   with a prominent "Chat with your copilot" call to action.
5. **Chat** ([`app/chat`](./app/chat/page.tsx)) — a conversation grounded in the
   analyzed data. History lives in client state and is intentionally lost on
   refresh (MVP). The persona card can deep-link a starter question via `?q=`.

---

## The pipeline (the four agents)

A single run executes four stages in order. The processing screen renders exactly
these, in this order, straight from the run's `stages` array:

| Stage | Agent | Produces | Caption shown |
|---|---|---|---|
| `parse` | Document Parser | Transactions + financial facts | "Reading your statements…" |
| `categorize` | Categorizer | Category labels + recurring/subscription flags | "Understanding your spending…" |
| `analyze` | Financial Analysis | Pure-math metrics + health score | "Crunching the numbers…" |
| `recommend` | Recommendation | Summary + prioritized action cards | "Writing your recommendations…" |

Polling logic lives in [`useRun`](./lib/query/hooks.ts): it refetches every ~1s
while the run is `pending`/`running` and stops automatically once `done` or
`failed`. The run endpoint carries **status only** — the actual results are
fetched once from `/dashboard/{user_id}` after completion.

---

## Project structure

```
app/                       App Router routes (one folder per screen)
  layout.tsx               Root layout: fonts, dark theme, Providers
  page.tsx                 Landing / hero
  onboarding/              Profile creation form
  upload/                  Document upload
  processing/              Animated pipeline + polling
  dashboard/               Persona, charts, KPIs, recommendations
  chat/                    Grounded conversation
  globals.css              Tailwind theme + keyframes

components/
  ui/                      shadcn/ui primitives (button, card, input, ...)
  dashboard/               Dashboard building blocks (gauge, donut, tiles, ...)
  processing/pipeline.tsx  The animated four-agent pipeline
  shared/                  Brand, page shell, motion, loading/error states
  providers.tsx            QueryClient + Tooltip + Toaster

lib/
  api/
    client.ts              fetch wrapper: base URL + normalized FastAPI errors
    endpoints.ts           One typed function per API endpoint
    types.ts               TypeScript mirror of the API contract
  query/
    hooks.ts               TanStack Query hooks (mutations + queries)
    keys.ts                Centralized query-key factory
  storage.ts               Typed localStorage for user_id / run_id
  use-session.ts           Session hooks (read ids, require-user redirect)
  format.ts                Display formatting (INR, percentages, dates)
  doc-types.ts             Document types, accepted extensions, filename guess
  utils.ts                 cn() and misc helpers
```

---

## How the frontend talks to the backend

There are no tokens or cookies (MVP). Identity is a `user_id` returned at
onboarding and kept in `localStorage`; a `run_id` is stored likewise so the
processing screen survives a refresh. See [`lib/storage.ts`](./lib/storage.ts).

The API layer is intentionally thin and typed:

- [`lib/api/client.ts`](./lib/api/client.ts) — a single `apiFetch` wrapper that
  prepends the base URL, serializes JSON bodies, sends `FormData` as-is for
  uploads, and turns FastAPI's string-or-array `detail` into one readable message
  via the `ApiError` class.
- [`lib/api/endpoints.ts`](./lib/api/endpoints.ts) — one function per endpoint
  (`onboard`, `uploadDocument`, `createRun`, `getRun`, `getDashboard`,
  `sendChat`, ...).
- [`lib/query/hooks.ts`](./lib/query/hooks.ts) — React hooks wrapping those
  functions with caching, polling, and cache invalidation.

Endpoints used:

| Method | Path | Purpose |
|---|---|---|
| `POST` | `/onboarding` | Create a user, returns `user_id` |
| `GET` | `/onboarding/{user_id}` | Fetch a user |
| `POST` | `/documents` | Upload one file (multipart) |
| `GET` | `/documents?user_id=...` | List uploaded documents |
| `POST` | `/pipeline/runs` | Start a run over all documents, returns `run_id` |
| `GET` | `/pipeline/runs/{run_id}` | Poll run status |
| `GET` | `/dashboard/{user_id}` | Composed dashboard from the latest run |
| `POST` | `/chat` | One grounded assistant reply |

Conventions worth knowing (all mirrored in [`lib/api/types.ts`](./lib/api/types.ts)):

- **Currency** is INR (₹), plain numbers — formatted for display in
  [`lib/format.ts`](./lib/format.ts).
- **Percentages** (`savings_rate`, `debt_to_income`) arrive as **fractions**
  (`0.42` means 42%) — multiply before display.
- Several fields can be `null` (`monthly_income`, `emergency_runway_months`,
  `target_date`, ...) — guard them.
- `persona` is `null` today; the dashboard already renders it behind a single
  non-null check, so it lights up the moment the backend ships it.

---

## Design language

- **Palette:** two colors — near-black (`#0A0A0A`) and near-white — with a full
  gray scale. No accent hues; depth comes from grays, subtle gradients, borders,
  and shadows.
- **Components:** shadcn/ui throughout, kept to the neutral/zinc theme.
- **Typography:** Geist for body/UI, Playfair Display for the big "moment"
  headings (hero, persona, chat).
- **Motion:** light and purposeful — fades and slide-ins on mount, numbers that
  count up, a light pulse travelling the pipeline connectors. Nothing loud.
- **States:** every screen has calm, monochrome loading (skeletons), empty, and
  error states.

The app currently renders in dark mode by default (set on `<html>` in
[`app/layout.tsx`](./app/layout.tsx)).

---

## Notes and limitations (MVP)

- **No authentication.** `user_id` in `localStorage` is the only identity.
- **Chat history is client-only** and lost on refresh, by design.
- **Chat is not streamed yet** — one reply per request; a typing indicator shows
  while the request is in flight. The design anticipates streaming later.
- **Document preview** is not available; the `url` field on documents is reserved
  and not populated.
- **Persona generation** is a backend feature not yet live; the UI is already
  built to render it.

---

## Related docs

- [`api-reference.md`](./api-reference.md) — full API contract, data models, enums.
- [`frontend-brief.md`](./frontend-brief.md) — product vision and design intent.
- [`AGENTS.md`](./AGENTS.md) / [`CLAUDE.md`](./CLAUDE.md) — repo conventions for
  AI coding agents.
