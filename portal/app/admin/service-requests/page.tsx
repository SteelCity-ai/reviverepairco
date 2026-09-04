import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";

export const dynamic = "force-dynamic";

// ── Types ─────────────────────────────────────────────────────────────────

interface Address {
  line1?: string;
  city?: string;
  state?: string;
  postal?: string;
}

interface ServiceRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  serviceType: string;
  priority: string;
  source: string;
  status: string;
  address: Address | null;
  estimatedCost: number | null;
  finalCost: number | null;
  internalNotes: string | null;
  convertedProjectId: string | null;
  convertedClientId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedRes<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ── Constants ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "new", label: "New" },
  { value: "reviewed", label: "Reviewed" },
  { value: "scheduled", label: "Scheduled" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" },
  { value: "converted", label: "Converted" },
];

const SOURCE_OPTIONS = [
  { value: "", label: "All Sources" },
  { value: "website_form", label: "Website Form" },
  { value: "admin", label: "Admin" },
  { value: "phone", label: "Phone" },
  { value: "referral", label: "Referral" },
];

function priorityVariant(p: string): "cancelled" | "signoff" | "default" {
  const u = p.toUpperCase();
  if (u === "URGENT" || u === "HIGH") return "cancelled";
  if (u === "NORMAL") return "signoff";
  return "default";
}

// ── Page ──────────────────────────────────────────────────────────────────

export default async function ServiceRequestsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const params = await searchParams;
  const status = typeof params.status === "string" ? params.status : "";
  const source = typeof params.source === "string" ? params.source : "";
  const search = typeof params.search === "string" ? params.search : "";
  const page = typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1;

  // Build query string for API
  const qs = new URLSearchParams();
  if (status) qs.set("status", status);
  if (source) qs.set("source", source);
  if (search) qs.set("search", search);
  if (page > 1) qs.set("page", String(page));
  qs.set("limit", "25");

  const result = await api<PaginatedRes<ServiceRequest>>(
    `/api/v1/service-requests?${qs.toString()}`,
  );

  const data = result?.data ?? [];
  const pagination = result?.pagination ?? { page: 1, limit: 25, total: 0, totalPages: 0 };
  const hasActiveFilters = !!(status || source || search);

  // Helper for building links preserving filters
  function filterQs(overrides: Record<string, string>) {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (source) p.set("source", source);
    if (search) p.set("search", search);
    for (const [k, v] of Object.entries(overrides)) {
      if (v) p.set(k, v);
      else p.delete(k);
    }
    const s = p.toString();
    return s ? `?${s}` : "";
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Service Requests</h1>
        <p className="mt-1 text-sm text-gray-500">
          {pagination.total} request{pagination.total !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Filter Bar */}
      <Card>
        <form method="get" className="flex flex-wrap gap-3">
          <div className="w-40">
            <Select name="status" options={STATUS_OPTIONS} defaultValue={status} />
          </div>
          <div className="w-40">
            <Select name="source" options={SOURCE_OPTIONS} defaultValue={source} />
          </div>
          <div className="min-w-[200px] flex-1">
            <Input name="search" placeholder="Search by email" defaultValue={search} />
          </div>
          <Button type="submit" variant="secondary" size="sm">
            Apply
          </Button>
          <Link
            href="/admin/service-requests"
            className="inline-flex items-center text-sm text-gray-500 hover:text-[var(--color-primary)] transition"
          >
            Reset
          </Link>
        </form>
      </Card>

      {/* Table */}
      {data.length === 0 ? (
        <EmptyState
          icon="✉"
          title={hasActiveFilters ? "No requests match these filters" : "No service requests"}
          description={
            hasActiveFilters
              ? "Try adjusting your filter criteria."
              : "Website form submissions will appear here automatically."
          }
          action={
            hasActiveFilters ? (
              <Link href="/admin/service-requests">
                <Button variant="secondary" size="sm">
                  Reset Filters
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <>
          <Card className="overflow-hidden p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Name</th>
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Service</th>
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Priority</th>
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Source</th>
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Received</th>
                    <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Converted</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                  {data.map((sr) => (
                    <tr
                      key={sr.id}
                      className="transition-colors hover:bg-[var(--color-surface)]"
                    >
                      <td className="px-6 py-3">
                        <Link
                          href={`/admin/service-requests/${sr.id}`}
                          className="font-medium text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                        >
                          {sr.firstName} {sr.lastName}
                        </Link>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{sr.serviceType || "—"}</td>
                      <td className="px-6 py-3">
                        <Badge variant={priorityVariant(sr.priority)}>
                          {sr.priority}
                        </Badge>
                      </td>
                      <td className="px-6 py-3 text-xs text-gray-400">
                        {sr.source.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </td>
                      <td className="px-6 py-3">
                        <StatusBadge status={sr.status} />
                      </td>
                      <td className="px-6 py-3 text-gray-500">{formatDate(sr.createdAt)}</td>
                      <td className="px-6 py-3">
                        {sr.convertedProjectId ? (
                          <Link
                            href={`/admin/projects/${sr.convertedProjectId}`}
                            className="text-[var(--color-amber)] hover:underline text-sm"
                            title="View project"
                          >
                            ↗ Project
                          </Link>
                        ) : (
                          <span className="text-gray-300">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-500">
                Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
              </p>
              <div className="flex gap-2">
                {pagination.page > 1 ? (
                  <Link href={filterQs({ page: String(pagination.page - 1) })}>
                    <Button variant="secondary" size="sm">
                      Previous
                    </Button>
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold text-gray-300">
                    Previous
                  </span>
                )}
                {pagination.page < pagination.totalPages ? (
                  <Link href={filterQs({ page: String(pagination.page + 1) })}>
                    <Button variant="secondary" size="sm">
                      Next
                    </Button>
                  </Link>
                ) : (
                  <span className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold text-gray-300">
                    Next
                  </span>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
