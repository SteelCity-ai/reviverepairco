"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type DocumentCategory = "ALL" | "CONTRACT" | "PERMIT" | "RECEIPT" | "OTHER";

interface ProjectDocument {
  id: string;
  filename: string;
  category: Exclude<DocumentCategory, "ALL">;
  sizeBytes: number;
  uploadedBy: string;
  uploadedAt: string;
  description: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const CATEGORIES: DocumentCategory[] = ["ALL", "CONTRACT", "PERMIT", "RECEIPT", "OTHER"];

const CATEGORY_LABELS: Record<Exclude<DocumentCategory, "ALL">, string> = {
  CONTRACT: "Contract",
  PERMIT: "Permit",
  RECEIPT: "Receipt",
  OTHER: "Other",
};

const CATEGORY_COLORS: Record<Exclude<DocumentCategory, "ALL">, string> = {
  CONTRACT: "bg-blue-100 text-blue-700",
  PERMIT: "bg-purple-100 text-purple-700",
  RECEIPT: "bg-emerald-100 text-emerald-700",
  OTHER: "bg-gray-100 text-gray-600",
};

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_DOCS: ProjectDocument[] = [
  {
    id: "d1",
    filename: "roofing-contract-meadow-ln.pdf",
    category: "CONTRACT",
    sizeBytes: 245000,
    uploadedBy: "Sarah (PM)",
    uploadedAt: "2026-04-01T09:00:00",
    description: "Signed roofing contract for Meadow Lane Residence",
  },
  {
    id: "d2",
    filename: "permit-2026-0412-roof-replacement.pdf",
    category: "PERMIT",
    sizeBytes: 890000,
    uploadedBy: "Sarah (PM)",
    uploadedAt: "2026-04-12T14:30:00",
    description: "City building permit for roof replacement — approved",
  },
  {
    id: "d3",
    filename: "material-invoice-shingles-apr15.pdf",
    category: "RECEIPT",
    sizeBytes: 125000,
    uploadedBy: "Marcus T.",
    uploadedAt: "2026-04-15T16:45:00",
    description: "Invoice for architectural shingles — 32 squares",
  },
  {
    id: "d4",
    filename: "decking-replacement-photos.zip",
    category: "OTHER",
    sizeBytes: 15200000,
    uploadedBy: "Carlos M.",
    uploadedAt: "2026-04-10T11:00:00",
    description: "Photos of damaged decking before and after replacement",
  },
  {
    id: "d5",
    filename: "dumpster-rental-receipt.pdf",
    category: "RECEIPT",
    sizeBytes: 78000,
    uploadedBy: "Javier R.",
    uploadedAt: "2026-04-14T10:00:00",
    description: "2 dumpster rentals for tear-off debris",
  },
  {
    id: "d6",
    filename: "ice-water-shield-invoice.pdf",
    category: "RECEIPT",
    sizeBytes: 95000,
    uploadedBy: "Marcus T.",
    uploadedAt: "2026-04-16T08:30:00",
    description: "Ice & water shield material invoice",
  },
  {
    id: "d7",
    filename: "safety-plan-meadow-ln.pdf",
    category: "OTHER",
    sizeBytes: 340000,
    uploadedBy: "Sarah (PM)",
    uploadedAt: "2026-04-01T09:15:00",
    description: "Site-specific safety plan and emergency procedures",
  },
];

// ── Helpers ────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getFileIcon(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase();
  switch (ext) {
    case "pdf":
      return "📄";
    case "zip":
      return "📦";
    case "jpg":
    case "jpeg":
    case "png":
    case "gif":
      return "🖼️";
    case "doc":
    case "docx":
      return "📝";
    case "xls":
    case "xlsx":
      return "📊";
    default:
      return "📎";
  }
}

// ── Component ──────────────────────────────────────────────────────────────

