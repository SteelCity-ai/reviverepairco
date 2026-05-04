"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import ChecklistTemplateList, {
  type ChecklistTemplate,
  type ChecklistTemplateItem,
} from "@/components/admin/ChecklistTemplateList";
import ChecklistTemplateForm from "@/components/admin/ChecklistTemplateForm";
import { useApi } from "@/lib/api-browser";

export default function ChecklistsClient({
  initialTemplates,
}: {
  initialTemplates: ChecklistTemplate[];
}) {
  const router = useRouter();
  const { api } = useApi();
  const [templates, setTemplates] = useState<ChecklistTemplate[]>(initialTemplates);
  const [showNew, setShowNew] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = useCallback(
    async (data: { name: string; items: ChecklistTemplateItem[] }) => {
      setSubmitting(true);
      setError(null);
      try {
        const created = await api<ChecklistTemplate>("/checklists/templates", {
          method: "POST",
          body: { name: data.name, items: data.items },
        });
        setTemplates((prev) => [created, ...prev]);
        setShowNew(false);
        router.refresh();
      } catch (err) {
        setError((err as Error).message ?? "Failed to create template");
      } finally {
        setSubmitting(false);
      }
    },
    [api, router],
  );

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
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

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

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

      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Checklist Template">
        <ChecklistTemplateForm
          onSubmit={handleCreate}
          onCancel={() => setShowNew(false)}
          submitting={submitting}
        />
      </Modal>
    </div>
  );
}
