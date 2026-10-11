import { Router } from "express";
import multer from "multer";
import { db } from "../../lib/db/index.js";
import {
  taskPhoto,
  dailyTask,
  mainTask,
  workType,
} from "../../lib/db/schema/portal.js";
import { desc, eq, inArray } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth.js";
import { uploadFile, getSignedUrl } from "../lib/storage.js";
import {
  allowedProjectIds,
  assertEntityAccess,
  assertProjectAccess,
  requireUser,
  resolveEntityProjectId,
} from "../lib/project-access.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/photos — list (optional ?dailyTaskId)
router.get("/", async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const dailyTaskId = req.query.dailyTaskId as string | undefined;

    if (dailyTaskId) {
      // Gate through the daily task's owning project
      const projectId = await resolveEntityProjectId("daily_task", dailyTaskId);
      if (!projectId) {
        res.status(404).json({ error: "Daily task not found" });
        return;
      }
      const access = await assertProjectAccess(user, projectId);
      if (!access.ok) {
        res.status(access.status).json({ error: access.error });
        return;
      }
      const photos = await db
        .select()
        .from(taskPhoto)
        .where(eq(taskPhoto.dailyTaskId, dailyTaskId))
        .orderBy(desc(taskPhoto.createdAt));
      res.json(photos);
      return;
    }

    // Scope the listing to projects the user may see
    const allowed = await allowedProjectIds(user);
    if (allowed !== "ALL" && allowed.length === 0) {
      res.json([]);
      return;
    }

    const photos =
      allowed === "ALL"
        ? await db
            .select()
            .from(taskPhoto)
            .orderBy(desc(taskPhoto.createdAt))
            .limit(500)
        : await db
            .select()
            .from(taskPhoto)
            .where(
              inArray(
                taskPhoto.dailyTaskId,
                db
                  .select({ id: dailyTask.id })
                  .from(dailyTask)
                  .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
                  .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
                  .where(inArray(workType.projectId, allowed)),
              ),
            )
            .orderBy(desc(taskPhoto.createdAt))
            .limit(500);
    res.json(photos);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/daily-tasks/:id/photos — upload photo
router.post(
  "/daily-tasks/:id/photos",
  upload.single("file"),
  async (req, res, next) => {
    const user = requireUser(req.user);
    if (!user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      // Access gate: project manager or assigned crew may upload
      const access = await assertEntityAccess(
        user,
        "daily_task",
        req.params.id as string,
      );
      if (!access.ok) {
        res.status(access.status).json({ error: access.error });
        return;
      }

      // Verify daily task exists
      const dt = await db.query.dailyTask.findFirst({
        where: eq(dailyTask.id, req.params.id as string),
      });
      if (!dt) {
        res.status(404).json({ error: "Daily task not found" });
        return;
      }

      // Upload to storage (stub)
      const { objectKey } = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );

      // Create task_photo record
      const [photo] = await db
        .insert(taskPhoto)
        .values({
          dailyTaskId: dt.id,
          objectKey,
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          uploadedByUserId: user.userId,
          caption: req.body.caption ?? null,
        })
        .returning();

      res.status(201).json(photo);
    } catch (err) {
      next(err);
    }
  },
);

// POST /api/v1/photos/:id/approve — admin approves photo
router.post("/:id/approve", requireAdmin, async (req, res, next) => {
  try {
    const [updated] = await db
      .update(taskPhoto)
      .set({ pmStatus: "APPROVED", updatedAt: new Date() })
      .where(eq(taskPhoto.id, req.params.id as string))
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

// POST /api/v1/photos/:id/reject — admin rejects photo
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
      .where(eq(taskPhoto.id, req.params.id as string))
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

// GET /api/v1/photos/:id/url — get signed URL (stub)
router.get("/:id/url", async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(
      user,
      "task_photo",
      req.params.id as string,
    );
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }

    const photo = await db.query.taskPhoto.findFirst({
      where: eq(taskPhoto.id, req.params.id as string),
    });

    if (!photo) {
      res.status(404).json({ error: "Photo not found" });
      return;
    }

    const url = await getSignedUrl(photo.objectKey);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

export default router;
