import { eq, and } from "drizzle-orm";
import { db } from "../../lib/db/index.js";
import {
  mainTask,
  workType,
  project,
  activityLog,
  dailyTask,
} from "../../lib/db/schema/portal.js";
import { sendMail } from "./email.js";

/**
 * Recompute a main_task's status based on all its daily_tasks.
 * - any daily_task done & status NOT_STARTED → IN_PROGRESS
 * - all daily_tasks DONE & status IN_PROGRESS or NOT_STARTED → PM_REVIEW
 *   (skipped if main task is already past PM_REVIEW)
 */
export async function recomputeMainTaskStatus(taskId: string): Promise<void> {
  const dailyTasks = await db.query.dailyTask.findMany({
    where: eq(dailyTask.mainTaskId, taskId),
  });
  if (dailyTasks.length === 0) return;

  const record = await db.query.mainTask.findFirst({
    where: eq(mainTask.id, taskId),
  });
  if (!record) return;

  // Don't move backwards from later states.
  if (
    record.status === "PM_REVIEW" ||
    record.status === "CLIENT_SIGNOFF" ||
    record.status === "COMPLETE"
  ) {
    return;
  }

  const allDone = dailyTasks.every((dt) => dt.status === "DONE");
  const anyDone = dailyTasks.some((dt) => dt.status === "DONE");

  if (allDone) {
    await db
      .update(mainTask)
      .set({ status: "PM_REVIEW", updatedAt: new Date() })
      .where(eq(mainTask.id, taskId));

    // Notify the project's PM.
    try {
      const wt = await db.query.workType.findFirst({
        where: eq(workType.id, record.workTypeId),
      });
      const proj = wt
        ? await db.query.project.findFirst({
            where: eq(project.id, wt.projectId),
          })
        : null;
      if (proj?.projectManagerUserId) {
        const { userProfile } = await import("../../lib/db/schema/portal.js");
        const pm = await db.query.userProfile.findFirst({
          where: eq(userProfile.id, proj.projectManagerUserId),
        });
        if (pm?.email) {
          const url = `${process.env.PORTAL_PUBLIC_URL ?? "https://portal.reviverepairco.com"}/admin/projects/${proj.id}`;
          await sendMail({
            to: pm.email,
            subject: `[${proj.name}] "${record.name}" is ready for your review`,
            html: `<p>All daily tasks for <strong>${record.name}</strong> are complete.</p><p><a href="${url}">Open the project →</a></p>`,
          });
        }
      }
    } catch (e) {
      console.warn("[recompute] PM notify failed", e);
    }
    return;
  }

  if (anyDone && record.status === "NOT_STARTED") {
    await db
      .update(mainTask)
      .set({ status: "IN_PROGRESS", updatedAt: new Date() })
      .where(eq(mainTask.id, taskId));
  }
}

export async function recomputeWorkTypeStatus(workTypeId: string): Promise<void> {
  const tasks = await db.query.mainTask.findMany({
    where: eq(mainTask.workTypeId, workTypeId),
  });
  if (tasks.length === 0) return;

  const allComplete = tasks.every((t) => t.status === "COMPLETE");
  const anyActive = tasks.some(
    (t) => t.status !== "NOT_STARTED" && t.status !== "COMPLETE",
  );

  const newStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" = allComplete
    ? "COMPLETE"
    : anyActive
    ? "IN_PROGRESS"
    : "NOT_STARTED";

  await db
    .update(workType)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(workType.id, workTypeId));
}

export async function recomputeProjectStatus(projectId: string): Promise<void> {
  const types = await db.query.workType.findMany({
    where: eq(workType.projectId, projectId),
  });
  const record = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });
  if (!record) return;

  if (record.status === "CANCELLED" || record.status === "ON_HOLD") return;
  if (types.length === 0) return;

  const allComplete = types.every((t) => t.status === "COMPLETE");
  const anyActive = types.some(
    (t) => t.status !== "NOT_STARTED" && t.status !== "COMPLETE",
  );

  const newStatus: "PLANNED" | "ACTIVE" | "COMPLETE" = allComplete
    ? "COMPLETE"
    : anyActive
    ? "ACTIVE"
    : "PLANNED";

  await db
    .update(project)
    .set({
      status: newStatus,
      ...(newStatus === "COMPLETE"
        ? { actualEndDate: new Date().toISOString().slice(0, 10) }
        : {}),
      updatedAt: new Date(),
    })
    .where(eq(project.id, projectId));
}

/**
 * Returns true if the given user has access to the given project.
 * - ADMIN: always true
 * - CLIENT: only if project.clientId === user.clientId
 * - CREW: only if user has at least one daily_task assigned within the project
 */
export async function userCanAccessProject(
  user: { userId: string; role: "ADMIN" | "CREW" | "CLIENT"; clientId: string | null },
  projectId: string,
): Promise<boolean> {
  if (user.role === "ADMIN") return true;
  const proj = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });
  if (!proj) return false;
  if (user.role === "CLIENT") return proj.clientId === user.clientId;
  // CREW
  const rows = await db
    .select({ id: dailyTask.id })
    .from(dailyTask)
    .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
    .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
    .where(
      and(
        eq(workType.projectId, projectId),
        eq(dailyTask.assignedToUserId, user.userId),
      ),
    )
    .limit(1);
  return rows.length > 0;
}

export async function logActivity(
  projectId: string,
  actorUserId: string,
  verb: string,
  entityType?: string | null,
  entityId?: string | null,
  meta?: Record<string, unknown> | null,
): Promise<void> {
  await db.insert(activityLog).values({
    projectId,
    actorUserId,
    verb,
    entityType: entityType ?? null,
    entityId: entityId ?? null,
    meta: meta ?? null,
  });
}
