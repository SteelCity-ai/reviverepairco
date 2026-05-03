import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type { DailyLog, Project } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectDailyLogsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, logs] = await Promise.all([
    api<Project>(`/projects/${id}`),
    api<DailyLog[]>(`/daily-logs?projectId=${id}`),
  ]);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/projects" className="hover:text-[var(--color-amber)] transition">Projects</Link>
          <span>/</span>
          <Link
            href={`/admin/projects/${id}`}
            className="hover:text-[var(--color-amber)] transition"
          >
            {project?.name ?? id}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">Daily Logs</span>
        </nav>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Daily Logs</h1>
      </div>

      {!logs || logs.length === 0 ? (
        <EmptyState
          icon="📝"
          title="No daily logs yet"
          description="Crew daily logs will appear here as they are submitted."
        />
      ) : (
        <div className="space-y-3">
          {logs.map((log) => (
            <Card key={log.id}>
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-[var(--color-primary)]">{formatDate(log.date)}</p>
                </div>
              </div>
              {log.crewNotes && (
                <p className="mt-3 whitespace-pre-wrap text-sm text-gray-600">{log.crewNotes}</p>
              )}
              {log.delays && (
                <p className="mt-2 text-sm text-amber-700"><strong>Delays:</strong> {log.delays}</p>
              )}
              {log.safetyNotes && (
                <p className="mt-2 text-sm text-gray-600"><strong>Safety:</strong> {log.safetyNotes}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
