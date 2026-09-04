import { Router } from "express";
import multer from "multer";
import { requireAdmin } from "../middleware/auth.js";
import {
  mediaAdapter,
  buildBlogMediaKey,
  MEDIA_BASE_URL,
} from "../lib/storage-local.js";

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB — image-only v1
});

/**
 * POST /api/v1/media
 *
 * Upload a media file (admin only). Accepts multipart/form-data with a
 * "file" field and an optional "prefix" body field (default "general").
 *
 * Returns the public URL for the uploaded asset.
 */
router.post(
  "/",
  requireAdmin,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const prefix = (req.body.prefix as string) || "general";
      const objectKey = buildBlogMediaKey(prefix, req.file.originalname);

      await mediaAdapter.uploadBytes(req.file.buffer, objectKey);

      const url = `${MEDIA_BASE_URL}/${objectKey}`;

      res.status(201).json({
        objectKey,
        url,
        originalFilename: req.file.originalname,
        mimeType: req.file.mimetype,
        sizeBytes: req.file.size,
      });
    } catch (err) {
      next(err);
    }
  },
);

export default router;
