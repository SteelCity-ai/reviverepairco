import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { changeOrder } from "../../lib/db/schema/portal.js";
import { eq, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import { userCanAccessProject } from "../lib/db-helpers.js";

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

async function loadCO(id: string) {
  return db.query.changeOrder.findFirst({
    where: eq(changeOrder.id, id),
  });
}

// ── List (scoped) ──
router.get("/", requireStaff, async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { projectId } = req.query;
    if (!projectId) {
      if (req.user.role !== "ADMIN") {
        res.status(400).json({ error: "projectId query parameter is required" });
        return;
      }
      const items = await db.select().from(changeOrder).orderBy(changeOrder.createdAt);
      res.json(items);
      return;
    }
    const allowed = await userCanAccessProject(req.user, projectId as string);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const items = await db
      .select()
      .from(changeOrder)
      .where(eq(changeOrder.projectId, projectId as string))
      .orderBy(changeOrder.createdAt);
    res.json(items);
  } catch (err) {
    next(err);
  }
});

// ── Create (admin only — costs/scope changes) ──
router.post("/", requireAdmin, validate.body(createCOBody), async (req, res, next) => {
  try {
    const [co] = await db
      .insert(changeOrder)
      .values({
        ...req.body,
        status: "DRAFT",
        createdByUserId: req.user!.userId,
      })
      .returning();
    res.status(201).json(co);
  } catch (err) {
    next(err);
  }
});

// ── Update (admin only) ──
router.patch("/:id", requireAdmin, async (req, res, next) => {
  try {
    const existing = await loadCO(req.params.id as string);
    if (!existing) {
      res.status(404).json({ error: "Change order not found" });
      return;
    }
    const [updated] = await db
      .update(changeOrder)
      .set(req.body)
      .where(eq(changeOrder.id, req.params.id as string))
      .returning();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Send (admin; DRAFT → SENT) ──
router.post("/:id/send", requireAdmin, async (req, res, next) => {
  try {
    const [co] = await db
      .update(changeOrder)
      .set({ status: "SENT" })
      .where(eq(changeOrder.id, req.params.id as string))
      .returning();
    if (!co) {
      res.status(404).json({ error: "Change order not found" });
      return;
    }
    res.json(co);
  } catch (err) {
    next(err);
  }
});

// ── Client approve (CLIENT user of project's client; SENT → APPROVED) ──
router.post("/:id/approve", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const co = await loadCO(req.params.id as string);
    if (!co) {
      res.status(404).json({ error: "Change order not found" });
      return;
    }
    if (req.user.role !== "ADMIN" && req.user.role !== "CLIENT") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const allowed = await userCanAccessProject(req.user, co.projectId);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [updated] = await db
      .update(changeOrder)
      .set({
        status: "APPROVED",
        clientApprovedAt: new Date(),
        clientApprovedByUserId: req.user.userId,
      })
      .where(eq(changeOrder.id, req.params.id as string))
      .returning();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Client reject (CLIENT user of project's client; SENT → REJECTED) ──
router.post("/:id/reject", validate.body(rejectBody), async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const co = await loadCO(req.params.id as string);
    if (!co) {
      res.status(404).json({ error: "Change order not found" });
      return;
    }
    if (req.user.role !== "ADMIN" && req.user.role !== "CLIENT") {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const allowed = await userCanAccessProject(req.user, co.projectId);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [updated] = await db
      .update(changeOrder)
      .set({ status: "REJECTED" })
      .where(eq(changeOrder.id, req.params.id as string))
      .returning();
    res.json(updated);
  } catch (err) {
    next(err);
  }
});

export default router;
