import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { serviceRequest } from "../../lib/db/schema/portal.js";

const router: Router = Router();

// Mirrors the existing internal bearer-secret pattern from daily-summary.ts.
// Checks INTERNAL_API_SECRET first (new name for service-request intake),
// then falls back to INTERNAL_CRON_SECRET for backward compatibility.
function bearerOk(req: import("express").Request): boolean {
  const expected =
    process.env.INTERNAL_API_SECRET || process.env.INTERNAL_CRON_SECRET;
  if (!expected) return false;
  const hdr = req.headers["authorization"];
  if (typeof hdr === "string" && hdr === `Bearer ${expected}`) return true;
  return false;
}

// ── Zod schema (mirrors the admin-facing create schema, adapted for intake) ─

const intakeSchema = z.object({
  firstName: z.string().min(1).max(255),
  lastName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional().default(""),
  serviceType: z.enum([
    "emergency",
    "leak",
    "storm",
    "replacement",
    "inspection",
    "commercial",
    "other",
  ]),
  description: z.string().optional().default(""),
  source: z
    .enum(["website_form", "admin", "phone", "referral"])
    .optional()
    .default("website_form"),
});

// ── POST /api/v1/internal/service-requests ─────────────────────────────────

router.post("/service-requests", async (req, res, next) => {
  try {
    if (!bearerOk(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const body = intakeSchema.parse(req.body);

    const [created] = await db
      .insert(serviceRequest)
      .values({
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
        phone: body.phone ?? "",
        serviceType: body.serviceType,
        description: body.description ?? "",
        source: body.source ?? "website_form",
        status: "new",
        priority: "normal",
      })
      .returning();

    res.status(201).json({ id: created!.id, status: created!.status });
  } catch (err) {
    next(err);
  }
});

export default router;
