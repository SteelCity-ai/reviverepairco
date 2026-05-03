import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  mainTask,
  completionDocument,
} from "../../lib/db/schema/portal.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff, requireClient } from "../middleware/auth.js";
import {
  recomputeMainTaskStatus,
  recomputeWorkTypeStatus,
  recomputeProjectStatus,
  logActivity,
} from "../lib/db-helpers.js";

const router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createMainTaskSchema = z.object({
  workTypeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  materials: z.record(z.unknown()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedDurationDays: z.number().int().optional(),
  dependsOn: z.string().uuid().optional(),
});

const updateMainTaskSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  materials: z.record(z.unknown()).optional(),
  status: z
    .enum(["NOT_STARTED", "IN_PROGRESS", "PM_REVIEW", "CLIENT_SIGNOFF", "COMPLETE"])
    .optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  estimatedDurationDays: z.number().int().nullable().optional(),
  dependsOn: z.string().uuid().nullable().optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/main-tasks — list (optional ?workTypeId)
router.get("/", async (req, res, next) => {
  try {
    const workTypeId = req.query.workTypeId as string | undefined;

    if (workTypeId) {
      const tasks = await db
        .select()
        .from(mainTask)
        .where(eq(mainTask.workTypeId, workTypeId))
        .orderBy(mainTask.sortOrder);
      res.json(tasks);
    } else {
      const tasks = await db
        .select()
        .from(mainTask)
        .orderBy(mainTask.workTypeId, mainTask.sortOrder);
      res.json(tasks);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/main-tasks — create (admin/staff)
router.post(
  "/",
  requireStaff,
  validate.body(createMainTaskSchema),
  async (req, res, next) => {
    try {
      const [newTask] = await db
        .insert(mainTask)
        .values({
          ...req.body,
          sortOrder: req.body.sortOrder ?? 0,
          materials: req.body.materials ?? [],
        })
        .returning();

      // Get the work type to find the project
      const wt = await db.query.workType.findFirst({
        where: eq(
          (await import("../../lib/db/schema/portal.js")).workType.id,
          newTask!.workTypeId,
        ),
      });

      if (wt) {
        await logActivity(
          wt.projectId,
          req.user!.userId,
          "main_task_created",
          "MAIN_TASK",
          newTask!.id,
        );
        await recomputeWorkTypeStatus(wt.id);
        await recomputeProjectStatus(wt.projectId);
      }

      res.status(201).json(newTask);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/main-tasks/:id
router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query.mainTask.findFirst({
      where: eq(mainTask.id, req.params.id!),
      with: {
        dailyTasks: { orderBy: (dt, { asc }) => [asc(dt.sortOrder)] },
        completionDocument: true,
      },
    });

    if (!result) {
      res.status(404).json({ error: "Main task not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/main-tasks/:id (admin/staff)
router.patch(
  "/:id",
  requireStaff,
  validate.body(updateMainTaskSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(mainTask)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(mainTask.id, req.params.id!))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Main task not found" });
        return;
      }

      await recomputeWorkTypeStatus(updated.workTypeId);

      // Find project via work type
      const wt = await db.query.workType.findFirst({
        where: eq(
          (await import("../../lib/db/schema/portal.js")).workType.id,
          updated.workTypeId,
        ),
      });
      if (wt) {
        await recomputeProjectStatus(wt.projectId);
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/main-tasks/:id/pm-approve — PM review → CLIENT_SIGNOFF
router.post("/:id/pm-approve", requireAdmin, async (req, res, next) => {
  try {
    const task = await db.query.mainTask.findFirst({
      where: eq(mainTask.id, req.params.id!),
      with: { dailyTasks: { with: { photos: true } } },
    });

    if (!task) {
      res.status(404).json({ error: "Main task not found" });
      return;
    }

    if (task.status !== "PM_REVIEW") {
      res.status(400).json({
        error: `Task status is ${task.status}, must be PM_REVIEW`,
      });
      return;
    }

    // Compile completion document
    const completionPayload = {
      taskName: task.name,
      taskId: task.id,
      dailyTasks: task.dailyTasks.map((dt) => ({
        title: dt.title,
        status: dt.status,
        completedAt: dt.completedAt,
        photos: dt.photos.map((p) => ({
          objectKey: p.objectKey,
          originalFilename: p.originalFilename,
          caption: p.caption,
        })),
        crewNotes: dt.crewNotes,
        hoursLogged: dt.hoursLogged,
      })),
      reviewedAt: new Date().toISOString(),
      reviewedBy: req.user!.displayName,
    };

    const clientViewToken = randomUUID();

    const [doc] = await db
      .insert(completionDocument)
      .values({
        mainTaskId: task.id,
        compiledByUserId: req.user!.userId,
        clientViewToken,
        payload: completionPayload,
      })
      .returning();

    // Update main task
    await db
      .update(mainTask)
      .set({
        status: "CLIENT_SIGNOFF",
        pmReviewedAt: new Date(),
        pmReviewedByUserId: req.user!.userId,
        completionDocumentId: doc!.id,
        updatedAt: new Date(),
      })
      .where(eq(mainTask.id, req.params.id!));

    // Log
    const wt = await db.query.workType.findFirst({
      where: eq(
        (await import("../../lib/db/schema/portal.js")).workType.id,
        task.workTypeId,
      ),
    });
    if (wt) {
      await logActivity(
        wt.projectId,
        req.user!.userId,
        "pm_approved",
        "MAIN_TASK",
        task.id,
      );
    }

    res.json({
      id: task.id,
      status: "CLIENT_SIGNOFF",
      completionDocumentId: doc!.id,
      clientViewToken,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/main-tasks/:id/client-signoff — client signoff → COMPLETE
router.post(
  "/:id/client-signoff",
  requireClient,
  async (req, res, next) => {
    try {
      const task = await db.query.mainTask.findFirst({
        where: eq(mainTask.id, req.params.id!),
      });

      if (!task) {
        res.status(404).json({ error: "Main task not found" });
        return;
      }

      if (task.status !== "CLIENT_SIGNOFF") {
        res.status(400).json({
          error: `Task status is ${task.status}, must be CLIENT_SIGNOFF`,
        });
        return;
      }

      // Update main task to COMPLETE
      await db
        .update(mainTask)
        .set({
          status: "COMPLETE",
          clientSignedAt: new Date(),
          clientSignedByUserId: req.user!.userId,
          clientSignatureName: req.user!.displayName,
          updatedAt: new Date(),
        })
        .where(eq(mainTask.id, req.params.id!));

      await recomputeWorkTypeStatus(task.workTypeId);

      const wt = await db.query.workType.findFirst({
        where: eq(
          (await import("../../lib/db/schema/portal.js")).workType.id,
          task.workTypeId,
        ),
      });
      if (wt) {
        await recomputeProjectStatus(wt.projectId);
        await logActivity(
          wt.projectId,
          req.user!.userId,
          "client_signoff",
          "MAIN_TASK",
          task.id,
        );
      }

      res.json({
        id: task.id,
        status: "COMPLETE",
        clientSignedAt: new Date().toISOString(),
        clientSignedBy: req.user!.displayName,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
