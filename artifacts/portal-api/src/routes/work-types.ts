import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { workType } from "../../lib/db/schema/portal.js";
import { eq } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import { recomputeProjectStatus } from "../lib/db-helpers.js";

const router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createWorkTypeSchema = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const updateWorkTypeSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETE"]).optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/work-types — list (optional ?projectId)
router.get("/", async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;

    if (projectId) {
      const types = await db
        .select()
        .from(workType)
        .where(eq(workType.projectId, projectId))
        .orderBy(workType.sortOrder);
      res.json(types);
    } else {
      const types = await db
        .select()
        .from(workType)
        .orderBy(workType.projectId, workType.sortOrder);
      res.json(types);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/work-types — create (admin/staff)
router.post(
  "/",
  requireStaff,
  validate.body(createWorkTypeSchema),
  async (req, res, next) => {
    try {
      const [newWorkType] = await db
        .insert(workType)
        .values({
          ...req.body,
          sortOrder: req.body.sortOrder ?? 0,
        })
        .returning();

      await recomputeProjectStatus(req.body.projectId);

      res.status(201).json(newWorkType);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/work-types/:id
router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query.workType.findFirst({
      where: eq(workType.id, req.params.id!),
      with: { mainTasks: { orderBy: (mt, { asc }) => [asc(mt.sortOrder)] } },
    });

    if (!result) {
      res.status(404).json({ error: "Work type not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/work-types/:id (admin/staff)
router.patch(
  "/:id",
  requireStaff,
  validate.body(updateWorkTypeSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(workType)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(workType.id, req.params.id!))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Work type not found" });
        return;
      }

      await recomputeProjectStatus(updated.projectId);
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/v1/work-types/:id (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [deleted] = await db
      .delete(workType)
      .where(eq(workType.id, req.params.id!))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Work type not found" });
      return;
    }

    await recomputeProjectStatus(deleted.projectId);
    res.json({ id: req.params.id, deleted: true });
  } catch (err) {
    next(err);
  }
});

export default router;
