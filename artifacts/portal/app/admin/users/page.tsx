import { api } from "@/lib/api-server";
import { Card } from "@/components/ui/Card";
import { Badge, type StatusVariant } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { UserProfile, UserRole } from "@/lib/db";
import InviteUserButton from "./InviteUserButton";

export const dynamic = "force-dynamic";

function roleBadgeVariant(role: UserRole): StatusVariant {
  if (role === "ADMIN") return "active";
  if (role === "CREW") return "default";
  return "pending";
}

function RoleBadge({ role }: { role: UserRole }) {
  const label = role === "ADMIN" ? "Admin" : role === "CREW" ? "Crew" : "Client";
  return <Badge variant={roleBadgeVariant(role)}>{label}</Badge>;
}

interface ClientLite {
  id: string;
  companyName: string;
}

export default async function AdminUsersPage() {
  const [users, clients] = await Promise.all([
    api<UserProfile[]>("/users") ?? [],
    api<ClientLite[]>("/clients") ?? [],
  ]);

  const list = users ?? [];
  const clientLookup = new Map(
    (clients ?? []).map((c) => [c.id, c.companyName]),
  );

  return (
    <div className="animate-fade-in-up space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {list.length} user{list.length !== 1 ? "s" : ""}
          </p>
        </div>
        <InviteUserButton clients={clients ?? []} />
      </div>

      {list.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No users yet"
          description="Invite your first teammate to get started."
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Name</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Email</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Role</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Client</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {list.map((u) => (
                  <tr key={u.id} className="transition-colors hover:bg-[var(--color-surface)]">
                    <td className="px-6 py-3 flex items-center gap-3">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-primary)] text-xs font-bold text-white">
                        {u.displayName
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                          .slice(0, 2)}
                      </div>
                      <span className="font-medium text-[var(--color-primary)]">{u.displayName}</span>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{u.email || "—"}</td>
                    <td className="px-6 py-3"><RoleBadge role={u.role} /></td>
                    <td className="px-6 py-3 text-gray-500">
                      {u.role === "CLIENT" && u.clientId
                        ? clientLookup.get(u.clientId) ?? "—"
                        : "—"}
                    </td>
                    <td className="px-6 py-3">
                      {u.archivedAt ? (
                        <span className="text-xs text-red-500">
                          Archived {formatDate(u.archivedAt)}
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600">
                          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                          Active
                        </span>
                      )}
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
