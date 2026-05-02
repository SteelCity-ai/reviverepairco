"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { ChecklistTemplateItem } from "@/components/admin/ChecklistTemplateList";

// ── Types ──────────────────────────────────────────────────────────────────

interface NewItem {
  label: string;
  required: boolean;
}

interface ChecklistTemplateFormProps {
  onSubmit: (data: { name: string; items: ChecklistTemplateItem[] }) => void;
  onCancel: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChecklistTemplateForm({ onSubmit, onCancel }: ChecklistTemplateFormProps) {
  const [name, setName] = useState("");
  const [items, setItems] = useState<NewItem[]>([{ label: "", required: true }]);

  const addItem = () => {
    setItems((prev) => [...prev, { label: "", required: false }]);
  };

  const removeItem = (idx: number) => {
    setItems((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateItem = (idx: number, field: keyof NewItem, value: string | boolean) => {
    setItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)),
    );
  };

  const handleSubmit = () => {
    if (!name.trim() || items.length === 0) return;
    const validItems: ChecklistTemplateItem[] = items
      .filter((i) => i.label.trim())
      .map((i) => ({ label: i.label.trim(), required: i.required }));
    if (validItems.length === 0) return;
    onSubmit({ name: name.trim(), items: validItems });
    setName("");
    setItems([{ label: "", required: true }]);
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1a202c] mb-1">Template Name *</label>
        <Input
          placeholder="e.g., Roof Installation Final Inspection"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-[#1a202c]">Checklist Items</label>
          <Button
            size="sm"
            variant="ghost"
            onClick={addItem}
            className="text-xs text-amber-600 hover:text-amber-700"
          >
            + Add Item
          </Button>
        </div>
        <div className="space-y-2">
          {items.map((item, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <Input
                placeholder={`Item ${idx + 1}`}
                value={item.label}
                onChange={(e) => updateItem(idx, "label", e.target.value)}
                className="flex-1 text-sm"
              />
              <label className="flex items-center gap-1.5 text-xs text-gray-500 cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  checked={item.required}
                  onChange={(e) => updateItem(idx, "required", e.target.checked)}
                  className="rounded border-gray-300 text-amber-500 focus:ring-amber-400"
                />
                Required
              </label>
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItem(idx)}
                  className="text-gray-300 hover:text-red-400 text-lg leading-none flex-shrink-0"
                >
                  ×
                </button>
              )}
            </div>
          ))}
        </div>
        {items.length > 0 && items.every((i) => !i.label.trim()) && (
          <p className="text-xs text-gray-400 mt-1">Add at least one item with a label.</p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={!name.trim() || items.every((i) => !i.label.trim())}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500 disabled:opacity-50"
        >
          Create Template
        </Button>
      </div>
    </div>
  );
}
