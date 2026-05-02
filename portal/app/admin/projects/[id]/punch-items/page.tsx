"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type PunchStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED";
type WorkType = "ROOFING" | "SIDING" | "GUTTERS" | "FRAMING" | "GENERAL";

interface PunchItem {
  id: string;
  description: string;
  assignee: string;
  workType: WorkType;
  deadline: string;
  status: PunchStatus;
  photos: string[];
  createdAt: string;
  createdBy: string;
}

interface CrewMember {
  id: string;
  name: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<PunchStatus, string> = {
  OPEN: "#ef4444",
  IN_PROGRESS: "#d69e2e",
  RESOLVED: "#22c55e",
  VERIFIED: "#3b82f6",
};

const STATUS_LABELS: Record<PunchStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  VERIFIED: "Verified",
};

const WORK_TYPES: WorkType[] = ["ROOFING", "SIDING", "GUTTERS", "FRAMING", "GENERAL"];

const MOCK_CREW: CrewMember[] = [
  { id: "u1", name: "Carlos M." },
  { id: "u2", name: "Javier R." },
  { id: "u3", name: "Marcus T." },
  { id: "u4", name: "Sarah (PM)" },
];

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ITEMS: PunchItem[] = [
  {
    id: "p1",
    description: "Missing shingle tab on north ridge — needs replacement",
    assignee: "Carlos M.",
    workType: "ROOFING",
    deadline: "2026-05-10",
    status: "OPEN",
    photos: ["/placeholder-roof.jpg"],
    createdAt: "2026-05-02",
    createdBy: "Sarah (PM)",
  },
  {
    id: "p2",
    description: "Gutter seam leaking at southeast corner",
    assignee: "Marcus T.",
    workType: "GUTTERS",
    deadline: "2026-05-08",
    status: "IN_PROGRESS",
    photos: [],
    createdAt: "2026-05-01",
    createdBy: "Sarah (PM)",
  },
  {
    id: "p3",
    description: "Flashing around chimney not properly sealed — water test failed",
    assignee: "Javier R.",
    workType: "ROOFING",
    deadline: "2026-05-07",
    status: "RESOLVED",
    photos: ["/placeholder-flashing.jpg", "/placeholder-seal.jpg"],
    createdAt: "2026-05-01",
    createdBy: "Carlos M.",
  },
  {
    id: "p4",
    description: "Paint touch-up needed on fascia board near garage",
    assignee: "Carlos M.",
    workType: "SIDING",
    deadline: "2026-05-12",
    status: "VERIFIED",
    photos: [],
    createdAt: "2026-04-28",
    createdBy: "Sarah (PM)",
  },
  {
    id: "p5",
    description: "Loose drip edge on west eave — re-secure with additional fasteners",
    assignee: "Marcus T.",
    workType: "ROOFING",
    deadline: "2026-05-09",
    status: "OPEN",
    photos: [],
    createdAt: "2026-05-02",
    createdBy: "Javier R.",
  },
];

// ── Group by status ────────────────────────────────────────────────────────

const STATUS_ORDER: PunchStatus[] = ["OPEN", "IN_PROGRESS", "RESOLVED", "VERIFIED"];

