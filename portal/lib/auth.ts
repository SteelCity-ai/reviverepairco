/**
 * Clerk auth helpers for the portal.
 *
 * Provides role-checking utilities and session helpers used across
 * server components and API routes.
 */

import { auth } from "@clerk/nextjs/server";

export type PortalRole = "ADMIN" | "CREW" | "CLIENT";

export async function getSessionRole(): Promise<PortalRole> {
  const { sessionClaims } = await auth();
  return ((sessionClaims?.publicMetadata as { role?: string })?.role ?? "CREW") as PortalRole;
}

export async function requireRole(...roles: PortalRole[]): Promise<boolean> {
  const role = await getSessionRole();
  return roles.includes(role);
}

export async function requireAdmin(): Promise<void> {
  const ok = await requireRole("ADMIN");
  if (!ok) throw new Error("Unauthorized: ADMIN role required");
}

export async function getUserId(): Promise<string | null> {
  const { userId } = await auth();
  return userId;
}

export async function requireUserId(): Promise<string> {
  const id = await getUserId();
  if (!id) throw new Error("Not authenticated");
  return id;
}
