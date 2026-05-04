import { Router } from "express";
import { db } from "../../lib/db/index.js";
import { activityLog } from "../../lib/db/schema/portal.js";
import { eq, desc } from "drizzle-orm";
import { userCanAccessProject } from "../lib/db-helpers.js";

const router: Router = Router();

// ── Project activity ──
// GET /api/v1/activity/project/:projectId
router.get("/project/:projectId", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const projectId = req.params.projectId as string;
    const allowed = await userCanAccessProject(req.user, projectId);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const logs = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.projectId, projectId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

// ── Current user activity ──
// GET /api/v1/activity/me
router.get("/me", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const logs = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.actorUserId, req.user.userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
