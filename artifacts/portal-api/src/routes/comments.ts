import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { comment } from "../../lib/db/schema/portal.js";
import { eq, and, desc } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import {
  resolveProjectIdForEntity,
  userCanAccessProject,
} from "../lib/db-helpers.js";

const router: Router = Router();

const entityTypeEnum = z.enum(["PROJECT", "WORK_TYPE", "MAIN_TASK", "DAILY_TASK"]);

const createCommentSchema = z.object({
  entityType: entityTypeEnum,
  entityId: z.string().uuid(),
  body: z.string().min(1),
});

const listQuerySchema = z.object({
  entityType: entityTypeEnum,
  entityId: z.string().uuid(),
});

// GET /api/v1/comments?entityType=…&entityId=… — scoped list
router.get("/", async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const parsed = listQuerySchema.safeParse({
      entityType: req.query.entityType,
      entityId: req.query.entityId,
    });
    if (!parsed.success) {
      res
        .status(400)
        .json({ error: "entityType and entityId query parameters are required" });
      return;
    }
    const { entityType, entityId } = parsed.data;
    const projectId = await resolveProjectIdForEntity(entityType, entityId);
    if (!projectId) {
      res.status(404).json({ error: "Entity not found" });
      return;
    }
    const allowed = await userCanAccessProject(req.user, projectId);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const results = await db
      .select()
      .from(comment)
      .where(
        and(
          eq(
            comment.entityType,
            entityType as typeof comment.$inferSelect.entityType,
          ),
          eq(comment.entityId, entityId),
        ),
      )
      .orderBy(desc(comment.createdAt));
    res.json(results);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/comments — create comment (scoped)
router.post("/", validate.body(createCommentSchema), async (req, res, next) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const { entityType, entityId } = req.body as z.infer<typeof createCommentSchema>;
    const projectId = await resolveProjectIdForEntity(entityType, entityId);
    if (!projectId) {
      res.status(404).json({ error: "Entity not found" });
      return;
    }
    const allowed = await userCanAccessProject(req.user, projectId);
    if (!allowed) {
      res.status(403).json({ error: "Forbidden" });
      return;
    }
    const [newComment] = await db
      .insert(comment)
      .values({
        ...req.body,
        authorUserId: req.user.userId,
      })
      .returning();
    res.status(201).json(newComment);
  } catch (err) {
    next(err);
  }
});

export default router;
