"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import type { Project, ProjectStatus } from "@/lib/db";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_PROJECTS: (Project & {
  clientCompanyName: string;
  pmDisplayName: string;
})[] = [
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
    pmDisplayName: "Sarah Peterson",
  },
  {
    id: "proj-002",
    clientId: "client-002",
    name: "Oakwood Apartments — Roof Inspection & Repair",
    description: "Post-storm inspection and targeted repairs across 3 buildings.",
    siteAddress: { line1: "1200 Oakwood Blvd", city: "Monroeville", state: "PA", zip: "15146" },
    status: "ACTIVE",
    projectManagerUserId: "user-002",
    startDate: "2026-04-20",
    targetEndDate: "2026-05-15",
    actualEndDate: null,
    invoiceStatus: "NOT_INVOICED",
    createdAt: "2026-04-10T08:00:00Z",
    updatedAt: "2026-04-29T09:15:00Z",
    clientCompanyName: "Oakwood Property Management",
    pmDisplayName: "Mike Collins",
  },
  {
    id: "proj-003",
    clientId: "client-003",
    name: "Davis Residence — Skylight Installation",
    description: "Install 3 Velux skylights with flashing kits on single-story ranch.",
    siteAddress: { line1: "789 Ridge Road", city: "Wexford", state: "PA", zip: "15090" },
    status: "PLANNED",
    projectManagerUserId: "user-001",
    startDate: "2026-05-05",
    targetEndDate: "2026-05-07",
    actualEndDate: null,
    invoiceStatus: "NOT_INVOICED",
    createdAt: "2026-04-22T12:00:00Z",
    updatedAt: "2026-04-27T16:00:00Z",
    clientCompanyName: "David & Lisa Davis",
    pmDisplayName: "Sarah Peterson",
  },
  {
    id: "proj-004",
    clientId: "client-004",
    name: "First Presbyterian Church — Steeple Roof",
    description: "Copper steeple roof restoration with custom flashing.",
    siteAddress: { line1: "501 Main Street", city: "Sewickley", state: "PA", zip: "15143" },
    status: "ON_HOLD",
    projectManagerUserId: "user-003",
    startDate: "2026-04-01",
    targetEndDate: "2026-05-20",
    actualEndDate: null,
    invoiceStatus: "INVOICED",
    createdAt: "2026-02-15T09:30:00Z",
    updatedAt: "2026-04-26T10:00:00Z",
    clientCompanyName: "First Presbyterian Church",
    pmDisplayName: "Tom Reynolds",
  },
  {
    id: "proj-005",
    clientId: "client-005",
    name: "Greenfield Elementary — Flat Roof Replacement",
    description: "TPO membrane replacement on 15,000 sq ft flat roof.",
    siteAddress: { line1: "300 Learning Lane", city: "Greenfield", state: "PA", zip: "15207" },
    status: "COMPLETE",
    projectManagerUserId: "user-001",
    startDate: "2026-03-01",
    targetEndDate: "2026-04-10",
    actualEndDate: "2026-04-08",
    invoiceStatus: "PAID",
    createdAt: "2026-02-01T11:00:00Z",
    updatedAt: "2026-04-09T14:00:00Z",
    clientCompanyName: "Greenfield School District",
    pmDisplayName: "Sarah Peterson",
  },
  {
    id: "proj-006",
    clientId: "client-006",
    name: "Wilson Estate — Gutter & Fascia Replacement",
    description: "Seamless gutter install with new fascia boards on historic Victorian.",
    siteAddress: { line1: "14 Magnolia Court", city: "Mt Lebanon", state: "PA", zip: "15228" },
    status: "CANCELLED",
    projectManagerUserId: "user-002",
    startDate: null,
    targetEndDate: null,
    actualEndDate: null,
    invoiceStatus: "NOT_INVOICED",
    createdAt: "2026-04-05T14:00:00Z",
    updatedAt: "2026-04-20T08:00:00Z",
    clientCompanyName: "Wilson Home Services LLC",
    pmDisplayName: "Mike Collins",
  },
];

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: "", label: "All Statuses" },
  { value: "PLANNED", label: "Planned" },
  { value: "ACTIVE", label: "Active" },
  { value: "ON_HOLD", label: "On Hold" },
  { value: "COMPLETE", label: "Complete" },
  { value: "CANCELLED", label: "Cancelled" },
];

// ── Page Component ─────────────────────────────────────────────────────────

export default function AdminProjectsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [clientFilter, setClientFilter] = useState("");

  const uniqueClients = useMemo(() => {
    const seen = new Set<string>();
    return MOCK_PROJECTS.filter((p) => {
      if (seen.has(p.clientId)) return false;
      seen.add(p.clientId);
      return true;
    }).map((p) => ({ value: p.clientId, label: p.clientCompanyName }));
  }, []);

  const filtered = useMemo(() => {
    return MOCK_PROJECTS.filter((p) => {
      const q = search.toLowerCase();
      const matchesSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.clientCompanyName.toLowerCase().includes(q) ||
        p.pmDisplayName.toLowerCase().includes(q);
      const matchesStatus = !statusFilter || p.status === statusFilter;
      const matchesClient = !clientFilter || p.clientId === clientFilter;
      return matchesSearch && matchesStatus && matchesClient;
    });
  }, [search, statusFilter, clientFilter]);

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
          </p>
        </div>
        <Link href="/admin/projects/new">
          <Button variant="primary">+ New Project</Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <Card>
        <div className="flex flex-wrap gap-3">
          <div className="min-w-[240px] flex-1">
            <Input
              placeholder="Search projects, clients, or PMs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="w-44">
            <Select
              options={STATUS_OPTIONS}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            />
          </div>
          <div className="w-52">
            <Select
              options={[{ value: "", label: "All Clients" }, ...uniqueClients]}
              value={clientFilter}
              onChange={(e) => setClientFilter(e.target.value)}
            />
          </div>
        </div>
      </Card>

      {/* Projects Table */}
      {filtered.length === 0 ? (
        <EmptyState
          icon="▦"
          title="No projects match your filters"
          description="Try adjusting your search or filter criteria."
          action={
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearch("");
                setStatusFilter("");
                setClientFilter("");
              }}
            >
              Clear Filters
            </Button>
          }
        />
      ) : (
        <Card className="overflow-hidden p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Project</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Client</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">PM</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Start</th>
                  <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Target End</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-border)]">
                {filtered.map((p) => (
                  <tr
                    key={p.id}
                    className="transition-colors hover:bg-[var(--color-surface)]"
                  >
                    <td className="px-6 py-3">
                      <Link
                        href={`/admin/projects/${p.id}`}
                        className="font-medium text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                      >
                        {p.name}
                      </Link>
                    </td>
                    <td className="px-6 py-3 text-gray-600">{p.clientCompanyName}</td>
                    <td className="px-6 py-3">
                      <StatusBadge status={p.status} />
                    </td>
                    <td className="px-6 py-3 text-gray-600">{p.pmDisplayName}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(p.startDate)}</td>
                    <td className="px-6 py-3 text-gray-500">{formatDate(p.targetEndDate)}</td>
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
