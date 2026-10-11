/**
 * project-access.ts — central access-gate helpers for the portal API.
 *
 * Role model:
 *   ADMIN  — full access to every project.
 *   CLIENT — access only to projects belonging to the user's client
 *            (project.clientId === user.clientId).
 *   CREW   — access to projects where the user is the project manager
 *            (project.projectManagerUserId) or is assigned to at least one
 *            daily task in the project
 *            (dailyTask.assignedToUserId → mainTask → workType → project).
 */
import { and, eq, inArray, sql } from "drizzle-orm";
import { db } from "../../lib/db/index.js";
import {
  activityLog,
  changeOrder,
  checklistInstance,
  checklistItemInstance,
  comment,
  completionDocument,
  dailyLog,
  dailyTask,
  mainTask,
  project,
  projectDocument,
  punchItem,
  selection,
  taskPhoto,
  timeEntry,
  workType,
} from "../../lib/db/schema/portal.js";
import type { AuthenticatedUser } from "../types.js";

// ── requireUser ─────────────────────────────────────────────────────────────

/**
 * Narrow `req.user` to an AuthenticatedUser. Returns null when the request is
 * unauthenticated so callers can respond with 401.
 */
export function requireUser(user: unknown): AuthenticatedUser | null {
  if (
    user &&
    typeof user === "object" &&
    "userId" in user &&
    "role" in user &&
    (user as AuthenticatedUser).role &&
    ["ADMIN", "CREW", "CLIENT"].includes((user as AuthenticatedUser).role)
  ) {
    return user as AuthenticatedUser;
  }
  return null;
}

// ── assertProjectAccess ─────────────────────────────────────────────────────

export type AccessResult =
  | { ok: true }
  | { ok: false; status: number; error: string };

/**
 * Resolve a project row and enforce role-based access.
 *
 *   ADMIN  → always allowed.
 *   CLIENT → allowed only when project.clientId === user.clientId.
 *   CREW   → allowed when the user is the project manager OR has any
 *            daily-task assignment inside the project.
 */
export async function assertProjectAccess(
  user: AuthenticatedUser,
  projectId: string,
): Promise<AccessResult> {
  if (user.role === "ADMIN") return { ok: true };

  const rows = await db
    .select({
      id: project.id,
      clientId: project.clientId,
      projectManagerUserId: project.projectManagerUserId,
    })
    .from(project)
    .where(eq(project.id, projectId))
    .limit(1);

  const row = rows[0];
  if (!row) return { ok: false, status: 404, error: "Project not found" };

  if (user.role === "CLIENT") {
    if (user.clientId && row.clientId === user.clientId) return { ok: true };
    return { ok: false, status: 403, error: "Forbidden" };
  }

  // CREW: project manager or daily-task assignment
  if (
    (row.projectManagerUserId && row.projectManagerUserId === user.userId) ||
    (await db
      .select({ one: sql`1` })
      .from(dailyTask)
      .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
      .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
      .where(
        and(
          eq(workType.projectId, projectId),
          eq(dailyTask.assignedToUserId, user.userId),
        ),
      )
      .limit(1)
      .then((r) => r.length > 0))
  ) {
    return { ok: true };
  }

  return { ok: false, status: 403, error: "Forbidden" };
}

/** Convenience: access check plus the fetched project row (null when absent). */
export async function getProjectWithAccess(
  user: AuthenticatedUser,
  projectId: string,
): Promise<{ ok: true; project: typeof project.$inferSelect } | AccessFail> {
  const access = await assertProjectAccess(user, projectId);
  if (!access.ok) return access;
  const row = await db.query.project.findFirst({
    where: eq(project.id, projectId),
  });
  if (!row) return { ok: false, status: 404, error: "Project not found" };
  return { ok: true, project: row };
}
type AccessFail = { ok: false; status: number; error: string };

/**
 * Compute the set of project ids the user may see, for list-route filtering.
 *   ADMIN  → "ALL" (no filter needed).
 *   CLIENT → projects belonging to the user's client.
 *   CREW   → projects the user manages or has any daily-task assignment in.
 */
export async function allowedProjectIds(
  user: AuthenticatedUser,
): Promise<string[] | "ALL"> {
  if (user.role === "ADMIN") return "ALL";

  if (user.role === "CLIENT") {
    if (!user.clientId) return [];
    const rows = await db
      .select({ id: project.id })
      .from(project)
      .where(eq(project.clientId, user.clientId));
    return rows.map((r) => r.id);
  }

  // CREW: project manager OR assigned to any daily task in the project
  const [pmRows, assignedRows] = await Promise.all([
    db
      .select({ id: project.id })
      .from(project)
      .where(eq(project.projectManagerUserId, user.userId)),
    db
      .selectDistinct({ id: workType.projectId })
      .from(dailyTask)
      .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
      .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
      .where(eq(dailyTask.assignedToUserId, user.userId)),
  ]);
  const ids = new Set<string>([...pmRows.map((r) => r.id), ...assignedRows.map((r) => r.id)]);
  return [...ids];
}

// ── resolveEntityProjectId ──────────────────────────────────────────────────

