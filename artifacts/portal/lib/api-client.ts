/**
 * Portal API client — typed fetch wrapper for the Express API.
 *
 * All callers must supply a Clerk session token (string) that is forwarded
 * as `Authorization: Bearer <token>`. Use the helpers in `lib/api-server.ts`
 * (server components / route handlers) or `lib/api-browser.ts` (client
 * components) — never call this directly without a token.
 */

const API_BASE =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api/v1";

export interface ApiCallOptions {
  method?: string;
  body?: unknown;
  headers?: Record<string, string>;
  /** Clerk session token. Required for all non-public endpoints. */
  token: string | null;
  /** When true, do not throw on non-2xx — return undefined. */
  silent?: boolean;
  /** Forwarded to fetch — useful for Next.js server-component cache hints. */
  cache?: RequestCache;
  next?: { revalidate?: number; tags?: string[] };
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public body?: unknown) {
    super(message);
  }
}

export async function apiCall<T = unknown>(
  path: string,
  opts: ApiCallOptions,
): Promise<T> {
  const { method = "GET", body, headers = {}, token, cache, next } = opts;

  const init: RequestInit = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    ...(cache !== undefined ? { cache } : {}),
    ...(next ? ({ next } as RequestInit) : {}),
  };

  if (body !== undefined && method !== "GET") {
    init.body = JSON.stringify(body);
  }

  const url = `${API_BASE}${path}`;
  const res = await fetch(url, init);

  if (!res.ok) {
    let payload: unknown = null;
    try {
      payload = await res.json();
    } catch {
      // ignore
    }
    if (opts.silent) return undefined as T;
    const msg =
      (payload as { error?: string; message?: string } | null)?.error ??
      (payload as { error?: string; message?: string } | null)?.message ??
      `API ${res.status}: ${res.statusText}`;
    throw new ApiError(res.status, msg, payload);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export async function apiUpload<T = unknown>(
  path: string,
  formData: FormData,
  token: string | null,
): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    body: formData,
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(
      res.status,
      (err as { error?: string }).error ?? `Upload error: ${res.status}`,
    );
  }
  return (await res.json()) as T;
}
