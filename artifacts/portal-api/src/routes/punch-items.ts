import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { punchItem } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";

const router: Router = Router();

const createPunchItemSchema = z.object({
  description: z.string().min(1),
  assigneeId: z.string().uuid(),
  workTypeId: z.string().uuid().optional(),
  deadline: z.string().optional(),
  projectId: z.string().uuid(),
});

const updatePunchItemSchema = z.object({
  status: z.enum(["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED"]).optional(),
  description: z.string().min(1).optional(),
  assigneeId: z.string().uuid().optional(),
  deadline: z.string().optional(),
});

// ── List ──
router.get("/", requireStaff, async (req, res, next) => {
  try {
    const { projectId, assigneeId, status } = req.query;
    const conditions = [];
    if (projectId) conditions.push(eq(punchItem.projectId, projectId as string));
    if (assigneeId) conditions.push(eq(punchItem.assigneeId, assigneeId as string));
    if (status) conditions.push(eq(punchItem.status, status as "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED"));
    const items = await db.select().from(punchItem).where(and(...conditions)).orderBy(punchItem.createdAt);
    res.json(items);
  } catch (err) { next(err); }
});

// ── Create ──
router.post("/", requireAdmin, validate.body(createPunchItemSchema), async (req, res, next) => {
  try {
    const [item] = await db.insert(punchItem).values({
      ...req.body,
      status: "OPEN",
      createdByUserId: req.user!.userId,
    }).returning();
    res.status(201).json(item);
  } catch (err) { next(err); }
});

// ── Update ──
router.patch("/:id", requireStaff, validate.body(updatePunchItemSchema), async (req, res, next) => {
  try {
    const { id } = req.params;
    // VERIFIED status requires ADMIN
    if (req.body.status === "VERIFIED" && req.user!.role !== "ADMIN") {
      return res.status(403).json({ error: "Only admins can verify punch items" });
    }
    const [updated] = await db.update(punchItem).set(req.body).where(eq(punchItem.id, id as string)).returning();
    if (!updated) return res.status(404).json({ error: "Punch item not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

export default router;
