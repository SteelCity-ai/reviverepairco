import { Router } from "express";
import { db } from "../../lib/db/index.js";
import { activityLog } from "../../lib/db/schema/portal.js";
import { eq, desc } from "drizzle-orm";
import { requireStaff } from "../middleware/auth.js";

const router: Router = Router();

// ── Project activity ──
// GET /api/v1/activity/project/:projectId
router.get("/project/:projectId", requireStaff, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const logs = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.projectId, req.params.projectId as string))
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
router.get("/me", requireStaff, async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(parseInt(req.query.limit as string) || 20, 1), 100);
    const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
    const logs = await db
      .select()
      .from(activityLog)
      .where(eq(activityLog.actorUserId, req.user!.userId))
      .orderBy(desc(activityLog.createdAt))
      .limit(limit)
      .offset(offset);
    res.json(logs);
  } catch (err) {
    next(err);
  }
});

export default router;
