import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { changeOrder } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireStaff } from "../middleware/auth.js";

const router: Router = Router();

const createCOBody = z.object({
  projectId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().optional(),
  reason: z.string().optional(),
  costImpact: z.number().optional(),
  scheduleImpact: z.record(z.unknown()).optional(),
  affectedTaskIds: z.array(z.string().uuid()).optional(),
});

const rejectBody = z.object({
  rejectionReason: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  try {
    const { projectId } = req.query;
    const conditions = [];
    if (projectId) conditions.push(eq(changeOrder.projectId, projectId as string));
    const items = await db.select().from(changeOrder)
      .where(and(...conditions))
      .orderBy(changeOrder.createdAt);
    res.json(items);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireStaff, validate.body(createCOBody), async (req, res, next) => {
  try {
    const [co] = await db.insert(changeOrder).values({
      ...req.body,
      status: "DRAFT",
      createdByUserId: req.user!.userId,
    }).returning();
    res.status(201).json(co);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, async (req, res, next) => {
  try {
    const [updated] = await db.update(changeOrder).set(req.body)
      .where(eq(changeOrder.id, (req.params.id as string))).returning();
    if (!updated) return res.status(404).json({ error: "Change order not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

// ── Send (DRAFT → SENT) ──
router.post("/:id/send", requireStaff, async (req, res, next) => {
  try {
    const [co] = await db.update(changeOrder)
      .set({ status: "SENT" })
      .where(eq(changeOrder.id, (req.params.id as string))).returning();
    if (!co) return res.status(404).json({ error: "Change order not found" });
    res.json(co);
  } catch (err) { next(err); }
});

// ── Client approve (SENT → APPROVED) ──
router.post("/:id/approve", requireStaff, async (req, res, next) => {
  try {
    const [co] = await db.update(changeOrder)
      .set({
        status: "APPROVED",
        clientApprovedAt: new Date(),
        clientApprovedByUserId: req.user!.userId,
      })
      .where(eq(changeOrder.id, (req.params.id as string))).returning();
    if (!co) return res.status(404).json({ error: "Change order not found" });
    res.json(co);
  } catch (err) { next(err); }
});

// ── Client reject (SENT → REJECTED) ──
router.post("/:id/reject", requireStaff, validate.body(rejectBody), async (req, res, next) => {
  try {
    const [co] = await db.update(changeOrder)
      .set({ status: "REJECTED" })
      .where(eq(changeOrder.id, (req.params.id as string))).returning();
    if (!co) return res.status(404).json({ error: "Change order not found" });
    // Note: rejectionReason from body is validated but the schema has no
    // dedicated rejection_reason column. Consider adding one or logging meta.
    res.json(co);
  } catch (err) { next(err); }
});

export default router;
