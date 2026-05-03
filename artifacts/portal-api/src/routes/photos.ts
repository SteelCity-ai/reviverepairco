import { Router } from "express";
import multer from "multer";
import { db } from "../../lib/db/index.js";
import { taskPhoto, dailyTask } from "../../lib/db/schema/portal.js";
import { eq } from "drizzle-orm";
import { requireAdmin } from "../middleware/auth.js";
import { uploadFile, getSignedUrl } from "../lib/storage.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/photos — list (optional ?dailyTaskId)
router.get("/", async (req, res, next) => {
  try {
    const dailyTaskId = req.query.dailyTaskId as string | undefined;

    if (dailyTaskId) {
      const photos = await db
        .select()
        .from(taskPhoto)
        .where(eq(taskPhoto.dailyTaskId, dailyTaskId))
        .orderBy(taskPhoto.createdAt, db.desc);
      res.json(photos);
    } else {
      // Admin can see all; others limited to their uploads
      const photos = await db
        .select()
        .from(taskPhoto)
        .orderBy(taskPhoto.createdAt, db.desc)
        .limit(500);
      res.json(photos);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/daily-tasks/:id/photos — upload photo
router.post(
  "/daily-tasks/:id/photos",
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      // Verify daily task exists
      const dt = await db.query.dailyTask.findFirst({
        where: eq(dailyTask.id, req.params.id!),
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
          uploadedByUserId: req.user!.userId,
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
      .where(eq(taskPhoto.id, req.params.id!))
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
      .where(eq(taskPhoto.id, req.params.id!))
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
  try {
    const photo = await db.query.taskPhoto.findFirst({
      where: eq(taskPhoto.id, req.params.id!),
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
