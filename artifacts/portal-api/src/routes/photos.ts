import { Router } from "express";
import multer from "multer";
import { db } from "../../lib/db/index.js";
import {
  taskPhoto,
  dailyTask,
  mainTask,
  workType,
  project,
} from "../../lib/db/schema/portal.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth.js";
import { uploadPhoto, downloadBytes, deleteObject } from "../lib/storage.js";
import { recomputeMainTaskStatus, logActivity } from "../lib/db-helpers.js";

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

async function resolvePhotoScope(photoId: string): Promise<
  | {
      photo: typeof taskPhoto.$inferSelect;
      projectId: string;
      clientId: string;
      assigneeId: string | null;
    }
  | null
> {
  const photo = await db.query.taskPhoto.findFirst({
    where: eq(taskPhoto.id, photoId),
  });
  if (!photo) return null;
  const dt = await db.query.dailyTask.findFirst({
    where: eq(dailyTask.id, photo.dailyTaskId),
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
    photo,
    projectId: p.id,
    clientId: p.clientId,
    assigneeId: dt.assignedToUserId ?? null,
  };
}

async function resolveDailyTaskScope(dailyTaskId: string) {
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
  return { dailyTask: dt, projectId: p.id, clientId: p.clientId };
}

// GET /api/v1/photos?dailyTaskId=... | ?projectId=...
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const dailyTaskId = req.query.dailyTaskId as string | undefined;
    const projectId = req.query.projectId as string | undefined;

    if (projectId && !dailyTaskId) {
      const proj = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });
      if (!proj) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      if (req.user.role === "CLIENT" && proj.clientId !== req.user.clientId) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
      const photos = await db
        .select({
          id: taskPhoto.id,
          dailyTaskId: taskPhoto.dailyTaskId,
          objectKey: taskPhoto.objectKey,
          originalFilename: taskPhoto.originalFilename,
          mimeType: taskPhoto.mimeType,
          sizeBytes: taskPhoto.sizeBytes,
          uploadedByUserId: taskPhoto.uploadedByUserId,
          caption: taskPhoto.caption,
          pmStatus: taskPhoto.pmStatus,
          pmRejectReason: taskPhoto.pmRejectReason,
          createdAt: taskPhoto.createdAt,
          updatedAt: taskPhoto.updatedAt,
        })
        .from(taskPhoto)
        .innerJoin(dailyTask, eq(taskPhoto.dailyTaskId, dailyTask.id))
        .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
        .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
        .where(eq(workType.projectId, projectId))
        .orderBy(desc(taskPhoto.createdAt));

      let filtered = photos;
      if (req.user.role === "CREW") {
        const myAssigned = await db
          .select({ id: dailyTask.id })
          .from(dailyTask)
          .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
          .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
          .where(
            and(
              eq(workType.projectId, projectId),
              eq(dailyTask.assignedToUserId, req.user.userId),
            ),
          );
        const allowedDts = new Set(myAssigned.map((d) => d.id));
        filtered = photos.filter((ph) => allowedDts.has(ph.dailyTaskId));
      }
      res.json(filtered);
      return;
    }

    if (!dailyTaskId) {
      res
        .status(400)
        .json({ error: "dailyTaskId or projectId query parameter is required" });
      return;
    }

    const scope = await resolveDailyTaskScope(dailyTaskId);
    if (!scope) {
      res.status(404).json({ error: "Daily task not found" });
      return;
    }
    if (
      req.user.role === "CREW" &&
      scope.dailyTask.assignedToUserId !== req.user.userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CLIENT" && req.user.clientId !== scope.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const photos = await db
      .select()
      .from(taskPhoto)
      .where(eq(taskPhoto.dailyTaskId, dailyTaskId))
      .orderBy(desc(taskPhoto.createdAt));
    res.json(photos);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/photos/daily-tasks/:id/photos — upload (assignee or admin)
router.post(
  "/daily-tasks/:id/photos",
  upload.single("file"),
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

      const scope = await resolveDailyTaskScope((req.params.id as string));
      if (!scope) {
        res.status(404).json({ error: "Daily task not found" });
        return;
      }
      const isAssignee =
        scope.dailyTask.assignedToUserId === req.user.userId;
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
          dailyTaskId: scope.dailyTask.id,
        },
      );

      const [photo] = await db
        .insert(taskPhoto)
        .values({
          dailyTaskId: scope.dailyTask.id,
          objectKey,
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          uploadedByUserId: req.user.userId,
          caption: req.body.caption ?? null,
        })
        .returning();

      res.status(201).json(photo);
    } catch (err) {
      next(err);
    }
  },
);

router.post("/:id/approve", requireAdmin, async (req, res, next) => {
  try {
    const [updated] = await db
      .update(taskPhoto)
      .set({ pmStatus: "APPROVED", updatedAt: new Date() })
      .where(eq(taskPhoto.id, (req.params.id as string)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/reject", requireAdmin, async (req, res, next) => {
  try {
    const reason = req.body.reason as string | undefined;
    const [updated] = await db
      .update(taskPhoto)
      .set({
        pmStatus: "REJECTED",
        pmRejectReason: reason ?? null,
        updatedAt: new Date(),
      })
      .where(eq(taskPhoto.id, (req.params.id as string)))
      .returning();
    if (!updated) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/photos/:id — uploader or ADMIN
router.delete("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const scope = await resolvePhotoScope(req.params.id as string);
    if (!scope) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }
    const isUploader = scope.photo.uploadedByUserId === req.user.userId;
    const isAdmin = req.user.role === "ADMIN";
    if (!isUploader && !isAdmin) {
      res
        .status(403)
        .json({ error: "Forbidden — only the uploader or an admin can delete" });
      return;
    }

    await db.delete(taskPhoto).where(eq(taskPhoto.id, scope.photo.id));

    try {
      await deleteObject(scope.photo.objectKey);
    } catch (e) {
      console.warn(
        `[photos] Object-storage delete failed for ${scope.photo.objectKey}:`,
        e,
      );
    }

    const dt = await db.query.dailyTask.findFirst({
      where: eq(dailyTask.id, scope.photo.dailyTaskId),
    });
    if (dt) await recomputeMainTaskStatus(dt.mainTaskId);

    await logActivity(
      scope.projectId,
      req.user.userId,
      "photo_deleted",
      "TASK_PHOTO",
      scope.photo.id,
      { filename: scope.photo.originalFilename ?? null },
    );

    res.json({ id: scope.photo.id, deleted: true });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/photos/:id/file — proxy bytes (per-request authz)
router.get("/:id/file", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const scope = await resolvePhotoScope((req.params.id as string));
    if (!scope) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }
    if (
      req.user.role === "CREW" &&
      scope.assigneeId !== req.user.userId &&
      scope.photo.uploadedByUserId !== req.user.userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CLIENT" && req.user.clientId !== scope.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    const bytes = await downloadBytes(scope.photo.objectKey);
    res.setHeader("Content-Type", scope.photo.mimeType ?? "application/octet-stream");
    res.setHeader("Cache-Control", "private, max-age=300");
    res.send(bytes);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/photos/:id/url — convenience: returns the proxy path.
// Same authz as /file to avoid resource-existence enumeration.
router.get("/:id/url", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const scope = await resolvePhotoScope((req.params.id as string));
    if (!scope) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }
    if (
      req.user.role === "CREW" &&
      scope.assigneeId !== req.user.userId &&
      scope.photo.uploadedByUserId !== req.user.userId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CLIENT" && req.user.clientId !== scope.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    res.json({ url: `/api/v1/photos/${scope.photo.id}/file` });
  } catch (err) {
    next(err);
  }
});

export default router;
