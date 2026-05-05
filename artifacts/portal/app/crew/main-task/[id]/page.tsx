"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Camera, CheckCircle2, Circle, UserCircle } from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";

interface DailyTaskRow {
  id: string;
  title: string;
  description: string | null;
  scheduledDate: string | null;
  status: "NOT_STARTED" | "DONE";
  assignedToUserId: string | null;
  crewNotes: string | null;
}

interface MainTaskRow {
  id: string;
  name: string;
  description: string | null;
  status: string;
  dailyTasks: DailyTaskRow[];
}

interface UserProfile {
  id: string;
  displayName: string | null;
  email: string | null;
}

export default function CrewMainTaskChecklist({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const { api, upload } = useApi();

  const [mainTask, setMainTask] = useState<MainTaskRow | null>(null);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);

  const refresh = async () => {
    try {
      const [mt, userList] = await Promise.all([
        api<MainTaskRow>(`/main-tasks/${id}`),
        api<UserProfile[]>(`/users/directory`).catch(() => [] as UserProfile[]),
      ]);
      setMainTask(mt);
      setUsers(userList ?? []);
    } catch (e) {
      setError((e as Error).message);
    }
  };

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function toggleComplete(dt: DailyTaskRow) {
    setBusy(dt.id);
    try {
      if (dt.status === "DONE") {
        await api(`/daily-tasks/${dt.id}/uncomplete`, { method: "POST" });
      } else {
        await api(`/daily-tasks/${dt.id}/complete`, { method: "POST" });
      }
      await refresh();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function handlePhoto(dtId: string, e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFor(dtId);
    try {
      const fd = new FormData();
      fd.append("file", file);
      await upload(`/daily-tasks/${dtId}/photos`, fd);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingFor(null);
      e.target.value = "";
    }
  }

  function userName(userId: string | null) {
    if (!userId) return null;
    const u = users.find((u) => u.id === userId);
    return u?.displayName ?? u?.email ?? null;
  }

  if (!mainTask && !error) {
    return <div className="px-4 py-8 text-sm text-gray-400">Loading…</div>;
  }
  if (error && !mainTask) {
    return <div className="px-4 py-8 text-sm text-red-500">{error}</div>;
  }
  if (!mainTask) return null;

  const total = mainTask.dailyTasks.length;
  const done = mainTask.dailyTasks.filter((dt) => dt.status === "DONE").length;

  return (
    <div className="animate-fade-in-up px-4 py-5">
      {/* Back */}
      <Link
        href="/crew/today"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[var(--color-amber)] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Today
      </Link>

      {/* Header */}
      <div className="mb-1 flex items-start justify-between gap-3">
        <h1 className="text-lg font-bold text-[var(--color-primary)]">{mainTask.name}</h1>
        <StatusBadge status={mainTask.status} />
      </div>
      {mainTask.description && (
        <p className="mb-3 text-sm text-gray-500">{mainTask.description}</p>
      )}

      {/* Progress */}
      {total > 0 && (
        <div className="mb-5">
          <div className="mb-1 flex items-center justify-between text-xs text-gray-500">
            <span>{done} of {total} steps done</span>
            <span>{total > 0 ? Math.round((done / total) * 100) : 0}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[var(--color-amber)] transition-all"
              style={{ width: total ? `${(done / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-500">{error}</p>}

      {total === 0 ? (
        <Card>
          <CardContent>
            <p className="py-4 text-center text-sm text-gray-400">
              No steps have been added to this task yet.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <h2 className="text-sm font-semibold text-[var(--color-primary)]">Checklist</h2>
          </CardHeader>
          <CardContent className="pt-0">
            <ul className="divide-y divide-[var(--color-border)]">
              {mainTask.dailyTasks.map((dt) => (
                <li key={dt.id} className="py-3">
                  <div className="flex items-start gap-3">
                    {/* Checkbox button */}
                    <button
                      type="button"
                      onClick={() => toggleComplete(dt)}
                      disabled={busy === dt.id}
                      className="mt-0.5 shrink-0 transition hover:scale-110 disabled:opacity-40"
                      title={dt.status === "DONE" ? "Mark not started" : "Mark done"}
                    >
                      {dt.status === "DONE" ? (
                        <CheckCircle2 className="h-5 w-5 text-[var(--color-amber)]" />
                      ) : (
                        <Circle className="h-5 w-5 text-gray-300" />
                      )}
                    </button>

                    {/* Text content */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium leading-snug ${
                          dt.status === "DONE"
                            ? "text-gray-400 line-through"
                            : "text-[var(--color-primary)]"
                        }`}
                      >
                        {dt.title}
                      </p>
                      {dt.description && (
                        <p className="mt-0.5 text-xs text-gray-500">{dt.description}</p>
                      )}
                      <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-400">
                        {dt.scheduledDate && <span>{dt.scheduledDate}</span>}
                        {dt.assignedToUserId && (
                          <span className="flex items-center gap-1">
                            <UserCircle className="h-3 w-3" />
                            {userName(dt.assignedToUserId) ?? "Assigned"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Photo button */}
                    <label className="shrink-0 cursor-pointer">
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={(e) => handlePhoto(dt.id, e)}
                        disabled={!!uploadingFor}
                        className="hidden"
                      />
                      <span
                        className={`inline-flex items-center justify-center rounded-lg border border-[var(--color-border)] bg-white p-1.5 transition hover:bg-gray-50 ${
                          uploadingFor === dt.id ? "opacity-50" : ""
                        }`}
                        title="Add photo"
                      >
                        <Camera className="h-4 w-4 text-gray-400" />
                      </span>
                    </label>
                  </div>

                  {/* View full task link */}
                  <div className="ml-8 mt-1">
                    <Link
                      href={`/crew/task/${dt.id}`}
                      className="text-xs text-[var(--color-amber)] hover:underline"
                    >
                      View details & notes →
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
