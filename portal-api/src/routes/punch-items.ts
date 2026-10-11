import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { punchItem } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import {
  assertEntityAccess,
  assertProjectAccess,
  requireUser,
} from "../lib/project-access.js";

const router = Router();

const createPunchItemSchema = z.object({
  description: z.string().min(1),
  assigneeId: z.string().uuid(),
  workTypeId: z.string().uuid().optional(),
  deadline: z.string().optional(),
  projectId: z.string().uuid(),
});

const updatePunchItemSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED"]).optional(),
  description: z.string().min(1).optional(),
  assigneeId: z.string().uuid().optional(),
  deadline: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { projectId, assigneeId, status } = req.query;
    if (projectId) {
      const access = await assertProjectAccess(user, projectId as string);
      if (!access.ok) {
        res.status(access.status).json({ error: access.error });
        return;
      }
    }
    const conditions = [];
    if (projectId) conditions.push(eq(punchItem.projectId, projectId as string));
    if (assigneeId) conditions.push(eq(punchItem.assigneeId, assigneeId as string));
    if (status) conditions.push(eq(punchItem.status, status as typeof punchItem.$inferSelect.status));
    const items = await db.select().from(punchItem).where(and(...conditions)).orderBy(punchItem.createdAt);
    res.json(items);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireAdmin, validate.body(createPunchItemSchema), async (req, res, next) => {
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
    const [item] = await db.insert(punchItem).values({
      ...req.body,
      status: "OPEN",
      createdByUserId: req.user!.userId,
    }).returning();
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, validate.body(updatePunchItemSchema), async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { id } = req.params;
    const access = await assertEntityAccess(user, "punch_item", id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    // VERIFIED status requires ADMIN
    if (req.body.status === "VERIFIED" && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can verify punch items" });
    }
    const [updated] = await db.update(punchItem).set(req.body).where(eq(punchItem.id, id as string)).returning();
    if (!updated) return res.status(404).json({ error: "Punch item not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
