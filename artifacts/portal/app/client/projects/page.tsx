import Link from "next/link";
import { api } from "@/lib/api-server";
import { Card, CardContent } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  description: string | null;
  startDate: string | null;
  targetEndDate: string | null;
}

export const dynamic = "force-dynamic";

export default async function ClientProjectsPage() {
  const projects = (await api<ProjectRow[]>("/projects")) ?? [];
  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-4 text-2xl font-bold text-[var(--color-primary)]">
        Your Projects
      </h1>
      {projects.length === 0 ? (
        <EmptyState
          icon="🏗️"
          title="No projects yet"
          description="When your project manager creates one, it will appear here."
        />
      ) : (
        <div className="space-y-3">
          {projects.map((p) => (
            <Link key={p.id} href={`/client/projects/${p.id}`}>
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <h2 className="text-base font-semibold text-[var(--color-primary)]">
                        {p.name}
                      </h2>
                      {p.description && (
                        <p className="mt-1 text-sm text-gray-500">
                          {p.description}
                        </p>
                      )}
                      <p className="mt-1 text-xs text-gray-400">
                        {p.startDate
                          ? `Started ${p.startDate}`
                          : "Not started"}
                        {p.targetEndDate
                          ? ` · target ${p.targetEndDate}`
                          : ""}
                      </p>
                    </div>
                    <span className="rounded-full border border-[var(--color-border)] px-3 py-0.5 text-xs uppercase tracking-wide text-gray-500">
                      {p.status}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
