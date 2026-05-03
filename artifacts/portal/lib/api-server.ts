import "server-only";
import { auth } from "@clerk/nextjs/server";
import { apiCall, type ApiCallOptions } from "./api-client";

/**
 * Server-component / route-handler API helper. Pulls the Clerk session
 * token from the current request and forwards it to the Express API.
 *
 * Returns `null` on 401/403/404 to make page-level rendering simple.
 */
export async function api<T>(
  path: string,
  opts: Omit<ApiCallOptions, "token"> & { silent?: boolean } = {},
): Promise<T | null> {
  const { getToken } = await auth();
  const token = await getToken();
  try {
    return await apiCall<T>(path, { ...opts, token });
  } catch (err) {
    const status = (err as { status?: number }).status;
    if (status === 401 || status === 403 || status === 404) return null;
    if (opts.silent) return null;
    throw err;
  }
}

export async function apiOrThrow<T>(
  path: string,
  opts: Omit<ApiCallOptions, "token"> = {},
): Promise<T> {
  const { getToken } = await auth();
  const token = await getToken();
  return apiCall<T>(path, { ...opts, token });
}

export async function getAuthToken(): Promise<string | null> {
  const { getToken } = await auth();
  return getToken();
}
