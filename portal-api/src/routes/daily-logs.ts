import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { dailyLog } from "../../lib/db/schema/portal.js";
import { eq, and, gte, lte, inArray } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";
import {
  allowedProjectIds,
  assertEntityAccess,
  assertProjectAccess,
  requireUser,
} from "../lib/project-access.js";

const router = Router();

const createLogBody = z.object({
  projectId: z.string().uuid(),
  date: z.string(),
  weather: z.record(z.unknown()).optional(),
  crewNotes: z.string().optional(),
  delays: z.string().optional(),
  safetyNotes: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { projectId, from, to } = req.query;
    if (projectId) {
      const access = await assertProjectAccess(user, projectId as string);
      if (!access.ok) {
        res.status(access.status).json({ error: access.error });
        return;
      }
      const logs = await db.select().from(dailyLog)
        .where(and(
          eq(dailyLog.projectId, projectId as string),
          ...(from ? [gte(dailyLog.date, from as string)] : []),
          ...(to ? [lte(dailyLog.date, to as string)] : []),
        ))
        .orderBy(dailyLog.date);
      res.json(logs);
      return;
    }
    // No projectId filter: scope to projects the user may see
    const allowed = await allowedProjectIds(user);
    if (allowed !== "ALL" && allowed.length === 0) {
      res.json([]);
      return;
    }
    const conditions = [];
    if (allowed !== "ALL") conditions.push(inArray(dailyLog.projectId, allowed));
    if (from) conditions.push(gte(dailyLog.date, from as string));
    if (to) conditions.push(lte(dailyLog.date, to as string));
    const logs = await db.select().from(dailyLog)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(dailyLog.date);
    res.json(logs);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireStaff, validate.body(createLogBody), async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertProjectAccess(user, req.body.projectId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [log] = await db.insert(dailyLog)
      .values({
        ...req.body,
        createdByUserId: user.userId,
      })
      .onConflictDoNothing()
      .returning();
    if (!log) return res.status(409).json({ error: "Daily log already exists for this project and date" });
    res.status(201).json(log);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(user, "daily_log", req.params.id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [updated] = await db.update(dailyLog).set(req.body)
      .where(eq(dailyLog.id, req.params.id as string)).returning();
    if (!updated) return res.status(404).json({ error: "Daily log not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
