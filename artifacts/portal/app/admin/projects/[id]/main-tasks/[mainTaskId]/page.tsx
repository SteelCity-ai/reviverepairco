"use client";

import { useEffect, useState, use, type FormEvent } from "react";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, Circle, Pencil, Trash2, UserCircle } from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { StatusBadge } from "@/components/ui/Badge";
import AISuggestDailyTasks from "../../AISuggestDailyTasks";

interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
  role: string;
}

interface DailyTaskRow {
  id: string;
  title: string;
  description: string | null;
  scheduledDate: string | null;
  status: "NOT_STARTED" | "DONE";
  assignedToUserId: string | null;
  crewNotes: string | null;
  hoursLogged: string | null;
}

interface MainTaskRow {
  id: string;
  workTypeId: string;
  name: string;
  description: string | null;
  status: string;
  startDate: string | null;
  endDate: string | null;
  dailyTasks: DailyTaskRow[];
}

export default function AdminMainTaskPage({
  params,
}: {
  params: Promise<{ id: string; mainTaskId: string }>;
}) {
  const { id: projectId, mainTaskId } = use(params);
  const { api } = useApi();

  const [mainTask, setMainTask] = useState<MainTaskRow | null>(null);
  const [crew, setCrew] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Form state
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [mt, users] = await Promise.all([
        api<MainTaskRow>(`/main-tasks/${mainTaskId}`),
        api<UserProfile[]>(`/users`),
      ]);
      setMainTask(mt);
      setCrew((users ?? []).filter((u) => u.role === "CREW" || u.role === "ADMIN"));
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mainTaskId]);

  async function run(key: string, fn: () => Promise<unknown>) {
    setBusy(key);
    setError(null);
    try {
      await fn();
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function addDailyTask(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const form = e.currentTarget;
    await run("add", async () => {
      await api("/daily-tasks", {
        method: "POST",
        body: {
          mainTaskId,
          title: String(fd.get("title") ?? "").trim(),
          scheduledDate: String(fd.get("scheduledDate") ?? "") || undefined,
          assignedToUserId: String(fd.get("assignedToUserId") ?? "") || undefined,
          description: String(fd.get("description") ?? "").trim() || undefined,
        },
      });
      form.reset();
      setShowAddForm(false);
    });
  }

  async function saveDailyTask(dt: DailyTaskRow, e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    await run(`save-${dt.id}`, async () => {
      await api(`/daily-tasks/${dt.id}`, {
        method: "PATCH",
        body: {
          title: String(fd.get("title") ?? "").trim(),
          scheduledDate: String(fd.get("scheduledDate") ?? "") || null,
          assignedToUserId: String(fd.get("assignedToUserId") ?? "") || null,
          description: String(fd.get("description") ?? "").trim() || undefined,
        },
      });
      setEditingId(null);
    });
  }

  async function deleteDailyTask(dt: DailyTaskRow) {
    if (!confirm(`Delete "${dt.title}"?`)) return;
    await run(`del-${dt.id}`, async () => {
      await api(`/daily-tasks/${dt.id}`, { method: "DELETE" });
    });
  }

  async function toggleComplete(dt: DailyTaskRow) {
    await run(`toggle-${dt.id}`, async () => {
      if (dt.status === "DONE") {
        await api(`/daily-tasks/${dt.id}/uncomplete`, { method: "POST" });
      } else {
        await api(`/daily-tasks/${dt.id}/complete`, { method: "POST" });
      }
    });
  }

  if (!mainTask && !error) {
    return <div className="px-6 py-8 text-sm text-gray-400">Loading…</div>;
  }
  if (error && !mainTask) {
    return <div className="px-6 py-8 text-sm text-red-500">{error}</div>;
  }
  if (!mainTask) return null;

  const total = mainTask.dailyTasks.length;
  const done = mainTask.dailyTasks.filter((dt) => dt.status === "DONE").length;

  function crewName(userId: string | null) {
    if (!userId) return null;
    return crew.find((u) => u.id === userId)?.displayName ?? crew.find((u) => u.id === userId)?.email ?? "Crew";
  }

  return (
    <div className="animate-fade-in-up mx-auto max-w-3xl px-4 py-6 sm:px-6">
      {/* Breadcrumb */}
      <nav className="mb-5 flex items-center gap-2 text-sm text-gray-400">
        <Link href="/admin/projects" className="hover:text-[var(--color-amber)] transition">
          Projects
        </Link>
        <span>/</span>
        <Link href={`/admin/projects/${projectId}?tab=work`} className="hover:text-[var(--color-amber)] transition">
          Project
        </Link>
        <span>/</span>
        <span className="text-[var(--color-primary)]">{mainTask.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">{mainTask.name}</h1>
            <StatusBadge status={mainTask.status} />
          </div>
          {mainTask.description && (
            <p className="mt-1 text-sm text-gray-500">{mainTask.description}</p>
          )}
          {(mainTask.startDate || mainTask.endDate) && (
            <p className="mt-1 text-xs text-gray-400">
              {mainTask.startDate ?? "—"} → {mainTask.endDate ?? "—"}
            </p>
          )}
        </div>
        <Link href={`/admin/projects/${projectId}?tab=work`}>
          <Button variant="secondary" size="sm">
            <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
            Back to Work
          </Button>
        </Link>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="mb-6">
          <div className="mb-1.5 flex items-center justify-between text-sm">
            <span className="font-medium text-[var(--color-primary)]">Progress</span>
            <span className="text-gray-500">{done} / {total} steps done</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[var(--color-amber)] transition-all"
              style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Daily task checklist */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between gap-3">
            <h2 className="font-semibold text-[var(--color-primary)]">
              Daily Steps {total > 0 && <span className="ml-1 text-sm font-normal text-gray-400">({total})</span>}
            </h2>
            <div className="flex items-center gap-3">
              {!showAddForm && (
                <Button size="sm" onClick={() => setShowAddForm(true)}>
                  + Add Step
                </Button>
              )}
            </div>
          </div>
          {/* AI suggestion panel — sits below the header, above checklist */}
          <div className="mt-3">
            <AISuggestDailyTasks mainTaskId={mainTaskId} onAdded={refresh} />
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {mainTask.dailyTasks.length === 0 && !showAddForm && (
            <p className="py-4 text-center text-sm text-gray-400">
              No steps yet — add the first one above.
            </p>
          )}

          <ul className="space-y-2">
            {mainTask.dailyTasks.map((dt) => (
              <li
                key={dt.id}
                className="rounded-lg border border-[var(--color-border)] bg-white"
              >
                {editingId === dt.id ? (
                  <form
                    onSubmit={(e) => saveDailyTask(dt, e)}
                    className="space-y-2 p-3"
                  >
                    <Input name="title" defaultValue={dt.title} required placeholder="Step title" />
                    <Input name="description" defaultValue={dt.description ?? ""} placeholder="Description (optional)" />
                    <div className="grid grid-cols-2 gap-2">
                      <Input name="scheduledDate" type="date" defaultValue={dt.scheduledDate ?? ""} aria-label="Scheduled date" />
                      <select
                        name="assignedToUserId"
                        defaultValue={dt.assignedToUserId ?? ""}
                        className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary)]"
                      >
                        <option value="">Unassigned</option>
                        {crew.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.displayName ?? u.email ?? u.id}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="flex gap-2">
                      <Button type="submit" size="sm" disabled={busy === `save-${dt.id}`}>
                        {busy === `save-${dt.id}` ? "Saving…" : "Save"}
                      </Button>
                      <Button type="button" size="sm" variant="secondary" onClick={() => setEditingId(null)}>
                        Cancel
                      </Button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-center gap-3 px-3 py-2.5">
                    {/* Checkbox */}
                    <button
                      type="button"
                      onClick={() => toggleComplete(dt)}
                      disabled={!!busy}
                      className="shrink-0 text-[var(--color-amber)] transition hover:scale-110 disabled:opacity-40"
                      title={dt.status === "DONE" ? "Mark not started" : "Mark done"}
                    >
                      {dt.status === "DONE" ? (
                        <CheckCircle2 className="h-5 w-5" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </button>

                    {/* Content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          dt.status === "DONE"
                            ? "text-gray-400 line-through"
                            : "text-[var(--color-primary)]"
                        }`}
                      >
                        {dt.title}
                      </p>
                      <div className="mt-0.5 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                        {dt.scheduledDate && <span>{dt.scheduledDate}</span>}
                        {dt.assignedToUserId && (
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3" />
                            {crewName(dt.assignedToUserId)}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-1">
                      <button
                        type="button"
                        onClick={() => setEditingId(dt.id)}
                        className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-[var(--color-primary)]"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteDailyTask(dt)}
                        disabled={busy === `del-${dt.id}`}
                        className="rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-600 disabled:opacity-40"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>

          {/* Add form */}
          {showAddForm && (
            <form onSubmit={addDailyTask} className="mt-3 space-y-2 rounded-lg border border-dashed border-[var(--color-border)] p-3">
              <Input name="title" placeholder="Step title (e.g. Strip south slope)" required autoFocus />
              <Input name="description" placeholder="Description (optional)" />
              <div className="grid grid-cols-2 gap-2">
                <Input name="scheduledDate" type="date" aria-label="Scheduled date" />
                <select
                  name="assignedToUserId"
                  className="rounded-lg border border-[var(--color-border)] bg-white px-3 py-2 text-sm text-[var(--color-primary)]"
                  aria-label="Assignee"
                >
                  <option value="">Unassigned</option>
                  {crew.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.displayName ?? u.email ?? u.id}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2">
                <Button type="submit" size="sm" disabled={busy === "add"}>
                  {busy === "add" ? "Adding…" : "Add Step"}
                </Button>
                <Button type="button" size="sm" variant="secondary" onClick={() => setShowAddForm(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
