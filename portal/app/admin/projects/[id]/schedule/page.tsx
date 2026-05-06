"use client";

import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Select } from "@/components/ui/Select";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type TaskStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | "PM_REVIEW";
type WorkType = "DEMOLITION" | "FRAMING" | "ROOFING" | "SIDING" | "GUTTERS" | "INSULATION" | "DRYWALL" | "PAINTING" | "ALL";

interface GanttTask {
  id: string;
  name: string;
  workType: WorkType;
  status: TaskStatus;
  startDate: Date;
  endDate: Date;
  dependsOn: string | null;
  assignee: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_TASKS: GanttTask[] = [
  {
    id: "t1",
    name: "Tear-off existing shingles",
    workType: "DEMOLITION",
    status: "COMPLETE",
    startDate: new Date("2026-04-01"),
    endDate: new Date("2026-04-05"),
    dependsOn: null,
    assignee: "Carlos M.",
  },
  {
    id: "t2",
    name: "Inspect & replace decking",
    workType: "FRAMING",
    status: "COMPLETE",
    startDate: new Date("2026-04-06"),
    endDate: new Date("2026-04-09"),
    dependsOn: "t1",
    assignee: "Javier R.",
  },
  {
    id: "t3",
    name: "Install ice & water shield",
    workType: "ROOFING",
    status: "IN_PROGRESS",
    startDate: new Date("2026-04-10"),
    endDate: new Date("2026-04-16"),
    dependsOn: "t2",
    assignee: "Marcus T.",
  },
  {
    id: "t4",
    name: "Install asphalt shingles",
    workType: "ROOFING",
    status: "NOT_STARTED",
    startDate: new Date("2026-04-17"),
    endDate: new Date("2026-04-26"),
    dependsOn: "t3",
    assignee: "Marcus T.",
  },
  {
    id: "t5",
    name: "Install ridge vents & flashing",
    workType: "ROOFING",
    status: "NOT_STARTED",
    startDate: new Date("2026-04-27"),
    endDate: new Date("2026-04-30"),
    dependsOn: "t4",
    assignee: "Carlos M.",
  },
  {
    id: "t6",
    name: "Replace fascia boards",
    workType: "SIDING",
    status: "IN_PROGRESS",
    startDate: new Date("2026-04-14"),
    endDate: new Date("2026-04-22"),
    dependsOn: "t2",
    assignee: "Javier R.",
  },
  {
    id: "t7",
    name: "Install seamless gutters",
    workType: "GUTTERS",
    status: "NOT_STARTED",
    startDate: new Date("2026-05-01"),
    endDate: new Date("2026-05-04"),
    dependsOn: "t5",
    assignee: "Marcus T.",
  },
  {
    id: "t8",
    name: "Final inspection & cleanup",
    workType: "ROOFING",
    status: "PM_REVIEW",
    startDate: new Date("2026-05-05"),
    endDate: new Date("2026-05-07"),
    dependsOn: "t7",
    assignee: "PM - Sarah",
  },
];

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<TaskStatus, string> = {
  NOT_STARTED: "bg-gray-300 text-gray-700",
  IN_PROGRESS: "bg-amber-400 text-[#1a202c]",
  COMPLETE: "bg-emerald-500 text-white",
  PM_REVIEW: "bg-purple-400 text-white",
};

const STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETE: "Complete",
  PM_REVIEW: "PM Review",
};

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  DEMOLITION: "Demolition",
  FRAMING: "Framing",
  ROOFING: "Roofing",
  SIDING: "Siding",
  GUTTERS: "Gutters",
  INSULATION: "Insulation",
  DRYWALL: "Drywall",
  PAINTING: "Painting",
  ALL: "All Work Types",
};

const COLORS = {
  primary: "#1a202c",
  amber: "#d69e2e",
};

const BAR_HEIGHT = 32;
const ROW_HEIGHT = 56;
const HEADER_HEIGHT = 48;
const LEFT_PANEL_WIDTH = 280;
const DAY_WIDTH = 36;

// ── Helpers ────────────────────────────────────────────────────────────────

