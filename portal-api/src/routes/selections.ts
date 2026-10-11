import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { selection } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";
import {
  assertEntityAccess,
  assertProjectAccess,
  requireUser,
} from "../lib/project-access.js";

const router = Router();

const createSelectionBody = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  options: z.record(z.unknown()),
  deadline: z.string().optional(),
  workTypeId: z.string().optional(),
  mainTaskId: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { projectId } = req.query;
    if (projectId) {
      const access = await assertProjectAccess(user, projectId as string);
      if (!access.ok) {
        res.status(access.status).json({ error: access.error });
        return;
      }
    }
    const conditions = [];
    if (projectId) conditions.push(eq(selection.projectId, projectId as string));
    const items = await db.select().from(selection)
      .where(and(...conditions))
      .orderBy(selection.createdAt);
    res.json(items);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireStaff, validate.body(createSelectionBody), async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertProjectAccess(user, req.body.projectId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [sel] = await db.insert(selection).values({
      ...req.body,
      status: "PENDING",
      createdByUserId: user.userId,
    }).returning();
    res.status(201).json(sel);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(user, "selection", req.params.id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [updated] = await db.update(selection).set(req.body)
      .where(eq(selection.id, req.params.id as string)).returning();
    if (!updated) return res.status(404).json({ error: "Selection not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
