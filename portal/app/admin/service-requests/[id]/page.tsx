"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";
import { Loading } from "@/components/ui/Loading";
import { formatDate, formatCurrency } from "@/lib/utils";
import { useApi } from "@/lib/api-browser";

// ── Types ─────────────────────────────────────────────────────────────────

interface Address {
  line1?: string;
  city?: string;
  state?: string;
  postal?: string;
}

interface ServiceRequest {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  serviceType: string;
  priority: string;
  source: string;
  status: string;
  address: Address | null;
  estimatedCost: number | null;
  finalCost: number | null;
  internalNotes: string | null;
  convertedProjectId: string | null;
  convertedClientId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface ConvertResult {
  serviceRequest: ServiceRequest;
  project: { id: string; name: string };
  client: { id: string };
}

// ── Constants ─────────────────────────────────────────────────────────────

const PIPELINE = ["NEW", "REVIEWED", "SCHEDULED", "COMPLETED", "CLOSED"] as const;

const STATUS_LABELS: Record<string, string> = {
  NEW: "New",
  REVIEWED: "Reviewed",
  SCHEDULED: "Scheduled",
  COMPLETED: "Completed",
  CLOSED: "Closed",
  CONVERTED: "Converted",
};

const PRIORITY_OPTIONS = [
  { value: "URGENT", label: "URGENT" },
  { value: "HIGH", label: "HIGH" },
  { value: "NORMAL", label: "NORMAL" },
  { value: "LOW", label: "LOW" },
];

function priorityVariant(p: string): "cancelled" | "signoff" | "default" {
  const u = p.toUpperCase();
  if (u === "URGENT" || u === "HIGH") return "cancelled";
  if (u === "NORMAL") return "signoff";
  return "default";
}

function formatSource(s: string): string {
  return s.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function ServiceRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { api } = useApi();

  const [sr, setSr] = useState<ServiceRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Editable fields
  const [editingPriority, setEditingPriority] = useState(false);
  const [priorityVal, setPriorityVal] = useState("");
  const [editingEstCost, setEditingEstCost] = useState(false);
  const [estCostVal, setEstCostVal] = useState("");
  const [editingFinalCost, setEditingFinalCost] = useState(false);
  const [finalCostVal, setFinalCostVal] = useState("");
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesVal, setNotesVal] = useState("");
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionSaving, setActionSaving] = useState(false);

  // Convert modal
  const [showConvert, setShowConvert] = useState(false);
  const [convertSaving, setConvertSaving] = useState(false);
  const [convertResult, setConvertResult] = useState<ConvertResult | null>(null);
  const [convertError, setConvertError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchReq = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<ServiceRequest>(`/api/v1/service-requests/${params.id}`);
      setSr(data);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [api, params.id]);

  useEffect(() => {
    fetchReq();
  }, [fetchReq]);

  // ── Patch helper ───────────────────────────────────────────────────────

  const patch = async (body: Record<string, unknown>) => {
    setActionError(null);
    setActionSaving(true);
    try {
      const updated = await api<ServiceRequest>(`/api/v1/service-requests/${params.id}`, {
        method: "PATCH",
        body,
      });
      setSr(updated);
      return updated;
    } catch (err) {
      setActionError((err as Error).message);
      return null;
    } finally {
      setActionSaving(false);
    }
  };

  // ── Status transition ──────────────────────────────────────────────────

  const doTransition = async (nextStatus: string) => {
    const updated = await patch({ status: nextStatus });
    if (updated && nextStatus === "converted") {
      setShowConvert(false);
    }
  };

  const getTransitionLabel = (status: string): string | null => {
    const idx = PIPELINE.indexOf(status as typeof PIPELINE[number]);
    if (idx === -1) return null;
    const labels = ["Mark Reviewed", "Mark Scheduled", "Mark Completed", "Close Request", null];
    return labels[idx] ?? null;
  };

  const getTransitionTarget = (status: string): string | null => {
    const idx = PIPELINE.indexOf(status as typeof PIPELINE[number]);
    if (idx === -1 || idx >= PIPELINE.length - 1) return null;
    return PIPELINE[idx + 1];
  };

  // ── Convert ────────────────────────────────────────────────────────────

  const doConvert = async () => {
    setConvertSaving(true);
    setConvertError(null);
    try {
      const result = await api<ConvertResult>(`/api/v1/service-requests/${params.id}/convert`, {
        method: "POST",
      });
      setConvertResult(result);
      setSr(result.serviceRequest);
    } catch (err) {
      const msg = (err as Error).message;
      // Check for 409 already-converted
      if (msg.includes("409") || msg.toLowerCase().includes("already converted")) {
        setConvertError(msg);
      } else {
        setConvertError(msg);
      }
    } finally {
      setConvertSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <Loading message="Loading service request…" />;
  if (error || !sr) {
    return (
      <div className="animate-fade-in-up">
        <Link href="/admin/service-requests" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[var(--color-amber)] transition">
          <ArrowLeft size={14} /> Back to Service Requests
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">
            {error || "Service request not found."}
          </p>
          <Link href="/admin/service-requests" className="mt-2 inline-block">
            <Button variant="secondary" size="sm">Back to list</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isConverted = sr.status === "CONVERTED" || !!sr.convertedProjectId;
  const transitionTarget = getTransitionTarget(sr.status);
  const transitionLabel = getTransitionLabel(sr.status);

  // Pipeline stepper
  const pipelineIdx = PIPELINE.indexOf(sr.status as typeof PIPELINE[number]);

  return (
    <div className="animate-fade-in-up space-y-8">
      {/* Breadcrumb & Header */}
      <div>
        <nav className="mb-2 flex items-center gap-2 text-sm text-gray-400">
          <Link href="/admin/service-requests" className="hover:text-[var(--color-amber)] transition">
            Service Requests
          </Link>
          <span>/</span>
          <span className="text-[var(--color-primary)]">{sr.firstName} {sr.lastName}</span>
        </nav>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">
              {sr.firstName} {sr.lastName}
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              {formatDate(sr.createdAt)} · {sr.serviceType}
              {sr.email && (
                <> · <a href={`mailto:${sr.email}`} className="hover:text-[var(--color-amber)] transition">{sr.email}</a></>
              )}
              {sr.phone && (
                <> · <a href={`tel:${sr.phone}`} className="hover:text-[var(--color-amber)] transition">{sr.phone}</a></>
              )}
            </p>
          </div>
          {isConverted ? (
            <Badge variant="signoff">
              Converted
              {sr.convertedProjectId && (
                <Link href={`/admin/projects/${sr.convertedProjectId}`} className="ml-1 underline">
                  → Project
                </Link>
              )}
            </Badge>
          ) : (
            <Button variant="primary" onClick={() => setShowConvert(true)}>
              Convert to Project
            </Button>
          )}
        </div>
      </div>

      {/* Status Pipeline */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Status Pipeline</h2>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-1 mb-4">
            {PIPELINE.map((s, i) => {
              const reached = isConverted
                ? false
                : pipelineIdx === -1
                  ? false
                  : i <= pipelineIdx;
              const current = !isConverted && i === pipelineIdx;
              return (
                <div key={s} className="flex items-center gap-1 flex-1">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium flex-shrink-0 ${
                      reached
                        ? "bg-[var(--color-amber)] text-[var(--color-primary)]"
                        : current
                          ? "bg-[var(--color-amber)]/50 text-[var(--color-primary)] border-2 border-[var(--color-amber)]"
                          : "bg-gray-100 text-gray-400"
                    }`}
                  >
                    {STATUS_LABELS[s]}
                  </span>
                  {i < PIPELINE.length - 1 && (
                    <div className={`h-0.5 flex-1 ${reached && !current ? "bg-[var(--color-amber)]" : "bg-gray-200"}`} />
                  )}
                </div>
              );
            })}
            {isConverted && (
              <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium bg-[var(--color-amber)] text-[var(--color-primary)]">
                Converted → Project
              </span>
            )}
          </div>

          {/* Error */}
          {actionError && (
            <p className="mb-3 text-sm text-red-500">{actionError}</p>
          )}

          {/* Transition buttons */}
          {!isConverted && (
            <div className="flex gap-2">
              {transitionTarget && transitionLabel && (
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={actionSaving}
                  onClick={() => doTransition(transitionTarget)}
                >
                  {actionSaving ? `${transitionLabel.replace("Mark ", "Marking ")}…` : transitionLabel}
                </Button>
              )}
              {sr.status === "CLOSED" && (
                <Button
                  variant="ghost"
                  size="sm"
                  disabled={actionSaving}
                  onClick={() => doTransition("reviewed")}
                >
                  {actionSaving ? "Reopening…" : "Reopen to Reviewed"}
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Grid */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Request Details</h2>
        </CardHeader>
        <CardContent>
          <dl className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">First Name</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">{sr.firstName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Last Name</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">{sr.lastName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Email</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                {sr.email ? (
                  <a href={`mailto:${sr.email}`} className="hover:text-[var(--color-amber)] transition">
                    {sr.email}
                  </a>
                ) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Phone</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                {sr.phone ? (
                  <a href={`tel:${sr.phone}`} className="hover:text-[var(--color-amber)] transition">
                    {sr.phone}
                  </a>
                ) : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Service Type</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">{sr.serviceType || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Priority</dt>
              <dd className="mt-1">
                {editingPriority ? (
                  <div className="flex items-center gap-2">
                    <Select
                      options={PRIORITY_OPTIONS}
                      value={priorityVal}
                      onChange={(e) => setPriorityVal(e.target.value)}
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={actionSaving}
                      onClick={async () => {
                        const u = await patch({ priority: priorityVal });
                        if (u) setEditingPriority(false);
                      }}
                    >
                      {actionSaving ? "…" : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingPriority(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Badge variant={priorityVariant(sr.priority)}>{sr.priority}</Badge>
                    <button
                      className="text-xs text-gray-400 hover:text-[var(--color-amber)] transition"
                      onClick={() => {
                        setPriorityVal(sr.priority);
                        setEditingPriority(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Source</dt>
              <dd className="mt-1 text-sm text-gray-500">{formatSource(sr.source)}</dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Status</dt>
              <dd className="mt-1">
                <StatusBadge status={sr.status} />
              </dd>
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Address</dt>
              <dd className="mt-1 text-sm text-gray-600">
                {sr.address?.line1
                  ? `${sr.address.line1}, ${sr.address.city ?? ""}, ${sr.address.state ?? ""} ${sr.address.postal ?? ""}`
                  : "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Est. Cost</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                {editingEstCost ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={estCostVal}
                      onChange={(e) => setEstCostVal(e.target.value)}
                      className="w-28"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={actionSaving}
                      onClick={async () => {
                        const u = await patch({ estimatedCost: estCostVal ? parseFloat(estCostVal) : null });
                        if (u) setEditingEstCost(false);
                      }}
                    >
                      {actionSaving ? "…" : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingEstCost(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {formatCurrency(sr.estimatedCost)}
                    <button
                      className="text-xs text-gray-400 hover:text-[var(--color-amber)] transition"
                      onClick={() => {
                        setEstCostVal(sr.estimatedCost != null ? String(sr.estimatedCost) : "");
                        setEditingEstCost(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Final Cost</dt>
              <dd className="mt-1 text-sm text-[var(--color-primary)]">
                {editingFinalCost ? (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      value={finalCostVal}
                      onChange={(e) => setFinalCostVal(e.target.value)}
                      className="w-28"
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      disabled={actionSaving}
                      onClick={async () => {
                        const u = await patch({ finalCost: finalCostVal ? parseFloat(finalCostVal) : null });
                        if (u) setEditingFinalCost(false);
                      }}
                    >
                      {actionSaving ? "…" : "Save"}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditingFinalCost(false)}>
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    {formatCurrency(sr.finalCost)}
                    <button
                      className="text-xs text-gray-400 hover:text-[var(--color-amber)] transition"
                      onClick={() => {
                        setFinalCostVal(sr.finalCost != null ? String(sr.finalCost) : "");
                        setEditingFinalCost(true);
                      }}
                    >
                      Edit
                    </button>
                  </div>
                )}
              </dd>
            </div>
            {sr.convertedProjectId && (
              <div>
                <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">Project</dt>
                <dd className="mt-1">
                  <Link
                    href={`/admin/projects/${sr.convertedProjectId}`}
                    className="text-sm text-[var(--color-amber)] hover:underline"
                  >
                    View Project →
                  </Link>
                </dd>
              </div>
            )}
          </dl>
        </CardContent>
      </Card>

      {/* Internal Notes */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Internal Notes</h2>
        </CardHeader>
        <CardContent>
          {editingNotes ? (
            <div className="space-y-3">
              <textarea
                className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20"
                rows={4}
                value={notesVal}
                onChange={(e) => setNotesVal(e.target.value)}
              />
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="primary"
                  disabled={actionSaving}
                  onClick={async () => {
                    const u = await patch({ internalNotes: notesVal || null });
                    if (u) setEditingNotes(false);
                  }}
                >
                  {actionSaving ? "Saving…" : "Save Notes"}
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditingNotes(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <div>
              {sr.internalNotes ? (
                <div className="rounded-lg bg-[var(--color-surface)] p-3 text-sm text-gray-600">
                  {sr.internalNotes}
                </div>
              ) : (
                <p className="text-sm text-gray-400">No notes yet.</p>
              )}
              <p className="mt-2 text-xs text-gray-400">Last updated {formatDate(sr.updatedAt)}</p>
              <button
                className="mt-2 text-sm text-gray-400 hover:text-[var(--color-amber)] transition"
                onClick={() => {
                  setNotesVal(sr.internalNotes ?? "");
                  setEditingNotes(true);
                }}
              >
                Edit notes
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Convert Modal */}
      <Modal
        open={showConvert}
        onClose={() => {
          setShowConvert(false);
          setConvertResult(null);
          setConvertError(null);
        }}
        title={convertResult ? "Project Created" : "Convert to Project?"}
        size="md"
      >
        {convertResult ? (
          <div className="space-y-4 text-center">
            <p className="text-green-600 font-semibold">✓ Project created</p>
            <p className="text-sm text-gray-500">
              Client and project have been created from this service request.
            </p>
            <div className="flex justify-center gap-3">
              <Link href={`/admin/projects/${convertResult.project.id}`}>
                <Button variant="primary">Open Project</Button>
              </Link>
              <Link href="/admin/service-requests">
                <Button variant="secondary">Back to List</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {convertError && (
              <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
                {convertError.includes("already converted") || convertError.includes("409")
                  ? `Already converted. ${sr.convertedProjectId ? `View the existing project.` : ""}`
                  : convertError}
                {sr.convertedProjectId && (
                  <div className="mt-2">
                    <Link href={`/admin/projects/${sr.convertedProjectId}`} className="underline">
                      View Project →
                    </Link>
                  </div>
                )}
              </div>
            )}
            <p className="text-sm text-gray-600">
              This will create a client and a project from this request and mark the request Converted.
              This cannot be undone.
            </p>
            <div className="rounded-lg bg-[var(--color-surface)] p-3 text-sm text-gray-600 space-y-1">
              <p><strong>Contact:</strong> {sr.firstName} {sr.lastName}</p>
              <p><strong>Service:</strong> {sr.serviceType}</p>
              <p className="text-xs text-gray-400">Resulting project: {sr.serviceType} — {sr.firstName} {sr.lastName}</p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="secondary" onClick={() => setShowConvert(false)}>
                Cancel
              </Button>
              <Button variant="primary" disabled={convertSaving} onClick={doConvert}>
                {convertSaving ? "Converting…" : "Create Project"}
              </Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
