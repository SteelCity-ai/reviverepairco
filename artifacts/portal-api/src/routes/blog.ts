import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { blogPosts } from "../../lib/db/schema/portal.js";
import { eq, and, ilike, sql, isNull } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";

// ── Zod schemas ────────────────────────────────────────────────────────────

const createBlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z.string().min(1).max(255),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  author: z.string().max(255).optional(),
  featuredImage: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).optional().default([]),
  status: z
    .enum(["draft", "pending_review", "published"])
    .optional()
    .default("draft"),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  sourceInsightId: z.string().uuid().nullable().optional(),
  sourceUrl: z.string().optional(),
});

const updateBlogPostSchema = createBlogPostSchema.partial();

// ── Publish transition helpers ─────────────────────────────────────────────

const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  draft: ["pending_review", "published"], // admin can fast-track to published
  pending_review: ["published"],
  published: ["pending_review"], // unpublish back to pending_review
};

function validatePublishTransition(
  currentStatus: string,
  nextStatus: string,
): void {
  const allowed = VALID_STATUS_TRANSITIONS[currentStatus];
  if (!allowed?.includes(nextStatus)) {
    throw new Error(
      `Cannot transition blog post from "${currentStatus}" to "${nextStatus}". ` +
        `Allowed: ${allowed?.join(", ") ?? "none"}`,
    );
  }
}

// ── Admin router (Clerk-protected) ────────────────────────────────────────

const adminRouter: Router = Router();

// GET /api/v1/blog — list (filter status/category, paginate)
adminRouter.get("/", requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const category = req.query.category as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(eq(blogPosts.status, status as "draft" | "pending_review" | "published"));
    }
    if (category) {
      conditions.push(eq(blogPosts.category, category));
    }
    if (search) {
      conditions.push(ilike(blogPosts.title, `%${search}%`));
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(blogPosts)
        .where(whereClause)
        .orderBy(blogPosts.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(blogPosts)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      data: results,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/blog/by-slug/:slug — get post by slug
adminRouter.get("/by-slug/:slug", requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.slug, req.params.slug as string),
    });
    if (!result) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/blog/:id — single post by id
adminRouter.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, req.params.id as string),
    });
    if (!result) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/blog — create
adminRouter.post(
  "/",
  requireAdmin,
  validate.body(createBlogPostSchema),
  async (req, res, next) => {
    try {
      const [newPost] = await db
        .insert(blogPosts)
        .values(req.body)
        .returning();

      res.status(201).json(newPost);
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/v1/blog/:id — update
adminRouter.patch(
  "/:id",
  requireAdmin,
  validate.body(updateBlogPostSchema),
  async (req, res, next) => {
    try {
      const existing = await db.query.blogPosts.findFirst({
        where: eq(blogPosts.id, req.params.id as string),
      });
      if (!existing) {
        res.status(404).json({ error: "Blog post not found" });
        return;
      }

      // Validate status transition if status is changing
      if (req.body.status && req.body.status !== existing.status) {
        try {
          validatePublishTransition(existing.status, req.body.status);
        } catch (transitionErr) {
          res.status(422).json({ error: (transitionErr as Error).message });
          return;
        }
      }

      const values = { ...req.body, updatedAt: new Date() };
      // If transitioning to published, set publishedAt
      if (req.body.status === "published" && existing.status !== "published") {
        (values as Record<string, unknown>).publishedAt = new Date();
      }

      const [updated] = await db
        .update(blogPosts)
        .set(values)
        .where(eq(blogPosts.id, req.params.id as string))
        .returning();

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/v1/blog/:id — admin delete
adminRouter.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [deleted] = await db
      .delete(blogPosts)
      .where(eq(blogPosts.id, req.params.id as string))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    res.json({ id: req.params.id, deleted: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/blog/:id/submit-review — draft → pending_review
adminRouter.post("/:id/submit-review", requireAdmin, async (req, res, next) => {
  try {
    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, req.params.id as string),
    });
    if (!existing) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    try {
      validatePublishTransition(existing.status, "pending_review");
    } catch (transitionErr) {
      res.status(422).json({ error: (transitionErr as Error).message });
      return;
    }

    const [updated] = await db
      .update(blogPosts)
      .set({ status: "pending_review", updatedAt: new Date() })
      .where(eq(blogPosts.id, req.params.id as string))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/blog/:id/publish — pending_review → published
adminRouter.post("/:id/publish", requireAdmin, async (req, res, next) => {
  try {
    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, req.params.id as string),
    });
    if (!existing) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    try {
      validatePublishTransition(existing.status, "published");
    } catch (transitionErr) {
      res.status(422).json({ error: (transitionErr as Error).message });
      return;
    }

    const now = new Date();
    const [updated] = await db
      .update(blogPosts)
      .set({
        status: "published",
        publishedAt: existing.publishedAt ?? now,
        publishedByUserId: req.user?.userId ?? null,
        updatedAt: now,
      })
      .where(eq(blogPosts.id, req.params.id as string))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/blog/:id/unpublish — published → pending_review
adminRouter.post("/:id/unpublish", requireAdmin, async (req, res, next) => {
  try {
    const existing = await db.query.blogPosts.findFirst({
      where: eq(blogPosts.id, req.params.id as string),
    });
    if (!existing) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    try {
      validatePublishTransition(existing.status, "pending_review");
    } catch (transitionErr) {
      res.status(422).json({ error: (transitionErr as Error).message });
      return;
    }

    const [updated] = await db
      .update(blogPosts)
      .set({ status: "pending_review", updatedAt: new Date() })
      .where(eq(blogPosts.id, req.params.id as string))
      .returning();

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// ── Public router (no auth) ───────────────────────────────────────────────

const publicRouter: Router = Router();

// GET /api/v1/public/blog — published posts only, minimal fields
publicRouter.get("/", async (_req, res, next) => {
  try {
    const results = await db
      .select({
        id: blogPosts.id,
        title: blogPosts.title,
        slug: blogPosts.slug,
        excerpt: blogPosts.excerpt,
        featuredImage: blogPosts.featuredImage,
        category: blogPosts.category,
        author: blogPosts.author,
        metaTitle: blogPosts.metaTitle,
        metaDescription: blogPosts.metaDescription,
        publishedAt: blogPosts.publishedAt,
        tags: blogPosts.tags,
      })
      .from(blogPosts)
      .where(eq(blogPosts.status, "published"))
      .orderBy(blogPosts.publishedAt);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/public/blog/:slug — single published post by slug
publicRouter.get("/:slug", async (req, res, next) => {
  try {
    const result = await db.query.blogPosts.findFirst({
      where: and(
        eq(blogPosts.slug, req.params.slug as string),
        eq(blogPosts.status, "published"),
      ),
    });

    if (!result) {
      res.status(404).json({ error: "Blog post not found" });
      return;
    }

    res.json(result);
  } catch (err) {
    next(err);
  }
});

export { publicRouter };
export default adminRouter;
