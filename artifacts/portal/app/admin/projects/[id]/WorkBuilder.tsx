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

export default function WorkBuilder({ projectId, workTypes, crew }: Props) {
  const { api } = useApi();
  const router = useRouter();
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showWtForm, setShowWtForm] = useState(false);
  const [openMtFor, setOpenMtFor] = useState<string | null>(null);
  const [openDtFor, setOpenDtFor] = useState<string | null>(null);

  const crewOptions = useMemo(
    () =>
      crew
        .filter((u) => u.role === "CREW" || u.role === "ADMIN")
        .map((u) => ({ value: u.id, label: u.displayName ?? u.email ?? u.id })),
    [crew],
  );

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
    await run(`mt-${workTypeId}`, async () => {
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
    await run(`dt-${mainTaskId}`, async () => {
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-[var(--color-primary)]">
                {wt.name}
              </span>
              <StatusBadge status={wt.status} />
            </div>
            <span className="text-xs text-gray-400">
              {wt.mainTasks.length} main task
              {wt.mainTasks.length !== 1 ? "s" : ""}
            </span>
          </div>
          {wt.description && (
            <p className="text-sm text-gray-500">{wt.description}</p>
          )}

          {wt.mainTasks.length > 0 && (
            <div className="space-y-2 border-t border-[var(--color-border)] pt-3">
              {wt.mainTasks.map((mt) => (
                <div
                  key={mt.id}
                  className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[var(--color-primary)]">
                        {mt.name}
                      </span>
                      <StatusBadge status={mt.status} />
                    </div>
                    <span className="text-xs text-gray-400">
                      {mt.dailyTasks.length} daily step
                      {mt.dailyTasks.length !== 1 ? "s" : ""}
                    </span>
                  </div>

                  {mt.dailyTasks.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-gray-600">
                      {mt.dailyTasks.map((dt) => (
                        <li
                          key={dt.id}
                          className="flex items-center justify-between rounded bg-white px-2 py-1"
                        >
                          <span>
                            {dt.status === "DONE" ? "✅ " : "◻️ "}
                            {dt.title}
                            {dt.scheduledDate && (
                              <span className="ml-2 text-gray-400">
                                {dt.scheduledDate}
                              </span>
                            )}
                          </span>
                          {dt.assignedToUserId && (
                            <span className="text-gray-400">
                              {crew.find(
                                (u) => u.id === dt.assignedToUserId,
                              )?.displayName ?? "—"}
                            </span>
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
                          disabled={busy === `dt-${mt.id}`}
                        >
                          {busy === `dt-${mt.id}` ? "Adding…" : "Add step"}
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
                  disabled={busy === `mt-${wt.id}`}
                >
                  {busy === `mt-${wt.id}` ? "Adding…" : "Add task"}
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
