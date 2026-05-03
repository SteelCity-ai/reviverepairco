import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { selection } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";

const router: Router = Router();

const createSelectionBody = z.object({
  projectId: z.string().uuid(),
  name: z.string().min(1),
  options: z.record(z.unknown()),
  deadline: z.string().optional(),
  workTypeId: z.string().optional(),
  mainTaskId: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const conditions = [];
    if (projectId) conditions.push(eq(selection.projectId, projectId as string));
    const items = await db.select().from(selection)
      .where(and(...conditions))
      .orderBy(selection.createdAt);
    res.json(items);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireStaff, validate.body(createSelectionBody), async (req, res, next) => {
  try {
    const [sel] = await db.insert(selection).values({
      ...req.body,
      status: "PENDING",
      createdByUserId: req.user!.userId,
    }).returning();
    res.status(201).json(sel);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, async (req, res, next) => {
  try {
    const [updated] = await db.update(selection).set(req.body)
      .where(eq(selection.id, (req.params.id as string))).returning();
    if (!updated) return res.status(404).json({ error: "Selection not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
