"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

interface WeatherInfo {
  temp: number;
  conditions: string;
  icon: string;
}

interface DailyLog {
  id: string;
  date: Date;
  weather: WeatherInfo;
  crewNotes: string;
  delays: string | null;
  safetyNotes: string;
  photoCount: number;
  createdBy: string;
}

interface NewDailyLog {
  date: string;
  weatherTemp: string;
  weatherConditions: string;
  crewNotes: string;
  delays: string;
  safetyNotes: string;
}

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_LOGS: DailyLog[] = [
  {
    id: "dl1",
    date: new Date("2026-04-15"),
    weather: { temp: 62, conditions: "Partly Cloudy", icon: "⛅" },
    crewNotes:
      "Tear-off on the east slope completed by noon. Decking inspection reveals 3 sheets of plywood need replacement due to water damage. Crew is staging materials for tomorrow's ice & water shield install.",
    delays: null,
    safetyNotes: "All crew wore harnesses. Safety meeting held at 7am — topic: ladder positioning on slopes.",
    photoCount: 8,
    createdBy: "Marcus T.",
  },
  {
    id: "dl2",
    date: new Date("2026-04-14"),
    weather: { temp: 58, conditions: "Overcast", icon: "☁️" },
    crewNotes:
      "Completed tear-off on the west slope. Hauled 2 dumpsters of old shingles and underlayment. Minor delay in the morning due to damp conditions — waited until 9:30am for roof to dry.",
    delays: "Morning rain delay — started 2 hours late.",
    safetyNotes: "Harness inspection passed. No incidents.",
    photoCount: 12,
    createdBy: "Carlos M.",
  },
  {
    id: "dl3",
    date: new Date("2026-04-11"),
    weather: { temp: 71, conditions: "Sunny", icon: "☀️" },
    crewNotes:
      "Full day of tear-off. Cleared the main roof section. Dumpster #1 is full — scheduled pickup for tomorrow. Started marking areas with obvious decking damage.",
    delays: null,
    safetyNotes: "All clear. Reminded crew about hydration — warmer temps today.",
    photoCount: 15,
    createdBy: "Marcus T.",
  },
  {
    id: "dl4",
    date: new Date("2026-04-10"),
    weather: { temp: 65, conditions: "Clear", icon: "🌤️" },
    crewNotes:
      "Project kickoff day. Delivered all materials, set up scaffolding, and protective tarping around the property. Completed initial safety walkthrough with the homeowner.",
    delays: null,
    safetyNotes:
      "Full site safety inspection completed. All PPE verified. Emergency procedures reviewed with crew.",
    photoCount: 20,
    createdBy: "Sarah (PM)",
  },
];

// ── Group helpers ──────────────────────────────────────────────────────────

function groupByDate(logs: DailyLog[]): Map<string, DailyLog[]> {
  const map = new Map<string, DailyLog[]>();
  logs.forEach((log) => {
    const key = log.date.toISOString().split("T")[0];
    const existing = map.get(key) || [];
    existing.push(log);
    map.set(key, existing);
  });
  return map;
}

function formatLogDate(date: Date): string {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });
}

