import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { project, userProfile, client } from "../../lib/db/schema/portal.js";
import { eq, ilike, and, or, desc } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import { logActivity } from "../lib/db-helpers.js";

const router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createProjectSchema = z.object({
  clientId: z.string().uuid(),
  name: z.string().min(1).max(255),
  description: z.string().optional(),
  siteAddress: z.record(z.unknown()).optional(),
  status: z
    .enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETE", "CANCELLED"])
    .optional(),
  projectManagerUserId: z.string().uuid().optional(),
  startDate: z.string().optional(),
  targetEndDate: z.string().optional(),
});

const updateProjectSchema = z.object({
  clientId: z.string().uuid().optional(),
  name: z.string().min(1).max(255).optional(),
  description: z.string().optional(),
  siteAddress: z.record(z.unknown()).optional(),
  status: z
    .enum(["PLANNED", "ACTIVE", "ON_HOLD", "COMPLETE", "CANCELLED"])
    .optional(),
  projectManagerUserId: z.string().uuid().nullable().optional(),
  startDate: z.string().nullable().optional(),
  targetEndDate: z.string().nullable().optional(),
  invoiceStatus: z
    .enum(["NOT_INVOICED", "INVOICED", "PAID"])
    .optional(),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/projects — list with optional filters
router.get("/", async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const clientId = req.query.clientId as string | undefined;
    const search = req.query.search as string | undefined;

    // Client users can only see their own projects
    if (req.user?.role === "CLIENT" && req.user.clientId) {
      const projects = await db
        .select()
        .from(project)
        .where(eq(project.clientId, req.user.clientId))
        .orderBy(desc(project.updatedAt));

      res.json(projects);
      return;
    }

    // Fetch all projects for ADMIN/CREW
    const allProjects = await db
      .select()
      .from(project)
      .orderBy(desc(project.updatedAt));

    // Apply filters in-memory (simpler than building dynamic where)
    let results = allProjects;
    if (status) {
      results = results.filter(
        (p) => p.status === (status as typeof project.$inferSelect.status),
      );
    }
    if (clientId) {
      results = results.filter((p) => p.clientId === clientId);
    }
    if (search) {
      const lower = search.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(lower));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/projects — create project (admin only)
router.post(
  "/",
  requireAdmin,
  validate.body(createProjectSchema),
  async (req, res, next) => {
    try {
      const [newProject] = await db
        .insert(project)
        .values(req.body)
        .returning();

      await logActivity(
        newProject!.id,
        req.user!.userId,
        "project_created",
        "PROJECT",
        newProject!.id,
      );

      res.status(201).json(newProject);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/projects/:id — single project with relations
router.get("/:id", async (req, res, next) => {
  try {
    const result = await db.query.project.findFirst({
      where: eq(project.id, req.params.id!),
      with: {
        client: true,
        projectManager: true,
        workTypes: { orderBy: (wt, { asc }) => [asc(wt.sortOrder)] },
        documents: true,
      },
    });

    if (!result) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    // Client users can only see their own projects
    if (
      req.user?.role === "CLIENT" &&
      req.user.clientId !== result.clientId
    ) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/projects/:id — update project (admin only)
router.patch(
  "/:id",
  requireAdmin,
  validate.body(updateProjectSchema),
  async (req, res, next) => {
    try {
      const prev = await db.query.project.findFirst({
        where: eq(project.id, req.params.id!),
      });
      if (!prev) {
        res.status(404).json({ error: "Project not found" });
        return;
      }

      const [updated] = await db
        .update(project)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(project.id, req.params.id!))
        .returning();

      // Log status transitions
      if (req.body.status && req.body.status !== prev.status) {
        await logActivity(
          req.params.id!,
          req.user!.userId,
          `status_change:${prev.status}→${req.body.status}`,
          "PROJECT",
          req.params.id!,
        );
      }

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/projects/:id/activity — activity feed
router.get("/:id/activity", async (req, res, next) => {
  try {
    const { activityLog } = await import(
      "../../lib/db/schema/portal.js"
    );

    const activities = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.projectId, req.params.id!))
      .orderBy(desc(activityLog.createdAt))
      .limit(100);

    res.json(activities);
  } catch (err) {
    next(err);
  }
});

export default router;
