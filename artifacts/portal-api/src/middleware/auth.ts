import type { Request, RequestHandler, Response, NextFunction } from "express";
import { requireAuth, getAuth } from "@clerk/express";
import { db } from "../../lib/db/index.js";
import { userProfile } from "../../lib/db/schema/portal.js";
import { eq } from "drizzle-orm";
import type { AuthenticatedUser } from "../types.js";

async function loadUserProfile(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const a = getAuth(req);
    const clerkUserId = a.userId;
    if (!clerkUserId) {
      res.status(401).json({ error: "Unauthorized — no Clerk session" });
      return;
    }

    const sessionClaims = (a.sessionClaims ?? {}) as Record<string, unknown>;
    const publicMetadata =
      (sessionClaims.publicMetadata as Record<string, unknown>) ?? {};
    const clerkRole = (publicMetadata.role as string) ?? "CREW";
    const clerkClientId =
      (publicMetadata.clientId as string | null | undefined) ?? null;

    let profile = await db.query.userProfile.findFirst({
      where: eq(userProfile.clerkUserId, clerkUserId),
    });

    if (!profile) {
      const displayName =
        (sessionClaims.firstName as string) ||
        (sessionClaims.username as string) ||
        clerkUserId;
      const email = (sessionClaims.email as string | undefined) ?? null;

      const [newProfile] = await db
        .insert(userProfile)
        .values({
          clerkUserId,
          role: clerkRole as "ADMIN" | "CREW" | "CLIENT",
          displayName: String(displayName),
          email,
          clientId: clerkClientId,
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

export const clerkAuth: RequestHandler[] = [requireAuth() as unknown as RequestHandler, loadUserProfile as RequestHandler];

function createRoleGuard(...roles: Array<"ADMIN" | "CREW" | "CLIENT">) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized — no session" });
      return;
    }
    if (!roles.includes(req.user.role)) {
      res
        .status(403)
        .json({ error: `Forbidden — requires one of: ${roles.join(", ")}` });
      return;
    }
    next();
  };
}

export const requireAdmin = createRoleGuard("ADMIN");
export const requireCrew = createRoleGuard("CREW");
export const requireClient = createRoleGuard("CLIENT");
export const requireStaff = createRoleGuard("ADMIN", "CREW");
