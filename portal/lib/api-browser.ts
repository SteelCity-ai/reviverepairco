/**
 * Browser-side API wrapper — provides a useApi() hook that attaches the
 * Clerk auth token automatically.
 */

"use client";

import { useAuth } from "@clerk/nextjs";
import { apiClient } from "./api-client";
import { useCallback, useMemo } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3002/api/v1";

export function useApi() {
  const { getToken } = useAuth();

  const api = useCallback(
    async <T = unknown>(
      path: string,
      options: { method?: string; body?: unknown } = {},
    ): Promise<T> => {
      const token = await getToken();
      return apiClient<T>(path, {
        ...options,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
    },
    [getToken],
  );

  const upload = useCallback(
    async <T = unknown>(
      path: string,
      formData: FormData,
    ): Promise<T> => {
      const token = await getToken();
      const res = await fetch(`${API_BASE}${path}`, {
        method: "POST",
        body: formData,
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: res.statusText }));
        throw new Error(error.message ?? `Upload error: ${res.status}`);
      }
      return res.json() as Promise<T>;
    },
    [getToken],
  );

  return useMemo(() => ({ api, upload }), [api, upload]);
}
