import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import { client, userProfile } from "../../lib/db/schema/portal.js";
import { eq, ilike, isNull, and } from "drizzle-orm";
import { validate } from "../middleware/validate.js";
import { requireAdmin } from "../middleware/auth.js";

const router: Router = Router();

// ── Zod schemas ────────────────────────────────────────────────────────────

const createClientSchema = z.object({
  companyName: z.string().min(1).max(255),
  primaryContactName: z.string().min(1).max(255),
  email: z.string().email().max(255),
  phone: z.string().max(50).optional(),
  billingAddress: z.record(z.unknown()).optional(),
  notes: z.string().optional(),
  clientType: z.enum(["prospect", "client"]).optional(),
  status: z.enum(["active", "inactive", "lead"]).optional(),
  propertyType: z.enum(["residential", "commercial"]).optional(),
});

const updateClientSchema = createClientSchema.partial();

// ── Routes ─────────────────────────────────────────────────────────────────

// GET /api/v1/clients — list clients (admin only)
router.get("/", requireAdmin, async (req, res, next) => {
  try {
    const search = req.query.search as string | undefined;
    const includeArchived = req.query.includeArchived === "true";
    const conditions = [] as Array<ReturnType<typeof eq>>;
    if (!includeArchived) conditions.push(isNull(client.archivedAt));
    if (search) conditions.push(ilike(client.companyName, `%${search}%`));

    const results =
      conditions.length > 0
        ? await db
            .select()
            .from(client)
            .where(and(...conditions))
            .orderBy(client.companyName)
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

// GET /api/v1/clients/:id — single client (admin only)
router.get("/:id", requireAdmin, async (req, res, next) => {
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

// POST /api/v1/clients/:id/archive — soft archive (admin only)
async function archiveClientHandler(
  req: Parameters<Parameters<typeof router.post>[1]>[0],
  res: Parameters<Parameters<typeof router.post>[1]>[1],
  next: Parameters<Parameters<typeof router.post>[1]>[2],
) {
  try {
    const now = new Date();
    const result = await db
      .update(client)
      .set({ archivedAt: now, updatedAt: now })
      .where(eq(client.id, req.params.id as string))
      .returning();
    if (!result.length) {
      res.status(404).json({ error: "Client not found" });
      return;
    }
    res.json({ id: req.params.id as string, archived: true, archivedAt: now });
  } catch (err) {
    next(err);
  }
}

// GET /api/v1/clients/:id/users — list user_profile rows tied to client (admin only)
router.get("/:id/users", requireAdmin, async (req, res, next) => {
  try {
    const rows = await db
      .select()
      .from(userProfile)
      .where(
        and(
          eq(userProfile.clientId, req.params.id as string),
          isNull(userProfile.archivedAt),
        ),
      )
      .orderBy(userProfile.displayName);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post("/:id/archive", requireAdmin, archiveClientHandler);
// Back-compat: keep DELETE during the transition; same admin guard + behavior.
router.delete("/:id", requireAdmin, archiveClientHandler);

export default router;
