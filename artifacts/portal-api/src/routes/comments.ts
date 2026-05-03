import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { comment } from "../../lib/db/schema/portal.js";
import { eq, and, desc } from "drizzle-orm";
import { validate } from "../middleware/validate.js";

const router: Router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createCommentSchema = z.object({
  entityType: z.enum(["PROJECT", "WORK_TYPE", "MAIN_TASK", "DAILY_TASK"]),
  entityId: z.string().uuid(),
  body: z.string().min(1),
});

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/comments — list (query entityType, entityId)
router.get("/", async (req, res, next) => {
  try {
    const entityType = req.query.entityType as string | undefined;
    const entityId = req.query.entityId as string | undefined;

    if (entityType && entityId) {
      const results = await db
        .select()
        .from(comment)
        .where(
          and(
            eq(comment.entityType, entityType as typeof comment.$inferSelect.entityType),
            eq(comment.entityId, entityId),
          ),
        )
        .orderBy(desc(comment.createdAt));

      res.json(results);
    } else {
      // If no filters, return recent comments (admin view)
      const results = await db
        .select()
        .from(comment)
        .orderBy(desc(comment.createdAt))
        .limit(100);

      res.json(results);
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/comments — create comment
router.post(
  "/",
  validate.body(createCommentSchema),
  async (req, res, next) => {
    try {
      const [newComment] = await db
        .insert(comment)
        .values({
          ...req.body,
          authorUserId: req.user!.userId,
        })
        .returning();

      res.status(201).json(newComment);
    } catch (err) {
      next(err);
    }
  },
);

export default router;
