import { z } from "zod";

// ── Blog Post Schemas ─────────────────────────────────────────────────────

export const createBlogPostSchema = z.object({
  title: z.string().min(1).max(255),
  slug: z
    .string()
    .min(1)
    .max(255)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  excerpt: z.string().optional(),
  content: z.string().optional(),
  author: z.string().max(255).optional(),
  featuredImage: z.string().max(500).optional(),
  category: z.string().max(100).optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "pending_review", "published"]).default("draft"),
  metaTitle: z.string().max(255).optional(),
  metaDescription: z.string().optional(),
  sourceInsightId: z.string().uuid().optional(),
  sourceUrl: z.string().url().optional().or(z.literal("")),
});

export const updateBlogPostSchema = createBlogPostSchema.partial();

export const blogPostStatusTransitionSchema = z.object({
  status: z.enum(["draft", "pending_review", "published"]),
});

// ── Blog Insight Schemas ──────────────────────────────────────────────────

export const updateBlogInsightSchema = z.object({
  status: z.enum(["new", "used", "dismissed"]),
});

// ── Blog Generation Job Schemas ───────────────────────────────────────────

export const createBlogGenerationJobSchema = z.object({
  postId: z.string().uuid().optional(),
  type: z.enum(["research", "article", "image"]),
  params: z.record(z.unknown()).default({}),
  provider: z.string().max(100).optional(),
});

export const updateBlogGenerationJobSchema = z.object({
  status: z.enum(["queued", "running", "succeeded", "failed"]),
  error: z.string().optional(),
  params: z.record(z.unknown()).optional(),
});
