import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate } from "@/lib/utils";
import { api } from "@/lib/api-server";
import type { ProjectDocument, Project } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function ProjectDocumentsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [project, docs] = await Promise.all([
    api<Project>(`/projects/${id}`),
    api<ProjectDocument[]>(`/documents?projectId=${id}`),
  ]);

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/projects" className="hover:text-[var(--color-amber)] transition">Projects</Link>
          <span>/</span>
          <Link href={`/admin/projects/${id}`} className="hover:text-[var(--color-amber)] transition">
            {project?.name ?? id}
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">Documents</span>
        </nav>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Documents</h1>
      </div>

      {!docs || docs.length === 0 ? (
        <EmptyState
          icon="📄"
          title="No documents yet"
          description="Upload contracts, permits, and other project documents."
        />
      ) : (
        <div className="space-y-2">
          {docs.map((doc) => (
            <Card key={doc.id} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">📄</span>
                <div>
                  <a
                    href={`/api/proxy/v1/documents/${doc.id}/file`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                  >
                    {doc.originalFilename ?? doc.objectKey}
                  </a>
                  <p className="text-xs text-gray-400">
                    {doc.category}
                    {doc.description && ` · ${doc.description}`}
                    {doc.sizeBytes && ` · ${(doc.sizeBytes / 1024).toFixed(0)} KB`}
                    {` · ${formatDate(doc.createdAt)}`}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
