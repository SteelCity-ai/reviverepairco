"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Play, Square } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { useApi } from "@/lib/api-browser";

type Project = { id: string; name: string };
type DailyTask = { id: string; title: string };
type TimeEntry = {
  id: string;
  projectId: string;
  dailyTaskId?: string | null;
  clockIn: string;
  clockOut?: string | null;
};

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDuration(ms: number): string {
  const minutes = Math.max(0, Math.floor(ms / 60000));
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h ? `${h}h ${m}m` : `${m}m`;
}

export default function CrewClockInPage() {
  const { api } = useApi();
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<DailyTask[]>([]);
  const [entries, setEntries] = useState<TimeEntry[]>([]);
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [selectedProject, setSelectedProject] = useState("");
  const [selectedTask, setSelectedTask] = useState("");
  const [loading, setLoading] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const [p, t, e] = await Promise.all([
        api<Project[]>("/projects"),
        api<DailyTask[]>("/daily-tasks"),
        api<TimeEntry[]>("/time-entries"),
      ]);
      setProjects(p ?? []);
      setTasks(t ?? []);
      const list = e ?? [];
      setEntries(list);
      const open = list.find((x) => !x.clockOut) ?? null;
      setActiveEntry(open);
      if (open) setSelectedProject(open.projectId);
    } catch {
      /* surfaced via UI loading state */
    }
  }, [api]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    if (!activeEntry) {
      setElapsed(0);
      return;
    }
    const start = new Date(activeEntry.clockIn).getTime();
    const tick = () => setElapsed(Math.floor((Date.now() - start) / 1000));
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, [activeEntry]);

  const onClockIn = useCallback(async () => {
    if (!selectedProject) return;
    setLoading(true);
    try {
      await api<TimeEntry>("/time-entries/clock-in", {
        method: "POST",
        body: {
          projectId: selectedProject,
          dailyTaskId: selectedTask || undefined,
        },
      });
      await loadData();
    } finally {
      setLoading(false);
    }
  }, [api, selectedProject, selectedTask, loadData]);

  const onClockOut = useCallback(async () => {
    if (!activeEntry) return;
    setLoading(true);
    try {
      await api(`/time-entries/${activeEntry.id}/clock-out`, { method: "POST" });
      await loadData();
    } finally {
      setLoading(false);
    }
  }, [api, activeEntry, loadData]);

  const isClockedIn = !!activeEntry;
  const projectOptions = [
    { value: "", label: "Select project…" },
    ...projects.map((p) => ({ value: p.id, label: p.name })),
  ];
  const taskOptions = [
    { value: "", label: "No specific task" },
    ...tasks.map((t) => ({ value: t.id, label: t.title })),
  ];
  const completedEntries = entries.filter((e) => e.clockOut);

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-4 text-xl font-bold text-[var(--color-primary)]">Clock In</h1>

      <Card className="mb-5">
        <CardContent className="flex flex-col items-center py-6">
          {isClockedIn ? (
            <>
              <div className="mb-2 flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-3xl font-bold text-[var(--color-primary)]">
                {formatElapsed(elapsed)}
              </span>
              <span className="mt-1 text-xs text-gray-400">Clocked in</span>
            </>
          ) : (
            <>
              <Clock className="mb-2 h-10 w-10 text-gray-300" />
              <span className="text-lg font-semibold text-gray-400">Not Clocked In</span>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mb-5">
        {isClockedIn ? (
          <Button
            size="lg"
            onClick={onClockOut}
            disabled={loading}
            className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white border-none"
          >
            <Square className="h-4 w-4" /> Clock Out
          </Button>
        ) : (
          <Button
            size="lg"
            onClick={onClockIn}
            disabled={loading || !selectedProject}
            className="w-full gap-2"
          >
            <Play className="h-4 w-4" /> Clock In
          </Button>
        )}
      </div>

      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            {isClockedIn ? "Currently Working On" : "Select Project & Task"}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            label="Project"
            options={projectOptions}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={isClockedIn}
          />
          <Select
            label="Task (optional)"
            options={taskOptions}
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            disabled={isClockedIn}
          />
        </CardContent>
      </Card>

      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Recent Time Entries
      </h2>
      <div className="space-y-2">
        {completedEntries.length === 0 ? (
          <p className="text-sm text-gray-400">No completed entries yet.</p>
        ) : (
          completedEntries.map((e) => {
            const proj = projects.find((p) => p.id === e.projectId);
            const dur =
              e.clockOut
                ? new Date(e.clockOut).getTime() - new Date(e.clockIn).getTime()
                : 0;
            return (
              <Card key={e.id}>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                        {proj?.name ?? "Project"}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400">
                        {new Date(e.clockIn).toLocaleString()}
                      </p>
                    </div>
                    <span className="ml-2 font-mono text-sm font-semibold text-[var(--color-primary)]">
                      {formatDuration(dur)}
                    </span>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
