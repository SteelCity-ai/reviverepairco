import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { timeEntry } from "../../lib/db/schema/portal.js";
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

const clockInBody = z.object({
  projectId: z.string().uuid(),
  dailyTaskId: z.string().uuid().optional(),
  notes: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const { userId, projectId, from, to } = req.query;
    if (projectId) {
      const access = await assertProjectAccess(user, projectId as string);
      if (!access.ok) {
        res.status(access.status).json({ error: access.error });
        return;
      }
      const entries = await db.select().from(timeEntry)
        .where(and(
          eq(timeEntry.projectId, projectId as string),
          ...(userId ? [eq(timeEntry.userId, userId as string)] : []),
          ...(from ? [gte(timeEntry.clockIn, new Date(from as string))] : []),
          ...(to ? [lte(timeEntry.clockIn, new Date(to as string))] : []),
        ))
        .orderBy(timeEntry.clockIn);
      res.json(entries);
      return;
    }
    // No projectId filter: scope to projects the user may see
    const allowed = await allowedProjectIds(user);
    if (allowed !== "ALL" && allowed.length === 0) {
      res.json([]);
      return;
    }
    const conditions = [];
    if (allowed !== "ALL") conditions.push(inArray(timeEntry.projectId, allowed));
    if (userId) conditions.push(eq(timeEntry.userId, userId as string));
    if (from) conditions.push(gte(timeEntry.clockIn, new Date(from as string)));
    if (to) conditions.push(lte(timeEntry.clockIn, new Date(to as string)));
    const entries = await db.select().from(timeEntry)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(timeEntry.clockIn);
    res.json(entries);
  } catch (err) { next(err); }
});

// ── Clock In ──
router.post("/clock-in", requireStaff, validate.body(clockInBody), async (req, res, next) => {
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
    const [entry] = await db.insert(timeEntry).values({
      userId: user.userId,
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
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(user, "time_entry", req.params.id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const { id } = req.params;
    const [entry] = await db.update(timeEntry)
      .set({ clockOut: new Date() })
      .where(eq(timeEntry.id, id as string)).returning();
    if (!entry) return res.status(404).json({ error: "Time entry not found" });
    res.json(entry);
  } catch (err) { next(err); }
});

export default router;
