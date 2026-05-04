/**
 * Revive Roof Repair Portal — Drizzle ORM Schema
 *
 * All portal tables in a single file. Imported by both the portal Next.js app
 * and the Express API server via lib/db/.
 *
 * Tables (original spec + 3CPO additions):
 *   client, user_profile, project, work_type, main_task, daily_task,
 *   task_photo, completion_document, project_document, comment, activity_log,
 *   punch_item, change_order, daily_log, selection, time_entry,
 *   checklist_template, checklist_instance, checklist_item_instance
 */

import {
  pgTable,
  uuid,
  varchar,
  text,
  timestamp,
  integer,
  decimal,
  date,
  jsonb,
  pgEnum,
  uniqueIndex,
  index,
  type AnyPgColumn,
} from "drizzle-orm/pg-core";
import { relations, type InferSelectModel } from "drizzle-orm";

// ── Enums ──────────────────────────────────────────────────────────────────

export const userRole = pgEnum("user_role", ["ADMIN", "CREW", "CLIENT"]);

export const projectStatus = pgEnum("project_status", [
  "PLANNED",
  "ACTIVE",
  "ON_HOLD",
  "COMPLETE",
  "CANCELLED",
]);

export const invoiceStatus = pgEnum("invoice_status", [
  "NOT_INVOICED",
  "INVOICED",
  "PAID",
]);

export const workTypeStatus = pgEnum("work_type_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "COMPLETE",
]);

export const mainTaskStatus = pgEnum("main_task_status", [
  "NOT_STARTED",
  "IN_PROGRESS",
  "PM_REVIEW",
  "CLIENT_SIGNOFF",
  "COMPLETE",
]);

export const dailyTaskStatus = pgEnum("daily_task_status", [
  "NOT_STARTED",
  "DONE",
]);

export const photoPmStatus = pgEnum("photo_pm_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const documentCategory = pgEnum("document_category", [
  "CONTRACT",
  "PERMIT",
  "RECEIPT",
  "OTHER",
]);

export const commentEntityType = pgEnum("comment_entity_type", [
  "PROJECT",
  "WORK_TYPE",
  "MAIN_TASK",
  "DAILY_TASK",
]);

export const punchItemStatus = pgEnum("punch_item_status", [
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "VERIFIED",
]);

export const changeOrderStatus = pgEnum("change_order_status", [
  "DRAFT",
  "SENT",
  "APPROVED",
  "REJECTED",
]);

export const selectionStatus = pgEnum("selection_status", [
  "PENDING",
  "APPROVED",
  "REJECTED",
]);

export const checklistInstanceStatus = pgEnum("checklist_instance_status", [
  "IN_PROGRESS",
  "COMPLETE",
]);

export const checklistItemStatus = pgEnum("checklist_item_status", [
  "PENDING",
  "PASS",
  "FAIL",
]);

// ── Tables ─────────────────────────────────────────────────────────────────

