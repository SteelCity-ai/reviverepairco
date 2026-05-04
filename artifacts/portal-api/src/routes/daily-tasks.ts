import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  dailyTask,
  mainTask,
  workType,
  project,
  taskPhoto,
} from "../../lib/db/schema/portal.js";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import { uploadPhoto } from "../lib/storage.js";
import {
  recomputeMainTaskStatus,
  recomputeWorkTypeStatus,
  recomputeProjectStatus,
  logActivity,
} from "../lib/db-helpers.js";

const router: Router = Router();

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
  crewNotes: z.string().nullable().optional(),
  hoursLogged: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

/**
 * Resolve the project id (and client id) that a given daily task belongs to.
 * Used for permission checks.
 */
async function resolveDailyTaskScope(
  dailyTaskId: string,
): Promise<{ projectId: string; clientId: string; assigneeId: string | null } | null> {
  const dt = await db.query.dailyTask.findFirst({
    where: eq(dailyTask.id, dailyTaskId),
  });
  if (!dt) return null;
  const mt = await db.query.mainTask.findFirst({
    where: eq(mainTask.id, dt.mainTaskId),
  });
  if (!mt) return null;
  const wt = await db.query.workType.findFirst({
    where: eq(workType.id, mt.workTypeId),
  });
  if (!wt) return null;
  const p = await db.query.project.findFirst({
    where: eq(project.id, wt.projectId),
  });
  if (!p) return null;
  return {
    projectId: p.id,
    clientId: p.clientId,
    assigneeId: dt.assignedToUserId ?? null,
  };
}

// GET /api/v1/daily-tasks — list with filters; scoped per role.
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const mainTaskId = req.query.mainTaskId as string | undefined;
    const assignedToUserId = req.query.assignedToUserId as string | undefined;
    const date = req.query.date as string | undefined;
    const dateFrom = req.query.dateFrom as string | undefined;
    const dateTo = req.query.dateTo as string | undefined;
    const status = req.query.status as "NOT_STARTED" | "DONE" | undefined;

    const allTasks = await db
      .select()
      .from(dailyTask)
      .orderBy(dailyTask.scheduledDate, dailyTask.sortOrder);

    let results = allTasks;

    // ── Role scoping ───────────────────────────────────────────
    if (req.user.role === "CREW") {
      results = results.filter((t) => t.assignedToUserId === req.user!.userId);
    } else if (req.user.role === "CLIENT") {
      // Client only sees daily tasks belonging to projects of their client.
      const projects = await db
        .select({ id: project.id })
        .from(project)
        .where(eq(project.clientId, req.user.clientId ?? "__none__"));
      const projectIds = new Set(projects.map((p) => p.id));
      const workTypes = await db.select().from(workType);
      const wtToProject = new Map(workTypes.map((w) => [w.id, w.projectId]));
      const mainTasks = await db.select().from(mainTask);
      const allowedMainTaskIds = new Set(
        mainTasks
          .filter((m) => projectIds.has(wtToProject.get(m.workTypeId) ?? ""))
          .map((m) => m.id),
      );
      results = results.filter((t) => allowedMainTaskIds.has(t.mainTaskId));
    }

    // ── Filters ────────────────────────────────────────────────
    if (mainTaskId) results = results.filter((t) => t.mainTaskId === mainTaskId);
    if (assignedToUserId)
      results = results.filter((t) => t.assignedToUserId === assignedToUserId);
    if (date) results = results.filter((t) => t.scheduledDate === date);
    if (dateFrom)
      results = results.filter(
        (t) => t.scheduledDate && t.scheduledDate >= dateFrom,
      );
    if (dateTo)
      results = results.filter(
        (t) => t.scheduledDate && t.scheduledDate <= dateTo,
      );
    if (status) results = results.filter((t) => t.status === status);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/daily-tasks — admin/crew (admin really; staff for now)
