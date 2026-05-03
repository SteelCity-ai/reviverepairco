import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type { Project, Client, UserProfile } from "@/lib/db";

export const dynamic = "force-dynamic";

type ProjectRow = Project & {
  client: Client | null;
  projectManager: UserProfile | null;
};

export default async function AdminProjectsPage() {
  const projects = (await api<ProjectRow[]>("/projects")) ?? [];

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            {projects.length} project{projects.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button variant="primary">+ New Project</Button>
        </Link>
      </div>

      {projects.length === 0 ? (
        <EmptyState
          icon="▦"
          title="No projects yet"
          description="Create your first project to get started."
          action={
            <Link href="/admin/projects/new">
              <Button variant="primary" size="sm">+ New Project</Button>
            </Link>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Project</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Client</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">PM</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Start</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Target End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {projects.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[var(--color-surface)]"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-medium text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{p.client?.companyName ?? "—"}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-600">
                      {p.projectManager?.displayName ?? "—"}
                    </td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(p.startDate)}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(p.targetEndDate)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
