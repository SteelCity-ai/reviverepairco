"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Tabs, type Tab } from "@/components/ui/Tabs";
import { formatDate } from "@/lib/utils";
import type {
  Project,
  WorkType,
  MainTask,
  DailyTask,
  TaskPhoto,
  PunchItem,
  ProjectDocument,
  ActivityLog,
  DailyLog,
} from "@/lib/db";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PROJECT: Project & {
  clientCompanyName: string;
  pmDisplayName: string;
  siteAddress: { line1: string; city: string; state: string; zip: string };
} = {
  id: "proj-001",
  clientId: "client-001",
  name: "Smith Residence — Full Roof Replacement",
  description:
    "Complete tear-off of existing asphalt shingle roof down to decking, install new ice & water shield, synthetic underlayment, architectural shingles (GAF Timberline HDZ in Charcoal), new ridge vent, pipe boots, and drip edge. 2-story colonial home with attached garage.",
  siteAddress: { line1: "42 Elm Street", city: "Pittsburgh", state: "PA", zip: "15206" },
  status: "ACTIVE",
  projectManagerUserId: "user-001",
  startDate: "2026-04-15",
  targetEndDate: "2026-05-10",
  actualEndDate: null,
  invoiceStatus: "INVOICED",
  createdAt: "2026-03-20T10:00:00Z",
  updatedAt: "2026-04-28T14:30:00Z",
  clientCompanyName: "Smith Family Trust",
  pmDisplayName: "Sarah Peterson",
};

