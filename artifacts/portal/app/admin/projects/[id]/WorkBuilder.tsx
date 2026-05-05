"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button, Card, Input, StatusBadge } from "@/components/ui";
import { useApi } from "@/lib/api-browser";
import type { WorkType, MainTask, DailyTask } from "@/lib/db";

type WorkTypeFull = WorkType & {
  mainTasks: (MainTask & { dailyTasks: DailyTask[] })[];
};

interface Props {
  projectId: string;
  workTypes: WorkTypeFull[];
  crew: { id: string; displayName: string | null; email: string | null; role: string }[];
}

type EditTarget =
  | { kind: "wt"; id: string }
  | { kind: "mt"; id: string }
  | null;

const WT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETE"] as const;

export default function WorkBuilder({ projectId, workTypes, crew }: Props) {
  const { api } = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWtForm, setShowWtForm] = useState(false);
  const [openMtFor, setOpenMtFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditTarget>(null);

  function isEditing(kind: "wt" | "mt", id: string): boolean {
    return editing?.kind === kind && editing.id === id;
  }

  async function run<T>(key: string, fn: () => Promise<T>) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      router.refresh();
    } catch (e) {
      setError((e as Error).message ?? "Request failed");
    } finally {
      setBusy(null);
    }
  }

  // ── CREATE ──────────────────────────────────────────────────────────
  async function addWorkType(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await run("wt", async () => {
      await api("/work-types", {
        method: "POST",
        body: {
          projectId,
          name: String(fd.get("name") ?? "").trim(),
          description: String(fd.get("description") ?? "").trim() || undefined,
        },
      });
      form.reset();
      setShowWtForm(false);
    });
  }

  async function addMainTask(workTypeId: string, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    await run(`mt-add-${workTypeId}`, async () => {
      await api("/main-tasks", {
        method: "POST",
        body: {
          workTypeId,
          name: String(fd.get("name") ?? "").trim(),
          description: String(fd.get("description") ?? "").trim() || undefined,
          startDate: String(fd.get("startDate") ?? "") || undefined,
          endDate: String(fd.get("endDate") ?? "") || undefined,
        },
      });
      form.reset();
      setOpenMtFor(null);
    });
  }

  // ── UPDATE ──────────────────────────────────────────────────────────
  async function saveWorkType(wt: WorkType, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await run(`wt-save-${wt.id}`, async () => {
      await api(`/work-types/${wt.id}`, {
        method: "PATCH",
        body: {
          name: String(fd.get("name") ?? "").trim(),
          description: String(fd.get("description") ?? "").trim() || undefined,
          status: String(fd.get("status") ?? "") as
            | "NOT_STARTED"
            | "IN_PROGRESS"
            | "COMPLETE",
        },
      });
      setEditing(null);
    });
  }

  async function saveMainTask(mt: MainTask, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await run(`mt-save-${mt.id}`, async () => {
      await api(`/main-tasks/${mt.id}`, {
        method: "PATCH",
        body: {
          name: String(fd.get("name") ?? "").trim(),
          description: String(fd.get("description") ?? "").trim() || undefined,
          startDate: String(fd.get("startDate") ?? "") || null,
          endDate: String(fd.get("endDate") ?? "") || null,
        },
      });
      setEditing(null);
    });
  }

  // ── DELETE ──────────────────────────────────────────────────────────
  async function deleteEntity(
    path: "work-types" | "main-tasks",
    id: string,
    confirmMsg: string,
  ) {
    if (!confirm(confirmMsg)) return;
    await run(`del-${path}-${id}`, async () => {
      await api(`/${path}/${id}`, { method: "DELETE" });
    });
  }

  // ── RENDER ──────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {workTypes.length === 0 && (
        <Card className="py-6 text-center text-sm text-gray-400">
          No work types yet — add the first one below.
        </Card>
      )}

      {workTypes.map((wt) => (
        <Card key={wt.id} className="space-y-3">
          {isEditing("wt", wt.id) ? (
            <form onSubmit={(e) => saveWorkType(wt, e)} className="space-y-2">
              <Input name="name" defaultValue={wt.name} required />
              <Input name="description" defaultValue={wt.description ?? ""} />
              <select
                name="status"
                defaultValue={wt.status}
                className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary)]"
              >
                {WT_STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s.replace("_", " ")}
                  </option>
                ))}
              </select>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={busy === `wt-save-${wt.id}`}
                >
                  {busy === `wt-save-${wt.id}` ? "Saving…" : "Save"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setEditing(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="font-semibold text-[var(--color-primary)]">
                  {wt.name}
                </span>
                <StatusBadge status={wt.status} />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-gray-400">
                  {wt.mainTasks.length} main task
                  {wt.mainTasks.length !== 1 ? "s" : ""}
                </span>
                <RowActions
                  onEdit={() => setEditing({ kind: "wt", id: wt.id })}
                  onDelete={() =>
                    deleteEntity(
                      "work-types",
                      wt.id,
                      `Delete work type "${wt.name}" and all its tasks? This cannot be undone.`,
                    )
                  }
                  busy={busy === `del-work-types-${wt.id}`}
                />
              </div>
            </div>
          )}

          {!isEditing("wt", wt.id) && wt.description && (
            <p className="text-sm text-gray-500">{wt.description}</p>
          )}

          {wt.mainTasks.length > 0 && (
            <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
              {wt.mainTasks.map((mt) => {
                const total = mt.dailyTasks.length;
                const done = mt.dailyTasks.filter((dt) => dt.status === "DONE").length;

                return (
                  <div
                    key={mt.id}
                    className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)]"
                  >
                    {isEditing("mt", mt.id) ? (
                      <form
                        onSubmit={(e) => saveMainTask(mt, e)}
                        className="space-y-2 px-4 py-3"
                      >
                        <Input name="name" defaultValue={mt.name} required />
                        <Input
                          name="description"
                          defaultValue={mt.description ?? ""}
                          placeholder="Description"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            name="startDate"
                            type="date"
                            defaultValue={mt.startDate ?? ""}
                            aria-label="Start date"
                          />
                          <Input
                            name="endDate"
                            type="date"
                            defaultValue={mt.endDate ?? ""}
                            aria-label="End date"
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={busy === `mt-save-${mt.id}`}
                          >
                            {busy === `mt-save-${mt.id}` ? "Saving…" : "Save"}
                          </Button>
                          <Button
                            type="button"
                            size="sm"
                            variant="secondary"
                            onClick={() => setEditing(null)}
                          >
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      <div className="flex items-center gap-2 px-4 py-3">
                        {/* Clickable area → drill-in */}
                        <Link
                          href={`/admin/projects/${projectId}/main-tasks/${mt.id}`}
                          className="group flex min-w-0 flex-1 items-center gap-3"
                        >
                          <div className="min-w-0 flex-1">
                            <span className="text-sm font-medium text-[var(--color-primary)] group-hover:text-[var(--color-amber)] transition-colors">
                              {mt.name}
                            </span>
                            {mt.description && (
                              <p className="mt-0.5 truncate text-xs text-gray-400">
                                {mt.description}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 items-center gap-2">
                            <StatusBadge status={mt.status} />
                            <span className="text-xs text-gray-400">
                              {total > 0 ? `${done} / ${total} done` : "0 steps"}
                            </span>
                            <ChevronRight className="h-4 w-4 text-gray-300 group-hover:text-[var(--color-amber)] transition-colors" />
                          </div>
                        </Link>

                        {/* Edit / Delete — stop propagation so link doesn't fire */}
                        <div
                          className="flex shrink-0 items-center gap-1"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <RowActions
                            small
                            onEdit={() => setEditing({ kind: "mt", id: mt.id })}
                            onDelete={() =>
                              deleteEntity(
                                "main-tasks",
                                mt.id,
                                `Delete main task "${mt.name}" and all its daily steps?`,
                              )
                            }
                            busy={busy === `del-main-tasks-${mt.id}`}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {openMtFor === wt.id ? (
            <form
              onSubmit={(e) => addMainTask(wt.id, e)}
              className="space-y-2 rounded-lg border border-dashed border-[var(--color-border)] p-3"
            >
              <Input name="name" placeholder="Main task name" required />
              <Input name="description" placeholder="Description (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <Input name="startDate" type="date" aria-label="Start date" />
                <Input name="endDate" type="date" aria-label="End date" />
              </div>
              <div className="flex gap-2">
                <Button
                  type="submit"
                  size="sm"
                  disabled={busy === `mt-add-${wt.id}`}
                >
                  {busy === `mt-add-${wt.id}` ? "Adding…" : "Add task"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => setOpenMtFor(null)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          ) : (
            <button
              type="button"
              onClick={() => setOpenMtFor(wt.id)}
              className="text-sm font-medium text-[var(--color-amber)] hover:underline"
            >
              + Add main task
            </button>
          )}
        </Card>
      ))}

      {showWtForm ? (
        <Card>
          <form onSubmit={addWorkType} className="space-y-2">
            <Input
              name="name"
              placeholder="Work type (e.g. Electrical, HVAC, Demolition)"
              required
            />
            <Input name="description" placeholder="Description (optional)" />
            <div className="flex gap-2">
              <Button type="submit" disabled={busy === "wt"}>
                {busy === "wt" ? "Adding…" : "Add work type"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => setShowWtForm(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : (
        <Button onClick={() => setShowWtForm(true)}>+ Add work type</Button>
      )}
    </div>
  );
}

function RowActions({
  onEdit,
  onDelete,
  busy,
  small,
}: {
  onEdit: () => void;
  onDelete: () => void;
  busy: boolean;
  small?: boolean;
}) {
  const cls = small
    ? "px-2 py-0.5 text-[11px]"
    : "px-2.5 py-1 text-xs";
  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={onEdit}
        className={`${cls} rounded font-medium text-[var(--color-primary)] hover:bg-[var(--color-surface)]`}
      >
        Edit
      </button>
      <button
        type="button"
        onClick={onDelete}
        disabled={busy}
        className={`${cls} rounded font-medium text-red-600 hover:bg-red-50 disabled:opacity-50`}
      >
        {busy ? "…" : "Delete"}
      </button>
    </div>
  );
}
