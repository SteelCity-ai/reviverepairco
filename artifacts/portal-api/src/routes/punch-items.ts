import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { punchItem } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import { userCanAccessProject } from "../lib/db-helpers.js";

const router: Router = Router();

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

// ── List (staff; project-scoped for CREW) ──
router.get("/", requireStaff, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { projectId, assigneeId, status } = req.query;
    if (!projectId) {
      if (req.user.role !== "ADMIN") {
        res.status(400).json({ error: "projectId query parameter is required" });
        return;
      }
    } else {
      const allowed = await userCanAccessProject(req.user, projectId as string);
      if (!allowed) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    const conditions = [];
    if (projectId) conditions.push(eq(punchItem.projectId, projectId as string));
    if (assigneeId) conditions.push(eq(punchItem.assigneeId, assigneeId as string));
    if (status)
      conditions.push(
        eq(
          punchItem.status,
          status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED",
        ),
      );
    const items = await db
      .select()
      .from(punchItem)
      .where(conditions.length ? and(...conditions) : undefined)
      .orderBy(punchItem.createdAt);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// ── Create (admin only) ──
router.post("/", requireAdmin, validate.body(createPunchItemSchema), async (req, res, next) => {
  try {
    const [item] = await db
      .insert(punchItem)
      .values({
        ...req.body,
        status: "OPEN",
        createdByUserId: req.user!.userId,
      })
      .returning();
    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
});

// ── Update (assignee crew OR admin; VERIFIED requires admin) ──
router.patch("/:id", requireStaff, validate.body(updatePunchItemSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const existing = await db.query.punchItem.findFirst({
      where: eq(punchItem.id, req.params.id as string),
    });
    if (!existing) {
      res.status(404).json({ error: "Punch item not found" });
      return;
    }
    const isAdmin = req.user.role === "ADMIN";
    const isAssignee = existing.assigneeId === req.user.userId;
    if (!isAdmin && !isAssignee) {
      res
        .status(403)
        .json({ error: "Forbidden — only the assignee or admin can update" });
      return;
    }
    if (req.body.status === "VERIFIED" && !isAdmin) {
      res.status(403).json({ error: "Only admins can verify punch items" });
      return;
    }
    const [updated] = await db
      .update(punchItem)
      .set(req.body)
      .where(eq(punchItem.id, req.params.id as string))
      .returning();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
