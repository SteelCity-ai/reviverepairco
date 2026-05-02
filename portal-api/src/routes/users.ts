import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { userProfile } from "../../lib/db/schema/portal.js";
import { eq, isNull } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";

const router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const inviteUserSchema = z.object({
  email: z.string().email(),
  role: z.enum(["ADMIN", "CREW", "CLIENT"]),
  clientId: z.string().uuid().optional(),
  displayName: z.string().min(1).max(255),
});

const updateUserSchema = z.object({
  role: z.enum(["ADMIN", "CREW", "CLIENT"]).optional(),
  clientId: z.string().uuid().nullable().optional(),
  displayName: z.string().min(1).max(255).optional(),
  email: z.string().email().nullable().optional(),
  phone: z.string().max(50).nullable().optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/users — list users (admin only)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const role = req.query.role as string | undefined;
    const clientId = req.query.clientId as string | undefined;

    let where = eq(userProfile.archivedAt, isNull(userProfile.archivedAt));

    // Drizzle doesn't support conditional where building easily, so we use a filter approach
    const all = await db
      .select()
      .from(userProfile)
      .where(eq(userProfile.archivedAt, null as unknown as never)) // filter out archived
      .orderBy(userProfile.displayName);

    let results = all;

    // TODO: Replace with proper combined where clauses
    if (role) {
      const validRole = role as "ADMIN" | "CREW" | "CLIENT";
      results = all.filter((u) => u.role === validRole);
    }
    if (clientId) {
      results = results.filter((u) => u.clientId === clientId);
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/users/:id — single user (admin only)
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query.userProfile.findFirst({
      where: eq(userProfile.id, req.params.id!),
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

// POST /api/v1/users/invite — create invitation (admin only)
router.post(
  "/invite",
  requireAdmin,
  validate.body(inviteUserSchema),
  async (req, res, next) => {
    try {
      // Stub: In production, this calls Clerk API to send an invitation email.
      // For now, create the user_profile record and log.
      const [newUser] = await db
        .insert(userProfile)
        .values({
          clerkUserId: `invited-${Date.now()}`,
          role: req.body.role,
          clientId: req.body.clientId ?? null,
          displayName: req.body.displayName,
          email: req.body.email,
        })
        .returning();

      console.log(
        `[users] (stub) Would send Clerk invite to ${req.body.email} for role ${req.body.role}`,
      );

      res.status(201).json({
        ...newUser,
        inviteSent: true,
        note: "Invitation stub — Clerk API integration required",
      });
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/v1/users/:id — update user (admin only)
router.patch(
  "/:id",
  requireAdmin,
  validate.body(updateUserSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(userProfile)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(userProfile.id, req.params.id!))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "User not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/v1/users/:id — archive user (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [archived] = await db
      .update(userProfile)
      .set({ archivedAt: new Date(), updatedAt: new Date() })
      .where(eq(userProfile.id, req.params.id!))
      .returning();

    if (!archived) {
      res.status(404).json({ error: "User not found" });
      return;
    }
    res.json({ id: req.params.id, archivedAt: archived.archivedAt });
  } catch (err) {
    next(err);
  }
});

export default router;