function daysBetween(a: Date, b: Date): number {
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function isToday(d: Date): boolean {
  const now = new Date();
  return (
    d.getFullYear() === now.getFullYear() &&
    d.getMonth() === now.getMonth() &&
    d.getDate() === now.getDate()
  );
}

function formatMonthYear(d: Date): string {
  return d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

type DatedGridCol = {
  date: Date;
  label: string;
  isMonthStart: boolean;
};

// ── Component ──────────────────────────────────────────────────────────────

export default function SchedulePage() {
  const [filter, setFilter] = useState<WorkType>("ALL");
  const [scrollLeft, setScrollLeft] = useState(0);
  const [tooltip, setTooltip] = useState<{ x: number; y: number; task: GanttTask } | null>(null);

  const gridContainerRef = useRef<HTMLDivElement>(null);

  const filteredTasks = useMemo(
    () =>
      filter === "ALL"
        ? MOCK_TASKS
        : MOCK_TASKS.filter((t) => t.workType === filter),
    [filter],
  );

  // Calculate date range
  const { minDate, maxDate, totalCols, gridCols } = useMemo(() => {
    const all = MOCK_TASKS;
    if (all.length === 0) {
      const now = new Date();
      return {
        minDate: now,
        maxDate: addDays(now, 90),
        totalCols: 91,
        gridCols: [] as DatedGridCol[],
      };
    }
    let min = new Date(Math.min(...all.map((t) => t.startDate.getTime())));
    let max = new Date(Math.max(...all.map((t) => t.endDate.getTime())));
    min = addDays(startOfDay(min), -3);
    max = addDays(startOfDay(max), 7);
    const total = daysBetween(min, max) + 1;
    const cols: DatedGridCol[] = [];
    for (let i = 0; i < total; i++) {
      const d = addDays(min, i);
      cols.push({
        date: d,
        label: d.getDate().toString(),
        isMonthStart: d.getDate() === 1,
      });
    }
    return { minDate: min, maxDate: max, totalCols: total, gridCols: cols };
  }, []);

  const totalGridWidth = totalCols * DAY_WIDTH;

  // Track scroll
  const handleScroll = useCallback(() => {
    if (gridContainerRef.current) {
      setScrollLeft(gridContainerRef.current.scrollLeft);
    }
  }, []);

  // Today marker
  const todayOffset = useMemo(() => {
    const today = startOfDay(new Date());
    const offset = daysBetween(minDate, today);
    if (offset < 0 || offset > totalCols) return -1;
    return offset * DAY_WIDTH + DAY_WIDTH / 2;
  }, [minDate, totalCols]);

  // Dependency lines
  const dependencyLines = useMemo(() => {
    return filteredTasks
      .filter((t) => t.dependsOn)
      .map((t) => {
        const dep = filteredTasks.find((dt) => dt.id === t.dependsOn);
        if (!dep) return null;
        const fromIdx = filteredTasks.indexOf(dep);
        const toIdx = filteredTasks.indexOf(t);
        const fromEnd = daysBetween(minDate, dep.endDate) * DAY_WIDTH + DAY_WIDTH;
        const fromY = fromIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
        const toStart = daysBetween(minDate, t.startDate) * DAY_WIDTH;
        const toY = toIdx * ROW_HEIGHT + ROW_HEIGHT / 2;
        const midX = (fromEnd + toStart) / 2;
        return { fromEnd, fromY, toStart, toY, midX, depId: dep.id, taskId: t.id };
      })
      .filter(Boolean) as {
      fromEnd: number;
      fromY: number;
      toStart: number;
      toY: number;
      midX: number;
      depId: string;
      taskId: string;
    }[];
  }, [filteredTasks, minDate]);

  // Work type filter options
  const workTypeOptions = (Object.keys(WORK_TYPE_LABELS) as WorkType[]).map((k) => ({
    value: k,
    label: WORK_TYPE_LABELS[k],
  }));

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Project Schedule</h1>
          <p className="text-sm text-gray-500 mt-1">
            Meadow Lane Residence — Roof Replacement
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select
            value={filter}
            onChange={(e) => setFilter(e.target.value as WorkType)}
            options={workTypeOptions}
          />
          <Button className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500">
            Export PDF
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-sm">
        <span className="text-gray-500 font-medium">Status:</span>
        {(Object.keys(STATUS_LABELS) as TaskStatus[]).map((s) => (
          <span key={s} className="flex items-center gap-1.5">
            <span className={cn("w-3 h-3 rounded-full", STATUS_COLORS[s].split(" ")[0])} />
            {STATUS_LABELS[s]}
          </span>
        ))}
      </div>

      {/* Gantt Container */}
      <div className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm overflow-hidden">
        {/* Header Row */}
        <div className="flex border-b border-gray-200" style={{ height: HEADER_HEIGHT }}>
          {/* Left panel header */}
          <div
            className="flex-shrink-0 bg-[#f7fafc] border-r border-gray-200 px-4 flex items-center font-semibold text-sm text-[#1a202c]"
            style={{ width: LEFT_PANEL_WIDTH }}
          >
            Task
          </div>
          {/* Grid header */}
          <div className="flex-1 overflow-hidden relative" ref={gridContainerRef} onScroll={handleScroll}>
            <div className="flex" style={{ width: totalGridWidth }}>
              {gridCols.map((col, i) => (
                <div
                  key={i}
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center text-xs text-gray-500 bg-[#f7fafc] border-r border-gray-100",
                    col.isMonthStart && "border-r-gray-300 font-semibold text-[#1a202c]",
                  )}
                  style={{ width: DAY_WIDTH, height: HEADER_HEIGHT }}
                >
                  {col.isMonthStart ? formatMonthYear(col.date) : col.label}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex" style={{ height: Math.max(filteredTasks.length * ROW_HEIGHT + 8, 200) }}>
          {/* Task list panel */}
          <div
            className="flex-shrink-0 border-r border-gray-200 bg-white overflow-y-auto"
            style={{ width: LEFT_PANEL_WIDTH }}
          >
            {filteredTasks.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-gray-400">
                No tasks match filter
              </div>
            ) : (
              filteredTasks.map((task, idx) => (
                <div
                  key={task.id}
                  className={cn(
                    "flex items-center gap-2 px-4 border-b border-gray-100",
                    idx % 2 === 0 ? "bg-white" : "bg-[#f7fafc]",
                  )}
                  style={{ height: ROW_HEIGHT }}
                >
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full flex-shrink-0",
                      STATUS_COLORS[task.status].split(" ")[0],
                    )}
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[#1a202c] truncate">
                      {task.name}
                    </div>
                    <div className="text-xs text-gray-400 truncate">{task.assignee}</div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Timeline grid */}
          <div
            className="flex-1 overflow-auto relative"
            ref={gridContainerRef}
            onScroll={handleScroll}
          >
            <div className="relative" style={{ width: totalGridWidth, height: filteredTasks.length * ROW_HEIGHT + 8 }}>
              {/* Grid lines */}
              {Array.from({ length: filteredTasks.length }).map((_, r) => (
                <div
                  key={`row-${r}`}
                  className="absolute left-0 right-0 border-b border-gray-100"
                  style={{ top: r * ROW_HEIGHT, height: ROW_HEIGHT }}
                />
              ))}
              {gridCols.map(
                (col, i) =>
                  col.isMonthStart && (
                    <div
                      key={`vline-${i}`}
                      className="absolute top-0 bottom-0 border-l border-gray-300"
                      style={{ left: i * DAY_WIDTH }}
                    />
                  ),
              )}

              {/* Today marker */}
              {todayOffset >= 0 && (
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-red-400 z-10"
                  style={{ left: todayOffset }}
                >
                  <div className="absolute -top-1 -left-2.5 w-5 h-5 rounded-full bg-red-400 text-white text-[10px] flex items-center justify-center shadow-sm">
                    T
                  </div>
                </div>
              )}

              {/* Dependency lines (SVG overlay) */}
              <svg
                className="absolute inset-0 pointer-events-none z-5"
                style={{ width: totalGridWidth, height: filteredTasks.length * ROW_HEIGHT + 8 }}
              >
                {dependencyLines.map((dl) => (
                  <g key={`dep-${dl.depId}-${dl.taskId}`}>
                    <path
                      d={`M ${dl.fromEnd} ${dl.fromY} C ${dl.midX} ${dl.fromY}, ${dl.midX} ${dl.toY}, ${dl.toStart - 6} ${dl.toY}`}
                      fill="none"
                      stroke="#9ca3af"
                      strokeWidth={1.5}
                      strokeDasharray="4 3"
                    />
                    <polygon
                      points={`${dl.toStart - 2} ${dl.toY - 4}, ${dl.toStart + 4} ${dl.toY}, ${dl.toStart - 2} ${dl.toY + 4}`}
                      fill="#9ca3af"
                    />
                  </g>
                ))}
              </svg>

              {/* Task bars */}
              {filteredTasks.map((task, idx) => {
                const left = daysBetween(minDate, task.startDate) * DAY_WIDTH;
                const width = Math.max(
                  daysBetween(task.startDate, task.endDate) * DAY_WIDTH + DAY_WIDTH,
                  DAY_WIDTH * 2,
                );
                return (
                  <div
                    key={task.id}
                    className={cn(
                      "absolute rounded-md flex items-center px-2 text-xs font-medium cursor-pointer transition-shadow hover:shadow-md z-10",
                      STATUS_COLORS[task.status],
                    )}
                    style={{
                      left,
                      top: idx * ROW_HEIGHT + (ROW_HEIGHT - BAR_HEIGHT) / 2,
                      width,
                      height: BAR_HEIGHT,
                    }}
                    onMouseEnter={(e) => {
                      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                      setTooltip({
                        x: rect.left + rect.width / 2,
                        y: rect.top - 8,
                        task,
                      });
                    }}
                    onMouseLeave={() => setTooltip(null)}
                  >
                    <span className="truncate">{task.name}</span>
                  </div>
                );
              })}
            </div>

            {/* Tooltip */}
            {tooltip && (
              <div
                className="fixed z-50 bg-[#1a202c] text-white text-xs rounded-lg px-3 py-2 shadow-lg pointer-events-none whitespace-nowrap"
                style={{
                  left: tooltip.x,
                  top: tooltip.y,
                  transform: "translate(-50%, -100%)",
                }}
              >
                <div className="font-semibold">{tooltip.task.name}</div>
                <div className="text-gray-300 mt-0.5">
                  {tooltip.task.startDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })} —{" "}
                  {tooltip.task.endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  {" · "}
                  {STATUS_LABELS[tooltip.task.status]}
                </div>
                <div className="text-gray-400">{tooltip.task.assignee}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
