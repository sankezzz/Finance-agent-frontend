// Thin fetch wrapper: base URL + normalized FastAPI errors.

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "") ?? "http://127.0.0.1:8000";

/** One field error inside a 422 `detail` array. */
interface FieldError {
  loc?: (string | number)[];
  msg?: string;
  type?: string;
}

/** Normalized error thrown by all API calls. */
export class ApiError extends Error {
  status: number;
  detail: string | FieldError[] | undefined;

  constructor(status: number, message: string, detail?: string | FieldError[]) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.detail = detail;
  }
}

/** Turn FastAPI's string-or-array `detail` into a single human string. */
function messageFromDetail(detail: unknown, fallback: string): string {
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    const first = detail[0] as FieldError | undefined;
    if (first?.msg) {
      const field = first.loc?.filter((p) => p !== "body").join(".");
      return field ? `${field}: ${first.msg}` : first.msg;
    }
  }
  return fallback;
}

async function parseError(res: Response): Promise<ApiError> {
  let detail: string | FieldError[] | undefined;
  try {
    const body = await res.json();
    detail = body?.detail;
  } catch {
    // non-JSON error body
  }
  return new ApiError(
    res.status,
    messageFromDetail(detail, `Request failed (${res.status})`),
    detail
  );
}

type FetchOptions = Omit<RequestInit, "body"> & {
  /** JSON body — serialized automatically with the right Content-Type. */
  json?: unknown;
  /** Raw body (e.g. FormData) — sent as-is, no Content-Type forced. */
  body?: BodyInit;
};

export async function apiFetch<T>(
  path: string,
  { json, headers, ...init }: FetchOptions = {}
): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...headers,
    },
    body: json !== undefined ? JSON.stringify(json) : init.body,
  });

  if (!res.ok) throw await parseError(res);

  // 204 / empty bodies
  if (res.status === 204) return undefined as T;
  const text = await res.text();
  return (text ? JSON.parse(text) : undefined) as T;
}
