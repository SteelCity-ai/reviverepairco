import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { Input } from "@/components/ui/Input";
import { api } from "@/lib/api-server";
import type { Client } from "@/lib/db";

export const dynamic = "force-dynamic";

interface SearchParams {
  search?: string;
  clientType?: string;
  status?: string;
  includeArchived?: string;
}

type ClientWithCount = Client & { projectCount?: number };

export default async function AdminClientsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const search = sp.search ?? "";
  const clientTypeFilter = sp.clientType ?? "";
  const statusFilter = sp.status ?? "";
  const includeArchived = sp.includeArchived === "true";

  // API supports search (companyName ILIKE) and includeArchived.
  // clientType/status are filtered client-side since the API doesn't yet expose them.
  const queryParts: string[] = [];
  if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
  if (includeArchived) queryParts.push("includeArchived=true");
  const query = queryParts.length > 0 ? `?${queryParts.join("&")}` : "";

  const clients = (await api<ClientWithCount[]>(`/clients${query}`)) ?? [];

  // Client-side filter: clientType and status
  const filtered = clients.filter((c) => {
    if (clientTypeFilter && c.clientType !== clientTypeFilter) return false;
    if (statusFilter && c.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} client{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/clients/new">
          <Button variant="primary">+ New Client</Button>
        </Link>
      </div>

      {/* Search / Filter bar — uses native <select> for server-rendered form */}
      <Card className="overflow-hidden p-0">
        <form method="get" className="p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[220px] flex-1">
              <Input
                label="Search"
                name="search"
                placeholder="Search by company name"
                defaultValue={search}
              />
            </div>
            <div className="w-[160px]">
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-primary)]">Type</label>
              <select
                name="clientType"
                defaultValue={clientTypeFilter}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-primary)] bg-white focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20 transition"
              >
                <option value="">All</option>
                <option value="prospect">Prospect</option>
                <option value="client">Client</option>
              </select>
            </div>
            <div className="w-[160px]">
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-primary)]">Status</label>
              <select
                name="status"
                defaultValue={statusFilter}
                className="w-full rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm text-[var(--color-primary)] bg-white focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20 transition"
              >
                <option value="">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="lead">Lead</option>
              </select>
            </div>
            <div className="flex items-center gap-2 pb-1">
              <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  name="includeArchived"
                  value="true"
                  defaultChecked={includeArchived}
                  className="rounded border-gray-300"
                />
                Include archived
              </label>
            </div>
            <div className="flex gap-2">
              <Button type="submit" variant="secondary" size="sm">
                Apply
              </Button>
              <Link href="/admin/clients">
                <Button type="button" variant="ghost" size="sm">
                  Reset
                </Button>
              </Link>
            </div>
          </div>
        </form>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon="◷"
          title={clients.length === 0 ? "No clients yet" : "No clients match these filters"}
          description={
            clients.length === 0
              ? "Add your first client to get started."
              : "Try adjusting your search or filters."
          }
          action={
            clients.length === 0 ? (
              <Link href="/admin/clients/new">
                <Button variant="primary" size="sm">+ New Client</Button>
              </Link>
            ) : (
              <Link href="/admin/clients">
                <Button variant="secondary" size="sm">Reset filters</Button>
              </Link>
            )
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Company</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Contact</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Email</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Phone</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Type</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                  <th className="px-6 py-3 text-center font-semibold text-[var(--color-primary)]">
                    Projects
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    className="transition-colors hover:bg-[var(--color-surface)]"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/clients/${c.id}`}
                        className="font-medium text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                      >
                        {c.companyName}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{c.primaryContactName ?? "—"}</td>
                    <td className="px-6 py-3 text-gray-600">{c.email ?? "—"}</td>
                    <td className="px-6 py-3 text-gray-500">{c.phone || "—"}</td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {c.clientType || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3">
                      <span className="inline-flex items-center rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-medium text-gray-600">
                        {c.status || "—"}
                      </span>
                    </td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                        {c.projectCount ?? 0}
                      </span>
                    </td>
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
