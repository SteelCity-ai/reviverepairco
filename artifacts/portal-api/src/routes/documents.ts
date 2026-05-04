import { Router } from "express";
import multer from "multer";
import { db } from "../../lib/db/index.js";
import {
  projectDocument,
  project,
  workType,
  mainTask,
  dailyTask,
} from "../../lib/db/schema/portal.js";
import { eq, desc, and } from "drizzle-orm";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import { uploadDocument, downloadBytes } from "../lib/storage.js";

async function assertCrewProjectAccess(
  userId: string,
  projectId: string,
): Promise<boolean> {
  const rows = await db
    .select({ id: dailyTask.id })
    .from(dailyTask)
    .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
    .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
    .where(
      and(
        eq(workType.projectId, projectId),
        eq(dailyTask.assignedToUserId, userId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

const router: Router = Router();
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 20 * 1024 * 1024 },
});

async function loadProject(projectId: string) {
  return db.query.project.findFirst({ where: eq(project.id, projectId) });
}

// GET /api/v1/documents?projectId=... — scoped per role
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const projectId = req.query.projectId as string | undefined;
    if (!projectId) {
      res.status(400).json({ error: "projectId query parameter is required" });
      return;
    }
    const proj = await loadProject(projectId);
    if (!proj) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user.role === "CLIENT" && proj.clientId !== req.user.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CREW") {
      const allowed = await assertCrewProjectAccess(
        req.user.userId,
        projectId,
      );
      if (!allowed) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }

    const docs = await db
      .select()
      .from(projectDocument)
      .where(eq(projectDocument.projectId, projectId))
      .orderBy(desc(projectDocument.createdAt));
    res.json(docs);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/documents — admin only
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
      const projectId = req.body.projectId as string;
      if (!projectId) {
        res.status(400).json({ error: "projectId is required" });
        return;
      }
      const proj = await loadProject(projectId);
      if (!proj) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      const category =
        ((req.body.category as string) ?? "OTHER") as
          | "CONTRACT"
          | "PERMIT"
          | "RECEIPT"
          | "OTHER";

      const { objectKey } = await uploadDocument(
        req.file.buffer,
        req.file.originalname,
        { clientId: proj.clientId, projectId: proj.id },
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
          category,
          description: req.body.description ?? null,
        })
        .returning();

      res.status(201).json(doc);
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
    const doc = await db.query.projectDocument.findFirst({
      where: eq(projectDocument.id, (req.params.id as string)),
    });
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    const proj = await loadProject(doc.projectId);
    if (!proj) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user.role === "CLIENT" && proj.clientId !== req.user.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CREW") {
      const allowed = await assertCrewProjectAccess(req.user.userId, proj.id);
      if (!allowed) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    res.json(doc);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:id/file — proxy bytes
router.get("/:id/file", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const doc = await db.query.projectDocument.findFirst({
      where: eq(projectDocument.id, (req.params.id as string)),
    });
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    const proj = await loadProject(doc.projectId);
    if (!proj) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user.role === "CLIENT" && proj.clientId !== req.user.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CREW") {
      const allowed = await assertCrewProjectAccess(req.user.userId, proj.id);
      if (!allowed) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    const bytes = await downloadBytes(doc.objectKey);
    res.setHeader(
      "Content-Type",
      doc.mimeType ?? "application/octet-stream",
    );
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${doc.originalFilename ?? "file"}"`,
    );
    res.send(bytes);
  } catch (err) {
    next(err);
  }
});

// Same authz as /file to avoid resource-existence enumeration.
router.get("/:id/url", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const doc = await db.query.projectDocument.findFirst({
      where: eq(projectDocument.id, (req.params.id as string)),
    });
    if (!doc) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    const proj = await loadProject(doc.projectId);
    if (!proj) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user.role === "CLIENT" && proj.clientId !== req.user.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CREW") {
      const allowed = await assertCrewProjectAccess(req.user.userId, proj.id);
      if (!allowed) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    res.json({ url: `/api/v1/documents/${doc.id}/file` });
  } catch (err) {
    next(err);
  }
});

router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [deleted] = await db
      .delete(projectDocument)
      .where(eq(projectDocument.id, (req.params.id as string)))
      .returning();
    if (!deleted) {
      res.status(404).json({ error: "Document not found" });
      return;
    }
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
