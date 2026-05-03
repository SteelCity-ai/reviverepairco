import Link from "next/link";
import { notFound } from "next/navigation";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type {
  Project,
  WorkType,
  MainTask,
  DailyTask,
  TaskPhoto,
  ProjectDocument,
  ActivityLog,
  Client,
  UserProfile,
} from "@/lib/db";
import ProjectTabs from "./ProjectTabs";

export const dynamic = "force-dynamic";

type ProjectFull = Project & {
  client: Client | null;
  projectManager: UserProfile | null;
  workTypes: (WorkType & {
    mainTasks: (MainTask & { dailyTasks: DailyTask[] })[];
  })[];
  documents: ProjectDocument[];
};

export default async function AdminProjectDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}) {
  const { id } = await params;
  const { tab } = await searchParams;
  const activeTab = tab ?? "overview";

  const [project, photos, activity] = await Promise.all([
    api<ProjectFull>(`/projects/${id}`),
    api<TaskPhoto[]>(`/photos?projectId=${id}`).catch(() => [] as TaskPhoto[]),
    api<ActivityLog[]>(`/projects/${id}/activity`).catch(
      () => [] as ActivityLog[],
    ),
  ]);

  if (!project) notFound();

  const address = (project.siteAddress ?? {}) as {
    line1?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  const allMainTasks = project.workTypes.flatMap((wt) => wt.mainTasks);
  const pendingPhotoCount = (photos ?? []).filter(
    (p) => p.pmStatus === "PENDING",
  ).length;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/projects" className="hover:text-[var(--color-amber)] transition">
            Projects
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">{project.name}</span>
        </nav>
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">{project.name}</h1>
          <StatusBadge status={project.status} />
        </div>
        <p className="mt-1 text-sm text-gray-500">
          {project.client?.companyName ?? "—"} · PM:{" "}
          {project.projectManager?.displayName ?? "—"} ·{" "}
          {formatDate(project.startDate)} → {formatDate(project.targetEndDate)}
        </p>
      </div>

      <ProjectTabs activeTab={activeTab} pendingPhotoCount={pendingPhotoCount} />

      <div className="pt-4">
        {activeTab === "overview" && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <h2 className="text-lg font-semibold text-[var(--color-primary)]">Project Information</h2>
              </CardHeader>
              <CardContent>
                <dl className="grid gap-4 sm:grid-cols-2">
                  <Field label="Project Name" value={project.name} />
                  <Field label="Description" value={project.description || "—"} />
                  <Field label="Client" value={project.client?.companyName ?? "—"} />
                  <Field label="Project Manager" value={project.projectManager?.displayName ?? "—"} />
                  <Field label="Start Date" value={formatDate(project.startDate)} />
                  <Field label="Target End Date" value={formatDate(project.targetEndDate)} />
                  <Field label="Actual End Date" value={formatDate(project.actualEndDate)} />
                  <Field
                    label="Site Address"
                    value={
                      address.line1
                        ? `${address.line1}, ${address.city ?? ""}, ${address.state ?? ""} ${address.zip ?? ""}`
                        : "—"
                    }
                  />
                </dl>
              </CardContent>
            </Card>

            <Card className="space-y-4">
              <h2 className="text-lg font-semibold text-[var(--color-primary)]">Status</h2>
              <Field label="Project Status" value={<StatusBadge status={project.status} />} />
              <Field label="Invoice Status" value={<StatusBadge status={project.invoiceStatus} />} />
              <Field label="Created" value={formatDate(project.createdAt)} />
              <Field label="Last Updated" value={formatDate(project.updatedAt)} />
            </Card>
          </div>
        )}

        {activeTab === "work" && (
          <div className="space-y-4">
            {project.workTypes.length === 0 ? (
              <Card className="py-8 text-center text-sm text-gray-400">No work types yet.</Card>
            ) : (
              project.workTypes.map((wt) => (
                <Card key={wt.id}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold text-[var(--color-primary)]">{wt.name}</span>
                      <StatusBadge status={wt.status} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {wt.mainTasks.length} main task{wt.mainTasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>
                  {wt.description && (
                    <p className="mt-2 text-sm text-gray-500">{wt.description}</p>
                  )}
                  {wt.mainTasks.length > 0 && (
                    <div className="mt-4 space-y-2 border-t border-[var(--color-border)] pt-4">
                      {wt.mainTasks.map((mt) => (
                        <div
                          key={mt.id}
                          className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-2.5"
                        >
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium text-[var(--color-primary)]">{mt.name}</span>
                              <StatusBadge status={mt.status} />
                            </div>
                            <span className="text-xs text-gray-400">
                              {mt.dailyTasks.length} daily task{mt.dailyTasks.length !== 1 ? "s" : ""}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "schedule" && (
          <div className="space-y-2">
            {allMainTasks.length === 0 ? (
              <Card className="py-8 text-center text-sm text-gray-400">No tasks scheduled yet.</Card>
            ) : (
              allMainTasks
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((mt) => (
                  <Card key={mt.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[var(--color-surface)] text-xs font-bold text-[var(--color-slate)]">
                        {mt.sortOrder}
                      </div>
                      <div>
                        <p className="font-medium text-[var(--color-primary)]">{mt.name}</p>
                        <p className="text-xs text-gray-400">
                          {formatDate(mt.startDate)} → {formatDate(mt.endDate)}
                          {mt.estimatedDurationDays &&
                            ` (${mt.estimatedDurationDays} day${mt.estimatedDurationDays > 1 ? "s" : ""})`}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={mt.status} />
                  </Card>
                ))
            )}
          </div>
        )}

        {activeTab === "approvals" && (
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
                Photos Pending PM Review ({pendingPhotoCount})
              </h2>
              {pendingPhotoCount === 0 ? (
                <p className="text-sm text-gray-400">No photos pending review.</p>
              ) : (
                <div className="grid gap-3 sm:grid-cols-2">
                  {(photos ?? [])
                    .filter((p) => p.pmStatus === "PENDING")
                    .map((photo) => (
                      <Card key={photo.id}>
                        <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                          {photo.originalFilename || photo.objectKey}
                        </p>
                        {photo.caption && (
                          <p className="mt-1 text-xs italic text-gray-500">&quot;{photo.caption}&quot;</p>
                        )}
                        <p className="mt-1 text-xs text-gray-400">{formatDate(photo.createdAt)}</p>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "documents" && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-[var(--color-primary)]">
              Project Documents ({project.documents.length})
            </h2>
            {project.documents.length === 0 ? (
              <Card className="py-8 text-center text-sm text-gray-400">No documents uploaded.</Card>
            ) : (
              project.documents.map((doc) => (
                <Card key={doc.id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="text-xl">📄</span>
                    <div>
                      <p className="text-sm font-medium text-[var(--color-primary)]">{doc.originalFilename}</p>
                      <p className="text-xs text-gray-400">
                        {doc.category}
                        {doc.description && ` · ${doc.description}`}
                        {doc.sizeBytes && ` · ${(doc.sizeBytes / 1024).toFixed(0)} KB`}
                      </p>
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === "activity" && (
          <div className="space-y-1">
            {!activity || activity.length === 0 ? (
              <p className="text-sm text-gray-400">No activity yet.</p>
            ) : (
              activity.map((act) => (
                <div key={act.id} className="flex items-start gap-3 border-b border-[var(--color-border)] py-3 last:border-0">
                  <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[var(--color-amber)]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-[var(--color-primary)]">
                      {act.verb}{" "}
                      <span className="text-gray-500">{act.entityType?.replace(/_/g, " ")}</span>
                    </p>
                  </div>
                  <time className="shrink-0 text-xs text-gray-400">{formatDate(act.createdAt)}</time>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-[var(--color-primary)]">{value}</dd>
    </div>
  );
}
