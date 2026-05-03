import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { api } from "@/lib/api-server";
import type { Client } from "@/lib/db";

export const dynamic = "force-dynamic";

type ClientWithCount = Client & { projectCount?: number };

export default async function AdminClientsPage() {
  const clients = (await api<ClientWithCount[]>("/clients")) ?? [];

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Clients</h1>
          <p className="mt-1 text-sm text-gray-500">
            {clients.length} client{clients.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link href="/admin/clients/new">
          <Button variant="primary">+ New Client</Button>
        </Link>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon="◷"
          title="No clients yet"
          description="Add your first client to get started."
          action={
            <Link href="/admin/clients/new">
              <Button variant="primary" size="sm">+ New Client</Button>
            </Link>
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
                  <th className="px-6 py-3 text-center font-semibold text-[var(--color-primary)]">
                    Projects
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {clients.map((c) => (
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
