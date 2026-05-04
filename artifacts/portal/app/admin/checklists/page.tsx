import { api } from "@/lib/api-server";
import ChecklistsClient from "./ChecklistsClient";
import type { ChecklistTemplate } from "@/components/admin/ChecklistTemplateList";

interface ApiTemplate {
  id: string;
  name: string;
  items: Array<{ label: string; required?: boolean }>;
  createdAt: string;
}

export default async function ChecklistTemplatesPage() {
  const rows = (await api<ApiTemplate[]>("/checklists/templates")) ?? [];
  const templates: ChecklistTemplate[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    items: (r.items ?? []).map((it) => ({ label: it.label, required: it.required ?? false })),
    createdAt: r.createdAt,
  }));
  return <ChecklistsClient initialTemplates={templates} />;
}
