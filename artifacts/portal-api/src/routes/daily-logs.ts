import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { dailyLog } from "../../lib/db/schema/portal.js";
import { eq, and, gte, lte } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";

const router: Router = Router();

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
  try {
    const { projectId, from, to } = req.query;
    const conditions = [];
    if (projectId) conditions.push(eq(dailyLog.projectId, projectId as string));
    if (from) conditions.push(gte(dailyLog.date, from as string));
    if (to) conditions.push(lte(dailyLog.date, to as string));
    const logs = await db.select().from(dailyLog)
      .where(and(...conditions))
      .orderBy(dailyLog.date);
    res.json(logs);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireStaff, validate.body(createLogBody), async (req, res, next) => {
  try {
    const [log] = await db.insert(dailyLog)
      .values({
        ...req.body,
        createdByUserId: req.user!.userId,
      })
      .onConflictDoNothing()
      .returning();
    if (!log) return res.status(409).json({ error: "Daily log already exists for this project and date" });
    res.status(201).json(log);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, async (req, res, next) => {
  try {
    const [updated] = await db.update(dailyLog).set(req.body)
      .where(eq(dailyLog.id, (req.params.id as string))).returning();
    if (!updated) return res.status(404).json({ error: "Daily log not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
