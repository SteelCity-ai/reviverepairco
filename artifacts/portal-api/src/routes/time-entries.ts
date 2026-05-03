import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { timeEntry } from "../../lib/db/schema/portal.js";
import { eq, and, gte, lte } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";

const router: Router = Router();

const clockInBody = z.object({
  projectId: z.string().uuid(),
  dailyTaskId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  try {
    const { userId, projectId, from, to } = req.query;
    const conditions = [];
    if (userId) conditions.push(eq(timeEntry.userId, userId as string));
    if (projectId) conditions.push(eq(timeEntry.projectId, projectId as string));
    if (from) conditions.push(gte(timeEntry.clockIn, new Date(from as string)));
    if (to) conditions.push(lte(timeEntry.clockIn, new Date(to as string)));
    const entries = await db.select().from(timeEntry)
      .where(and(...conditions))
      .orderBy(timeEntry.clockIn);
    res.json(entries);
  } catch (err) { next(err); }
});

// ── Clock In ──
router.post("/clock-in", requireStaff, validate.body(clockInBody), async (req, res, next) => {
  try {
    const [entry] = await db.insert(timeEntry).values({
      userId: req.user!.userId,
      projectId: req.body.projectId,
      dailyTaskId: req.body.dailyTaskId,
      notes: req.body.notes,
      clockIn: new Date(),
    }).returning();
    res.status(201).json(entry);
  } catch (err) { next(err); }
});

// ── Clock Out ──
router.post("/:id/clock-out", requireStaff, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [entry] = await db.update(timeEntry)
      .set({ clockOut: new Date() })
      .where(eq(timeEntry.id, id as string)).returning();
    if (!entry) return res.status(404).json({ error: "Time entry not found" });
    res.json(entry);
  } catch (err) { next(err); }
});

export default router;
