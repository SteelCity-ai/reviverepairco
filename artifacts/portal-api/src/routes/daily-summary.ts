import { Router } from "express";
import { z } from "zod";
import { db } from "../../lib/db/index.js";
import {
  userProfile,
  dailyTask,
  mainTask,
  workType,
  project,
} from "../../lib/db/schema/portal.js";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { sendMail } from "../lib/email.js";

const router: Router = Router();

function bearerOk(req: import("express").Request): boolean {
  const expected = process.env.INTERNAL_CRON_SECRET;
  if (!expected) return false;
  const hdr = req.headers["authorization"];
  if (typeof hdr === "string" && hdr === `Bearer ${expected}`) return true;
  if (req.headers["x-cron-secret"] === expected) return true;
  return false;
}

function todayET(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}
function yesterdayET(): string {
  const d = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(d);
}

// ── POST /internal/daily-summary ───────────────────────────────────────────

router.post("/daily-summary", async (req, res, next) => {
  try {
    if (!bearerOk(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }

    const today = todayET();
    const yest = yesterdayET();

    // Pull all active users
    const users = await db
      .select()
      .from(userProfile)
      .where(isNull(userProfile.archivedAt));

    // Pull yesterday's completed daily tasks + today's scheduled
    const yesterdayDone = await db.query.dailyTask.findMany({
      where: and(
        eq(dailyTask.status, "DONE"),
      ),
    });
    const yesterdayDoneFiltered = yesterdayDone.filter((d) => {
      if (!d.completedAt) return false;
      const fmt = new Intl.DateTimeFormat("en-CA", {
        timeZone: "America/New_York",
      }).format(d.completedAt);
      return fmt === yest;
    });

    const todayScheduled = (await db.select().from(dailyTask)).filter(
      (d) => d.scheduledDate === today,
    );

    const pmReviewTasks = await db
      .select()
      .from(mainTask)
      .where(eq(mainTask.status, "PM_REVIEW"));

    const clientSignoffTasksRaw = await db
      .select({
        id: mainTask.id,
        name: mainTask.name,
        clientId: project.clientId,
      })
      .from(mainTask)
      .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
      .innerJoin(project, eq(workType.projectId, project.id))
      .where(eq(mainTask.status, "CLIENT_SIGNOFF"));

    let sent = 0;
    for (const u of users) {
      if (!u.email) continue;

      const personalToday = todayScheduled.filter(
        (d) => d.assignedToUserId === u.id,
      );
      const personalYest = yesterdayDoneFiltered.filter(
        (d) => d.completedByUserId === u.id || d.assignedToUserId === u.id,
      );

      const sections: string[] = [];
      if (personalYest.length) {
        sections.push(
          `<h3>Yesterday</h3><ul>${personalYest
            .map((d) => `<li>${d.title}</li>`)
            .join("")}</ul>`,
        );
      }
      if (personalToday.length) {
        sections.push(
          `<h3>Today</h3><ul>${personalToday
            .map((d) => `<li>${d.title}</li>`)
            .join("")}</ul>`,
        );
      }
      if (u.role === "ADMIN" && pmReviewTasks.length) {
        sections.push(
          `<h3>Awaiting your review</h3><ul>${pmReviewTasks
            .map((t) => `<li>${t.name}</li>`)
            .join("")}</ul>`,
        );
      }
      if (u.role === "CLIENT" && u.clientId) {
        const myClientTasks = clientSignoffTasksRaw.filter(
          (t) => t.clientId === u.clientId,
        );
        if (myClientTasks.length) {
          sections.push(
            `<h3>Awaiting your sign-off</h3><ul>${myClientTasks
              .map((t) => `<li>${t.name}</li>`)
              .join("")}</ul>`,
          );
        }
      }
      if (!sections.length) continue;

      await sendMail({
        to: u.email,
        subject: `Revive Portal — daily summary (${today})`,
        html: `<p>Hi ${u.displayName},</p>${sections.join(
          "",
        )}<p><a href="https://portal.reviverepairco.com">Open the portal →</a></p>`,
      });
      sent++;
    }

    res.json({ status: "ok", sent });
  } catch (err) {
    next(err);
  }
});

// ── POST /internal/users/upsert ────────────────────────────────────────────
// Called by the Clerk webhook in the Next app to keep user_profile in sync.

const upsertSchema = z.object({
  clerkUserId: z.string().min(1),
  email: z.string().email().nullable(),
  displayName: z.string().min(1),
  role: z.enum(["ADMIN", "CREW", "CLIENT"]),
  clientId: z.string().uuid().nullable().optional(),
});

router.post("/users/upsert", async (req, res, next) => {
  try {
    if (!bearerOk(req)) {
      res.status(401).json({ error: "Unauthorized" });
      return;
    }
    const body = upsertSchema.parse(req.body);

    const existing = await db.query.userProfile.findFirst({
      where: eq(userProfile.clerkUserId, body.clerkUserId),
    });

    if (existing) {
      const [updated] = await db
        .update(userProfile)
        .set({
          email: body.email,
          displayName: body.displayName,
          role: body.role,
          clientId: body.clientId ?? null,
          updatedAt: new Date(),
        })
        .where(eq(userProfile.clerkUserId, body.clerkUserId))
        .returning();
      res.json({ ok: true, action: "updated", user: updated });
      return;
    }

    const [created] = await db
      .insert(userProfile)
      .values({
        clerkUserId: body.clerkUserId,
        email: body.email,
        displayName: body.displayName,
        role: body.role,
        clientId: body.clientId ?? null,
      })
      .returning();
    res.json({ ok: true, action: "created", user: created });
  } catch (err) {
    next(err);
  }
});

export default router;
