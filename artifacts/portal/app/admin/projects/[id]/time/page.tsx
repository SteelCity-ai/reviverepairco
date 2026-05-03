import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type { Project } from "@/lib/db";

type TimeEntry = {
  id: string;
  userId: string;
  projectId: string;
  clockIn: string;
  clockOut: string | null;
  notes: string | null;
};

export const dynamic = "force-dynamic";

function formatDuration(start: string, end: string | null): string {
  if (!end) return "—";
  const minutes = Math.max(
    0,
    Math.floor((new Date(end).getTime() - new Date(start).getTime()) / 60000),
  );
  const h = Math.floor(minutes / 60);
  const m = Math.floor(minutes % 60);
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default async function ProjectTimePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, entries] = await Promise.all([
    api<Project>(`/projects/${id}`),
    api<(TimeEntry & { user?: { displayName?: string | null } | null })[]>(`/time-entries?projectId=${id}`),
  ]);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/projects" className="hover:text-[var(--color-amber)] transition">Projects</Link>
          <span>/</span>
          <Link href={`/admin/projects/${id}`} className="hover:text-[var(--color-amber)] transition">
            {project?.name ?? id}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">Time</span>
        </nav>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Time Entries</h1>
      </div>

      {!entries || entries.length === 0 ? (
        <EmptyState icon="⏱" title="No time entries yet" description="Crew clock-ins will appear here." />
      ) : (
        <Card className="overflow-hidden p-0">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                <th className="px-4 py-3 font-semibold text-[var(--color-primary)]">User</th>
                <th className="px-4 py-3 font-semibold text-[var(--color-primary)]">Start</th>
                <th className="px-4 py-3 font-semibold text-[var(--color-primary)]">End</th>
                <th className="px-4 py-3 font-semibold text-[var(--color-primary)]">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--color-border)]">
              {entries.map((e) => (
                <tr key={e.id}>
                  <td className="px-4 py-3 text-[var(--color-primary)]">{e.user?.displayName ?? "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDate(e.clockIn)}</td>
                  <td className="px-4 py-3 text-gray-600">{e.clockOut ? formatDate(e.clockOut) : "—"}</td>
                  <td className="px-4 py-3 text-gray-600">{formatDuration(e.clockIn, e.clockOut)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}
    </div>
  );
}
