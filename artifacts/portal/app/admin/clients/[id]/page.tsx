import Link from "next/link";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type { Client, Project, ProjectStatus } from "@/lib/db";

export const dynamic = "force-dynamic";

function formatAddress(addr: unknown): string {
  const a = addr as { line1?: string; city?: string; state?: string; zip?: string };
  if (!a?.line1) return "—";
  return `${a.line1}, ${a.city ?? ""}, ${a.state ?? ""} ${a.zip ?? ""}`;
}

const STATUS_ORDER: Record<ProjectStatus, number> = {
  ACTIVE: 0,
  PLANNED: 1,
  ON_HOLD: 2,
  COMPLETE: 3,
  CANCELLED: 4,
};

export default async function AdminClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [client, projects] = await Promise.all([
    api<Client>(`/clients/${id}`),
    api<Project[]>(`/projects?clientId=${id}`),
  ]);

  if (!client) notFound();

  const sortedProjects = [...(projects ?? [])].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5),
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/clients" className="hover:text-[var(--color-amber)] transition">
            Clients
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">{client.companyName}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">{client.companyName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Primary Contact: {client.primaryContactName} · Client since {formatDate(client.createdAt)}
            </p>
          </div>
          <Link href={`/admin/clients/${client.id}/edit`}>
            <Button variant="secondary">Edit Client</Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Client Information</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                <a
                  href={`mailto:${client.email}`}
                  className="hover:text-[var(--color-amber)] transition"
                >
                  {client.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                {client.phone ? (
                  <a href={`tel:${client.phone}`} className="hover:text-[var(--color-amber)] transition">
                    {client.phone}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Projects</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
                {sortedProjects.length}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Client Type</dt>
              <dd className="mt-1 text-sm text-gray-600">
                <span className="inline-flex items-center rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-medium">
                  {client.clientType || "—"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</dt>
              <dd className="mt-1 text-sm text-gray-600">
                <span className="inline-flex items-center rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-medium">
                  {client.status || "—"}
                </span>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Property Type</dt>
              <dd className="mt-1 text-sm text-gray-600">
                {client.propertyType || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Billing Address</dt>
              <dd className="mt-1 text-sm text-gray-600">
                {formatAddress(client.billingAddress)}
              </dd>
            </div>
            {client.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Notes</dt>
                <dd className="mt-1 rounded-lg bg-[var(--color-surface)] p-3 text-sm text-gray-600">
                  {client.notes}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      <div>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Projects</h2>
          <span className="text-sm text-gray-400">
            {sortedProjects.length} project{sortedProjects.length !== 1 ? "s" : ""}
          </span>
        </div>

        {sortedProjects.length === 0 ? (
          <Card className="py-8 text-center">
            <p className="text-sm text-gray-400">No projects for this client yet.</p>
            <Link href="/admin/projects/new" className="mt-2 inline-block">
              <Button variant="primary" size="sm">+ New Project</Button>
            </Link>
          </Card>
        ) : (
          <div className="space-y-2">
            {sortedProjects.map((p) => (
              <Link key={p.id} href={`/admin/projects/${p.id}`} className="block group">
                <Card className="flex items-center justify-between transition-colors group-hover:border-[var(--color-amber)] group-hover:bg-amber-50/40 cursor-pointer">
                  <div className="min-w-0">
                    <p className="font-semibold text-[var(--color-primary)] group-hover:text-[var(--color-amber)] transition-colors">
                      {p.name}
                    </p>
                    <p className="mt-0.5 text-xs text-gray-400">
                      {formatDate(p.startDate)} → {formatDate(p.targetEndDate)}
                      {p.actualEndDate && ` (Completed ${formatDate(p.actualEndDate)})`}
                    </p>
                  </div>
                  <StatusBadge status={p.status} />
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
