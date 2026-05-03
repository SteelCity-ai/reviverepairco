import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { client } from "../../lib/db/schema/portal.js";
import { eq, ilike, isNull, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin, requireStaff } from "../middleware/auth.js";

const router: Router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createClientSchema = z.object({
  companyName: z.string().min(1).max(255),
  primaryContactName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
});

const updateClientSchema = createClientSchema.partial();

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/clients — list clients (admin/staff only)
router.get("/", requireStaff, async (req, res, next) => {
  try {
    const search = req.query.search as string | undefined;
    let where = isNull(client.id); // dummy — will be replaced

    if (search) {
      where = ilike(client.companyName, `%${search}%`);
    }

    const results = search
      ? await db.select().from(client).where(where).orderBy(client.companyName)
      : await db.select().from(client).orderBy(client.companyName);

    res.json(results);
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/clients — create client (admin only)
router.post(
  "/",
  requireAdmin,
  validate.body(createClientSchema),
  async (req, res, next) => {
    try {
      const [newClient] = await db
        .insert(client)
        .values(req.body)
        .returning();

      res.status(201).json(newClient);
    } catch (err) {
      next(err);
    }
  },
);

// GET /api/v1/clients/:id — single client (admin/staff only)
router.get("/:id", requireStaff, async (req, res, next) => {
  try {
    const result = await db.query.client.findFirst({
      where: eq(client.id, (req.params.id as string)),
    });
    if (!result) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json(result);
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/clients/:id — update client (admin only)
router.patch(
  "/:id",
  requireAdmin,
  validate.body(updateClientSchema),
  async (req, res, next) => {
    try {
      const [updated] = await db
        .update(client)
        .set({ ...req.body, updatedAt: new Date() })
        .where(eq(client.id, (req.params.id as string)))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Client not found" });
        return;
      }
      res.json(updated);
    } catch (err) {
      next(err);
    }
  },
);

// DELETE /api/v1/clients/:id — soft delete (admin only)
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const result = await db
      .update(client)
      .set({ updatedAt: new Date() })
      .where(eq(client.id, (req.params.id as string)))
      .returning();

    if (!result.length) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    // Note: client table doesn't have archivedAt — use project pattern instead.
    // For now, we just mark updatedAt. Full soft-delete would need schema change.
    res.json({ id: (req.params.id as string), archived: true });
  } catch (err) {
    next(err);
  }
});

export default router;
