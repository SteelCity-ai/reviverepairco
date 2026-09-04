import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  serviceRequest,
  serviceRequestStatus,
  client,
  project,
} from "../../lib/db/schema/portal.js";
import { eq, and, ilike, sql } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";

const router: Router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createServiceRequestSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  serviceType: z.enum([
    "emergency",
    "leak",
    "storm",
    "replacement",
    "inspection",
    "commercial",
    "other",
  ]),
  description: z.string().optional(),
  addressLine1: z.string().max(255).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(50).optional().default("PA"),
  postalCode: z.string().max(20).optional(),
  source: z
    .enum(["website_form", "admin", "phone", "referral"])
    .optional()
    .default("website_form"),
  priority: z.enum(["low", "normal", "high", "urgent"]).optional().default("normal"),
  assignedToUserId: z.string().uuid().nullable().optional(),
  estimatedCost: z.string().optional(),
  internalNotes: z.string().optional(),
});

const updateServiceRequestSchema = createServiceRequestSchema.partial().extend({
  status: z
    .enum(["new", "reviewed", "scheduled", "completed", "closed", "converted"])
    .optional(),
});

// ── Status transition map ──────────────────────────────────────────────────
// Enforce forward-only pipeline (excluding admin overrides like back-transitions).

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  new: ["reviewed"],
  reviewed: ["scheduled"],
  scheduled: ["completed"],
  completed: ["closed"],
  closed: [], // terminal — re-open not in v1
  converted: [], // terminal
};

function validateTransition(
  currentStatus: string,
  nextStatus: string,
): void {
  const allowed = ALLOWED_TRANSITIONS[currentStatus];
  if (!allowed) {
    throw new Error(`Unknown current status: ${currentStatus}`);
  }
  // Admin may skip status enforcement for back-transitions or directly set any status
  // if the ALLOWED_TRANSITIONS list is extended — current rule enforces forward-only.
  if (!allowed.includes(nextStatus)) {
    throw new Error(
      `Invalid status transition: ${currentStatus} → ${nextStatus}. ` +
        `Allowed: ${allowed.length > 0 ? allowed.join(", ") : "none"}`,
    );
  }
}

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/service-requests — list (filter by status/source, paginate)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const status = req.query.status as string | undefined;
    const source = req.query.source as string | undefined;
    const search = req.query.search as string | undefined;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const conditions = [];

    if (status) {
      conditions.push(
        eq(serviceRequest.status, status as (typeof serviceRequestStatus.enumValues)[number]),
      );
    }
    if (source) {
      conditions.push(
        eq(serviceRequest.source, source as "website_form" | "admin" | "phone" | "referral"),
      );
    }
    if (search) {
      conditions.push(
        ilike(serviceRequest.email, `%${search}%`),
      );
    }

    const whereClause =
      conditions.length > 0 ? and(...conditions) : undefined;

    const [results, countResult] = await Promise.all([
      db
        .select()
        .from(serviceRequest)
        .where(whereClause)
        .orderBy(serviceRequest.createdAt)
        .limit(limit)
        .offset(offset),
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(serviceRequest)
        .where(whereClause),
    ]);

    const total = countResult[0]?.count ?? 0;

    res.json({
      data: results,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/service-requests/:id — single request
router.get("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await db.query.serviceRequest.findFirst({
      where: eq(serviceRequest.id, req.params.id as string),
    });
    if (!result) {
      res.status(404).json({ error: "Service request not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/service-requests — create
router.post(
  "/",
  requireAdmin,
  validate.body(createServiceRequestSchema),
  async (req, res, next) => {
    try {
      const [newRequest] = await db
        .insert(serviceRequest)
        .values(req.body)
        .returning();

      res.status(201).json(newRequest);
    } catch (err) {
      next(err);
    }
  },
);

// PATCH /api/v1/service-requests/:id — update (status transitions + notes)
router.patch(
  "/:id",
  requireAdmin,
  validate.body(updateServiceRequestSchema),
  async (req, res, next) => {
    try {
      const existing = await db.query.serviceRequest.findFirst({
        where: eq(serviceRequest.id, req.params.id as string),
      });
      if (!existing) {
        res.status(404).json({ error: "Service request not found" });
        return;
      }

      // Enforce status transition if status is being changed
      if (req.body.status && req.body.status !== existing.status) {
        try {
          validateTransition(existing.status, req.body.status);
        } catch (transitionErr) {
          res.status(422).json({
            error: (transitionErr as Error).message,
          });
          return;
        }
      }

      const [updated] = await db
        .update(serviceRequest)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(serviceRequest.id, req.params.id as string))
        .returning();

      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/v1/service-requests/:id — admin delete
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const [deleted] = await db
      .delete(serviceRequest)
      .where(eq(serviceRequest.id, req.params.id as string))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Service request not found" });
      return;
    }

    res.json({ id: req.params.id, deleted: true });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/service-requests/:id/convert — convert to project
router.post("/:id/convert", requireAdmin, async (req, res, next) => {
  try {
    const sr = await db.query.serviceRequest.findFirst({
      where: eq(serviceRequest.id, req.params.id as string),
    });
    if (!sr) {
      res.status(404).json({ error: "Service request not found" });
      return;
    }

    // Idempotent: reject re-conversion when link already set
    if (sr.convertedProjectId) {
      res.status(409).json({
        error: "Service request already converted",
        convertedProjectId: sr.convertedProjectId,
      });
      return;
    }

    if (sr.status === "converted") {
      res.status(409).json({
        error: "Service request already marked as converted",
      });
      return;
    }

    // Create a client from the service request contact info
    const companyName =
      `${sr.firstName} ${sr.lastName}`.trim() || "New Client";

    const [newClient] = await db
      .insert(client)
      .values({
        companyName,
        primaryContactName: `${sr.firstName} ${sr.lastName}`.trim(),
        email: sr.email,
        phone: sr.phone,
        billingAddress: sr.addressLine1
          ? {
              line1: sr.addressLine1,
              city: sr.city,
              state: sr.state,
              postalCode: sr.postalCode,
            }
          : undefined,
        notes: `Auto-created from service request conversion. Original SR ID: ${sr.id}`,
      })
      .returning();

    // Build project name from service type and client name
    const typeLabel =
      sr.serviceType.charAt(0).toUpperCase() + sr.serviceType.slice(1);
    const projectName = `${typeLabel} — ${companyName}`;

    // Create the project
    const [newProject] = await db
      .insert(project)
      .values({
        clientId: newClient!.id,
        name: projectName,
        description: sr.description ?? null,
        siteAddress: sr.addressLine1
          ? {
              line1: sr.addressLine1,
              city: sr.city,
              state: sr.state,
              postalCode: sr.postalCode,
            }
          : undefined,
        status: "PLANNED",
      })
      .returning();

    // Update the service request
    const [updated] = await db
      .update(serviceRequest)
      .set({
        status: "converted",
        convertedProjectId: newProject!.id,
        updatedAt: new Date(),
      })
      .where(eq(serviceRequest.id, sr.id))
      .returning();

    res.status(201).json({
      serviceRequest: updated,
      project: newProject,
      client: newClient,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