function formatShortDate(date: Date): string {
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

// ── Component ──────────────────────────────────────────────────────────────

export default function DailyLogsPage() {
  const [logs, setLogs] = useState<DailyLog[]>(MOCK_LOGS);
  const [showNewLog, setShowNewLog] = useState(false);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [form, setForm] = useState<NewDailyLog>({
    date: new Date().toISOString().split("T")[0],
    weatherTemp: "",
    weatherConditions: "",
    crewNotes: "",
    delays: "",
    safetyNotes: "",
  });

  const groupedLogs = useMemo(() => groupByDate(logs), [logs]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSubmit = () => {
    if (!form.crewNotes.trim()) return;
    const newLog: DailyLog = {
      id: `dl${Date.now()}`,
      date: new Date(form.date),
      weather: {
        temp: parseInt(form.weatherTemp) || 0,
        conditions: form.weatherConditions || "Not recorded",
        icon: "🌤️",
      },
      crewNotes: form.crewNotes,
      delays: form.delays || null,
      safetyNotes: form.safetyNotes,
      photoCount: 0,
      createdBy: "You",
    };
    setLogs((prev) => [newLog, ...prev]);
    setForm({
      date: new Date().toISOString().split("T")[0],
      weatherTemp: "",
      weatherConditions: "",
      crewNotes: "",
      delays: "",
      safetyNotes: "",
    });
    setShowNewLog(false);
  };

  const sortedDates = Array.from(groupedLogs.keys()).sort().reverse();

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Daily Logs</h1>
          <p className="text-sm text-gray-500 mt-1">
            Meadow Lane Residence — Roof Replacement
          </p>
        </div>
        <Button
          onClick={() => setShowNewLog(true)}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          + New Daily Log
        </Button>
      </div>

      {/* Logs List */}
      {sortedDates.length === 0 ? (
        <EmptyState
          title="No daily logs yet"
          description="Start logging your first day."
          action={
            <Button
              onClick={() => setShowNewLog(true)}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)]"
            >
              Create First Log
            </Button>
          }
        />
      ) : (
        <div className="space-y-6">
          {sortedDates.map((dateKey) => {
            const dayLogs = groupedLogs.get(dateKey)!;
            return (
              <div key={dateKey}>
                <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {formatLogDate(new Date(dateKey))}
                </h3>
                <div className="space-y-3">
                  {dayLogs.map((log) => {
                    const isExpanded = expandedIds.has(log.id);
                    return (
                      <Card
                        key={log.id}
                        className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-shadow"
                      >
                        <CardContent className="p-5">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1 min-w-0">
                              {/* Weather + Date row */}
                              <div className="flex items-center gap-3 mb-2">
                                <span className="text-2xl">{log.weather.icon}</span>
                                <span className="text-sm font-medium text-gray-700">
                                  {log.weather.temp}°F · {log.weather.conditions}
                                </span>
                                {log.delays && (
                                  <Badge className="bg-red-100 text-red-700 text-xs">
                                    ⚠️ Delay
                                  </Badge>
                                )}
                                {log.photoCount > 0 && (
                                  <span className="text-xs text-gray-400 ml-auto flex items-center gap-1">
                                    📷 {log.photoCount} photos
                                  </span>
                                )}
                              </div>

                              {/* Crew notes preview */}
                              <p className="text-sm text-gray-700 leading-relaxed line-clamp-2">
                                {log.crewNotes}
                              </p>

                              {/* Expanded details */}
                              {isExpanded && (
                                <div className="mt-4 pt-4 border-t border-gray-100 space-y-3">
                                  {log.delays && (
                                    <div>
                                      <span className="text-xs font-semibold text-red-600 uppercase">
                                        Delays
                                      </span>
                                      <p className="text-sm text-gray-600 mt-1">{log.delays}</p>
                                    </div>
                                  )}
                                  <div>
                                    <span className="text-xs font-semibold text-[#1a202c] uppercase">
                                      Safety Notes
                                    </span>
                                    <p className="text-sm text-gray-600 mt-1">{log.safetyNotes}</p>
                                  </div>
                                  <div>
                                    <span className="text-xs font-semibold text-[#1a202c] uppercase">
                                      Full Notes
                                    </span>
                                    <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
                                      {log.crewNotes}
                                    </p>
                                  </div>
                                  <div className="text-xs text-gray-400">
                                    Logged by {log.createdBy} on{" "}
                                    {log.date.toLocaleDateString("en-US", {
                                      month: "long",
                                      day: "numeric",
                                      year: "numeric",
                                      hour: "numeric",
                                      minute: "2-digit",
                                    })}
                                  </div>
                                </div>
                              )}
                            </div>

                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpand(log.id)}
                              className="text-xs text-gray-400 hover:text-[#1a202c] flex-shrink-0"
                            >
                              {isExpanded ? "Less ▲" : "More ▼"}
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Daily Log Modal */}
      <Modal open={showNewLog} onClose={() => setShowNewLog(false)} title="New Daily Log">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Date</label>
            <Input
              type="date"
              value={form.date}
              onChange={(e) => setForm((prev) => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-[#1a202c] mb-1">
                Temperature (°F)
              </label>
              <Input
                type="number"
                placeholder="e.g., 72"
                value={form.weatherTemp}
                onChange={(e) => setForm((prev) => ({ ...prev, weatherTemp: e.target.value }))}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a202c] mb-1">Conditions</label>
              <Input
                placeholder="e.g., Sunny, Overcast"
                value={form.weatherConditions}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, weatherConditions: e.target.value }))
                }
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Crew Notes</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y min-h-[100px]"
              placeholder="What did the crew accomplish today?"
              value={form.crewNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, crewNotes: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">
              Delays (if any)
            </label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y min-h-[60px]"
              placeholder="Any delays or issues today?"
              value={form.delays}
              onChange={(e) => setForm((prev) => ({ ...prev, delays: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#1a202c] mb-1">Safety Notes</label>
            <textarea
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent resize-y min-h-[60px]"
              placeholder="Safety observations, incidents, or reminders"
              value={form.safetyNotes}
              onChange={(e) => setForm((prev) => ({ ...prev, safetyNotes: e.target.value }))}
            />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button variant="outline" onClick={() => setShowNewLog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!form.crewNotes.trim()}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500 disabled:opacity-50"
            >
              Save Log
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}