import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  project,
  workType,
  mainTask,
  dailyTask,
  activityLog,
} from "../../lib/db/schema/portal.js";
import { eq, desc, inArray } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";
import { logActivity } from "../lib/db-helpers.js";

const router: Router = Router();

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

/**
 * Returns the set of project IDs the given crew user is assigned to.
 * "Assigned" = has at least one daily_task with assignedToUserId === userId.
 */
async function crewAssignedProjectIds(crewUserId: string): Promise<Set<string>> {
  const tasks = await db
    .select({ mainTaskId: dailyTask.mainTaskId })
    .from(dailyTask)
    .where(eq(dailyTask.assignedToUserId, crewUserId));
  if (tasks.length === 0) return new Set();
  const mainTaskIds = Array.from(new Set(tasks.map((t) => t.mainTaskId)));
  const mts = await db
    .select({ workTypeId: mainTask.workTypeId })
    .from(mainTask)
    .where(inArray(mainTask.id, mainTaskIds));
  const wtIds = Array.from(new Set(mts.map((m) => m.workTypeId)));
  if (!wtIds.length) return new Set();
  const wts = await db
    .select({ projectId: workType.projectId })
    .from(workType)
    .where(inArray(workType.id, wtIds));
  return new Set(wts.map((w) => w.projectId));
}

// GET /api/v1/projects — scoped per role
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const status = req.query.status as string | undefined;
    const clientId = req.query.clientId as string | undefined;
    const search = req.query.search as string | undefined;

    let scoped: Array<typeof project.$inferSelect>;

    if (req.user.role === "CLIENT") {
      if (!req.user.clientId) {
        res.json([]);
        return;
      }
      scoped = await db
        .select()
        .from(project)
        .where(eq(project.clientId, req.user.clientId))
        .orderBy(desc(project.updatedAt));
    } else if (req.user.role === "CREW") {
      const allowed = await crewAssignedProjectIds(req.user.userId);
      if (allowed.size === 0) {
        res.json([]);
        return;
      }
      scoped = await db
        .select()
        .from(project)
        .where(inArray(project.id, Array.from(allowed)))
        .orderBy(desc(project.updatedAt));
    } else {
      scoped = await db
        .select()
        .from(project)
        .orderBy(desc(project.updatedAt));
    }

    let results = scoped;
    if (status) results = results.filter((p) => p.status === status);
    if (clientId) results = results.filter((p) => p.clientId === clientId);
    if (search) {
      const lower = search.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(lower));
    }

    res.json(results);
  } catch (err) {
    next(err);
  }
});

router.post(
  "/",
  requireAdmin,
  validate.body(createProjectSchema),
  async (req, res, next) => {
    try {
      const [newProject] = await db.insert(project).values(req.body).returning();
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

// GET /api/v1/projects/:id — scoped per role
router.get("/:id", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const result = await db.query.project.findFirst({
      where: eq(project.id, (req.params.id as string)),
      with: {
        client: true,
        projectManager: true,
        workTypes: {
          orderBy: (wt, { asc }) => [asc(wt.sortOrder)],
          with: {
            mainTasks: {
              orderBy: (mt, { asc }) => [asc(mt.sortOrder)],
              with: {
                dailyTasks: {
                  orderBy: (dt, { asc }) => [asc(dt.sortOrder)],
                },
              },
            },
          },
        },
        documents: true,
      },
    });

    if (!result) {
      res.status(404).json({ error: "Project not found" });
      return;
    }

    if (req.user.role === "CLIENT" && req.user.clientId !== result.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CREW") {
      const allowed = await crewAssignedProjectIds(req.user.userId);
      if (!allowed.has(result.id)) {
        res.status(403).json({ error: "Forbidden — not assigned" });
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
  requireAdmin,
  validate.body(updateProjectSchema),
  async (req, res, next) => {
    try {
      const prev = await db.query.project.findFirst({
        where: eq(project.id, (req.params.id as string)),
      });
      if (!prev) {
        res.status(404).json({ error: "Project not found" });
        return;
      }
      const [updated] = await db
        .update(project)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(project.id, (req.params.id as string)))
        .returning();

      if (req.body.status && req.body.status !== prev.status) {
        await logActivity(
          (req.params.id as string),
          req.user!.userId,
          `status_change:${prev.status}→${req.body.status}`,
          "PROJECT",
          (req.params.id as string),
        );
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/projects/:id/activity — activity feed (scoped)
router.get("/:id/activity", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const proj = await db.query.project.findFirst({
      where: eq(project.id, (req.params.id as string)),
    });
    if (!proj) {
      res.status(404).json({ error: "Project not found" });
      return;
    }
    if (req.user.role === "CLIENT" && req.user.clientId !== proj.clientId) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    if (req.user.role === "CREW") {
      const allowed = await crewAssignedProjectIds(req.user.userId);
      if (!allowed.has(proj.id)) {
        res.status(403).json({ error: "Forbidden" });
        return;
      }
    }
    const activities = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.projectId, (req.params.id as string)))
      .orderBy(desc(activityLog.createdAt))
      .limit(100);
    res.json(activities);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/projects/:id/documents — admin upload (proxy to documents router)
router.post("/:id/documents", requireAdmin, (req, res) => {
  // Convenience: clients can also use POST /documents with projectId in body.
  res.status(308).redirect(`/api/v1/documents`);
});

// GET /api/v1/projects/:id/documents — list (scoped)
router.get("/:id/documents", async (req, res) => {
  res.redirect(307, `/api/v1/documents?projectId=${(req.params.id as string)}`);
});

export default router;