// --- client ---
export const client = pgTable("client", {
  id: uuid("id").defaultRandom().primaryKey(),
  companyName: varchar("company_name", { length: 255 }).notNull(),
  primaryContactName: varchar("primary_contact_name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  phone: varchar("phone", { length: 50 }),
  billingAddress: jsonb("billing_address"),
  notes: text("notes"),
  archivedAt: timestamp("archived_at", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- user_profile ---
export const userProfile = pgTable(
  "user_profile",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clerkUserId: varchar("clerk_user_id", { length: 255 }).notNull().unique(),
    role: userRole("role").notNull().default("CREW"),
    clientId: uuid("client_id").references(() => client.id, {
      onDelete: "set null",
    }),
    displayName: varchar("display_name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 50 }),
    archivedAt: timestamp("archived_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_user_profile_clerk").on(t.clerkUserId),
    index("idx_user_profile_client").on(t.clientId),
    index("idx_user_profile_role").on(t.role),
  ],
);

// --- project ---
export const project = pgTable(
  "project",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    clientId: uuid("client_id")
      .notNull()
      .references(() => client.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    siteAddress: jsonb("site_address"),
    status: projectStatus("status").notNull().default("PLANNED"),
    projectManagerUserId: uuid("project_manager_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    startDate: date("start_date"),
    targetEndDate: date("target_end_date"),
    actualEndDate: date("actual_end_date"),
    invoiceStatus: invoiceStatus("invoice_status")
      .notNull()
      .default("NOT_INVOICED"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_project_client").on(t.clientId),
    index("idx_project_status").on(t.status),
    index("idx_project_pm").on(t.projectManagerUserId),
  ],
);

// --- work_type ---
export const workType = pgTable(
  "work_type",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: workTypeStatus("status").notNull().default("NOT_STARTED"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_work_type_project").on(t.projectId),
  ],
);

// --- main_task ---
export const mainTask = pgTable(
  "main_task",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    workTypeId: uuid("work_type_id")
      .notNull()
      .references(() => workType.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 255 }).notNull(),
    description: text("description"),
    sortOrder: integer("sort_order").notNull().default(0),
    status: mainTaskStatus("status").notNull().default("NOT_STARTED"),
    pmReviewedAt: timestamp("pm_reviewed_at", { withTimezone: true }),
    pmReviewedByUserId: uuid("pm_reviewed_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    clientSignedAt: timestamp("client_signed_at", { withTimezone: true }),
    clientSignedByUserId: uuid("client_signed_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    clientSignatureName: varchar("client_signature_name", { length: 255 }),
    completionDocumentId: uuid("completion_document_id"),
    materials: jsonb("materials").default("[]").notNull(),
    // ── 3CPO scheduling additions ──
    startDate: date("start_date"),
    endDate: date("end_date"),
    estimatedDurationDays: integer("estimated_duration_days"),
    dependsOn: uuid("depends_on").references((): AnyPgColumn => mainTask.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_main_task_work_type").on(t.workTypeId),
    index("idx_main_task_status").on(t.status),
    index("idx_main_task_depends_on").on(t.dependsOn),
  ],
);

// --- daily_task ---
export const dailyTask = pgTable(
  "daily_task",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mainTaskId: uuid("main_task_id")
      .notNull()
      .references(() => mainTask.id, { onDelete: "cascade" }),
    assignedToUserId: uuid("assigned_to_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    scheduledDate: date("scheduled_date"),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    status: dailyTaskStatus("status").notNull().default("NOT_STARTED"),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    completedByUserId: uuid("completed_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    crewNotes: text("crew_notes"),
    hoursLogged: decimal("hours_logged", { precision: 5, scale: 2 }),
    sortOrder: integer("sort_order").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_daily_task_main").on(t.mainTaskId),
    index("idx_daily_task_assignee").on(t.assignedToUserId),
    index("idx_daily_task_date").on(t.scheduledDate),
    index("idx_daily_task_status").on(t.status),
  ],
);

// --- task_photo ---
export const taskPhoto = pgTable(
  "task_photo",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    dailyTaskId: uuid("daily_task_id")
      .notNull()
      .references(() => dailyTask.id, { onDelete: "cascade" }),
    objectKey: varchar("object_key", { length: 500 }).notNull(),
    originalFilename: varchar("original_filename", { length: 255 }),
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: integer("size_bytes"),
    uploadedByUserId: uuid("uploaded_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    pmStatus: photoPmStatus("pm_status").notNull().default("PENDING"),
    pmRejectReason: text("pm_reject_reason"),
    caption: text("caption"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_task_photo_daily").on(t.dailyTaskId),
    index("idx_task_photo_pm_status").on(t.pmStatus),
  ],
);

// --- completion_document ---
export const completionDocument = pgTable(
  "completion_document",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    mainTaskId: uuid("main_task_id")
      .notNull()
      .unique()
      .references(() => mainTask.id, { onDelete: "restrict" }),
    compiledAt: timestamp("compiled_at", { withTimezone: true }).notNull().defaultNow(),
    compiledByUserId: uuid("compiled_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    clientViewToken: varchar("client_view_token", { length: 255 })
      .notNull()
      .unique(),
    payload: jsonb("payload"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_completion_doc_token").on(t.clientViewToken),
  ],
);

// --- project_document ---
export const projectDocument = pgTable(
  "project_document",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    objectKey: varchar("object_key", { length: 500 }).notNull(),
    originalFilename: varchar("original_filename", { length: 255 }),
    mimeType: varchar("mime_type", { length: 100 }),
    sizeBytes: integer("size_bytes"),
    uploadedByUserId: uuid("uploaded_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    category: documentCategory("category").notNull().default("OTHER"),
    description: text("description"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_project_doc_project").on(t.projectId),
    index("idx_project_doc_category").on(t.category),
  ],
);

// --- comment ---
export const comment = pgTable(
  "comment",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    entityType: commentEntityType("entity_type").notNull(),
    entityId: uuid("entity_id").notNull(),
    authorUserId: uuid("author_user_id")
      .notNull()
      .references(() => userProfile.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_comment_entity").on(t.entityType, t.entityId),
    index("idx_comment_author").on(t.authorUserId),
  ],
);

// --- activity_log ---
export const activityLog = pgTable(
  "activity_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => project.id, {
      onDelete: "cascade",
    }),
    actorUserId: uuid("actor_user_id").references(() => userProfile.id, {
      onDelete: "set null",
    }),
    verb: varchar("verb", { length: 100 }).notNull(),
    entityType: varchar("entity_type", { length: 100 }),
    entityId: uuid("entity_id"),
    meta: jsonb("meta"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_activity_project").on(t.projectId),
    index("idx_activity_created").on(t.createdAt),
  ],
);

// ── 3CPO NEW TABLES ────────────────────────────────────────────────────────

// --- punch_item ---
export const punchItem = pgTable(
  "punch_item",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    workTypeId: uuid("work_type_id").references(() => workType.id, {
      onDelete: "set null",
    }),
    description: text("description").notNull(),
    assigneeId: uuid("assignee_id").references(() => userProfile.id, {
      onDelete: "set null",
    }),
    photos: jsonb("photos").default("[]").notNull(),
    deadline: date("deadline"),
    status: punchItemStatus("status").notNull().default("OPEN"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => userProfile.id),
    verifiedByUserId: uuid("verified_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_punch_project").on(t.projectId),
    index("idx_punch_assignee").on(t.assigneeId),
    index("idx_punch_status").on(t.status),
  ],
);

// --- change_order ---
export const changeOrder = pgTable(
  "change_order",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    reason: text("reason"),
    costImpact: decimal("cost_impact", { precision: 12, scale: 2 }),
    scheduleImpact: jsonb("schedule_impact"),
    status: changeOrderStatus("status").notNull().default("DRAFT"),
    affectedMainTaskIds: uuid("affected_main_task_ids").array(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => userProfile.id),
    clientApprovedAt: timestamp("client_approved_at", { withTimezone: true }),
    clientApprovedByUserId: uuid("client_approved_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_change_order_project").on(t.projectId),
    index("idx_change_order_status").on(t.status),
  ],
);

// --- daily_log ---
export const dailyLog = pgTable(
  "daily_log",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    date: date("date").notNull(),
    weather: jsonb("weather"),
    crewNotes: text("crew_notes"),
    delays: text("delays"),
    safetyNotes: text("safety_notes"),
    photos: jsonb("photos").default("[]").notNull(),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => userProfile.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_daily_log_project_date").on(t.projectId, t.date),
    uniqueIndex("uq_daily_log_project_date").on(t.projectId, t.date),
  ],
);

// --- selection ---
export const selection = pgTable(
  "selection",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    projectId: uuid("project_id").references(() => project.id, {
      onDelete: "cascade",
    }),
    workTypeId: uuid("work_type_id").references(() => workType.id, {
      onDelete: "set null",
    }),
    mainTaskId: uuid("main_task_id").references(() => mainTask.id, {
      onDelete: "set null",
    }),
    name: varchar("name", { length: 255 }).notNull(),
    options: jsonb("options").default("[]").notNull(),
    deadline: date("deadline"),
    clientChoice: integer("client_choice"),
    status: selectionStatus("status").notNull().default("PENDING"),
    createdByUserId: uuid("created_by_user_id")
      .notNull()
      .references(() => userProfile.id),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_selection_project").on(t.projectId),
    index("idx_selection_status").on(t.status),
  ],
);

// --- time_entry ---
export const timeEntry = pgTable(
  "time_entry",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => userProfile.id, { onDelete: "cascade" }),
    projectId: uuid("project_id")
      .notNull()
      .references(() => project.id, { onDelete: "cascade" }),
    dailyTaskId: uuid("daily_task_id").references(() => dailyTask.id, {
      onDelete: "set null",
    }),
    clockIn: timestamp("clock_in", { withTimezone: true }).notNull(),
    clockOut: timestamp("clock_out", { withTimezone: true }),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_time_entry_user").on(t.userId),
    index("idx_time_entry_project").on(t.projectId),
    index("idx_time_entry_clock_in").on(t.clockIn),
  ],
);

// --- checklist_template ---
export const checklistTemplate = pgTable("checklist_template", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  items: jsonb("items").default("[]").notNull(),
  // items: [{ label: string, required: boolean }]
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// --- checklist_instance ---
export const checklistInstance = pgTable(
  "checklist_instance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    templateId: uuid("template_id")
      .notNull()
      .references(() => checklistTemplate.id, { onDelete: "restrict" }),
    workTypeId: uuid("work_type_id").references(() => workType.id, {
      onDelete: "set null",
    }),
    mainTaskId: uuid("main_task_id").references(() => mainTask.id, {
      onDelete: "set null",
    }),
    status: checklistInstanceStatus("status").notNull().default("IN_PROGRESS"),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    index("idx_checklist_instance_template").on(t.templateId),
    index("idx_checklist_instance_work_type").on(t.workTypeId),
    index("idx_checklist_instance_main_task").on(t.mainTaskId),
  ],
);

// --- checklist_item_instance ---
export const checklistItemInstance = pgTable(
  "checklist_item_instance",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    instanceId: uuid("instance_id")
      .notNull()
      .references(() => checklistInstance.id, { onDelete: "cascade" }),
    templateItemIndex: integer("template_item_index").notNull(),
    status: checklistItemStatus("status").notNull().default("PENDING"),
    completedByUserId: uuid("completed_by_user_id").references(
      () => userProfile.id,
      { onDelete: "set null" },
    ),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    notes: text("notes"),
  },
  (t) => [
    index("idx_checklist_item_instance").on(t.instanceId),
  ],
);

// ── Drizzle Relations ──────────────────────────────────────────────────────

export const clientRelations = relations(client, ({ many }) => ({
  userProfiles: many(userProfile),
  projects: many(project),
}));

export const userProfileRelations = relations(userProfile, ({ one, many }) => ({
  client: one(client, {
    fields: [userProfile.clientId],
    references: [client.id],
  }),
  managedProjects: many(project, { relationName: "projectManager" }),
  assignedDailyTasks: many(dailyTask, { relationName: "assignedToUser" }),
  completedDailyTasks: many(dailyTask, { relationName: "completedByUser" }),
  pmReviewedMainTasks: many(mainTask, { relationName: "pmReviewedBy" }),
  clientSignedMainTasks: many(mainTask, { relationName: "clientSignedBy" }),
  uploadedPhotos: many(taskPhoto, { relationName: "photoUploader" }),
  compiledDocuments: many(completionDocument, { relationName: "documentCompiler" }),
  uploadedProjectDocuments: many(projectDocument, { relationName: "docUploader" }),
  comments: many(comment),
  activities: many(activityLog),
  assignedPunchItems: many(punchItem, { relationName: "punchAssignee" }),
  createdPunchItems: many(punchItem, { relationName: "punchCreator" }),
  verifiedPunchItems: many(punchItem, { relationName: "punchVerifier" }),
  createdChangeOrders: many(changeOrder, { relationName: "coCreator" }),
  approvedChangeOrders: many(changeOrder, { relationName: "coApprover" }),
  timeEntries: many(timeEntry),
  completedChecklistItems: many(checklistItemInstance),
}));

export const projectRelations = relations(project, ({ one, many }) => ({
  client: one(client, {
    fields: [project.clientId],
    references: [client.id],
  }),
  projectManager: one(userProfile, {
    fields: [project.projectManagerUserId],
    references: [userProfile.id],
    relationName: "projectManager",
  }),
  workTypes: many(workType),
  documents: many(projectDocument),
  activities: many(activityLog),
  punchItems: many(punchItem),
  changeOrders: many(changeOrder),
  dailyLogs: many(dailyLog),
  selections: many(selection),
  timeEntries: many(timeEntry),
}));

export const workTypeRelations = relations(workType, ({ one, many }) => ({
  project: one(project, {
    fields: [workType.projectId],
    references: [project.id],
  }),
  mainTasks: many(mainTask),
  punchItems: many(punchItem),
  selections: many(selection),
  checklistInstances: many(checklistInstance),
}));

export const mainTaskRelations = relations(mainTask, ({ one, many }) => ({
  workType: one(workType, {
    fields: [mainTask.workTypeId],
    references: [workType.id],
  }),
  pmReviewedBy: one(userProfile, {
    fields: [mainTask.pmReviewedByUserId],
    references: [userProfile.id],
    relationName: "pmReviewedBy",
  }),
  clientSignedBy: one(userProfile, {
    fields: [mainTask.clientSignedByUserId],
    references: [userProfile.id],
    relationName: "clientSignedBy",
  }),
  dependsOnTask: one(mainTask, {
    fields: [mainTask.dependsOn],
    references: [mainTask.id],
    relationName: "taskDependsOn",
  }),
  blockedTasks: many(mainTask, { relationName: "taskDependsOn" }),
  completionDocument: one(completionDocument, {
    fields: [mainTask.completionDocumentId],
    references: [completionDocument.id],
  }),
  dailyTasks: many(dailyTask),
  selections: many(selection),
  checklistInstances: many(checklistInstance),
}));

export const dailyTaskRelations = relations(dailyTask, ({ one, many }) => ({
  mainTask: one(mainTask, {
    fields: [dailyTask.mainTaskId],
    references: [mainTask.id],
  }),
  assignedTo: one(userProfile, {
    fields: [dailyTask.assignedToUserId],
    references: [userProfile.id],
    relationName: "assignedToUser",
  }),
  completedBy: one(userProfile, {
    fields: [dailyTask.completedByUserId],
    references: [userProfile.id],
    relationName: "completedByUser",
  }),
  photos: many(taskPhoto),
  timeEntries: many(timeEntry),
}));

export const taskPhotoRelations = relations(taskPhoto, ({ one }) => ({
  dailyTask: one(dailyTask, {
    fields: [taskPhoto.dailyTaskId],
    references: [dailyTask.id],
  }),
  uploadedBy: one(userProfile, {
    fields: [taskPhoto.uploadedByUserId],
    references: [userProfile.id],
    relationName: "photoUploader",
  }),
}));

export const completionDocumentRelations = relations(completionDocument, ({ one }) => ({
  mainTask: one(mainTask, {
    fields: [completionDocument.mainTaskId],
    references: [mainTask.id],
  }),
  compiledBy: one(userProfile, {
    fields: [completionDocument.compiledByUserId],
    references: [userProfile.id],
    relationName: "documentCompiler",
  }),
}));

export const projectDocumentRelations = relations(projectDocument, ({ one }) => ({
  project: one(project, {
    fields: [projectDocument.projectId],
    references: [project.id],
  }),
  uploadedBy: one(userProfile, {
    fields: [projectDocument.uploadedByUserId],
    references: [userProfile.id],
    relationName: "docUploader",
  }),
}));

export const commentRelations = relations(comment, ({ one }) => ({
  author: one(userProfile, {
    fields: [comment.authorUserId],
    references: [userProfile.id],
  }),
}));

export const activityLogRelations = relations(activityLog, ({ one }) => ({
  project: one(project, {
    fields: [activityLog.projectId],
    references: [project.id],
  }),
  actor: one(userProfile, {
    fields: [activityLog.actorUserId],
    references: [userProfile.id],
  }),
}));

export const punchItemRelations = relations(punchItem, ({ one }) => ({
  project: one(project, {
    fields: [punchItem.projectId],
    references: [project.id],
  }),
  workType: one(workType, {
    fields: [punchItem.workTypeId],
    references: [workType.id],
  }),
  assignee: one(userProfile, {
    fields: [punchItem.assigneeId],
    references: [userProfile.id],
    relationName: "punchAssignee",
  }),
  createdBy: one(userProfile, {
    fields: [punchItem.createdByUserId],
    references: [userProfile.id],
    relationName: "punchCreator",
  }),
  verifiedBy: one(userProfile, {
    fields: [punchItem.verifiedByUserId],
    references: [userProfile.id],
    relationName: "punchVerifier",
  }),
}));

export const changeOrderRelations = relations(changeOrder, ({ one }) => ({
  project: one(project, {
    fields: [changeOrder.projectId],
    references: [project.id],
  }),
  createdBy: one(userProfile, {
    fields: [changeOrder.createdByUserId],
    references: [userProfile.id],
    relationName: "coCreator",
  }),
  approvedBy: one(userProfile, {
    fields: [changeOrder.clientApprovedByUserId],
    references: [userProfile.id],
    relationName: "coApprover",
  }),
}));

export const dailyLogRelations = relations(dailyLog, ({ one }) => ({
  project: one(project, {
    fields: [dailyLog.projectId],
    references: [project.id],
  }),
  createdBy: one(userProfile, {
    fields: [dailyLog.createdByUserId],
    references: [userProfile.id],
  }),
}));

export const selectionRelations = relations(selection, ({ one }) => ({
  project: one(project, {
    fields: [selection.projectId],
    references: [project.id],
  }),
  workType: one(workType, {
    fields: [selection.workTypeId],
    references: [workType.id],
  }),
  mainTask: one(mainTask, {
    fields: [selection.mainTaskId],
    references: [mainTask.id],
  }),
  createdBy: one(userProfile, {
    fields: [selection.createdByUserId],
    references: [userProfile.id],
  }),
}));

export const timeEntryRelations = relations(timeEntry, ({ one }) => ({
  user: one(userProfile, {
    fields: [timeEntry.userId],
    references: [userProfile.id],
  }),
  project: one(project, {
    fields: [timeEntry.projectId],
    references: [project.id],
  }),
  dailyTask: one(dailyTask, {
    fields: [timeEntry.dailyTaskId],
    references: [dailyTask.id],
  }),
}));

export const checklistTemplateRelations = relations(checklistTemplate, ({ many }) => ({
  instances: many(checklistInstance),
}));

export const checklistInstanceRelations = relations(checklistInstance, ({ one, many }) => ({
  template: one(checklistTemplate, {
    fields: [checklistInstance.templateId],
    references: [checklistTemplate.id],
  }),
  workType: one(workType, {
    fields: [checklistInstance.workTypeId],
    references: [workType.id],
  }),
  mainTask: one(mainTask, {
    fields: [checklistInstance.mainTaskId],
    references: [mainTask.id],
  }),
  items: many(checklistItemInstance),
}));

export const checklistItemInstanceRelations = relations(
  checklistItemInstance,
  ({ one }) => ({
    instance: one(checklistInstance, {
      fields: [checklistItemInstance.instanceId],
      references: [checklistInstance.id],
    }),
    completedBy: one(userProfile, {
      fields: [checklistItemInstance.completedByUserId],
      references: [userProfile.id],
    }),
  }),
);

// ── Inferred Types ─────────────────────────────────────────────────────────

export type Client = InferSelectModel<typeof client>;
export type UserProfile = InferSelectModel<typeof userProfile>;
export type Project = InferSelectModel<typeof project>;
export type WorkType = InferSelectModel<typeof workType>;
export type MainTask = InferSelectModel<typeof mainTask>;
export type DailyTask = InferSelectModel<typeof dailyTask>;
export type TaskPhoto = InferSelectModel<typeof taskPhoto>;
export type CompletionDocument = InferSelectModel<typeof completionDocument>;
export type ProjectDocument = InferSelectModel<typeof projectDocument>;
export type Comment = InferSelectModel<typeof comment>;
export type ActivityLog = InferSelectModel<typeof activityLog>;
export type PunchItem = InferSelectModel<typeof punchItem>;
export type ChangeOrder = InferSelectModel<typeof changeOrder>;
export type DailyLog = InferSelectModel<typeof dailyLog>;
export type Selection = InferSelectModel<typeof selection>;
export type TimeEntry = InferSelectModel<typeof timeEntry>;
export type ChecklistTemplate = InferSelectModel<typeof checklistTemplate>;
export type ChecklistInstance = InferSelectModel<typeof checklistInstance>;
export type ChecklistItemInstance = InferSelectModel<typeof checklistItemInstance>;
