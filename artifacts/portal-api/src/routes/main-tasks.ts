import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  mainTask,
  workType,
  project,
  completionDocument,
  taskPhoto,
  dailyTask,
} from "../../lib/db/schema/portal.js";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import {
  recomputeMainTaskStatus,
  recomputeWorkTypeStatus,
  recomputeProjectStatus,
  logActivity,
} from "../lib/db-helpers.js";
import { sendMail } from "../lib/email.js";

const router: Router = Router();

const createMainTaskSchema = z.object({
  workTypeId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  materials: z.array(z.unknown()).optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  estimatedDurationDays: z.number().int().optional(),
  dependsOn: z.string().uuid().optional(),
});

const updateMainTaskSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  sortOrder: z.number().int().optional(),
  materials: z.array(z.unknown()).optional(),
  status: z
    .enum([
      "NOT_STARTED",
      "IN_PROGRESS",
      "PM_REVIEW",
      "CLIENT_SIGNOFF",
      "COMPLETE",
    ])
    .optional(),
  startDate: z.string().nullable().optional(),
  endDate: z.string().nullable().optional(),
  estimatedDurationDays: z.number().int().nullable().optional(),
  dependsOn: z.string().uuid().nullable().optional(),
});

const clientSignoffSchema = z.object({
  signatureName: z.string().min(1).max(255),
  confirmed: z.boolean().refine((v) => v === true, {
    message: "Must confirm completion",
  }),
});

async function resolveProjectFromMainTask(
  mainTaskId: string,
): Promise<{ projectId: string; clientId: string } | null> {
  const mt = await db.query.mainTask.findFirst({
    where: eq(mainTask.id, mainTaskId),
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
  return { projectId: p.id, clientId: p.clientId };
}

router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const tasks = await db
      .select({
        id: mainTask.id,
        workTypeId: mainTask.workTypeId,
        name: mainTask.name,
        description: mainTask.description,
        status: mainTask.status,
        sortOrder: mainTask.sortOrder,
        materials: mainTask.materials,
        startDate: mainTask.startDate,
        endDate: mainTask.endDate,
        estimatedDurationDays: mainTask.estimatedDurationDays,
        dependsOn: mainTask.dependsOn,
        clientSignedAt: mainTask.clientSignedAt,
        clientSignedByUserId: mainTask.clientSignedByUserId,
        clientSignatureName: mainTask.clientSignatureName,
        createdAt: mainTask.createdAt,
        updatedAt: mainTask.updatedAt,
        projectId: workType.projectId,
        clientId: project.clientId,
      })
      .from(mainTask)
      .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
      .innerJoin(project, eq(workType.projectId, project.id))
      .orderBy(mainTask.workTypeId, mainTask.sortOrder);

    let filtered = tasks;
    if (req.user.role === "CLIENT") {
      filtered = tasks.filter((t) => t.clientId === req.user!.clientId);
    } else if (req.user.role === "CREW") {
      const dts = await db
        .select({ mainTaskId: dailyTask.mainTaskId })
        .from(dailyTask)
        .where(eq(dailyTask.assignedToUserId, req.user.userId));
      const allowed = new Set(dts.map((d) => d.mainTaskId));
      filtered = tasks.filter((t) => allowed.has(t.id));
    }
    res.json(filtered);
  } catch (err) {
    next(err);
  }
});

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

      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, newTask!.workTypeId),
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