export type AccessEntityType =
  | "project"
  | "work_type"
  | "main_task"
  | "daily_task"
  | "task_photo"
  | "completion_document"
  | "project_document"
  | "comment"
  | "activity_log"
  | "punch_item"
  | "change_order"
  | "daily_log"
  | "selection"
  | "time_entry"
  | "checklist_instance"
  | "checklist_item_instance";

/**
 * Resolve the owning project id for an entity, following the ownership chain
 * where the table does not carry projectId directly. Returns null when the
 * entity does not exist.
 */
export async function resolveEntityProjectId(
  entityType: AccessEntityType,
  entityId: string,
): Promise<string | null> {
  switch (entityType) {
    case "project":
      return entityId;
    case "work_type": {
      const r = await db
        .select({ projectId: workType.projectId })
        .from(workType)
        .where(eq(workType.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "main_task": {
      const r = await db
        .select({ projectId: workType.projectId })
        .from(mainTask)
        .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
        .where(eq(mainTask.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "daily_task":
    case "task_photo": {
      // daily_task → mainTask → workType → project; task_photo → dailyTask
      let dailyTaskId = entityId;
      if (entityType === "task_photo") {
        const p = await db
          .select({ dailyTaskId: taskPhoto.dailyTaskId })
          .from(taskPhoto)
          .where(eq(taskPhoto.id, entityId))
          .limit(1);
        if (!p[0]) return null;
        dailyTaskId = p[0].dailyTaskId;
      }
      const r = await db
        .select({ projectId: workType.projectId })
        .from(dailyTask)
        .innerJoin(mainTask, eq(dailyTask.mainTaskId, mainTask.id))
        .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
        .where(eq(dailyTask.id, dailyTaskId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "completion_document": {
      const r = await db
        .select({ projectId: workType.projectId })
        .from(completionDocument)
        .innerJoin(mainTask, eq(completionDocument.mainTaskId, mainTask.id))
        .innerJoin(workType, eq(mainTask.workTypeId, workType.id))
        .where(eq(completionDocument.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "project_document": {
      const r = await db
        .select({ projectId: projectDocument.projectId })
        .from(projectDocument)
        .where(eq(projectDocument.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "comment": {
      // comment.entityType names the commented entity (enum values are
      // UPPERCASE: PROJECT, WORK_TYPE, MAIN_TASK, DAILY_TASK); resolve
      // through the matching ownership chain.
      const r = await db
        .select({ entityType: comment.entityType, entityId: comment.entityId })
        .from(comment)
        .where(eq(comment.id, entityId))
        .limit(1);
      if (!r[0]) return null;
      switch (r[0].entityType) {
        case "PROJECT":
          return r[0].entityId;
        case "WORK_TYPE":
          return resolveEntityProjectId("work_type", r[0].entityId);
        case "MAIN_TASK":
          return resolveEntityProjectId("main_task", r[0].entityId);
        case "DAILY_TASK":
          return resolveEntityProjectId("daily_task", r[0].entityId);
        default:
          return null;
      }
    }
    case "activity_log": {
      const r = await db
        .select({ projectId: activityLog.projectId })
        .from(activityLog)
        .where(eq(activityLog.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "punch_item": {
      const r = await db
        .select({ projectId: punchItem.projectId })
        .from(punchItem)
        .where(eq(punchItem.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "change_order": {
      const r = await db
        .select({ projectId: changeOrder.projectId })
        .from(changeOrder)
        .where(eq(changeOrder.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "daily_log": {
      const r = await db
        .select({ projectId: dailyLog.projectId })
        .from(dailyLog)
        .where(eq(dailyLog.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "selection": {
      const r = await db
        .select({ projectId: selection.projectId })
        .from(selection)
        .where(eq(selection.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "time_entry": {
      const r = await db
        .select({ projectId: timeEntry.projectId })
        .from(timeEntry)
        .where(eq(timeEntry.id, entityId))
        .limit(1);
      return r[0]?.projectId ?? null;
    }
    case "checklist_instance": {
      // prefer workType.projectId, fall back to mainTask chain
      const r = await db
        .select({
          wtProjectId: workType.projectId,
          mainTaskId: checklistInstance.mainTaskId,
          workTypeId: checklistInstance.workTypeId,
        })
        .from(checklistInstance)
        .leftJoin(workType, eq(checklistInstance.workTypeId, workType.id))
        .where(eq(checklistInstance.id, entityId))
        .limit(1);
      if (!r[0]) return null;
      if (r[0].wtProjectId) return r[0].wtProjectId;
      if (r[0].mainTaskId) return resolveEntityProjectId("main_task", r[0].mainTaskId);
      return null;
    }
    case "checklist_item_instance": {
      const r = await db
        .select({ instanceId: checklistItemInstance.instanceId })
        .from(checklistItemInstance)
        .where(eq(checklistItemInstance.id, entityId))
        .limit(1);
      if (!r[0]) return null;
      return resolveEntityProjectId("checklist_instance", r[0].instanceId);
    }
    default:
      return null;
  }
}

/** Gate for entity-scoped routes: resolve the project, then assert access. */
export async function assertEntityAccess(
  user: AuthenticatedUser,
  entityType: AccessEntityType,
  entityId: string,
): Promise<AccessResult> {
  const projectId = await resolveEntityProjectId(entityType, entityId);
  if (!projectId) return { ok: false, status: 404, error: "Not found" };
  return assertProjectAccess(user, projectId);
}
