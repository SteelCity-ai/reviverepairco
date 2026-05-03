import { eq, and, sql } from "drizzle-orm";
import { db } from "../../lib/db/index.js";
import {
  mainTask,
  workType,
  project,
  activityLog,
  dailyTask,
} from "../../lib/db/schema/portal.js";

/**
 * Recompute a main_task's status based on all its daily_tasks.
 *
 * Rules:
 * - If any daily_task is DONE, main_task → IN_PROGRESS (unless already beyond)
 * - If ALL daily_tasks are DONE, main_task stays at its current status but
 *   could later trigger PM_REVIEW via separate logic.
 * - If no daily_tasks, status is unchanged.
 */
export async function recomputeMainTaskStatus(taskId: string): Promise<void> {
  const dailyTasks = await db.query.dailyTask.findMany({
    where: eq(dailyTask.mainTaskId, taskId),
  });

  if (dailyTasks.length === 0) return;

  const allDone = dailyTasks.every((dt) => dt.status === "DONE");

  const record = await db.query.mainTask.findFirst({
    where: eq(mainTask.id, taskId),
  });
  if (!record) return;

  if (allDone && record.status === "IN_PROGRESS") {
    // All done — mark for PM review
    await db
      .update(mainTask)
      .set({ status: "PM_REVIEW", updatedAt: new Date() })
      .where(eq(mainTask.id, taskId));
  } else if (!allDone && record.status === "NOT_STARTED") {
    await db
      .update(mainTask)
      .set({ status: "IN_PROGRESS", updatedAt: new Date() })
      .where(eq(mainTask.id, taskId));
  }
}

/**
 * Recompute a work_type's status based on its main_tasks.
 *
 * Rules:
 * - If any main_task is IN_PROGRESS or beyond → work_type IN_PROGRESS
 * - If ALL main_tasks are COMPLETE → work_type COMPLETE
 * - Otherwise → NOT_STARTED
 */
export async function recomputeWorkTypeStatus(
  workTypeId: string,
): Promise<void> {
  const tasks = await db.query.mainTask.findMany({
    where: eq(mainTask.workTypeId, workTypeId),
  });

  if (tasks.length === 0) return;

  const allComplete = tasks.every((t) => t.status === "COMPLETE");
  const anyActive = tasks.some(
    (t) => t.status !== "NOT_STARTED" && t.status !== "COMPLETE",
  );

  let newStatus: typeof workType.$inferSelect.status;
  if (allComplete) newStatus = "COMPLETE";
  else if (anyActive) newStatus = "IN_PROGRESS";
  else newStatus = "NOT_STARTED";

  await db
    .update(workType)
    .set({ status: newStatus, updatedAt: new Date() })
    .where(eq(workType.id, workTypeId));
}

/**
 * Recompute a project's status based on its work_types.
 *
 * Rules:
 * - If any work_type is IN_PROGRESS → project ACTIVE
 * - If ALL work_types are COMPLETE → project COMPLETE
 * - Otherwise → PLANNED (unless manually set to ON_HOLD or CANCELLED)
 */
export async function recomputeProjectStatus(projectId: string): Promise<void> {
  const types = await db.query.workType.findMany({
    where: eq(workType.projectId, projectId),
  });

  const record = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });
  if (!record) return;

  // Don't override terminal states
  if (record.status === "CANCELLED" || record.status === "ON_HOLD") return;

  if (types.length === 0) return;

  const allComplete = types.every((t) => t.status === "COMPLETE");
  const anyActive = types.some(
    (t) => t.status !== "NOT_STARTED" && t.status !== "COMPLETE",
  );

  let newStatus: typeof project.$inferSelect.status;
  if (allComplete) newStatus = "COMPLETE";
  else if (anyActive) newStatus = "ACTIVE";
  else newStatus = "PLANNED";

  await db
    .update(project)
    .set({
      status: newStatus,
      ...(newStatus === "COMPLETE" ? { actualEndDate: new Date().toISOString().slice(0, 10) } : {}),
      updatedAt: new Date(),
    })
    .where(eq(project.id, projectId));
}

/**
 * Create an activity log entry.
 */
export async function logActivity(
  projectId: string,
  actorUserId: string,
  verb: string,
  entityType?: string,
  entityId?: string,
  meta?: Record<string, unknown>,
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