const MOCK_WORK_TYPES: WorkType[] = [
  { id: "wt-001", projectId: "proj-001", name: "Tear-Off & Prep", description: "Remove old shingles, inspect decking, install underlayment", sortOrder: 1, status: "COMPLETE", createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-17T16:00:00Z" },
  { id: "wt-002", projectId: "proj-001", name: "Shingle Installation", description: "Install architectural shingles on main roof", sortOrder: 2, status: "IN_PROGRESS", createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-28T14:00:00Z" },
  { id: "wt-003", projectId: "proj-001", name: "Flashing & Ventilation", description: "Install ridge vent, pipe boots, drip edge, step flashing", sortOrder: 3, status: "NOT_STARTED", createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
  { id: "wt-004", projectId: "proj-001", name: "Cleanup & Final Inspection", description: "Magnetic sweep, gutter cleaning, final walkthrough", sortOrder: 4, status: "NOT_STARTED", createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
];

const MOCK_MAIN_TASKS: MainTask[] = [
  { id: "mt-001", workTypeId: "wt-001", name: "Tear off existing shingles", description: "Strip all layers down to decking", sortOrder: 1, status: "COMPLETE", startDate: "2026-04-15", endDate: "2026-04-15", estimatedDurationDays: 1, dependsOn: null, pmReviewedAt: "2026-04-15T17:00:00Z", pmReviewedByUserId: "user-001", clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-15T17:00:00Z" },
  { id: "mt-002", workTypeId: "wt-001", name: "Inspect and repair decking", description: "Replace any rotted or damaged deck boards", sortOrder: 2, status: "COMPLETE", startDate: "2026-04-16", endDate: "2026-04-16", estimatedDurationDays: 1, dependsOn: "mt-001", pmReviewedAt: "2026-04-16T16:30:00Z", pmReviewedByUserId: "user-001", clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-16T16:30:00Z" },
  { id: "mt-003", workTypeId: "wt-001", name: "Install ice & water shield + underlayment", description: "Apply Grace Ice & Water Shield at eaves, valleys, and penetrations; synthetic underlayment over entire roof deck", sortOrder: 3, status: "COMPLETE", startDate: "2026-04-17", endDate: "2026-04-17", estimatedDurationDays: 1, dependsOn: "mt-002", pmReviewedAt: "2026-04-17T16:00:00Z", pmReviewedByUserId: "user-001", clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-17T16:00:00Z" },
  { id: "mt-004", workTypeId: "wt-002", name: "Install starter strip and first course", description: "Starter shingles at eaves and rakes", sortOrder: 4, status: "COMPLETE", startDate: "2026-04-21", endDate: "2026-04-21", estimatedDurationDays: 1, dependsOn: "mt-003", pmReviewedAt: "2026-04-21T16:30:00Z", pmReviewedByUserId: "user-001", clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-21T16:30:00Z" },
  { id: "mt-005", workTypeId: "wt-002", name: "Shingle main roof field", description: "GAF Timberline HDZ Charcoal shingles on main roof faces", sortOrder: 5, status: "IN_PROGRESS", startDate: "2026-04-22", endDate: "2026-04-30", estimatedDurationDays: 7, dependsOn: "mt-004", pmReviewedAt: null, pmReviewedByUserId: null, clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-28T14:00:00Z" },
  { id: "mt-006", workTypeId: "wt-002", name: "Shingle garage roof", description: "Same material on attached garage", sortOrder: 6, status: "NOT_STARTED", startDate: "2026-05-01", endDate: "2026-05-02", estimatedDurationDays: 2, dependsOn: "mt-005", pmReviewedAt: null, pmReviewedByUserId: null, clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
  { id: "mt-007", workTypeId: "wt-003", name: "Install ridge vent", description: "Cut ridge slot and install Cobra Ridge Vent", sortOrder: 7, status: "NOT_STARTED", startDate: "2026-05-03", endDate: "2026-05-03", estimatedDurationDays: 1, dependsOn: "mt-006", pmReviewedAt: null, pmReviewedByUserId: null, clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
  { id: "mt-008", workTypeId: "wt-003", name: "Install pipe boots, step flashing, drip edge", description: "Lead pipe boots, custom step flashing at walls, drip edge at all eaves", sortOrder: 8, status: "NOT_STARTED", startDate: "2026-05-04", endDate: "2026-05-05", estimatedDurationDays: 2, dependsOn: "mt-006", pmReviewedAt: null, pmReviewedByUserId: null, clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
  { id: "mt-009", workTypeId: "wt-004", name: "Site cleanup & magnetic sweep", description: "Magnetic roller sweep of entire property, gutter cleaning, debris removal", sortOrder: 9, status: "NOT_STARTED", startDate: "2026-05-06", endDate: "2026-05-06", estimatedDurationDays: 1, dependsOn: "mt-007", pmReviewedAt: null, pmReviewedByUserId: null, clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
  { id: "mt-010", workTypeId: "wt-004", name: "Final PM inspection & walkthrough", description: "PM reviews all work, photos, and walks the roof with client", sortOrder: 10, status: "NOT_STARTED", startDate: "2026-05-07", endDate: "2026-05-07", estimatedDurationDays: 1, dependsOn: "mt-009", pmReviewedAt: null, pmReviewedByUserId: null, clientSignedAt: null, clientSignedByUserId: null, clientSignatureName: null, completionDocumentId: null, materials: [], createdAt: "2026-04-10T08:00:00Z", updatedAt: "2026-04-10T08:00:00Z" },
];

const MOCK_DAILY_TASKS: DailyTask[] = [
  { id: "dt-001", mainTaskId: "mt-005", assignedToUserId: "user-010", scheduledDate: "2026-04-29", title: "Shingle east face", description: "Complete east-facing roof plane shingling", status: "NOT_STARTED", completedAt: null, completedByUserId: null, crewNotes: null, hoursLogged: null, sortOrder: 1, createdAt: "2026-04-28T08:00:00Z", updatedAt: "2026-04-28T08:00:00Z" },
  { id: "dt-002", mainTaskId: "mt-005", assignedToUserId: "user-011", scheduledDate: "2026-04-29", title: "Shingle north face + ridge cap prep", description: "North face and prep ridge for ridge cap shingles", status: "NOT_STARTED", completedAt: null, completedByUserId: null, crewNotes: null, hoursLogged: null, sortOrder: 2, createdAt: "2026-04-28T08:00:00Z", updatedAt: "2026-04-28T08:00:00Z" },
  { id: "dt-003", mainTaskId: "mt-005", assignedToUserId: "user-012", scheduledDate: "2026-04-28", title: "Shingle south face — completed", description: "South-facing roof plane fully shingled", status: "DONE", completedAt: "2026-04-28T15:30:00Z", completedByUserId: "user-012", crewNotes: "No issues, good weather", hoursLogged: "7.5", sortOrder: 3, createdAt: "2026-04-28T08:00:00Z", updatedAt: "2026-04-28T15:30:00Z" },
  { id: "dt-004", mainTaskId: "mt-005", assignedToUserId: "user-013", scheduledDate: "2026-04-28", title: "Shingle west face — completed", description: "West-facing roof plane fully shingled", status: "DONE", completedAt: "2026-04-28T15:45:00Z", completedByUserId: "user-013", crewNotes: "All ridge vents prepped", hoursLogged: "7.5", sortOrder: 4, createdAt: "2026-04-28T08:00:00Z", updatedAt: "2026-04-28T15:45:00Z" },
];

const MOCK_PHOTOS: (TaskPhoto & { uploadedByName: string; dailyTaskTitle: string })[] = [
  { id: "ph-001", dailyTaskId: "dt-003", objectKey: "photos/smith/south-face-01.jpg", originalFilename: "south-face-before.jpg", mimeType: "image/jpeg", sizeBytes: 2450000, uploadedByUserId: "user-012", pmStatus: "PENDING", pmRejectReason: null, caption: "South face before shingling", createdAt: "2026-04-28T09:00:00Z", updatedAt: "2026-04-28T09:00:00Z", uploadedByName: "Dave R.", dailyTaskTitle: "Shingle south face — completed" },
  { id: "ph-002", dailyTaskId: "dt-003", objectKey: "photos/smith/south-face-02.jpg", originalFilename: "south-face-after.jpg", mimeType: "image/jpeg", sizeBytes: 3120000, uploadedByUserId: "user-012", pmStatus: "PENDING", pmRejectReason: null, caption: "South face after shingling complete", createdAt: "2026-04-28T15:00:00Z", updatedAt: "2026-04-28T15:00:00Z", uploadedByName: "Dave R.", dailyTaskTitle: "Shingle south face — completed" },
  { id: "ph-003", dailyTaskId: "dt-004", objectKey: "photos/smith/west-face-01.jpg", originalFilename: "west-face-complete.jpg", mimeType: "image/jpeg", sizeBytes: 2800000, uploadedByUserId: "user-013", pmStatus: "APPROVED", pmRejectReason: null, caption: "West face complete with valley detail", createdAt: "2026-04-28T14:30:00Z", updatedAt: "2026-04-28T16:00:00Z", uploadedByName: "Jake M.", dailyTaskTitle: "Shingle west face — completed" },
  { id: "ph-004", dailyTaskId: "dt-004", objectKey: "photos/smith/west-face-02.jpg", originalFilename: "west-flashing-detail.jpg", mimeType: "image/jpeg", sizeBytes: 1900000, uploadedByUserId: "user-013", pmStatus: "REJECTED", pmRejectReason: "Photo too dark — please retake with better lighting on flashing detail", caption: "Step flashing at chimney", createdAt: "2026-04-28T15:00:00Z", updatedAt: "2026-04-28T16:15:00Z", uploadedByName: "Jake M.", dailyTaskTitle: "Shingle west face — completed" },
];

const MOCK_PUNCH_ITEMS: (PunchItem & { assigneeName: string; workTypeName: string })[] = [
  { id: "pi-001", projectId: "proj-001", workTypeId: "wt-001", description: "Replace 3 damaged deck boards found near chimney on north side", assigneeId: "user-010", photos: [], deadline: "2026-04-30", status: "OPEN", createdByUserId: "user-001", verifiedByUserId: null, createdAt: "2026-04-16T10:00:00Z", updatedAt: "2026-04-16T10:00:00Z", assigneeName: "Dave R.", workTypeName: "Tear-Off & Prep" },
  { id: "pi-002", projectId: "proj-001", workTypeId: "wt-002", description: "Remove and re-nail loose starter strip on garage east eave", assigneeId: "user-011", photos: [], deadline: "2026-04-29", status: "IN_PROGRESS", createdByUserId: "user-001", verifiedByUserId: null, createdAt: "2026-04-22T14:00:00Z", updatedAt: "2026-04-28T09:00:00Z", assigneeName: "Carlos V.", workTypeName: "Shingle Installation" },
];

const MOCK_DOCUMENTS: (ProjectDocument & { uploadedByName: string })[] = [
  { id: "doc-001", projectId: "proj-001", objectKey: "docs/smith/contract.pdf", originalFilename: "Smith-Contract-v2.pdf", mimeType: "application/pdf", sizeBytes: 450000, uploadedByUserId: "user-001", category: "CONTRACT", description: "Signed contract for full roof replacement", createdAt: "2026-03-20T10:00:00Z", updatedAt: "2026-03-20T10:00:00Z", uploadedByName: "Sarah Peterson" },
  { id: "doc-002", projectId: "proj-001", objectKey: "docs/smith/permit.pdf", originalFilename: "Building-Permit-2026-0412.pdf", mimeType: "application/pdf", sizeBytes: 180000, uploadedByUserId: "user-001", category: "PERMIT", description: "City building permit #BP-2026-0412", createdAt: "2026-04-12T09:00:00Z", updatedAt: "2026-04-12T09:00:00Z", uploadedByName: "Sarah Peterson" },
  { id: "doc-003", projectId: "proj-001", objectKey: "docs/smith/shingles-receipt.pdf", originalFilename: "ABC-Supply-Shingles.pdf", mimeType: "application/pdf", sizeBytes: 120000, uploadedByUserId: "user-002", category: "RECEIPT", description: "GAF Timberline HDZ — 42 squares", createdAt: "2026-04-14T11:00:00Z", updatedAt: "2026-04-14T11:00:00Z", uploadedByName: "Mike Collins" },
];

const MOCK_ACTIVITY: (ActivityLog & { actorName: string })[] = [
  { id: "al-001", projectId: "proj-001", actorUserId: "user-012", verb: "completed daily task", entityType: "daily_task", entityId: "dt-003", meta: null, createdAt: "2026-04-28T15:30:00Z", actorName: "Dave R." },
  { id: "al-002", projectId: "proj-001", actorUserId: "user-013", verb: "completed daily task", entityType: "daily_task", entityId: "dt-004", meta: null, createdAt: "2026-04-28T15:45:00Z", actorName: "Jake M." },
  { id: "al-003", projectId: "proj-001", actorUserId: "user-012", verb: "uploaded photos", entityType: "task_photo", entityId: "ph-001", meta: null, createdAt: "2026-04-28T09:00:00Z", actorName: "Dave R." },
  { id: "al-004", projectId: "proj-001", actorUserId: "user-001", verb: "approved photo", entityType: "task_photo", entityId: "ph-003", meta: null, createdAt: "2026-04-28T16:00:00Z", actorName: "Sarah Peterson" },
  { id: "al-005", projectId: "proj-001", actorUserId: "user-001", verb: "rejected photo", entityType: "task_photo", entityId: "ph-004", meta: { reason: "Photo too dark" }, createdAt: "2026-04-28T16:15:00Z", actorName: "Sarah Peterson" },
  { id: "al-006", projectId: "proj-001", actorUserId: "user-002", verb: "created punch item", entityType: "punch_item", entityId: "pi-001", meta: null, createdAt: "2026-04-22T14:00:00Z", actorName: "Mike Collins" },
  { id: "al-007", projectId: "proj-001", actorUserId: "user-011", verb: "started work on", entityType: "punch_item", entityId: "pi-002", meta: null, createdAt: "2026-04-28T09:00:00Z", actorName: "Carlos V." },
];

const MOCK_DAILY_LOGS: (DailyLog & { createdByName: string })[] = [
  {
    id: "dl-001", projectId: "proj-001", date: "2026-04-28",
    weather: { temp: 62, condition: "Partly Cloudy", wind: "8 mph SW", precipitation: "0%" },
    crewNotes: "Good progress on south and west faces. Completed both by 3:45 PM. Material staging area organized. All safety protocols followed.",
    delays: null,
    safetyNotes: "Morning tailgate: ladder safety review. All harnesses inspected — passed.",
    photos: [],
    createdByUserId: "user-010", createdAt: "2026-04-28T16:30:00Z", updatedAt: "2026-04-28T16:30:00Z",
    createdByName: "Dave R.",
  },
  {
    id: "dl-002", projectId: "proj-001", date: "2026-04-27",
    weather: { temp: 58, condition: "Sunny", wind: "5 mph N", precipitation: "0%" },
    crewNotes: "Focused on prep for shingling. Verified all starter strip measurements. Material delivery confirmed — 42 squares on site.",
    delays: null,
    safetyNotes: "Morning tailgate: fall protection. All PPE accounted for.",
    photos: [],
    createdByUserId: "user-010", createdAt: "2026-04-27T16:00:00Z", updatedAt: "2026-04-27T16:00:00Z",
    createdByName: "Dave R.",
  },
  {
    id: "dl-003", projectId: "proj-001", date: "2026-04-26",
    weather: { temp: 55, condition: "Rain AM / Clearing PM", wind: "12 mph E", precipitation: "0.3 in" },
    crewNotes: "Rain delay in morning. Started at 11 AM. Installed starter strip on east face. Called day at 3 PM due to lingering drizzle.",
    delays: "3-hour rain delay in morning",
    safetyNotes: "Wet roof protocol in effect. Extra caution on ladder footing.",
    photos: [],
    createdByUserId: "user-010", createdAt: "2026-04-26T15:00:00Z", updatedAt: "2026-04-26T15:00:00Z",
    createdByName: "Dave R.",
  },
];

const CREW_NAMES: Record<string, string> = {
  "user-010": "Dave R.",
  "user-011": "Carlos V.",
  "user-012": "Dave R.",
  "user-013": "Jake M.",
};

// ── Tabs ───────────────────────────────────────────────────────────────────

const TABS: Tab[] = [
  { id: "overview", label: "Overview" },
  { id: "work", label: "Work" },
  { id: "schedule", label: "Schedule" },
  { id: "approvals", label: "Approvals", count: MOCK_PHOTOS.filter((p) => p.pmStatus === "PENDING").length + MOCK_PUNCH_ITEMS.filter((p) => p.status === "OPEN" || p.status === "IN_PROGRESS").length },
  { id: "documents", label: "Documents" },
  { id: "activity", label: "Activity" },
  { id: "daily-logs", label: "Daily Logs" },
];

const STATUS_CHANGE_OPTIONS = [
  { value: "", label: "Change Status" },
  { value: "PLANNED", label: "Planned" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETE", label: "Complete" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ── Tab Content Components ─────────────────────────────────────────────────

function OverviewTab({ project }: { project: typeof MOCK_PROJECT }) {
  const address = project.siteAddress;
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Project Info Card */}
      <Card className="lg:col-span-2">
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Project Information</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Project Name</dt>
              <dd className="mt-1 text-sm font-medium text-[var(--color-primary)]">{project.name}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Description</dt>
              <dd className="mt-1 text-sm text-gray-600">{project.description || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Client</dt>
              <dd className="mt-1 text-sm text-gray-600">{project.clientCompanyName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Project Manager</dt>
              <dd className="mt-1 text-sm text-gray-600">{project.pmDisplayName}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Start Date</dt>
              <dd className="mt-1 text-sm text-gray-600">{formatDate(project.startDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Target End Date</dt>
              <dd className="mt-1 text-sm text-gray-600">{formatDate(project.targetEndDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Actual End Date</dt>
              <dd className="mt-1 text-sm text-gray-600">{formatDate(project.actualEndDate)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Site Address</dt>
              <dd className="mt-1 text-sm text-gray-600">
                {address.line1}, {address.city}, {address.state} {address.zip}
              </dd>
            </div>
          </dl>
        </CardContent>
      </Card>

      {/* Status Card */}
      <Card className="space-y-4">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">Status</h2>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
            Project Status
          </label>
          <select className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-primary)] bg-white focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20 transition">
            {STATUS_CHANGE_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value} disabled={opt.value === ""}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
            Invoice Status
          </label>
          <div className="mt-1">
            <StatusBadge status={project.invoiceStatus} />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
            Created
          </label>
          <p className="text-sm text-gray-600">{formatDate(project.createdAt)}</p>
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-gray-400">
            Last Updated
          </label>
          <p className="text-sm text-gray-600">{formatDate(project.updatedAt)}</p>
        </div>
      </Card>
    </div>
  );
}

function WorkTab() {
  const [expandedWorkType, setExpandedWorkType] = useState<string | null>(null);
  const [expandedMainTask, setExpandedMainTask] = useState<string | null>(null);

  return (
    <div className="space-y-4">
      {MOCK_WORK_TYPES.map((wt) => {
        const tasks = MOCK_MAIN_TASKS.filter((mt) => mt.workTypeId === wt.id);
        const isExpanded = expandedWorkType === wt.id;
        return (
          <Card key={wt.id}>
            <button
              className="flex w-full items-center justify-between text-left"
              onClick={() => setExpandedWorkType(isExpanded ? null : wt.id)}
            >
              <div className="flex items-center gap-3">
                <span className={`transition-transform ${isExpanded ? "rotate-90" : ""}`}>
                  ▸
                </span>
                <span className="font-semibold text-[var(--color-primary)]">{wt.name}</span>
                <StatusBadge status={wt.status} />
              </div>
              <span className="text-xs text-gray-400">{tasks.length} main task{tasks.length !== 1 ? "s" : ""}</span>
            </button>
            {isExpanded && (
              <div className="mt-4 space-y-3 border-t border-[var(--color-border)] pt-4">
                {wt.description && (
                  <p className="text-sm text-gray-500">{wt.description}</p>
                )}
                {tasks.map((mt) => {
                  const dailies = MOCK_DAILY_TASKS.filter((dt) => dt.mainTaskId === mt.id);
                  const mtExpanded = expandedMainTask === mt.id;
                  return (
                    <div key={mt.id} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]">
                      <button
                        className="flex w-full items-center justify-between px-4 py-2.5 text-left"
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedMainTask(mtExpanded ? null : mt.id);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`text-xs transition-transform ${mtExpanded ? "rotate-90" : ""}`}>
                            ▸
                          </span>
                          <span className="text-sm font-medium text-[var(--color-primary)]">{mt.name}</span>
                          <StatusBadge status={mt.status} />
                        </div>
                        <span className="text-xs text-gray-400">
                          {dailies.length} daily task{dailies.length !== 1 ? "s" : ""}
                        </span>
                      </button>
                      {mtExpanded && dailies.length > 0 && (
                        <div className="border-t border-[var(--color-border)] px-4 py-2">
                          <ul className="space-y-1.5">
                            {dailies.map((dt) => (
                              <li key={dt.id} className="flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`h-1.5 w-1.5 rounded-full ${
                                      dt.status === "DONE" ? "bg-green-500" : "bg-gray-300"
                                    }`}
                                  />
                                  <span className={dt.status === "DONE" ? "text-gray-500 line-through" : "text-gray-700"}>
                                    {dt.title}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-400">
                                  {dt.assignedToUserId ? CREW_NAMES[dt.assignedToUserId] || "Unassigned" : "Unassigned"}
                                  {dt.scheduledDate && ` · ${formatDate(dt.scheduledDate)}`}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {mtExpanded && dailies.length === 0 && (
                        <div className="border-t border-[var(--color-border)] px-4 py-2 text-xs text-gray-400">
                          No daily tasks assigned yet.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

function ScheduleTab() {
  return (
    <div className="space-y-2">
      {MOCK_MAIN_TASKS.map((mt) => {
        const dep = mt.dependsOn
          ? MOCK_MAIN_TASKS.find((m) => m.id === mt.dependsOn)
          : null;
        return (
          <Card key={mt.id} className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface)] text-xs font-bold text-[var(--color-slate)]">
                {mt.sortOrder}
              </div>
              <div>
                <p className="font-medium text-[var(--color-primary)]">{mt.name}</p>
                <p className="text-xs text-gray-400">
                  {formatDate(mt.startDate)} → {formatDate(mt.endDate)}
                  {mt.estimatedDurationDays && ` (${mt.estimatedDurationDays} day${mt.estimatedDurationDays > 1 ? "s" : ""})`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              {dep && (
                <span className="text-xs text-gray-400">
                  Depends on: <span className="font-medium text-gray-600">{dep.name}</span>
                </span>
              )}
              <StatusBadge status={mt.status} />
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function ApprovalsTab() {
  const pendingPhotos = MOCK_PHOTOS.filter((p) => p.pmStatus === "PENDING");
  const approvedRejectedPhotos = MOCK_PHOTOS.filter((p) => p.pmStatus !== "PENDING");

  return (
    <div className="space-y-8">
      {/* Photos Pending Review */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
          Photos Pending PM Review ({pendingPhotos.length})
        </h2>
        {pendingPhotos.length === 0 ? (
          <p className="text-sm text-gray-400">No photos pending review.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingPhotos.map((photo) => (
              <Card key={photo.id}>
                <div className="flex items-start justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                      {photo.originalFilename || photo.objectKey}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      Uploaded by {photo.uploadedByName} · {photo.dailyTaskTitle}
                    </p>
                    {photo.caption && (
                      <p className="mt-1 text-xs italic text-gray-500">"{photo.caption}"</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">{formatDate(photo.createdAt)}</p>
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button variant="primary" size="sm">✓ Approve</Button>
                  <Button variant="danger" size="sm">✗ Reject</Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Previously Reviewed Photos */}
      {approvedRejectedPhotos.length > 0 && (
        <div>
          <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
            Reviewed Photos ({approvedRejectedPhotos.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {approvedRejectedPhotos.map((photo) => (
              <Card key={photo.id}>
                <div>
                  <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                    {photo.originalFilename || photo.objectKey}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {photo.uploadedByName} · {formatDate(photo.createdAt)}
                  </p>
                  {photo.pmRejectReason && (
                    <p className="mt-1 text-xs text-red-500">Rejected: {photo.pmRejectReason}</p>
                  )}
                </div>
                <div className="mt-2">
                  <StatusBadge status={photo.pmStatus} />
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Punch Items */}
      <div>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
          Punch Items ({MOCK_PUNCH_ITEMS.length})
        </h2>
        {MOCK_PUNCH_ITEMS.length === 0 ? (
          <p className="text-sm text-gray-400">No punch items.</p>
        ) : (
          <div className="space-y-2">
            {MOCK_PUNCH_ITEMS.map((pi) => (
              <Card key={pi.id} className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[var(--color-primary)]">{pi.description}</p>
                  <p className="mt-1 text-xs text-gray-400">
                    {pi.workTypeName} · Assigned to {pi.assigneeName}
                    {pi.deadline && ` · Due ${formatDate(pi.deadline)}`}
                  </p>
                </div>
                <StatusBadge status={pi.status} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function DocumentsTab() {
  const categories = ["CONTRACT", "PERMIT", "RECEIPT", "OTHER"] as const;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[var(--color-primary)]">
          Project Documents ({MOCK_DOCUMENTS.length})
        </h2>
        <Button variant="primary" size="sm">+ Upload Document</Button>
      </div>

      {categories.map((cat) => {
        const docs = MOCK_DOCUMENTS.filter((d) => d.category === cat);
        if (docs.length === 0) return null;
        return (
          <div key={cat}>
            <h3 className="mb-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
              {cat === "OTHER" ? "Other" : cat.charAt(0) + cat.slice(1).toLowerCase()}s
            </h3>
            <div className="space-y-2">
              {docs.map((doc) => (
                <Card key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-primary)]">{doc.originalFilename}</p>
                      <p className="text-xs text-gray-400">
                        {doc.description} · Uploaded by {doc.uploadedByName} · {formatDate(doc.createdAt)}
                        {doc.sizeBytes && ` · ${(doc.sizeBytes / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm">Download</Button>
                </Card>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function ActivityTab() {
  return (
    <div className="space-y-1">
      {MOCK_ACTIVITY.map((act) => (
        <div key={act.id} className="flex items-start gap-3 border-b border-[var(--color-border)] py-3 last:border-0">
          <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-amber)]" />
          <div className="min-w-0 flex-1">
            <p className="text-sm text-[var(--color-primary)]">
              <span className="font-semibold">{act.actorName}</span>{" "}
              {act.verb}{" "}
              <span className="text-gray-500">{act.entityType?.replace(/_/g, " ")}</span>
            </p>
          </div>
          <time className="shrink-0 text-xs text-gray-400">{formatDate(act.createdAt)}</time>
        </div>
      ))}
    </div>
  );
}

function DailyLogsTab() {
  return (
    <div className="space-y-4">
      {MOCK_DAILY_LOGS.map((log) => {
        const weather = log.weather as { temp?: number; condition?: string; wind?: string; precipitation?: string } | null;
        return (
          <Card key={log.id}>
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-[var(--color-primary)]">
                {formatDate(log.date)}
              </h3>
              <span className="text-xs text-gray-400">by {log.createdByName}</span>
            </div>

            {weather && (
              <div className="mt-3 flex flex-wrap gap-3 rounded-lg bg-[var(--color-surface)] px-4 py-2 text-xs">
                {weather.temp !== undefined && (
                  <span>
                    <span className="text-gray-400">Temp:</span> {weather.temp}°F
                  </span>
                )}
                {weather.condition && (
                  <span>
                    <span className="text-gray-400">Sky:</span> {weather.condition}
                  </span>
                )}
                {weather.wind && (
                  <span>
                    <span className="text-gray-400">Wind:</span> {weather.wind}
                  </span>
                )}
                {weather.precipitation && (
                  <span>
                    <span className="text-gray-400">Precip:</span> {weather.precipitation}
                  </span>
                )}
              </div>
            )}

            {log.crewNotes && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Crew Notes</p>
                <p className="mt-1 text-sm text-gray-600">{log.crewNotes}</p>
              </div>
            )}

            {log.delays && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Delays</p>
                <p className="mt-1 text-sm text-amber-600">{log.delays}</p>
              </div>
            )}

            {log.safetyNotes && (
              <div className="mt-3">
                <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Safety Notes</p>
                <p className="mt-1 text-sm text-gray-600">{log.safetyNotes}</p>
              </div>
            )}
          </Card>
        );
      })}
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────

export default function AdminProjectDetailPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const activeTab = searchParams.get("tab") || "overview";

  const handleTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [searchParams, router],
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/projects" className="hover:text-[var(--color-amber)] transition">
            Projects
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">{MOCK_PROJECT.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">{MOCK_PROJECT.name}</h1>
          <StatusBadge status={MOCK_PROJECT.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {MOCK_PROJECT.clientCompanyName} · PM: {MOCK_PROJECT.pmDisplayName} ·{" "}
          {formatDate(MOCK_PROJECT.startDate)} → {formatDate(MOCK_PROJECT.targetEndDate)}
        </p>
      </div>

      {/* Tabs */}
      <Tabs tabs={TABS} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Tab Content */}
      <div className="pt-4">
        {activeTab === "overview" && <OverviewTab project={MOCK_PROJECT} />}
        {activeTab === "work" && <WorkTab />}
        {activeTab === "schedule" && <ScheduleTab />}
        {activeTab === "approvals" && <ApprovalsTab />}
        {activeTab === "documents" && <DocumentsTab />}
        {activeTab === "activity" && <ActivityTab />}
        {activeTab === "daily-logs" && <DailyLogsTab />}
      </div>
    </div>
  );
}
