"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

// ── Types ──────────────────────────────────────────────────────────────────

interface TaskOption {
  id: string;
  name: string;
}

interface ChangeOrderFormData {
  title: string;
  description: string;
  reason: string;
  costImpact: string;
  scheduleImpactDays: string;
  affectedTasks: string[];
}

interface ChangeOrderFormProps {
  tasks: TaskOption[];
  onSubmit: (data: ChangeOrderFormData) => void;
  onCancel: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChangeOrderForm({ tasks, onSubmit, onCancel }: ChangeOrderFormProps) {
  const [form, setForm] = useState<ChangeOrderFormData>({
    title: "",
    description: "",
    reason: "",
    costImpact: "",
    scheduleImpactDays: "",
    affectedTasks: [],
  });

  const [errors, setErrors] = useState<Partial<Record<keyof ChangeOrderFormData, string>>>({});

  const toggleTask = (taskId: string) => {
    setForm((prev) => ({
      ...prev,
      affectedTasks: prev.affectedTasks.includes(taskId)
        ? prev.affectedTasks.filter((id) => id !== taskId)
        : [...prev.affectedTasks, taskId],
    }));
    // Clear error when user interacts
    if (errors.affectedTasks) {
      setErrors((prev) => ({ ...prev, affectedTasks: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Partial<Record<keyof ChangeOrderFormData, string>> = {};
    if (!form.title.trim()) newErrors.title = "Title is required";
    if (!form.description.trim()) newErrors.description = "Description is required";
    if (!form.reason.trim()) newErrors.reason = "Reason is required";
    if (!form.costImpact || isNaN(Number(form.costImpact)) || Number(form.costImpact) < 0)
      newErrors.costImpact = "Valid cost is required";
    if (
      form.scheduleImpactDays !== "" &&
      (isNaN(Number(form.scheduleImpactDays)) || Number(form.scheduleImpactDays) < 0)
    )
      newErrors.scheduleImpactDays = "Must be a positive number or empty";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      onSubmit(form);
      setForm({
        title: "",
        description: "",
        reason: "",
        costImpact: "",
        scheduleImpactDays: "",
        affectedTasks: [],
      });
      setErrors({});
    }
  };

  const fieldClass = (field: keyof ChangeOrderFormData) =>
    errors[field] ? "border-red-300 focus:ring-red-400" : "";

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-[#1a202c] mb-1">Title *</label>
        <Input
          placeholder="e.g., Additional ridge vent installation"
          value={form.title}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, title: e.target.value }));
            if (errors.title) setErrors((prev) => ({ ...prev, title: undefined }));
          }}
          className={fieldClass("title")}
        />
        {errors.title && <p className="text-xs text-red-500 mt-1">{errors.title}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a202c] mb-1">Description *</label>
        <textarea
          className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y min-h-[80px] ${fieldClass("description")}`}
          placeholder="Detailed scope of the change..."
          value={form.description}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, description: e.target.value }));
            if (errors.description) setErrors((prev) => ({ ...prev, description: undefined }));
          }}
        />
        {errors.description && <p className="text-xs text-red-500 mt-1">{errors.description}</p>}
      </div>

      <div>
        <label className="block text-sm font-medium text-[#1a202c] mb-1">Reason *</label>
        <textarea
          className={`w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y min-h-[60px] ${fieldClass("reason")}`}
          placeholder="Why is this change needed?"
          value={form.reason}
          onChange={(e) => {
            setForm((prev) => ({ ...prev, reason: e.target.value }));
            if (errors.reason) setErrors((prev) => ({ ...prev, reason: undefined }));
          }}
        />
        {errors.reason && <p className="text-xs text-red-500 mt-1">{errors.reason}</p>}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-[#1a202c] mb-1">Cost Impact ($) *</label>
          <Input
            type="number"
            min="0"
            step="0.01"
            placeholder="0.00"
            value={form.costImpact}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, costImpact: e.target.value }));
              if (errors.costImpact) setErrors((prev) => ({ ...prev, costImpact: undefined }));
            }}
            className={fieldClass("costImpact")}
          />
          {errors.costImpact && <p className="text-xs text-red-500 mt-1">{errors.costImpact}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[#1a202c] mb-1">
            Schedule Impact (days)
          </label>
          <Input
            type="number"
            min="0"
            placeholder="0"
            value={form.scheduleImpactDays}
            onChange={(e) => {
              setForm((prev) => ({ ...prev, scheduleImpactDays: e.target.value }));
              if (errors.scheduleImpactDays)
                setErrors((prev) => ({ ...prev, scheduleImpactDays: undefined }));
            }}
            className={fieldClass("scheduleImpactDays")}
          />
          {errors.scheduleImpactDays && (
            <p className="text-xs text-red-500 mt-1">{errors.scheduleImpactDays}</p>
          )}
        </div>
      </div>

      {/* Affected tasks multi-select */}
      <div>
        <label className="block text-sm font-medium text-[#1a202c] mb-1">Affected Tasks</label>
        <div className="flex flex-wrap gap-2">
          {tasks.map((task) => (
            <button
              key={task.id}
              type="button"
              onClick={() => toggleTask(task.id)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                form.affectedTasks.includes(task.id)
                  ? "bg-[#1a202c] text-white border-[#1a202c]"
                  : "bg-white text-gray-600 border-gray-200 hover:border-amber-300"
              }`}
            >
              {task.name}
            </button>
          ))}
        </div>
        {form.affectedTasks.length > 0 && (
          <p className="text-xs text-gray-400 mt-1.5">
            {form.affectedTasks.length} task{form.affectedTasks.length > 1 ? "s" : ""} selected
          </p>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          onClick={handleSubmit}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          Create Change Order
        </Button>
      </div>
    </div>
  );
}
