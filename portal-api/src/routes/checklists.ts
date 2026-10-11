import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  checklistTemplate,
  checklistInstance,
  checklistItemInstance,
  mainTask,
  workType,
} from "../../lib/db/schema/portal.js";
import { eq, and, inArray } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";
import {
  allowedProjectIds,
  assertEntityAccess,
  assertProjectAccess,
  requireUser,
} from "../lib/project-access.js";

const router = Router();

const createTemplateBody = z.object({
  name: z.string().min(1),
  items: z.array(z.object({ label: z.string(), required: z.boolean().optional() })),
});

const createInstanceBody = z.object({
  templateId: z.string().uuid(),
  workTypeId: z.string().uuid().optional(),
  mainTaskId: z.string().uuid().optional(),
});

// ── Templates: list ──
router.get("/templates", requireStaff, async (req, res, next) => {
  try {
    const templates = await db.select().from(checklistTemplate)
      .orderBy(checklistTemplate.name);
    res.json(templates);
  } catch (err) { next(err); }
});

// ── Templates: create ──
router.post("/templates", requireAdmin, validate.body(createTemplateBody), async (req, res, next) => {
  try {
    // Note: checklist_template has no createdByUserId column —
    // user tracking is via the instances that reference this template.
    const [template] = await db.insert(checklistTemplate).values({
      name: req.body.name,
      items: req.body.items,
    }).returning();
    res.status(201).json(template);
  } catch (err) { next(err); }
});

// ── Templates: update ──
router.patch("/templates/:id", requireAdmin, async (req, res, next) => {
  try {
    const [updated] = await db.update(checklistTemplate).set(req.body)
      .where(eq(checklistTemplate.id, req.params.id as string)).returning();
    if (!updated) return res.status(404).json({ error: "Template not found" });
    res.json(updated);
  } catch (err) { next(err); }
});

// ── Instances: list ──
router.get("/instances", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const allowed = await allowedProjectIds(user);
    const conditions = [];
    if (allowed !== "ALL") {
      const projectIds = await db
        .select({ id: workType.id })
        .from(workType)
        .where(inArray(workType.projectId, allowed));
      const workTypeIds = projectIds.map((r) => r.id);
      if (workTypeIds.length === 0) return res.json([]);
      conditions.push(inArray(checklistInstance.workTypeId, workTypeIds));
    }
    const instances = await db.select().from(checklistInstance)
      .where(conditions.length > 0 ? and(...conditions) : undefined)
      .orderBy(checklistInstance.createdAt);
    res.json(instances);
  } catch (err) { next(err); }
});

// ── Instances: create ──
router.post("/instances", requireStaff, validate.body(createInstanceBody), async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    let projectId: string | null = null;
    if (req.body.workTypeId) {
      const r = await db.select({ projectId: workType.projectId })
        .from(workType).where(eq(workType.id, req.body.workTypeId)).limit(1);
      projectId = r[0]?.projectId ?? null;
    } else if (req.body.mainTaskId) {
      const r = await db.select({ projectId: workType.projectId })
        .from(mainTask).innerJoin(workType, eq(mainTask.workTypeId, workType.id))
        .where(eq(mainTask.id, req.body.mainTaskId)).limit(1);
      projectId = r[0]?.projectId ?? null;
    }
    if (!projectId) {
      return res.status(400).json({ error: "workTypeId or mainTaskId must reference an existing task" });
    }
    const access = await assertProjectAccess(user, projectId);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [instance] = await db.insert(checklistInstance).values({
      ...req.body,
      status: "IN_PROGRESS",
    }).returning();
    // Create items from template
    if (instance) {
      const template = await db.select().from(checklistTemplate)
        .where(eq(checklistTemplate.id, req.body.templateId)).limit(1);
      if (template[0]?.items) {
        const items = (template[0].items as any[]).map((item: any, index: number) => ({
          instanceId: instance.id,
          templateItemIndex: index,
          status: "PENDING" as const,
        }));
        if (items.length > 0) {
          await db.insert(checklistItemInstance).values(items);
        }
      }
    }
    res.status(201).json(instance);
  } catch (err) { next(err); }
});

// ── Instances: single with items ──
router.get("/instances/:id", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(user, "checklist_instance", req.params.id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const instance = await db.select().from(checklistInstance)
      .where(eq(checklistInstance.id, req.params.id as string)).limit(1);
    if (!instance[0]) return res.status(404).json({ error: "Instance not found" });
    const items = await db.select().from(checklistItemInstance)
      .where(eq(checklistItemInstance.instanceId, req.params.id as string));
    res.json({ ...instance[0], items });
  } catch (err) { next(err); }
});

// ── Items: mark PASS ──
router.post("/items/:id/complete", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(user, "checklist_item_instance", req.params.id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [item] = await db.update(checklistItemInstance)
      .set({
        status: "PASS",
        completedAt: new Date(),
        completedByUserId: user.userId,
      })
      .where(eq(checklistItemInstance.id, req.params.id as string)).returning();
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { next(err); }
});

// ── Items: mark FAIL ──
router.post("/items/:id/fail", requireStaff, async (req, res, next) => {
  const user = requireUser(req.user);
  if (!user) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  try {
    const access = await assertEntityAccess(user, "checklist_item_instance", req.params.id as string);
    if (!access.ok) {
      res.status(access.status).json({ error: access.error });
      return;
    }
    const [item] = await db.update(checklistItemInstance)
      .set({ status: "FAIL" })
      .where(eq(checklistItemInstance.id, req.params.id as string)).returning();
    if (!item) return res.status(404).json({ error: "Item not found" });
    res.json(item);
  } catch (err) { next(err); }
});

export default router;
