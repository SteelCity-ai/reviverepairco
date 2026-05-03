import { Router } from "express";
import { z } from "zod";
import { createClerkClient } from "@clerk/express";
import { db } from "../../lib/db/index.js";
import { userProfile } from "../../lib/db/schema/portal.js";
import { eq, isNull, and, desc } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";

const router: Router = Router();

const clerk = createClerkClient({
  secretKey: process.env.CLERK_SECRET_KEY,
});

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "CREW", "CLIENT"]),
  clientId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(255).optional(),
});

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "CREW", "CLIENT"]).optional(),
  clientId: z.string().uuid().nullable().optional(),
  displayName: z.string().min(1).max(255).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
});

// GET /api/v1/users — list (admin only)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const role = req.query.role as "ADMIN" | "CREW" | "CLIENT" | undefined;
    const clientId = req.query.clientId as string | undefined;

    const all = await db
      .select()
      .from(userProfile)
      .where(isNull(userProfile.archivedAt))
      .orderBy(userProfile.displayName);

    let results = all;
    if (role) results = results.filter((u) => u.role === role);
    if (clientId) results = results.filter((u) => u.clientId === clientId);
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:id (admin only)
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query.userProfile.findFirst({
      where: eq(userProfile.id, (req.params.id as string)),
    });
    if (!result) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/users/invite — admin only; sends a real Clerk invitation.
router.post(
  "/invite",
  requireAdmin,
  validate.body(inviteUserSchema),
  async (req, res, next) => {
    try {
      const { email, role, clientId, displayName } = req.body as z.infer<
        typeof inviteUserSchema
      >;

      if (role === "CLIENT" && !clientId) {
        res
          .status(400)
          .json({ error: "clientId is required when role is CLIENT" });
        return;
      }

      if (!process.env.CLERK_SECRET_KEY) {
        res
          .status(500)
          .json({ error: "Clerk is not configured (CLERK_SECRET_KEY missing)" });
        return;
      }

      const baseUrl =
        process.env.PORTAL_PUBLIC_URL ?? "https://portal.reviverepairco.com";

      const invitation = await clerk.invitations.createInvitation({
        emailAddress: email,
        publicMetadata: { role, clientId: clientId ?? null },
        redirectUrl: `${baseUrl}/accept-invite`,
        notify: true,
      });

      res.status(201).json({
        invitationId: invitation.id,
        emailAddress: invitation.emailAddress,
        status: invitation.status,
        role,
        clientId: clientId ?? null,
        displayName: displayName ?? null,
        note: "User row will be created on Clerk webhook user.created.",
      });
    } catch (err) {
      const e = err as { errors?: Array<{ message: string }>; message?: string };
      if (e.errors?.length) {
        res.status(400).json({ error: e.errors.map((x) => x.message).join("; ") });
        return;
      }
      next(err);
    }
  },
);

// PATCH /api/v1/users/:id — admin only; mirror role/client to Clerk too.
router.patch(
  "/:id",
  requireAdmin,
  validate.body(updateUserSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(userProfile)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(userProfile.id, (req.params.id as string)))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      if (
        process.env.CLERK_SECRET_KEY &&
        (req.body.role !== undefined || req.body.clientId !== undefined)
      ) {
        try {
          await clerk.users.updateUserMetadata(updated.clerkUserId, {
            publicMetadata: {
              role: updated.role,
              clientId: updated.clientId,
            },
          });
        } catch (e) {
          console.warn("[users] clerk metadata sync failed", e);
        }
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/v1/users/:id — archive (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [archived] = await db
      .update(userProfile)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(userProfile.id, (req.params.id as string)))
      .returning();

    if (!archived) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: (req.params.id as string), archivedAt: archived.archivedAt });
  } catch (err) {
    next(err);
  }
});

export default router;
