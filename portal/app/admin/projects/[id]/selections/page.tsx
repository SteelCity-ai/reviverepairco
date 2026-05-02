"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import SelectionCard, { type Selection, type SelectionOption } from "@/components/admin/SelectionCard";

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_SELECTIONS: Selection[] = [
  {
    id: "s1",
    name: "Shingle Color",
    options: [
      { description: "Charcoal Black", priceDelta: 0 },
      { description: "Weathered Wood", priceDelta: 0 },
      { description: "Slate Gray (Premium)", priceDelta: 450 },
    ],
    deadline: "2026-04-12",
    status: "APPROVED",
    clientChoice: 0,
    workType: "ROOFING",
    mainTask: "Install asphalt shingles",
  },
  {
    id: "s2",
    name: "Gutter Color",
    options: [
      { description: "White", priceDelta: 0 },
      { description: "Bronze", priceDelta: 0 },
      { description: "Copper (Premium)", priceDelta: 800 },
    ],
    deadline: "2026-04-25",
    status: "APPROVED",
    clientChoice: 1,
    workType: "GUTTERS",
    mainTask: "Install seamless gutters",
  },
  {
    id: "s3",
    name: "Attic Ventilation Upgrade",
    options: [
      { description: "Standard ridge vent (included)", priceDelta: 0 },
      { description: "Powered attic fan (electric)", priceDelta: 650 },
      { description: "Solar-powered attic fan", priceDelta: 950 },
    ],
    deadline: "2026-04-20",
    status: "PENDING",
    clientChoice: null,
    workType: "ROOFING",
    mainTask: "Install ridge vents & flashing",
  },
  {
    id: "s4",
    name: "Fascia Board Material",
    options: [
      { description: "Standard pine (primed)", priceDelta: 0 },
      { description: "Cedar (natural)", priceDelta: 320 },
      { description: "PVC composite (maintenance-free)", priceDelta: 580 },
    ],
    deadline: "2026-04-18",
    status: "REJECTED",
    clientChoice: 0,
    workType: "SIDING",
    mainTask: "Replace fascia boards",
  },
];

// ── New Selection form state ──────────────────────────────────────────────

interface NewOption {
  description: string;
  priceDelta: string;
}

interface NewSelectionForm {
  name: string;
  options: NewOption[];
  deadline: string;
  workType: string;
  mainTask: string;
}

const WORK_TYPES = ["ROOFING", "SIDING", "GUTTERS", "FRAMING"];

// ── Component ──────────────────────────────────────────────────────────────

export default function SelectionsPage() {
  const [selections, setSelections] = useState<Selection[]>(MOCK_SELECTIONS);
  const [showNew, setShowNew] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<NewSelectionForm>({
    name: "",
    options: [{ description: "", priceDelta: "0" }],
    deadline: "",
    workType: "ROOFING",
    mainTask: "",
  });

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const addOption = () => {
    setForm((prev) => ({
      ...prev,
      options: [...prev.options, { description: "", priceDelta: "0" }],
    }));
  };

  const removeOption = (idx: number) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.filter((_, i) => i !== idx),
    }));
  };

  const updateOption = (idx: number, field: "description" | "priceDelta", value: string) => {
    setForm((prev) => ({
      ...prev,
      options: prev.options.map((opt, i) => (i === idx ? { ...opt, [field]: value } : opt)),
    }));
  };

  const handleCreate = () => {
    if (!form.name.trim() || form.options.length === 0) return;
    const newSelection: Selection = {
      id: `s${Date.now()}`,
      name: form.name,
      options: form.options.map((opt) => ({
        description: opt.description || `Option`,
        priceDelta: parseFloat(opt.priceDelta) || 0,
      })),
      deadline: form.deadline || "",
      status: "PENDING",
      clientChoice: null,
      workType: form.workType,
      mainTask: form.mainTask,
    };
    setSelections((prev) => [newSelection, ...prev]);
    setForm({
      name: "",
      options: [{ description: "", priceDelta: "0" }],
      deadline: "",
      workType: "ROOFING",
      mainTask: "",
    });
    setShowNew(false);
  };

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Client Selections</h1>
          <p className="text-sm text-gray-500 mt-1">
            {selections.length} selections ·{" "}
            {selections.filter((s) => s.status === "PENDING").length} pending
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          + New Selection
        </Button>
      </div>

      {/* Grid */}
      {selections.length === 0 ? (
        <EmptyState
          title="No selections yet"
          description="Create selections for the client to choose options like colors, materials, and upgrades."
          action={
            <Button
              onClick={() => setShowNew(true)}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)]"
            >
              Create First Selection
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {selections.map((selection) => (
            <SelectionCard
              key={selection.id}
              selection={selection}
              isExpanded={expandedIds.has(selection.id)}
              onToggle={() => toggleExpand(selection.id)}
            />
          ))}
        </div>
      )}

      {/* New Selection Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Selection">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Name *</label>
            <Input
              placeholder="e.g., Shingle Color"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            />
          </div>

          {/* Options editor */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-[#1a202c]">Options</label>
              <Button
                size="sm"
                variant="ghost"
                onClick={addOption}
                className="text-xs text-amber-600 hover:text-amber-700"
              >
                + Add Option
              </Button>
            </div>
            <div className="space-y-2">
              {form.options.map((opt, idx) => (
                <div key={idx} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${idx + 1} description`}
                    value={opt.description}
                    onChange={(e) => updateOption(idx, "description", e.target.value)}
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Price delta"
                    value={opt.priceDelta}
                    onChange={(e) => updateOption(idx, "priceDelta", e.target.value)}
                    className="w-24"
                  />
                  {form.options.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeOption(idx)}
                      className="text-gray-300 hover:text-red-400 text-lg leading-none"
                    >
                      ×
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1a202c] mb-1">Deadline</label>
              <Input
                type="date"
                value={form.deadline}
                onChange={(e) => setForm((prev) => ({ ...prev, deadline: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a202c] mb-1">Work Type</label>
              <select
                value={form.workType}
                onChange={(e) => setForm((prev) => ({ ...prev, workType: e.target.value }))}
                className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
              >
                {WORK_TYPES.map((w) => (
                  <option key={w} value={w}>
                    {w.charAt(0) + w.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Linked Task</label>
            <Input
              placeholder="e.g., Install asphalt shingles"
              value={form.mainTask}
              onChange={(e) => setForm((prev) => ({ ...prev, mainTask: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowNew(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              disabled={!form.name.trim() || form.options.length === 0}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500 disabled:opacity-50"
            >
              Create Selection
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
