/**
 * Server-side API wrapper — thin wrapper around apiClient for Next.js
 * server components. Returns null on 401/403/404 so pages can call
 * notFound() or show EmptyState.
 */

import { apiClient } from "./api-client";

export async function api<T = unknown>(
  path: string,
  options: { revalidate?: number; tags?: string[] } = {},
): Promise<T | null> {
  try {
    return await apiClient<T>(path);
  } catch (err) {
    const msg = (err as Error).message;
    if (
      msg.includes("401") ||
      msg.includes("403") ||
      msg.includes("404")
    ) {
      return null;
    }
    // Re-throw other errors (network, 500, etc.) for error boundaries
    throw err;
  }
}
