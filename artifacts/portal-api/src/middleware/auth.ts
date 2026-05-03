import type { Request, Response, NextFunction } from "express";
import { requireAuth, type ClerkExpressRequireAuth } from "@clerk/express";
import { db } from "../../lib/db/index.js";
import { userProfile } from "../../lib/db/schema/portal.js";
import { eq, isNull } from "drizzle-orm";
import type { AuthenticatedUser } from "../types.js";

// ── Clerk auth middleware ───────────────────────────────────────────────────

/**
 * Verifies the Clerk session token and loads (or creates) the corresponding
 * user_profile row. Attaches the AuthenticatedUser to `req.user`.
 *
 * Routes behind this middleware can assume req.user is always set.
 */
async function loadUserProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const clerkUserId = req.auth?.userId;
    if (!clerkUserId) {
      res.status(401).json({ error: "Unauthorized — no Clerk session" });
      return;
    }

    // Extract metadata from Clerk session claims
    const sessionClaims = req.auth?.sessionClaims as Record<string, unknown> | undefined;
    const publicMetadata =
      (sessionClaims?.publicMetadata as Record<string, unknown>) ?? {};
    const clerkRole = (publicMetadata?.role as string) ?? "CREW";

    // Look up existing profile
    let profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.clerkUserId, clerkUserId),
    });

    if (!profile) {
      // Auto-provision: create profile from Clerk session data
      const displayName =
        (sessionClaims?.firstName as string) ||
        (sessionClaims?.username as string) ||
        clerkUserId;
      const email =
        (sessionClaims?.email as string) ||
        (sessionClaims?.primaryEmailAddressId
          ? (sessionClaims as Record<string, unknown>).email as string
          : null);

      const [newProfile] = await db
        .insert(userProfile)
        .values({
          clerkUserId,
          role: clerkRole as "ADMIN" | "CREW" | "CLIENT",
          displayName: String(displayName),
          email: email ?? null,
        })
        .returning();

      profile = newProfile!;
      console.log(
        `[auth] Auto-provisioned user_profile for clerkUserId=${clerkUserId} role=${clerkRole}`,
      );
    }

    const user: AuthenticatedUser = {
      userId: profile.id,
      clerkUserId: profile.clerkUserId,
      role: profile.role,
      displayName: profile.displayName,
      email: profile.email ?? null,
      clientId: profile.clientId ?? null,
    };

    req.user = user;
    next();
  } catch (err) {
    console.error("[auth] Error loading user profile:", err);
    res.status(500).json({ error: "Internal authentication error" });
  }
}

/** Combined Clerk auth + user-profile loading middleware. */
export const clerkAuth = [requireAuth() as ClerkExpressRequireAuth, loadUserProfile];

// ── Role guard middleware ───────────────────────────────────────────────────

function createRoleGuard(...roles: Array<"ADMIN" | "CREW" | "CLIENT">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized — no session" });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        error: `Forbidden — requires one of roles: ${roles.join(", ")}`,
      });
      return;
    }

    next();
  };
}

/** Requires ADMIN role. */
export const requireAdmin = createRoleGuard("ADMIN");

/** Requires CREW role. */
export const requireCrew = createRoleGuard("CREW");

/** Requires CLIENT role. */
export const requireClient = createRoleGuard("CLIENT");

/** Requires ADMIN or CREW role. */
export const requireStaff = createRoleGuard("ADMIN", "CREW");
