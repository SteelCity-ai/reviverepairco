/**
 * Barrel re-export of portal schema types.
 *
 * These are simplified placeholder type definitions matching the shape of
 * the Drizzle schema at lib/db/schema/portal.ts. When real DB integration
 * lands, replace with actual Drizzle InferSelectModel imports.
 */

export interface Client {
  id: string;
  companyName: string;
  primaryContactName: string;
  email: string;
  phone: string | null;
  billingAddress: unknown;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = "ADMIN" | "CREW" | "CLIENT";

export interface UserProfile {
  id: string;
  clerkUserId: string;
  role: UserRole;
  clientId: string | null;
  displayName: string;
  email: string | null;
  phone: string | null;
  archivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = "PLANNED" | "ACTIVE" | "ON_HOLD" | "COMPLETE" | "CANCELLED";
export type InvoiceStatus = "NOT_INVOICED" | "INVOICED" | "PAID";

export interface Project {
  id: string;
  clientId: string;
  name: string;
  description: string | null;
  siteAddress: unknown;
  status: ProjectStatus;
  projectManagerUserId: string | null;
  startDate: string | null;
  targetEndDate: string | null;
  actualEndDate: string | null;
  invoiceStatus: InvoiceStatus;
  createdAt: string;
  updatedAt: string;
}

export type WorkTypeStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE";

export interface WorkType {
  id: string;
  projectId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: WorkTypeStatus;
  createdAt: string;
  updatedAt: string;
}

export type MainTaskStatus =
  | "NOT_STARTED"
  | "IN_PROGRESS"
  | "PM_REVIEW"
  | "CLIENT_SIGNOFF"
  | "COMPLETE";

export interface MainTask {
  id: string;
  workTypeId: string;
  name: string;
  description: string | null;
  sortOrder: number;
  status: MainTaskStatus;
  pmReviewedAt: string | null;
  pmReviewedByUserId: string | null;
  clientSignedAt: string | null;
  clientSignedByUserId: string | null;
  clientSignatureName: string | null;
  completionDocumentId: string | null;
  materials: unknown;
  startDate: string | null;
  endDate: string | null;
  estimatedDurationDays: number | null;
  dependsOn: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DailyTaskStatus = "NOT_STARTED" | "DONE";

export interface DailyTask {
  id: string;
  mainTaskId: string;
  assignedToUserId: string | null;
  scheduledDate: string | null;
  title: string;
  description: string | null;
  status: DailyTaskStatus;
  completedAt: string | null;
  completedByUserId: string | null;
  crewNotes: string | null;
  hoursLogged: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

export type PhotoPmStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface TaskPhoto {
  id: string;
  dailyTaskId: string;
  objectKey: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedByUserId: string | null;
  pmStatus: PhotoPmStatus;
  pmRejectReason: string | null;
  caption: string | null;
  createdAt: string;
  updatedAt: string;
}

export type DocumentCategory = "CONTRACT" | "PERMIT" | "RECEIPT" | "OTHER";

export interface ProjectDocument {
  id: string;
  projectId: string;
  objectKey: string;
  originalFilename: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  uploadedByUserId: string | null;
  category: DocumentCategory;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export type PunchItemStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED";

export interface PunchItem {
  id: string;
  projectId: string;
  workTypeId: string | null;
  description: string;
  assigneeId: string | null;
  photos: unknown;
  deadline: string | null;
  status: PunchItemStatus;
  createdByUserId: string;
  verifiedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export type ChangeOrderStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED";

export interface ChangeOrder {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  reason: string | null;
  costImpact: string | null;
  scheduleImpact: unknown;
  status: ChangeOrderStatus;
  affectedMainTaskIds: string[] | null;
  createdByUserId: string;
  clientApprovedAt: string | null;
  clientApprovedByUserId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DailyLog {
  id: string;
  projectId: string;
  date: string;
  weather: unknown;
  crewNotes: string | null;
  delays: string | null;
  safetyNotes: string | null;
  photos: unknown;
  createdByUserId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  projectId: string | null;
  actorUserId: string | null;
  verb: string;
  entityType: string | null;
  entityId: string | null;
  meta: unknown;
  createdAt: string;
}
