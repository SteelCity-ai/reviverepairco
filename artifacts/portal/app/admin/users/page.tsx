"use client";

import { useState, useMemo, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Badge, type StatusVariant } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { UserProfile, UserRole } from "@/lib/db";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_USERS: (UserProfile & { clientCompanyName: string | null })[] = [
  {
    id: "user-001",
    clerkUserId: "clerk_admin_001",
    role: "ADMIN",
    clientId: null,
    displayName: "Sarah Peterson",
    email: "sarah@reviveroof.com",
    phone: "412-555-0101",
    archivedAt: null,
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2026-04-28T16:00:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-002",
    clerkUserId: "clerk_admin_002",
    role: "ADMIN",
    clientId: null,
    displayName: "Mike Collins",
    email: "mike@reviveroof.com",
    phone: "412-555-0102",
    archivedAt: null,
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2026-04-29T09:00:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-003",
    clerkUserId: "clerk_admin_003",
    role: "ADMIN",
    clientId: null,
    displayName: "Tom Reynolds",
    email: "tom@reviveroof.com",
    phone: "412-555-0103",
    archivedAt: "2026-04-15T12:00:00Z",
    createdAt: "2025-06-01T09:00:00Z",
    updatedAt: "2026-04-15T12:00:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-010",
    clerkUserId: "clerk_crew_001",
    role: "CREW",
    clientId: null,
    displayName: "Dave R.",
    email: "dave@reviveroof.com",
    phone: null,
    archivedAt: null,
    createdAt: "2025-07-15T07:00:00Z",
    updatedAt: "2026-04-28T16:30:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-011",
    clerkUserId: "clerk_crew_002",
    role: "CREW",
    clientId: null,
    displayName: "Carlos V.",
    email: "carlos@reviveroof.com",
    phone: null,
    archivedAt: null,
    createdAt: "2025-08-01T07:00:00Z",
    updatedAt: "2026-04-28T09:00:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-012",
    clerkUserId: "clerk_crew_003",
    role: "CREW",
    clientId: null,
    displayName: "Dave R.",
    email: null,
    phone: null,
    archivedAt: null,
    createdAt: "2026-01-10T07:00:00Z",
    updatedAt: "2026-04-28T15:30:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-013",
    clerkUserId: "clerk_crew_004",
    role: "CREW",
    clientId: null,
    displayName: "Jake M.",
    email: "jake@reviveroof.com",
    phone: null,
    archivedAt: null,
    createdAt: "2026-02-01T07:00:00Z",
    updatedAt: "2026-04-28T15:45:00Z",
    clientCompanyName: null,
  },
  {
    id: "user-020",
    clerkUserId: "clerk_client_001",
    role: "CLIENT",
    clientId: "client-001",
    displayName: "John Smith",
    email: "john@smithfamilytrust.com",
    phone: "412-555-0142",
    archivedAt: null,
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-04-28T14:00:00Z",
    clientCompanyName: "Smith Family Trust",
  },
  {
    id: "user-021",
    clerkUserId: "clerk_client_002",
    role: "CLIENT",
    clientId: "client-002",
    displayName: "Lisa Chen",
    email: "lchen@oakwoodpm.com",
    phone: "412-555-0198",
    archivedAt: null,
    createdAt: "2026-02-05T11:00:00Z",
    updatedAt: "2026-04-29T09:15:00Z",
    clientCompanyName: "Oakwood Property Management",
  },
  {
    id: "user-022",
    clerkUserId: "clerk_client_003",
    role: "CLIENT",
    clientId: "client-005",
    displayName: "Robert Martinez",
    email: "rmartinez@greenfield.k12.pa.us",
    phone: "412-555-0456",
    archivedAt: null,
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2026-04-09T14:00:00Z",
    clientCompanyName: "Greenfield School District",
  },
];

const CLIENTS_LOOKUP: { value: string; label: string }[] = [
  { value: "client-001", label: "Smith Family Trust" },
  { value: "client-002", label: "Oakwood Property Management" },
  { value: "client-003", label: "David & Lisa Davis" },
  { value: "client-004", label: "First Presbyterian Church" },
  { value: "client-005", label: "Greenfield School District" },
  { value: "client-006", label: "Wilson Home Services LLC" },
];

const ROLE_OPTIONS: { value: string; label: string }[] = [
  { value: "ADMIN", label: "Admin" },
  { value: "CREW", label: "Crew" },
  { value: "CLIENT", label: "Client" },
];

// ── Role Badge ─────────────────────────────────────────────────────────────

function roleBadgeVariant(role: UserRole): StatusVariant {
  switch (role) {
    case "ADMIN":
      return "active";
    case "CREW":
      return "default";
    case "CLIENT":
      return "pending";
  }
}

function RoleBadge({ role }: { role: UserRole }) {
  const label = role === "ADMIN" ? "Admin" : role === "CREW" ? "Crew" : "Client";
  return <Badge variant={roleBadgeVariant(role)}>{label}</Badge>;
}

// ── Page Component ─────────────────────────────────────────────────────────

export default function AdminUsersPage() {
  const [search, setSearch] = useState("");
  const [inviteOpen, setInviteOpen] = useState(false);
  const [inviteForm, setInviteForm] = useState({
    email: "",
    role: "CREW",
    clientId: "",
  });

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return MOCK_USERS;
    return MOCK_USERS.filter(
      (u) =>
        u.displayName.toLowerCase().includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        u.role.toLowerCase().includes(q) ||
        (u.clientCompanyName && u.clientCompanyName.toLowerCase().includes(q)),
    );
  }, [search]);

  function handleInviteSubmit(e: FormEvent) {
    e.preventDefault();
    // Placeholder — would call Clerk invite API in production
    setInviteOpen(false);
    setInviteForm({ email: "", role: "CREW", clientId: "" });
  }

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Users</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} user{filtered.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Button variant="primary" onClick={() => setInviteOpen(true)}>
          + Invite User
        </Button>
      </div>

      {/* Search Bar */}
      <Card>
        <div className="max-w-md">
          <Input
            placeholder="Search by name, email, or role…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Users Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="◎"
          title="No users found"
          description={search ? "Try adjusting your search." : "No users have been added yet."}
          action={
            search ? (
              <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                Clear Search
              </Button>
            ) : null
          }
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
                {filtered.map((u) => (
                  <tr
                    key={u.id}
                    className="transition-colors hover:bg-[var(--color-surface)]"
                  >
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
                    <td className="px-6 py-3">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-6 py-3 text-gray-500">
                      {u.role === "CLIENT" ? u.clientCompanyName || "—" : "—"}
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

      {/* Invite User Modal */}
      <Modal open={inviteOpen} onClose={() => setInviteOpen(false)} title="Invite User" size="md">
        <form onSubmit={handleInviteSubmit} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={inviteForm.email}
            onChange={(e) => setInviteForm((f) => ({ ...f, email: e.target.value }))}
            required
          />
          <Select
            label="Role"
            options={ROLE_OPTIONS}
            value={inviteForm.role}
            onChange={(e) => setInviteForm((f) => ({ ...f, role: e.target.value }))}
          />
          {inviteForm.role === "CLIENT" && (
            <Select
              label="Linked Client"
              options={[{ value: "", label: "Select a client…" }, ...CLIENTS_LOOKUP]}
              value={inviteForm.clientId}
              onChange={(e) => setInviteForm((f) => ({ ...f, clientId: e.target.value }))}
              required
            />
          )}
          <div className="flex justify-end gap-3 pt-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
