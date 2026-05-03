"use client";

import { useMemo } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

import type { TimeEntry } from "@/components/admin/TimeEntryList";

interface TimesheetReportProps {
  entries: TimeEntry[];
}

interface UserSummary {
  displayName: string;
  totalHours: number;
  entryCount: number;
  activeNow: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function calcHours(entry: TimeEntry): number {
  if (!entry.clockOut) return 0; // active entries not counted
  const start = new Date(entry.clockIn).getTime();
  const end = new Date(entry.clockOut).getTime();
  return (end - start) / (1000 * 60 * 60);
}

function getWeekStart(date: Date): Date {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Monday start
  d.setDate(diff);
  return d;
}

function getMonthStart(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TimesheetReport({ entries }: TimesheetReportProps) {
  const now = new Date();
  const weekStart = getWeekStart(now);
  const monthStart = getMonthStart(now);

  const { weekHours, monthHours, userSummaries, totalEntries } = useMemo(() => {
    const weekHours = entries
      .filter((e) => new Date(e.date) >= weekStart && e.clockOut)
      .reduce((sum, e) => sum + calcHours(e), 0);

    const monthHours = entries
      .filter((e) => new Date(e.date) >= monthStart && e.clockOut)
      .reduce((sum, e) => sum + calcHours(e), 0);

    const byUser = new Map<string, UserSummary>();
    entries.forEach((e) => {
      const existing = byUser.get(e.displayName);
      const hours = calcHours(e);
      if (existing) {
        existing.totalHours += hours;
        existing.entryCount += 1;
        existing.activeNow = existing.activeNow || !e.clockOut;
      } else {
        byUser.set(e.displayName, {
          displayName: e.displayName,
          totalHours: hours,
          entryCount: 1,
          activeNow: !e.clockOut,
        });
      }
    });

    return {
      weekHours,
      monthHours,
      userSummaries: Array.from(byUser.values()).sort((a, b) => b.totalHours - a.totalHours),
      totalEntries: entries.length,
    };
  }, [entries, weekStart, monthStart]);

  return (
    <div className="space-y-4">
      {/* Summary stat cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              This Week
            </div>
            <div className="text-2xl font-bold text-[#1a202c] mt-1">
              {weekHours.toFixed(1)}h
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              Week of {weekStart.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
            </div>
          </CardContent>
        </Card>
        <Card className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm">
          <CardContent className="p-4">
            <div className="text-xs text-gray-400 uppercase tracking-wider font-semibold">
              This Month
            </div>
            <div className="text-2xl font-bold text-[#1a202c] mt-1">
              {monthHours.toFixed(1)}h
            </div>
            <div className="text-xs text-gray-400 mt-0.5">
              {monthStart.toLocaleDateString("en-US", { month: "long" })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Total entries */}
      <div className="text-xs text-gray-400">
        {totalEntries} total entries · {userSummaries.length} workers
      </div>

      {/* Per-user summary */}
      <div className="space-y-2">
        <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">By Worker</h4>
        {userSummaries.map((user) => (
          <div
            key={user.displayName}
            className="flex items-center justify-between py-2 px-3 rounded-lg bg-[#f7fafc] border border-gray-100"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-[#1a202c]">{user.displayName}</span>
              {user.activeNow && (
                <span className="inline-flex items-center gap-1 text-amber-600 text-[10px] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                  Active
                </span>
              )}
            </div>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span>{user.entryCount} entries</span>
              <span className="font-semibold text-[#1a202c]">{user.totalHours.toFixed(1)}h</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