router.post(
  "/",
  requireAdmin,
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

// GET /api/v1/daily-tasks/:id — scoped per role
router.get("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await db.query.dailyTask.findFirst({
      where: eq(dailyTask.id, (req.params.id as string)),
      with: { photos: true },
    });

    if (!result) {
      res.status(404).json({ error: "Daily task not found" });
      return;
    }

    const scope = await resolveDailyTaskScope((req.params.id as string));
    if (!scope) {
      res.status(404).json({ error: "Daily task scope missing" });
      return;
    }

    if (req.user.role === "CREW" && scope.assigneeId !== req.user.userId) {
      res.status(403).json({ error: "Forbidden — not your task" });
      return;
    }
    if (req.user.role === "CLIENT" && req.user.clientId !== scope.clientId) {
      res.status(403).json({ error: "Forbidden — not your client's task" });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/daily-tasks/:id — admin/crew (assignee)
router.patch(
  "/:id",
  validate.body(updateDailyTaskSchema),
  async (req, res, next) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (req.user.role === "CLIENT") {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const scope = await resolveDailyTaskScope((req.params.id as string));
      if (!scope) {
        res.status(404).json({ error: "Daily task not found" });
        return;
      }
      if (
        req.user.role === "CREW" &&
        scope.assigneeId !== req.user.userId
      ) {
        res.status(403).json({ error: "Forbidden — not your task" });
        return;
      }

      const [updated] = await db
        .update(dailyTask)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(dailyTask.id, (req.params.id as string)))
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

// DELETE /api/v1/daily-tasks/:id (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const existing = await db.query.dailyTask.findFirst({
      where: eq(dailyTask.id, req.params.id as string),
    });
    if (!existing) {
      res.status(404).json({ error: "Daily task not found" });
      return;
    }
    await db.delete(dailyTask).where(eq(dailyTask.id, req.params.id as string));
    await recomputeMainTaskStatus(existing.mainTaskId);
    const mt = await db.query.mainTask.findFirst({
      where: eq(mainTask.id, existing.mainTaskId),
    });
    if (mt) {
      await recomputeWorkTypeStatus(mt.workTypeId);
      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, mt.workTypeId),
      });
      if (wt) await recomputeProjectStatus(wt.projectId);
    }
    res.json({ id: req.params.id as string, deleted: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/daily-tasks/:id/complete — assignee or admin
router.post("/:id/complete", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const task = await db.query.dailyTask.findFirst({
      where: eq(dailyTask.id, (req.params.id as string)),
    });
    if (!task) {
      res.status(404).json({ error: "Daily task not found" });
      return;
    }

    const isAssignee = task.assignedToUserId === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";
    if (!isAssignee && !isAdmin) {
      res
        .status(403)
        .json({ error: "Forbidden — only the assignee or an admin can complete" });
      return;
    }

    const [updated] = await db
      .update(dailyTask)
      .set({
        status: "DONE",
        completedAt: new Date(),
        completedByUserId: req.user.userId,
        updatedAt: new Date(),
      })
      .where(eq(dailyTask.id, (req.params.id as string)))
      .returning();

    await recomputeMainTaskStatus(task.mainTaskId);

    const mt = await db.query.mainTask.findFirst({
      where: eq(mainTask.id, task.mainTaskId),
    });
    if (mt) {
      await recomputeWorkTypeStatus(mt.workTypeId);
      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, mt.workTypeId),
      });
      if (wt) {
        await recomputeProjectStatus(wt.projectId);
        await logActivity(
          wt.projectId,
          req.user.userId,
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

// POST /api/v1/daily-tasks/:id/photos — assignee or admin (spec-aligned alias)
const photoUpload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});
router.post(
  "/:id/photos",
  photoUpload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }
      const scope = await resolveDailyTaskScope(req.params.id as string);
      if (!scope) {
        res.status(404).json({ error: "Daily task not found" });
        return;
      }
      const isAssignee = scope.assigneeId === req.user.userId;
      const isAdmin = req.user.role === "ADMIN";
      if (!isAssignee && !isAdmin) {
        res
          .status(403)
          .json({ error: "Forbidden — only the assignee or admin can upload" });
        return;
      }
      const { objectKey } = await uploadPhoto(
        req.file.buffer,
        req.file.originalname,
        {
          clientId: scope.clientId,
          projectId: scope.projectId,
          dailyTaskId: req.params.id as string,
        },
      );
      const [photo] = await db
        .insert(taskPhoto)
        .values({
          dailyTaskId: req.params.id as string,
          objectKey,
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          uploadedByUserId: req.user.userId,
          caption: (req.body as { caption?: string }).caption ?? null,
        })
        .returning();
      res.status(201).json(photo);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
