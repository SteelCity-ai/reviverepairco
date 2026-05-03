import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type { ChangeOrder, Project } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectChangeOrdersPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, orders] = await Promise.all([
    api<Project>(`/projects/${id}`),
    api<ChangeOrder[]>(`/change-orders?projectId=${id}`),
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
          <span className="text-[var(--color-primary)]">Change Orders</span>
        </nav>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Change Orders</h1>
      </div>

      {!orders || orders.length === 0 ? (
        <EmptyState icon="📑" title="No change orders" description="Change orders will appear here as they are created." />
      ) : (
        <div className="space-y-2">
          {orders.map((co) => (
            <Card key={co.id}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-[var(--color-primary)]">{co.title}</p>
                  {co.costImpact && (
                    <p className="text-xs text-gray-400">Cost impact: {co.costImpact}</p>
                  )}
                </div>
                <span className="text-xs uppercase text-gray-500">{co.status}</span>
              </div>
              {co.description && (
                <p className="mt-2 text-sm text-gray-600">{co.description}</p>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
