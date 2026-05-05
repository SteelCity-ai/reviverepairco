"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Card, Input, StatusBadge } from "@/components/ui";
import { useApi } from "@/lib/api-browser";
import type {
  WorkType,
  MainTask,
  DailyTask,
  UserProfile,
} from "@/lib/db";

type WorkTypeFull = WorkType & {
  mainTasks: (MainTask & { dailyTasks: DailyTask[] })[];
};

interface Props {
  projectId: string;
  workTypes: WorkTypeFull[];
  crew: UserProfile[];
}

type EditTarget =
  | { kind: "wt"; id: string }
  | { kind: "mt"; id: string }
  | { kind: "dt"; id: string }
  | null;

const WT_STATUSES = ["NOT_STARTED", "IN_PROGRESS", "COMPLETE"] as const;

export default function WorkBuilder({ projectId, workTypes, crew }: Props) {
  const { api } = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWtForm, setShowWtForm] = useState(false);
  const [openMtFor, setOpenMtFor] = useState<string | null>(null);
  const [openDtFor, setOpenDtFor] = useState<string | null>(null);
  const [editing, setEditing] = useState<EditTarget>(null);

  const crewOptions = useMemo(
    () =>
      crew
        .filter((u) => u.role === "CREW" || u.role === "ADMIN")
        .map((u) => ({ value: u.id, label: u.displayName ?? u.email ?? u.id })),
    [crew],
  );

  function isEditing(kind: "wt" | "mt" | "dt", id: string): boolean {
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

  async function addDailyTask(mainTaskId: string, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const fd = new FormData(form);
    const assignee = String(fd.get("assignedToUserId") ?? "");
    await run(`dt-add-${mainTaskId}`, async () => {
      await api("/daily-tasks", {
        method: "POST",
        body: {
          mainTaskId,
          title: String(fd.get("title") ?? "").trim(),
          scheduledDate: String(fd.get("scheduledDate") ?? "") || undefined,
          assignedToUserId: assignee || undefined,
        },
      });
      form.reset();
      setOpenDtFor(null);
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

  async function saveDailyTask(dt: DailyTask, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const assignee = String(fd.get("assignedToUserId") ?? "");
    await run(`dt-save-${dt.id}`, async () => {
      await api(`/daily-tasks/${dt.id}`, {
        method: "PATCH",
        body: {
          title: String(fd.get("title") ?? "").trim(),
          scheduledDate: String(fd.get("scheduledDate") ?? "") || null,
          assignedToUserId: assignee || null,
        },
      });
      setEditing(null);
    });
  }

  // ── DELETE ──────────────────────────────────────────────────────────
  async function deleteEntity(
    path: "work-types" | "main-tasks" | "daily-tasks",
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
              {wt.mainTasks.map((mt) => (
                <div
                  key={mt.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  {isEditing("mt", mt.id) ? (
                    <form
                      onSubmit={(e) => saveMainTask(mt, e)}
                      className="space-y-2"
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
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[var(--color-primary)]">
                          {mt.name}
                        </span>
                        <StatusBadge status={mt.status} />
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-gray-400">
                          {mt.dailyTasks.length} daily step
                          {mt.dailyTasks.length !== 1 ? "s" : ""}
                        </span>
                        <RowActions
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

                  {mt.dailyTasks.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {mt.dailyTasks.map((dt) => (
                        <li
                          key={dt.id}
                          className="rounded bg-white px-2 py-1"
                        >
                          {isEditing("dt", dt.id) ? (
                            <form
                              onSubmit={(e) => saveDailyTask(dt, e)}
                              className="space-y-2 py-2"
                            >
                              <Input name="title" defaultValue={dt.title} required />
                              <div className="grid grid-cols-2 gap-2">
                                <Input
                                  name="scheduledDate"
                                  type="date"
                                  defaultValue={dt.scheduledDate ?? ""}
                                  aria-label="Scheduled date"
                                />
                                <select
                                  name="assignedToUserId"
                                  defaultValue={dt.assignedToUserId ?? ""}
                                  className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary)]"
                                >
                                  <option value="">Unassigned</option>
                                  {crewOptions.map((o) => (
                                    <option key={o.value} value={o.value}>
                                      {o.label}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="submit"
                                  size="sm"
                                  disabled={busy === `dt-save-${dt.id}`}
                                >
                                  {busy === `dt-save-${dt.id}` ? "Saving…" : "Save"}
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
                            <div className="flex items-center justify-between gap-2">
                              <span>
                                {dt.status === "DONE" ? "✅ " : "◻️ "}
                                {dt.title}
                                {dt.scheduledDate && (
                                  <span className="ml-2 text-gray-400">
                                    {dt.scheduledDate}
                                  </span>
                                )}
                              </span>
                              <div className="flex items-center gap-2">
                                {dt.assignedToUserId && (
                                  <span className="text-gray-400">
                                    {crew.find(
                                      (u) => u.id === dt.assignedToUserId,
                                    )?.displayName ?? "—"}
                                  </span>
                                )}
                                <RowActions
                                  small
                                  onEdit={() =>
                                    setEditing({ kind: "dt", id: dt.id })
                                  }
                                  onDelete={() =>
                                    deleteEntity(
                                      "daily-tasks",
                                      dt.id,
                                      `Delete daily step "${dt.title}"?`,
                                    )
                                  }
                                  busy={busy === `del-daily-tasks-${dt.id}`}
                                />
                              </div>
                            </div>
                          )}
                        </li>
                      ))}
                    </ul>
                  )}

                  {openDtFor === mt.id ? (
                    <form
                      onSubmit={(e) => addDailyTask(mt.id, e)}
                      className="mt-3 space-y-2"
                    >
                      <Input
                        name="title"
                        placeholder="Daily step (e.g. Strip south slope)"
                        required
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <Input
                          name="scheduledDate"
                          type="date"
                          aria-label="Scheduled date"
                        />
                        <select
                          name="assignedToUserId"
                          className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary)]"
                          aria-label="Assignee"
                        >
                          <option value="">Unassigned</option>
                          {crewOptions.map((o) => (
                            <option key={o.value} value={o.value}>
                              {o.label}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          type="submit"
                          size="sm"
                          disabled={busy === `dt-add-${mt.id}`}
                        >
                          {busy === `dt-add-${mt.id}` ? "Adding…" : "Add step"}
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          onClick={() => setOpenDtFor(null)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setOpenDtFor(mt.id)}
                      className="mt-2 text-xs font-medium text-[var(--color-amber)] hover:underline"
                    >
                      + Add daily step
                    </button>
                  )}
                </div>
              ))}
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
