"use client";

import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export interface TimeEntry {
  id: string;
  userId: string;
  displayName: string;
  clockIn: string; // ISO
  clockOut: string | null;
  task: string;
  notes: string;
  date: string; // YYYY-MM-DD
}

// ── Props ─────────────────────────────────────────────────────────────────

interface TimeEntryListProps {
  entries: TimeEntry[];
  loading?: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────────────

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

function calcDuration(entry: TimeEntry): string {
  if (!entry.clockOut) return "Active";
  const start = new Date(entry.clockIn).getTime();
  const end = new Date(entry.clockOut).getTime();
  const hours = (end - start) / (1000 * 60 * 60);
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  return `${hours.toFixed(1)}h`;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function TimeEntryList({ entries, loading }: TimeEntryListProps) {
  if (loading) {
    return (
      <div className="text-center py-8 text-sm text-gray-400">Loading time entries...</div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-8 text-sm text-gray-300 italic">No time entries for this period.</div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              User
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Clock In
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Clock Out
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Duration
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Task
            </th>
            <th className="text-left py-3 px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Notes
            </th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry, idx) => (
            <tr
              key={entry.id}
              className={cn(
                "border-b border-gray-50 hover:bg-gray-50/50 transition-colors",
                !entry.clockOut && "bg-amber-50/30",
              )}
            >
              <td className="py-3 px-4">
                <span className="font-medium text-[#1a202c]">{entry.displayName}</span>
              </td>
              <td className="py-3 px-4 text-gray-600">{formatTime(entry.clockIn)}</td>
              <td className="py-3 px-4">
                {entry.clockOut ? (
                  <span className="text-gray-600">{formatTime(entry.clockOut)}</span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-600 text-xs font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                    Active
                  </span>
                )}
              </td>
              <td className="py-3 px-4">
                <span className={cn("font-medium", !entry.clockOut ? "text-amber-600" : "text-[#1a202c]")}>
                  {calcDuration(entry)}
                </span>
              </td>
              <td className="py-3 px-4 text-gray-600 max-w-[180px] truncate">{entry.task}</td>
              <td className="py-3 px-4 text-gray-400 max-w-[150px] truncate">{entry.notes || "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
