"use client";

import { useState, useEffect, useCallback } from "react";
import { Clock, Play, Square, MapPin, FileText } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import { Input } from "@/components/ui/Input";
import { cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const projects = [
  { value: "smith", label: "Smith Residence" },
  { value: "johnson", label: "Johnson Commercial" },
  { value: "williams", label: "Williams Estate" },
  { value: "davis", label: "Davis Home" },
];

const dailyTasks = [
  { value: "", label: "No specific task" },
  { value: "dt-001", label: "Tear off shingles — front slope" },
  { value: "dt-002", label: "Install underlayment" },
  { value: "dt-003", label: "Replace ridge vent" },
  { value: "dt-004", label: "Inspect flashing around chimney" },
];

const recentTimeEntries = [
  { id: "te-1", project: "Smith Residence", task: "Tear off shingles", start: "6:58 AM", end: "2:30 PM", total: "7h 32m" },
  { id: "te-2", project: "Johnson Commercial", task: "Remove old ridge vent", start: "7:15 AM", end: "3:45 PM", total: "8h 30m" },
  { id: "te-3", project: "Smith Residence", task: "Install underlayment", start: "6:45 AM", end: "3:00 PM", total: "8h 15m" },
];

// ── Helpers ─────────────────────────────────────────────────

function formatElapsed(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

function formatDuration(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// ── Clock display sub-component ─────────────────────────────

function CircularTimer({ elapsedSeconds, isClockedIn }: { elapsedSeconds: number; isClockedIn: boolean }) {
  // SVG ring progress: max 8 hours (28800 seconds)
  const maxSeconds = 28800; // 8h
  const progress = Math.min(elapsedSeconds / maxSeconds, 1);
  const circumference = 2 * Math.PI * 120;
  const dashOffset = circumference * (1 - progress);

  return (
    <div className="flex flex-col items-center justify-center py-6">
      <div className="relative flex items-center justify-center">
        {/* SVG ring */}
        <svg width="280" height="280" viewBox="0 0 280 280" className="-rotate-90">
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="10"
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={isClockedIn ? "var(--color-amber)" : "#e2e8f0"}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={dashOffset}
            className="transition-all duration-1000"
          />
        </svg>

        {/* Center content */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          {isClockedIn ? (
            <>
              <div className="mb-1 flex h-3 w-3 rounded-full bg-green-500 animate-pulse" />
              <span className="font-mono text-3xl font-bold tracking-tight text-[var(--color-primary)]">
                {formatElapsed(elapsedSeconds)}
              </span>
              <span className="mt-1 text-xs text-gray-400">Clocked in</span>
            </>
          ) : (
            <>
              <Clock className="mb-2 h-10 w-10 text-gray-300" />
              <span className="text-lg font-semibold text-gray-400">Not Clocked In</span>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ────────────────────────────────────────────────────

export default function CrewClockInPage() {
  const [isClockedIn, setIsClockedIn] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [selectedProject, setSelectedProject] = useState(projects[0].value);
  const [selectedTask, setSelectedTask] = useState("");
  const [notes, setNotes] = useState("");
  const [clockHistory, setClockHistory] = useState<{ time: string; elapsed: number; project: string; task: string }[]>([]);

  // Timer tick
  useEffect(() => {
    if (!isClockedIn) return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isClockedIn]);

  const handleClockIn = useCallback(() => {
    setIsClockedIn(true);
    setElapsedSeconds(0);
  }, []);

  const handleClockOut = useCallback(() => {
    setClockHistory((prev) => [
      {
        time: new Date().toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" }),
        elapsed: elapsedSeconds,
        project: projects.find((p) => p.value === selectedProject)?.label ?? "",
        task: dailyTasks.find((t) => t.value === selectedTask)?.label ?? "",
      },
      ...prev,
    ]);
    setIsClockedIn(false);
    setElapsedSeconds(0);
    setNotes("");
  }, [elapsedSeconds, selectedProject, selectedTask]);

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-4 text-xl font-bold text-[var(--color-primary)]">Clock In</h1>

      {/* Timer ring */}
      <CircularTimer elapsedSeconds={elapsedSeconds} isClockedIn={isClockedIn} />

      {/* Toggle */}
      <div className="mb-5">
        {isClockedIn ? (
          <Button
            size="lg"
            onClick={handleClockOut}
            className="w-full gap-2 bg-red-500 hover:bg-red-600 text-white border-none"
          >
            <Square className="h-4 w-4" />
            Clock Out ({formatDuration(elapsedSeconds)})
          </Button>
        ) : (
          <Button size="lg" onClick={handleClockIn} className="w-full gap-2">
            <Play className="h-4 w-4" />
            Clock In
          </Button>
        )}
      </div>

      {/* Selectors */}
      <Card className="mb-4">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            {isClockedIn ? "Currently Working On" : "Select Project & Task"}
          </h3>
        </CardHeader>
        <CardContent className="space-y-3">
          <Select
            label="Project"
            options={projects}
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            disabled={isClockedIn}
          />
          <Select
            label="Task (optional)"
            options={dailyTasks}
            value={selectedTask}
            onChange={(e) => setSelectedTask(e.target.value)}
            disabled={isClockedIn}
          />
        </CardContent>
      </Card>

      {/* Notes */}
      <Card className="mb-5">
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">
            <FileText className="mr-1.5 inline h-4 w-4" />
            Notes
          </h3>
        </CardHeader>
        <CardContent>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            className="w-full rounded-lg border border-[var(--color-border)] p-3 text-sm text-[var(--color-primary)] placeholder:text-gray-400 focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20 transition resize-none"
            placeholder="What are you working on?"
          />
        </CardContent>
      </Card>

      {/* Recent time entries */}
      <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
        Recent Time Entries
      </h2>

      {/* Today's clock-ins (from session state) */}
      {clockHistory.length > 0 && (
        <div className="mb-4 space-y-2">
          {clockHistory.map((entry, i) => (
            <Card key={i}>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-green-600">Today &bull; {entry.time}</p>
                    <p className="mt-0.5 truncate text-xs text-gray-400">
                      {entry.project}{entry.task ? ` · ${entry.task}` : ""}
                    </p>
                  </div>
                  <span className="ml-2 text-sm font-mono font-semibold text-[var(--color-primary)]">
                    {formatDuration(entry.elapsed)}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Historical entries */}
      <div className="space-y-2">
        {recentTimeEntries.map((entry) => (
          <Card key={entry.id}>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-[var(--color-primary)]">
                    {entry.project}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {entry.task} &bull; {entry.start} – {entry.end}
                  </p>
                </div>
                <span className="ml-2 text-sm font-mono font-semibold text-[var(--color-primary)]">
                  {entry.total}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