export default function DocumentsPage() {
  const [docs, setDocs] = useState<ProjectDocument[]>(MOCK_DOCS);
  const [filter, setFilter] = useState<DocumentCategory>("ALL");
  const [showUpload, setShowUpload] = useState(false);
  const [form, setForm] = useState({
    filename: "",
    category: "CONTRACT" as Exclude<DocumentCategory, "ALL">,
    description: "",
  });

  const filteredDocs =
    filter === "ALL" ? docs : docs.filter((d) => d.category === filter);

  const handleUpload = () => {
    if (!form.filename.trim()) return;
    const newDoc: ProjectDocument = {
      id: `d${Date.now()}`,
      filename: form.filename,
      category: form.category,
      sizeBytes: 0,
      uploadedBy: "You",
      uploadedAt: new Date().toISOString(),
      description: form.description,
    };
    setDocs((prev) => [newDoc, ...prev]);
    setForm({ filename: "", category: "CONTRACT", description: "" });
    setShowUpload(false);
  };

  const categoryOptions = (CATEGORIES.filter((c) => c !== "ALL") as Exclude<DocumentCategory, "ALL">[]).map(
    (c) => ({ value: c, label: CATEGORY_LABELS[c] }),
  );

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Documents</h1>
          <p className="text-sm text-gray-500 mt-1">
            {docs.length} document{docs.length !== 1 ? "s" : ""} ·{" "}
            {formatBytes(docs.reduce((sum, d) => sum + d.sizeBytes, 0))} total
          </p>
        </div>
        <Button
          onClick={() => setShowUpload(true)}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          + Upload Document
        </Button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              "text-xs px-3 py-1.5 rounded-full border transition-colors",
              filter === cat
                ? "bg-[#1a202c] text-white border-[#1a202c]"
                : "bg-white text-gray-500 border-gray-200 hover:border-amber-300",
            )}
          >
            {cat === "ALL" ? "All" : CATEGORY_LABELS[cat]}
            {cat !== "ALL" && (
              <span className="ml-1 opacity-50">
                {docs.filter((d) => d.category === cat).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Documents list */}
      {filteredDocs.length === 0 ? (
        <EmptyState
          title="No documents found"
          description={filter !== "ALL" ? `No ${CATEGORY_LABELS[filter as Exclude<DocumentCategory, "ALL">]} documents yet.` : "Upload your first document to get started."}
          action={
            <Button
              onClick={() => setShowUpload(true)}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)]"
            >
              Upload Document
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filteredDocs.map((doc) => (
            <Card
              key={doc.id}
              className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* File icon */}
                  <div className="w-10 h-10 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl flex-shrink-0">
                    {getFileIcon(doc.filename)}
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Filename */}
                    <h4 className="text-sm font-medium text-[#1a202c] truncate">
                      {doc.filename}
                    </h4>

                    {/* Meta row */}
                    <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
                      <span>{formatBytes(doc.sizeBytes)}</span>
                      <span>·</span>
                      <span>{doc.uploadedBy}</span>
                      <span>·</span>
                      <span>
                        {new Date(doc.uploadedAt).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>
                    </div>

                    {/* Description */}
                    {doc.description && (
                      <p className="text-xs text-gray-500 mt-1.5 line-clamp-1">{doc.description}</p>
                    )}

                    {/* Category badge */}
                    <div className="mt-2">
                      <Badge className={cn("text-[10px]", CATEGORY_COLORS[doc.category])}>
                        {CATEGORY_LABELS[doc.category]}
                      </Badge>
                    </div>
                  </div>

                  {/* Download button */}
                  <button
                    className="text-gray-300 hover:text-[#1a202c] transition-colors flex-shrink-0"
                    title="Download"
                  >
                    ⬇️
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      <Modal open={showUpload} onClose={() => setShowUpload(false)} title="Upload Document">
        <div className="space-y-4">
          {/* File drop zone */}
          <div className="border-2 border-dashed border-gray-200 rounded-xl p-8 text-center hover:border-amber-300 transition-colors cursor-pointer">
            <div className="text-3xl mb-2">📁</div>
            <p className="text-sm text-gray-500 font-medium">Drag & drop a file here</p>
            <p className="text-xs text-gray-300 mt-1">or click to browse</p>
            <input type="file" className="hidden" />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">
              Filename *
            </label>
            <Input
              placeholder="e.g., permit-2026-roof.pdf"
              value={form.filename}
              onChange={(e) => setForm((prev) => ({ ...prev, filename: e.target.value }))}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  category: e.target.value as Exclude<DocumentCategory, "ALL">,
                }))
              }
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Description</label>
            <Input
              placeholder="Brief description of this document"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowUpload(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleUpload}
              disabled={!form.filename.trim()}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500 disabled:opacity-50"
            >
              Upload
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
