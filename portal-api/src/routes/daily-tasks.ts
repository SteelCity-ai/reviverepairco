import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { dailyTask } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";
import {
  recomputeMainTaskStatus,
  recomputeWorkTypeStatus,
  recomputeProjectStatus,
  logActivity,
} from "../lib/db-helpers.js";

const router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createDailyTaskSchema = z.object({
  mainTaskId: z.string().uuid(),
  assignedToUserId: z.string().uuid().optional(),
  scheduledDate: z.string().optional(),
  title: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
});

const updateDailyTaskSchema = z.object({
  assignedToUserId: z.string().uuid().nullable().optional(),
  scheduledDate: z.string().nullable().optional(),
  title: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  status: z.enum(["NOT_STARTED", "DONE"]).optional(),
  crewNotes: z.string().nullable().optional(),
  hoursLogged: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/daily-tasks — list with optional filters
router.get("/", async (req, res, next) => {
  try {
    const mainTaskId = req.query.mainTaskId as string | undefined;
    const assignedToUserId = req.query.assignedToUserId as string | undefined;
    const date = req.query.date as string | undefined;

    const allTasks = await db
      .select()
      .from(dailyTask)
      .orderBy(dailyTask.sortOrder);

    let results = allTasks;
    if (mainTaskId) {
      results = results.filter((t) => t.mainTaskId === mainTaskId);
    }
    if (assignedToUserId) {
      results = results.filter((t) => t.assignedToUserId === assignedToUserId);
    }
    if (date) {
      results = results.filter((t) => t.scheduledDate === date);
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/daily-tasks — create (staff)
router.post(
  "/",
  requireStaff,
  validate.body(createDailyTaskSchema),
  async (req, res, next) => {
    try {
      const [newTask] = await db
        .insert(dailyTask)
        .values({
          ...req.body,
          sortOrder: req.body.sortOrder ?? 0,
        })
        .returning();

      await recomputeMainTaskStatus(req.body.mainTaskId);

      res.status(201).json(newTask);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/daily-tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query.dailyTask.findFirst({
      where: eq(dailyTask.id, req.params.id!),
      with: { photos: true },
    });

    if (!result) {
      res.status(404).json({ error: "Daily task not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/daily-tasks/:id
router.patch(
  "/:id",
  requireStaff,
  validate.body(updateDailyTaskSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(dailyTask)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(dailyTask.id, req.params.id!))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Daily task not found" });
        return;
      }

      await recomputeMainTaskStatus(updated.mainTaskId);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/daily-tasks/:id/complete — mark DONE
router.post("/:id/complete", async (req, res, next) => {
  try {
    const task = await db.query.dailyTask.findFirst({
      where: eq(dailyTask.id, req.params.id!),
    });

    if (!task) {
      res.status(404).json({ error: "Daily task not found" });
      return;
    }

    const [updated] = await db
      .update(dailyTask)
      .set({
        status: "DONE",
        completedAt: new Date(),
        completedByUserId: req.user!.userId,
        updatedAt: new Date(),
      })
      .where(eq(dailyTask.id, req.params.id!))
      .returning();

    await recomputeMainTaskStatus(task.mainTaskId);

    // Cascade: recompute work_type and project
    const mt = await db.query.mainTask.findFirst({
      where: eq(
        (await import("../../lib/db/schema/portal.js")).mainTask.id,
        task.mainTaskId,
      ),
    });
    if (mt) {
      await recomputeWorkTypeStatus(mt.workTypeId);
      const wt = await db.query.workType.findFirst({
        where: eq(
          (await import("../../lib/db/schema/portal.js")).workType.id,
          mt.workTypeId,
        ),
      });
      if (wt) {
        await recomputeProjectStatus(wt.projectId);
        await logActivity(
          wt.projectId,
          req.user!.userId,
          "daily_task_completed",
          "DAILY_TASK",
          updated!.id,
          { title: updated!.title },
        );
      }
    }

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
