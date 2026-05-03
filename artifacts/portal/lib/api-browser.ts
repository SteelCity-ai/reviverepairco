"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { apiCall, apiUpload, type ApiCallOptions } from "./api-client";

/**
 * React hook returning a token-aware API helper for client components.
 * Call .api() / .upload() inside event handlers / effects.
 */
export function useApi() {
  const { getToken } = useAuth();

  const apiFn = useCallback(
    async <T,>(
      path: string,
      opts: Omit<ApiCallOptions, "token"> = {},
    ): Promise<T> => {
      const token = await getToken();
      return apiCall<T>(path, { ...opts, token });
    },
    [getToken],
  );

  const uploadFn = useCallback(
    async <T,>(path: string, formData: FormData): Promise<T> => {
      const token = await getToken();
      return apiUpload<T>(path, formData, token);
    },
    [getToken],
  );

  return { api: apiFn, upload: uploadFn };
}
