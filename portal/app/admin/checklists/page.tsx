"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import ChecklistTemplateList, { type ChecklistTemplate, type ChecklistTemplateItem } from "@/components/admin/ChecklistTemplateList";
import ChecklistTemplateForm from "@/components/admin/ChecklistTemplateForm";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TEMPLATES: ChecklistTemplate[] = [
  {
    id: "ct1",
    name: "Roof Installation Final Inspection",
    items: [
      { label: "Shingles properly aligned and fastened", required: true },
      { label: "Ridge vent installed and sealed", required: true },
      { label: "Flashing around all penetrations", required: true },
      { label: "Drip edge secured on all eaves", required: true },
      { label: "No exposed fasteners", required: true },
      { label: "Gutters clean and flowing", required: false },
      { label: "Jobsite fully cleaned", required: true },
      { label: "Client walkthrough completed", required: false },
    ],
    createdAt: "2026-04-01",
  },
  {
    id: "ct2",
    name: "Tear-off & Decking Inspection",
    items: [
      { label: "All old shingles removed", required: true },
      { label: "Felt/underlayment removed", required: true },
      { label: "Decking inspected for rot/damage", required: true },
      { label: "Damaged decking replaced", required: true },
      { label: "Decking re-nailed per code", required: true },
      { label: "Dumpster loaded and secured", required: false },
    ],
    createdAt: "2026-03-28",
  },
  {
    id: "ct3",
    name: "Daily Safety Check",
    items: [
      { label: "All crew wearing proper PPE", required: true },
      { label: "Harnesses inspected", required: true },
      { label: "Ladders secured and stable", required: true },
      { label: "First aid kit accessible", required: true },
      { label: "Fire extinguisher on site", required: true },
      { label: "Weather conditions assessed", required: true },
      { label: "Safety meeting held", required: false },
    ],
    createdAt: "2026-03-15",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function ChecklistTemplatesPage() {
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(MOCK_TEMPLATES);
  const [showNew, setShowNew] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleCreate = useCallback(
    (data: { name: string; items: ChecklistTemplateItem[] }) => {
      const newTemplate: ChecklistTemplate = {
        id: `ct${Date.now()}`,
        name: data.name,
        items: data.items,
        createdAt: new Date().toISOString().split("T")[0],
      };
      setTemplates((prev) => [newTemplate, ...prev]);
      setShowNew(false);
    },
    [],
  );

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Checklist Templates</h1>
          <p className="text-sm text-gray-500 mt-1">
            {templates.length} template{templates.length !== 1 ? "s" : ""} ·{" "}
            {templates.reduce((sum, t) => sum + t.items.length, 0)} total items
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          + New Template
        </Button>
      </div>

      {/* Templates list */}
      {templates.length === 0 ? (
        <EmptyState
          title="No checklist templates yet"
          description="Create reusable checklist templates for inspections, safety checks, and quality assurance."
          action={
            <Button
              onClick={() => setShowNew(true)}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)]"
            >
              Create First Template
            </Button>
          }
        />
      ) : (
        <ChecklistTemplateList
          templates={templates}
          onSelect={(t) => setSelectedId(selectedId === t.id ? null : t.id)}
          selectedId={selectedId}
        />
      )}

      {/* New Template Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Checklist Template">
        <ChecklistTemplateForm onSubmit={handleCreate} onCancel={() => setShowNew(false)} />
      </Modal>
    </div>
  );
}
