import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
import type { Client, Project, ProjectStatus } from "@/lib/db";

// ── Mock Data ──────────────────────────────────────────────────────────────

interface ClientDetail extends Client {
  projects: (Project & { clientCompanyName: string })[];
}

const MOCK_CLIENT: ClientDetail = {
  id: "client-001",
  companyName: "Smith Family Trust",
  primaryContactName: "John Smith",
  email: "john@smithfamilytrust.com",
  phone: "412-555-0142",
  billingAddress: { line1: "42 Elm Street", city: "Pittsburgh", state: "PA", zip: "15206" },
  notes: "Prefers morning communication. Has two properties under management. All invoices should be emailed to john@smithfamilytrust.com and CC'd to their accountant at accountant@smithcpa.com.",
  createdAt: "2026-01-10T09:00:00Z",
  updatedAt: "2026-04-28T14:30:00Z",
  projects: [
    {
      id: "proj-001",
      clientId: "client-001",
      name: "Smith Residence — Full Roof Replacement",
      description: "Complete tear-off and replacement of asphalt shingle roof on 2-story colonial.",
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
    },
    {
      id: "proj-007",
      clientId: "client-001",
      name: "Smith Rental Property — Roof Repair",
      description: "Patch repair on rental property garage roof after storm damage.",
      siteAddress: { line1: "18 Walnut Avenue", city: "Millvale", state: "PA", zip: "15209" },
      status: "COMPLETE",
      projectManagerUserId: "user-002",
      startDate: "2026-02-10",
      targetEndDate: "2026-02-11",
      actualEndDate: "2026-02-11",
      invoiceStatus: "PAID",
      createdAt: "2026-02-01T08:00:00Z",
      updatedAt: "2026-02-12T09:00:00Z",
      clientCompanyName: "Smith Family Trust",
    },
    {
      id: "proj-008",
      clientId: "client-001",
      name: "Smith Residence — Gutter Guard Install",
      description: "LeafGuard gutter system on entire home and garage.",
      siteAddress: { line1: "42 Elm Street", city: "Pittsburgh", state: "PA", zip: "15206" },
      status: "PLANNED",
      projectManagerUserId: "user-001",
      startDate: "2026-06-01",
      targetEndDate: "2026-06-02",
      actualEndDate: null,
      invoiceStatus: "NOT_INVOICED",
      createdAt: "2026-04-28T10:00:00Z",
      updatedAt: "2026-04-28T10:00:00Z",
      clientCompanyName: "Smith Family Trust",
    },
  ],
};

// ── Helpers ────────────────────────────────────────────────────────────────

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

// ── Page Component ─────────────────────────────────────────────────────────

export default function AdminClientDetailPage() {
  const sortedProjects = [...MOCK_CLIENT.projects].sort(
    (a, b) => (STATUS_ORDER[a.status] ?? 5) - (STATUS_ORDER[b.status] ?? 5),
  );

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/clients" className="hover:text-[var(--color-amber)] transition">
            Clients
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">{MOCK_CLIENT.companyName}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">{MOCK_CLIENT.companyName}</h1>
            <p className="mt-1 text-sm text-gray-500">
              Primary Contact: {MOCK_CLIENT.primaryContactName} · Client since {formatDate(MOCK_CLIENT.createdAt)}
            </p>
          </div>
          <Link href={`/admin/clients/${MOCK_CLIENT.id}/edit`}>
            <Button variant="secondary">Edit Client</Button>
          </Link>
        </div>
      </div>

      {/* Info Card */}
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
                  href={`mailto:${MOCK_CLIENT.email}`}
                  className="hover:text-[var(--color-amber)] transition"
                >
                  {MOCK_CLIENT.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                {MOCK_CLIENT.phone ? (
                  <a href={`tel:${MOCK_CLIENT.phone}`} className="hover:text-[var(--color-amber)] transition">
                    {MOCK_CLIENT.phone}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Total Projects</dt>
              <dd className="mt-1 text-sm font-semibold text-[var(--color-primary)]">
                {MOCK_CLIENT.projects.length}
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Billing Address</dt>
              <dd className="mt-1 text-sm text-gray-600">
                {formatAddress(MOCK_CLIENT.billingAddress)}
              </dd>
            </div>
            {MOCK_CLIENT.notes && (
              <div className="sm:col-span-2 lg:col-span-3">
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Notes</dt>
                <dd className="mt-1 rounded-lg bg-[var(--color-surface)] p-3 text-sm text-gray-600">
                  {MOCK_CLIENT.notes}
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Projects Section */}
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
              <Card key={p.id} className="flex items-center justify-between">
                <div className="min-w-0">
                  <Link
                    href={`/admin/projects/${p.id}`}
                    className="font-semibold text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                  >
                    {p.name}
                  </Link>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {formatDate(p.startDate)} → {formatDate(p.targetEndDate)}
                    {p.actualEndDate && ` (Completed ${formatDate(p.actualEndDate)})`}
                  </p>
                </div>
                <StatusBadge status={p.status} />
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
