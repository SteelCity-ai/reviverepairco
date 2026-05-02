"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import type { Client } from "@/lib/db";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_CLIENTS: (Client & { projectCount: number })[] = [
  {
    id: "client-001",
    companyName: "Smith Family Trust",
    primaryContactName: "John Smith",
    email: "john@smithfamilytrust.com",
    phone: "412-555-0142",
    billingAddress: { line1: "42 Elm Street", city: "Pittsburgh", state: "PA", zip: "15206" },
    notes: "Prefers morning communication. Has two properties under management.",
    createdAt: "2026-01-10T09:00:00Z",
    updatedAt: "2026-04-28T14:30:00Z",
    projectCount: 3,
  },
  {
    id: "client-002",
    companyName: "Oakwood Property Management",
    primaryContactName: "Lisa Chen",
    email: "lchen@oakwoodpm.com",
    phone: "412-555-0198",
    billingAddress: { line1: "1200 Oakwood Blvd", city: "Monroeville", state: "PA", zip: "15146" },
    notes: "Manages 12 commercial properties. Potential for recurring annual inspection contracts.",
    createdAt: "2026-02-05T11:00:00Z",
    updatedAt: "2026-04-29T09:15:00Z",
    projectCount: 1,
  },
  {
    id: "client-003",
    companyName: "David & Lisa Davis",
    primaryContactName: "David Davis",
    email: "david.davis@email.com",
    phone: "724-555-0234",
    billingAddress: { line1: "789 Ridge Road", city: "Wexford", state: "PA", zip: "15090" },
    notes: "First-time customer. Referred by Smith Family Trust.",
    createdAt: "2026-04-22T12:00:00Z",
    updatedAt: "2026-04-27T16:00:00Z",
    projectCount: 1,
  },
  {
    id: "client-004",
    companyName: "First Presbyterian Church",
    primaryContactName: "Rev. Mark Thompson",
    email: "pastor@fpcsewickley.org",
    phone: "412-555-0311",
    billingAddress: { line1: "501 Main Street", city: "Sewickley", state: "PA", zip: "15143" },
    notes: "Historic building — all work must be approved by preservation committee. Net-45 payment terms.",
    createdAt: "2025-11-15T09:30:00Z",
    updatedAt: "2026-04-26T10:00:00Z",
    projectCount: 1,
  },
  {
    id: "client-005",
    companyName: "Greenfield School District",
    primaryContactName: "Robert Martinez",
    email: "rmartinez@greenfield.k12.pa.us",
    phone: "412-555-0456",
    billingAddress: { line1: "300 Learning Lane", city: "Greenfield", state: "PA", zip: "15207" },
    notes: "Requires COI and W-9 on file before project start. Purchase order required for all invoices.",
    createdAt: "2025-12-01T10:00:00Z",
    updatedAt: "2026-04-09T14:00:00Z",
    projectCount: 1,
  },
  {
    id: "client-006",
    companyName: "Wilson Home Services LLC",
    primaryContactName: "Carol Wilson",
    email: "carol@wilsonhomeservices.com",
    phone: "412-555-0678",
    billingAddress: { line1: "14 Magnolia Court", city: "Mt Lebanon", state: "PA", zip: "15228" },
    notes: "Flips historic properties. Project cancelled due to budget — may revisit next quarter.",
    createdAt: "2026-03-20T08:00:00Z",
    updatedAt: "2026-04-20T08:00:00Z",
    projectCount: 0,
  },
];

// ── Page Component ─────────────────────────────────────────────────────────

export default function AdminClientsPage() {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return MOCK_CLIENTS;
    return MOCK_CLIENTS.filter(
      (c) =>
        c.companyName.toLowerCase().includes(q) ||
        c.primaryContactName.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)),
    );
  }, [search]);

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page Header */}
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

      {/* Search Bar */}
      <Card>
        <div className="max-w-md">
          <Input
            placeholder="Search by name, email, or phone…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </Card>

      {/* Clients Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="◷"
          title="No clients found"
          description={search ? "Try adjusting your search terms." : "Add your first client to get started."}
          action={
            search ? (
              <Button variant="secondary" size="sm" onClick={() => setSearch("")}>
                Clear Search
              </Button>
            ) : (
              <Link href="/admin/clients/new">
                <Button variant="primary" size="sm">+ New Client</Button>
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
                    <td className="px-6 py-3 text-gray-600">{c.primaryContactName}</td>
                    <td className="px-6 py-3 text-gray-600">{c.email}</td>
                    <td className="px-6 py-3 text-gray-500">{c.phone || "—"}</td>
                    <td className="px-6 py-3 text-center">
                      <span className="inline-flex items-center justify-center rounded-full bg-[var(--color-surface)] px-2.5 py-0.5 text-xs font-semibold text-[var(--color-primary)]">
                        {c.projectCount}
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
