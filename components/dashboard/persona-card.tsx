"use client";

import Link from "next/link";
import { Sparkles, MessageSquare, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { Persona, User } from "@/lib/api/types";

// Personalization prompts surfaced right on the persona card. They deep-link
// into the chat (phase 2) via ?q= so the copilot can pick them up later.
const SUGGESTIONS = [
  "How much do I spend on food?",
  "How's my emergency fund?",
  "Where can I cut back?",
  "Can I afford a big purchase?",
];

function ChatHub({ intro }: { intro: string }) {
  return (
    <div className="mt-6 border-t border-border/60 pt-5">
      <p className="text-sm text-muted-foreground">{intro}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTIONS.map((q) => (
          <Link
            key={q}
            href={`/chat?q=${encodeURIComponent(q)}`}
            className="rounded-full border border-border/70 bg-background/40 px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:border-foreground/30 hover:text-foreground"
          >
            {q}
          </Link>
        ))}
      </div>
      <Link
        href="/chat"
        className={cn(buttonVariants({ size: "sm" }), "group mt-4")}
      >
        <MessageSquare className="size-4" />
        Chat with your copilot
        <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

/**
 * Persona is the emotional hook of the dashboard. `persona` is null today
 * (reserved in the API), so we render a graceful placeholder and swap in the
 * real archetype the moment it's non-null — no other changes needed.
 */
export function PersonaCard({
  persona,
  user,
}: {
  persona: Persona | null;
  user: User;
}) {
  const first = user.name?.split(" ")[0] || "there";

  if (persona) {
    return (
      <div className="edge relative overflow-hidden rounded-2xl p-6 sm:p-8">
        <div className="relative">
          <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
            <Sparkles className="size-3.5" />
            Your financial persona
          </div>
          <h2 className="text-gradient font-display text-4xl font-normal tracking-tight sm:text-5xl">
            {persona.title}
          </h2>
          <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
            {persona.description}
          </p>
          {persona.traits?.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-2">
              {persona.traits.map((t) => (
                <Badge key={t} variant="secondary">
                  {t}
                </Badge>
              ))}
            </div>
          )}
          <ChatHub intro="Ask your copilot anything — it knows your numbers." />
        </div>
      </div>
    );
  }

  // Placeholder — the dashboard is designed around this slot.
  return (
    <div className="edge relative overflow-hidden rounded-2xl p-6 sm:p-8">
      <div className="relative">
        <div className="mb-3 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
          <Sparkles className="size-3.5" />
          This is your money, decoded
        </div>
        <h2 className="text-gradient text-3xl font-semibold tracking-tight sm:text-4xl">
          Hello, {first}
        </h2>
        <p className="mt-3 max-w-xl text-pretty text-muted-foreground">
          Everything below is built from the documents you uploaded — your
          spending, savings, and health score, all in one place. Your
          personalized money persona is coming soon; for now, dig into your
          numbers or just ask.
        </p>
        <div className="mt-5">
          <Badge
            variant="outline"
            className="border-dashed text-muted-foreground"
          >
            Persona coming soon
          </Badge>
        </div>
        <ChatHub intro="Want more personalization? Ask your copilot about your data." />
      </div>
    </div>
  );
}
