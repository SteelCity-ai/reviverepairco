import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { api } from "@/lib/api-server";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

interface DailyTaskRow {
  id: string;
  status: string;
}
interface MainTaskRow {
  id: string;
  name: string;
  status: string;
  dailyTasks: DailyTaskRow[];
}
interface WorkTypeRow {
  id: string;
  name: string;
  status: string;
  mainTasks: MainTaskRow[];
}
interface ProjectDetail {
  id: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  targetEndDate: string | null;
  workTypes: WorkTypeRow[];
}

function pct(items: { status: string }[], doneStatus = "DONE"): number {
  if (!items.length) return 0;
  const done = items.filter((i) => i.status === doneStatus).length;
  return Math.round((done / items.length) * 100);
}

export const dynamic = "force-dynamic";

export default async function ClientProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await api<ProjectDetail>(`/projects/${id}`);
  if (!project) return notFound();

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <Link
        href="/client/projects"
        className="mb-4 inline-flex items-center gap-1.5 text-sm text-gray-500"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to projects
      </Link>

      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          {project.name}
        </h1>
        {project.description && (
          <p className="mt-1 text-sm text-gray-600">{project.description}</p>
        )}
        <p className="mt-2 text-xs uppercase tracking-wide text-gray-400">
          {project.status}
          {project.targetEndDate ? ` · target ${project.targetEndDate}` : ""}
        </p>
      </div>

      <div className="space-y-4">
        {project.workTypes.map((wt) => (
          <Card key={wt.id}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <h2 className="text-base font-semibold text-[var(--color-primary)]">
                  {wt.name}
                </h2>
                <span className="text-xs uppercase tracking-wide text-gray-400">
                  {wt.status}
                </span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {wt.mainTasks.map((mt) => {
                  const p = pct(mt.dailyTasks);
                  return (
                    <div
                      key={mt.id}
                      className="rounded-lg border border-[var(--color-border)] p-3"
                    >
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-medium text-[var(--color-primary)]">
                          {mt.name}
                        </p>
                        <span className="text-xs uppercase tracking-wide text-gray-400">
                          {mt.status}
                        </span>
                      </div>
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className="h-full bg-[var(--color-amber)]"
                          style={{ width: `${p}%` }}
                        />
                      </div>
                      {mt.status === "CLIENT_SIGNOFF" && (
                        <Link
                          href={`/client/main-tasks/${mt.id}/signoff`}
                          className="mt-3 inline-block rounded-full bg-[var(--color-amber)] px-3 py-1 text-xs font-semibold text-[var(--color-primary)]"
                        >
                          Sign off →
                        </Link>
                      )}
                    </div>
                  );
                })}
                {!wt.mainTasks.length && (
                  <p className="text-sm text-gray-400">
                    No main tasks yet.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {!project.workTypes.length && (
          <p className="text-sm text-gray-400">
            No work types defined yet — your project manager will add them
            shortly.
          </p>
        )}
      </div>
    </div>
  );
}
