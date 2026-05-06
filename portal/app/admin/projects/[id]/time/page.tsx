"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Tabs } from "@/components/ui/Tabs";
import TimeEntryList, { type TimeEntry } from "@/components/admin/TimeEntryList";
import TimesheetReport from "@/components/admin/TimesheetReport";

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_ENTRIES: TimeEntry[] = [
  {
    id: "te1",
    userId: "u1",
    displayName: "Carlos M.",
    clockIn: "2026-04-30T07:02:00",
    clockOut: "2026-04-30T15:30:00",
    task: "Tear-off existing shingles",
    notes: "Completed east slope",
    date: "2026-04-30",
  },
  {
    id: "te2",
    userId: "u2",
    displayName: "Javier R.",
    clockIn: "2026-04-30T07:10:00",
    clockOut: "2026-04-30T15:45:00",
    task: "Inspect & replace decking",
    notes: "Replaced 2 sheets plywood",
    date: "2026-04-30",
  },
  {
    id: "te3",
    userId: "u3",
    displayName: "Marcus T.",
    clockIn: "2026-04-30T07:00:00",
    clockOut: null,
    task: "Install ice & water shield",
    notes: "Working on west slope",
    date: "2026-04-30",
  },
  {
    id: "te4",
    userId: "u1",
    displayName: "Carlos M.",
    clockIn: "2026-04-29T07:05:00",
    clockOut: "2026-04-29T16:00:00",
    task: "Tear-off existing shingles",
    notes: "West slope done, 1.5 dumpsters filled",
    date: "2026-04-29",
  },
  {
    id: "te5",
    userId: "u2",
    displayName: "Javier R.",
    clockIn: "2026-04-29T07:15:00",
    clockOut: "2026-04-29T16:10:00",
    task: "Decking inspection",
    notes: "Marked damaged areas",
    date: "2026-04-29",
  },
  {
    id: "te6",
    userId: "u3",
    displayName: "Marcus T.",
    clockIn: "2026-04-29T07:00:00",
    clockOut: "2026-04-29T15:30:00",
    task: "Material staging",
    notes: "Staged ice & water shield for tomorrow",
    date: "2026-04-29",
  },
  {
    id: "te7",
    userId: "u1",
    displayName: "Carlos M.",
    clockIn: "2026-04-28T07:00:00",
    clockOut: "2026-04-28T16:00:00",
    task: "Tear-off existing shingles",
    notes: "North slope done",
    date: "2026-04-28",
  },
  {
    id: "te8",
    userId: "u3",
    displayName: "Marcus T.",
    clockIn: "2026-04-15T07:00:00",
    clockOut: "2026-04-15T16:00:00",
    task: "Install ridge vents & flashing",
    notes: "",
    date: "2026-04-15",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function TimeTrackingPage() {
  const [entries] = useState<TimeEntry[]>(MOCK_ENTRIES);
  const [userFilter, setUserFilter] = useState("ALL");
  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo, setDateTo] = useState("2026-05-07");
  const [tab, setTab] = useState("timesheet");

  // Unique users for filter
  const users = useMemo(() => {
    const names = new Set(entries.map((e) => e.displayName));
    return [{ value: "ALL", label: "All Workers" }, ...Array.from(names).map((n) => ({ value: n, label: n }))];
  }, [entries]);

  // Filter entries
  const filteredEntries = useMemo(() => {
    return entries.filter((e) => {
      if (userFilter !== "ALL" && e.displayName !== userFilter) return false;
      if (dateFrom && e.date < dateFrom) return false;
      if (dateTo && e.date > dateTo) return false;
      return true;
    });
  }, [entries, userFilter, dateFrom, dateTo]);

  const activeCount = entries.filter((e) => !e.clockOut).length;

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Time Tracking</h1>
          <p className="text-sm text-gray-500 mt-1">
            {entries.length} entries · {activeCount > 0 && (
              <span className="text-amber-600 font-medium">{activeCount} active now</span>
            )}
          </p>
        </div>
        <Button
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
          onClick={() => alert("Export placeholder — CSV download would go here.")}
        >
          📥 Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">User:</label>
          <select
            value={userFilter}
            onChange={(e) => setUserFilter(e.target.value)}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-amber-400 bg-white"
          >
            {users.map((u) => (
              <option key={u.value} value={u.value}>
                {u.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">From:</label>
          <Input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
            className="text-xs w-40"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-medium text-gray-500">To:</label>
          <Input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="text-xs w-40"
          />
        </div>
        <span className="text-xs text-gray-400 ml-auto">
          Showing {filteredEntries.length} entries
        </span>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={[
          { id: "timesheet", label: "Timesheet" },
          { id: "report", label: "Report" },
        ]}
        activeTab={tab}
        onTabChange={setTab}
      />

      {/* Content */}
      {tab === "timesheet" ? (
        <TimeEntryList entries={filteredEntries} />
      ) : (
        <TimesheetReport entries={filteredEntries} />
      )}
    </div>
  );
}