function groupByStatus(items: PunchItem[]): Record<PunchStatus, PunchItem[]> {
  const result: Record<PunchStatus, PunchItem[]> = {
    OPEN: [],
    IN_PROGRESS: [],
    RESOLVED: [],
    VERIFIED: [],
  };
  items.forEach((item) => result[item.status].push(item));
  return result;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function PunchItemsPage() {
  const [items, setItems] = useState<PunchItem[]>(MOCK_ITEMS);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    description: "",
    assignee: "",
    workType: "GENERAL" as WorkType,
    deadline: "",
  });

  const grouped = groupByStatus(items);

  const handleCreate = () => {
    if (!form.description.trim() || !form.assignee) return;
    const newItem: PunchItem = {
      id: `p${Date.now()}`,
      description: form.description,
      assignee: form.assignee,
      workType: form.workType,
      deadline: form.deadline || "",
      status: "OPEN",
      photos: [],
      createdAt: new Date().toISOString().split("T")[0],
      createdBy: "You",
    };
    setItems((prev) => [newItem, ...prev]);
    setForm({ description: "", assignee: "", workType: "GENERAL", deadline: "" });
    setShowNew(false);
  };

  const handleStatusChange = (id: string, newStatus: PunchStatus) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item)),
    );
  };

  const getNextStatus = (current: PunchStatus): PunchStatus | null => {
    switch (current) {
      case "OPEN":
        return "IN_PROGRESS";
      case "IN_PROGRESS":
        return "RESOLVED";
      case "RESOLVED":
        return "VERIFIED";
      default:
        return null;
    }
  };

  const crewOptions = MOCK_CREW.map((c) => ({ value: c.name, label: c.name }));
  const workTypeOptions = WORK_TYPES.map((w) => ({ value: w, label: w.charAt(0) + w.slice(1).toLowerCase() }));

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Punch Items</h1>
          <p className="text-sm text-gray-500 mt-1">
            {items.length} items · {items.filter((i) => i.status === "OPEN").length} open
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          + New Punch Item
        </Button>
      </div>

      {/* Kanban Columns */}
      <div className="grid grid-cols-4 gap-4">
        {STATUS_ORDER.map((status) => (
          <div key={status} className="space-y-3">
            {/* Column header */}
            <div className="flex items-center gap-2 pb-2 border-b-2" style={{ borderColor: STATUS_COLORS[status] }}>
              <span
                className="w-3 h-3 rounded-full flex-shrink-0"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-sm font-semibold text-[#1a202c]">{STATUS_LABELS[status]}</span>
              <span className="text-xs font-medium text-gray-400 ml-auto bg-gray-100 rounded-full px-2 py-0.5">
                {grouped[status].length}
              </span>
            </div>

            {/* Cards */}
            {grouped[status].length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-300 italic">No items</div>
            ) : (
              grouped[status].map((item) => (
                <Card
                  key={item.id}
                  className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-4 space-y-3">
                    {/* Description */}
                    <p className="text-sm text-[#1a202c] leading-relaxed font-medium">
                      {item.description}
                    </p>

                    {/* Meta */}
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <span>👤 {item.assignee}</span>
                      {item.deadline && (
                        <>
                          <span>·</span>
                          <span
                            className={
                              new Date(item.deadline) < new Date() && item.status !== "VERIFIED"
                                ? "text-red-500 font-medium"
                                : ""
                            }
                          >
                            📅 {new Date(item.deadline).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </>
                      )}
                    </div>

                    {/* Work type tag */}
                    <Badge className="text-[10px] bg-gray-100 text-gray-600">
                      {item.workType}
                    </Badge>

                    {/* Photo thumbnails */}
                    {item.photos.length > 0 && (
                      <div className="flex gap-1.5">
                        {item.photos.map((_, i) => (
                          <div
                            key={i}
                            className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 text-xs"
                          >
                            📷
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 pt-1 border-t border-gray-100">
                      {getNextStatus(item.status) && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(item.id, getNextStatus(item.status)!)}
                          className="text-xs rounded-full"
                          style={{
                            backgroundColor: STATUS_COLORS[getNextStatus(item.status)!],
                            color: "white",
                          }}
                        >
                          Move to {STATUS_LABELS[getNextStatus(item.status)!]}
                        </Button>
                      )}
                      {/* ADMIN verify button */}
                      {item.status === "RESOLVED" && (
                        <Button
                          size="sm"
                          onClick={() => handleStatusChange(item.id, "VERIFIED")}
                          className="text-xs rounded-full bg-blue-500 text-white hover:bg-blue-600"
                        >
                          ✓ Verify
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        ))}
      </div>

      {/* New Punch Item Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Punch Item">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Description</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y min-h-[80px]"
              placeholder="Describe the issue..."
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Assignee</label>
            <Select
              value={form.assignee}
              onChange={(e) => setForm((prev) => ({ ...prev, assignee: e.target.value }))}
              options={crewOptions}
              placeholder="Select crew member"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Work Type</label>
            <Select
              value={form.workType}
              onChange={(e) => setForm((prev) => ({ ...prev, workType: e.target.value as WorkType }))}
              options={workTypeOptions}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Deadline</label>
            <Input
              type="date"
              value={form.deadline}
              onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Photos</label>
            <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center text-sm text-gray-400 hover:border-amber-300 transition-colors cursor-pointer">
              📷 Drag & drop photos or click to upload
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.description.trim() || !form.assignee}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500 disabled:opacity-50"
            >
              Create Item
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
