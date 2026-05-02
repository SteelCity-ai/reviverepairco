import { Router } from "express";
import multer from "multer";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { projectDocument, project } from "../../lib/db/schema/portal.js";
import { eq, desc } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";
import { uploadFile, getSignedUrl } from "../lib/storage.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 20 * 1024 * 1024 } });

// ── Zod schemas ────────────────────────────────────────────────────────────

const createDocumentBodySchema = z.object({
  projectId: z.string().uuid(),
  category: z.enum(["CONTRACT", "PERMIT", "RECEIPT", "OTHER"]).optional(),
  description: z.string().optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/documents?projectId=xxx — list project documents
router.get("/", async (req, res, next) => {
  try {
    const projectId = req.query.projectId as string | undefined;

    if (projectId) {
      const docs = await db
        .select()
        .from(projectDocument)
        .where(eq(projectDocument.projectId, projectId))
        .orderBy(desc(projectDocument.createdAt));
      res.json(docs);
    } else {
      const docs = await db
        .select()
        .from(projectDocument)
        .orderBy(desc(projectDocument.createdAt))
        .limit(500);
      res.json(docs);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents — upload document (staff only)
router.post(
  "/",
  requireStaff,
  upload.single("file"),
  async (req, res, next) => {
    try {
      if (!req.file) {
        res.status(400).json({ error: "No file provided" });
        return;
      }

      const projectId = req.body.projectId as string;
      if (!projectId) {
        res.status(400).json({ error: "projectId is required" });
        return;
      }

      // Verify project exists
      const proj = await db.query.project.findFirst({
        where: eq(project.id, projectId),
      });
      if (!proj) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      const category = (req.body.category as string) ?? "OTHER";

      const { objectKey } = await uploadFile(
        req.file.buffer,
        req.file.originalname,
        req.file.mimetype,
      );

      const [doc] = await db
        .insert(projectDocument)
        .values({
          projectId: proj.id,
          objectKey,
          originalFilename: req.file.originalname,
          mimeType: req.file.mimetype,
          sizeBytes: req.file.size,
          uploadedByUserId: req.user!.userId,
          category: category as typeof projectDocument.$inferSelect.category,
          description: req.body.description ?? null,
        })
        .returning();

      res.status(201).json(doc);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/documents/:id — single document metadata
router.get("/:id", async (req, res, next) => {
  try {
    const doc = await db.query.projectDocument.findFirst({
      where: eq(projectDocument.id, req.params.id!),
    });

    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:id/url — get signed URL (stub)
router.get("/:id/url", async (req, res, next) => {
  try {
    const doc = await db.query.projectDocument.findFirst({
      where: eq(projectDocument.id, req.params.id!),
    });

    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }

    const url = await getSignedUrl(doc.objectKey);
    res.json({ url });
  } catch (err) {
    next(err);
  }
});

export default router;