router.get("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await db.query.mainTask.findFirst({
      where: eq(mainTask.id, (req.params.id as string)),
      with: {
        dailyTasks: { orderBy: (dt, { asc }) => [asc(dt.sortOrder)] },
        completionDocument: true,
      },
    });
    if (!result) {
      res.status(404).json({ error: "Main task not found" });
      return;
    }

    const scope = await resolveProjectFromMainTask((req.params.id as string));
    if (req.user.role === "CLIENT") {
      if (!scope || scope.clientId !== req.user.clientId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

router.patch(
  "/:id",
  requireStaff,
  validate.body(updateMainTaskSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(mainTask)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(mainTask.id, (req.params.id as string)))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Main task not found" });
        return;
      }
      await recomputeWorkTypeStatus(updated.workTypeId);
      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, updated.workTypeId),
      });
      if (wt) await recomputeProjectStatus(wt.projectId);

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/main-tasks/:id/pm-approve — admin; PM_REVIEW → CLIENT_SIGNOFF
router.post("/:id/pm-approve", requireAdmin, async (req, res, next) => {
  try {
    const task = await db.query.mainTask.findFirst({
      where: eq(mainTask.id, (req.params.id as string)),
      with: { dailyTasks: { with: { photos: true } } },
    });
    if (!task) {
      res.status(404).json({ error: "Main task not found" });
      return;
    }
    if (task.status !== "PM_REVIEW") {
      res
        .status(400)
        .json({ error: `Task status is ${task.status}, must be PM_REVIEW` });
      return;
    }

    // Block if any photo is still PENDING.
    const allPhotos = task.dailyTasks.flatMap((dt) => dt.photos);
    const pending = allPhotos.filter((p) => p.pmStatus === "PENDING");
    if (pending.length > 0) {
      res.status(400).json({
        error: `Cannot approve while ${pending.length} photo(s) are PENDING — approve or reject each first`,
        pendingPhotoIds: pending.map((p) => p.id),
      });
      return;
    }

    // Compile completion document — only APPROVED photos.
    const completionPayload = {
      taskName: task.name,
      taskId: task.id,
      dailyTasks: task.dailyTasks.map((dt) => ({
        title: dt.title,
        status: dt.status,
        completedAt: dt.completedAt,
        photos: dt.photos
          .filter((p) => p.pmStatus === "APPROVED")
          .map((p) => ({
            id: p.id,
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

    await db
      .update(mainTask)
      .set({
        status: "CLIENT_SIGNOFF",
        pmReviewedAt: new Date(),
        pmReviewedByUserId: req.user!.userId,
        completionDocumentId: doc!.id,
        updatedAt: new Date(),
      })
      .where(eq(mainTask.id, (req.params.id as string)));

    const scope = await resolveProjectFromMainTask((req.params.id as string));
    if (scope) {
      await logActivity(
        scope.projectId,
        req.user!.userId,
        "pm_approved",
        "MAIN_TASK",
        task.id,
      );

      // Notify client users.
      try {
        const { userProfile } = await import(
          "../../lib/db/schema/portal.js"
        );
        const clients = await db
          .select()
          .from(userProfile)
          .where(eq(userProfile.clientId, scope.clientId));
        const recipients = clients
          .filter((c) => c.role === "CLIENT" && c.email && !c.archivedAt)
          .map((c) => c.email!);
        if (recipients.length) {
          const url = `${process.env.PORTAL_PUBLIC_URL ?? "https://portal.reviverepairco.com"}/client/main-tasks/${task.id}/signoff`;
          await sendMail({
            to: recipients,
            subject: `Action needed: please sign off on "${task.name}"`,
            html: `<p>The work for <strong>${task.name}</strong> is complete and ready for your review.</p><p><a href="${url}">Open the sign-off page →</a></p>`,
          });
        }
      } catch (e) {
        console.warn("[main-tasks] client signoff email failed", e);
      }
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

// POST /api/v1/main-tasks/:id/client-signoff — CLIENT user of the project's client
router.post(
  "/:id/client-signoff",
  validate.body(clientSignoffSchema),
  async (req, res, next) => {
    try {
      if (!req.user) {
        res.status(401).json({ error: "Unauthorized" });
        return;
      }
      if (req.user.role !== "CLIENT") {
        res
          .status(403)
          .json({ error: "Forbidden — only client users can sign off" });
        return;
      }

      const task = await db.query.mainTask.findFirst({
        where: eq(mainTask.id, (req.params.id as string)),
      });
      if (!task) {
        res.status(404).json({ error: "Main task not found" });
        return;
      }

      const scope = await resolveProjectFromMainTask((req.params.id as string));
      if (!scope || scope.clientId !== req.user.clientId) {
        res
          .status(403)
          .json({ error: "Forbidden — not your client's project" });
        return;
      }

      if (task.status !== "CLIENT_SIGNOFF") {
        res.status(400).json({
          error: `Task status is ${task.status}, must be CLIENT_SIGNOFF`,
        });
        return;
      }

      await db
        .update(mainTask)
        .set({
          status: "COMPLETE",
          clientSignedAt: new Date(),
          clientSignedByUserId: req.user.userId,
          clientSignatureName: req.body.signatureName,
          updatedAt: new Date(),
        })
        .where(eq(mainTask.id, (req.params.id as string)));

      await recomputeWorkTypeStatus(task.workTypeId);
      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, task.workTypeId),
      });
      if (wt) {
        await recomputeProjectStatus(wt.projectId);
        await logActivity(
          wt.projectId,
          req.user.userId,
          "client_signoff",
          "MAIN_TASK",
          task.id,
          { signatureName: req.body.signatureName },
        );
      }

      res.json({
        id: task.id,
        status: "COMPLETE",
        clientSignedAt: new Date().toISOString(),
        clientSignatureName: req.body.signatureName,
      });
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/main-tasks/:id/completion-document
router.get("/:id/completion-document", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const scope = await resolveProjectFromMainTask((req.params.id as string));
    if (!scope) {
      res.status(404).json({ error: "Not found" });
      return;
    }
    if (
      req.user.role === "CLIENT" &&
      req.user.clientId !== scope.clientId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const doc = await db.query.completionDocument.findFirst({
      where: eq(completionDocument.mainTaskId, (req.params.id as string)),
    });
    if (!doc) {
      res.status(404).json({ error: "Completion document not yet compiled" });
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

export default router;
