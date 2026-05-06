"use client";

import { useState } from "react";
import {
  Sparkles,
  X,
  Check,
  ChevronDown,
  ChevronRight,
  Upload,
  FileText,
} from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Button } from "@/components/ui/Button";

// ── Types ───────────────────────────────────────────────────────────────────

interface DailyTaskSuggestion {
  title: string;
  description: string;
}

interface MainTaskSuggestion {
  name: string;
  description: string;
  estimatedDays: number;
  dailyTasks: DailyTaskSuggestion[];
  // editable copies
  _name?: string;
  _description?: string;
}

interface WorkTypeSuggestion {
  name: string;
  description: string;
  mainTasks: MainTaskSuggestion[];
  // editable copies
  _name?: string;
  _description?: string;
}

interface SowPlan {
  workTypes: WorkTypeSuggestion[];
}

type TabMode = "upload" | "paste";
type Stage = "input" | "loading" | "review" | "creating";

interface Props {
  projectId: string;
  onComplete: () => void;
  onClose: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SOWImportPanel({ projectId, onComplete, onClose }: Props) {
  const { api, upload } = useApi();
  const [tab, setTab] = useState<TabMode>("upload");
  const [stage, setStage] = useState<Stage>("input");
  const [error, setError] = useState<string | null>(null);
  const [sowText, setSowText] = useState("");
  const [plan, setPlan] = useState<SowPlan | null>(null);

  // Selection state (maps index in flat lists)
  const [selectedWts, setSelectedWts] = useState<Set<number>>(new Set());
  const [selectedMts, setSelectedMts] = useState<Map<string, Set<number>>>(new Map());
  const [expandedWts, setExpandedWts] = useState<Set<number>>(new Set());
  const [expandedMts, setExpandedMts] = useState<Map<string, Set<number>>>(new Map());

  // Progress
  const [progress, setProgress] = useState({ current: 0, total: 0 });

  // ── Parse PDF ──────────────────────────────────────────────────────────

  async function handleFile(file: File | null) {
    if (!file) return;
    setError(null);
    setStage("loading");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const result = await upload<{ text: string }>("/ai/parse-sow", fd);
      setSowText(result.text);
      await buildFromSow(result.text);
    } catch (e) {
      setError((e as Error).message ?? "Failed to parse file");
      setStage("input");
    }
  }

  // ── Build from SOW ────────────────────────────────────────────────────

  async function buildFromSow(text: string) {
    setError(null);
    try {
      const result = await api<SowPlan>("/ai/build-from-sow", {
        method: "POST",
        body: { projectId, sowText: text },
      });
      const items = (result.workTypes ?? []).map((wt) => ({
        ...wt,
        _name: wt.name,
        _description: wt.description,
        mainTasks: (wt.mainTasks ?? []).map((mt) => ({
          ...mt,
          _name: mt.name,
          _description: mt.description,
        })),
      }));
      setPlan({ workTypes: items });
      // Select all by default
      setSelectedWts(new Set(items.map((_, i) => i)));
      setExpandedWts(new Set(items.map((_, i) => i)));
      setStage("review");
    } catch (e) {
      setError((e as Error).message ?? "AI analysis failed");
      setStage("input");
    }
  }

  // ── Paste submit ──────────────────────────────────────────────────────

  async function handlePasteSubmit() {
    if (!sowText.trim()) return;
    await buildFromSow(sowText.trim());
  }

  // ── Bulk Create ───────────────────────────────────────────────────────

  async function handleBulkCreate() {
    if (!plan) return;
    setError(null);

    const selectedWtList = plan.workTypes.filter((_, wi) => selectedWts.has(wi));
    // Count total operations
    let totalOps = 0;
    for (const wt of selectedWtList) {
      totalOps += 1; // create work type
      const mtIndices = selectedMts.get(wt._name ?? wt.name) ?? new Set(wt.mainTasks.map((_, i) => i));
      totalOps += mtIndices.size; // create main tasks
      for (const mi of mtIndices) {
        const mt = wt.mainTasks[mi];
        if (mt) totalOps += mt.dailyTasks.length; // create daily tasks
      }
    }

    setProgress({ current: 0, total: totalOps });
    setStage("creating");

    try {
      for (const [wi, wt] of selectedWtList.entries()) {
        // Create work type
        const createdWt = await api<{ id: string }>("/work-types", {
          method: "POST",
          body: {
            projectId,
            name: wt._name ?? wt.name,
            description: wt._description ?? wt.description,
          },
        });
        setProgress((p) => ({ ...p, current: p.current + 1 }));

        const mtIndices = selectedMts.get(wt._name ?? wt.name) ?? new Set(wt.mainTasks.map((_, i) => i));
        for (const mi of mtIndices) {
          const mt = wt.mainTasks[mi];
          if (!mt) continue;

          // Create main task
          const createdMt = await api<{ id: string }>("/main-tasks", {
            method: "POST",
            body: {
              workTypeId: createdWt.id,
              name: mt._name ?? mt.name,
              description: mt._description ?? mt.description,
              estimatedDurationDays: mt.estimatedDays,
            },
          });
          setProgress((p) => ({ ...p, current: p.current + 1 }));

          // Create daily tasks
          for (const dt of mt.dailyTasks) {
            await api("/daily-tasks", {
              method: "POST",
              body: {
                mainTaskId: createdMt.id,
                title: dt.title,
                description: dt.description,
              },
            });
            setProgress((p) => ({ ...p, current: p.current + 1 }));
          }
        }
      }
      onComplete();
    } catch (e) {
      setError((e as Error).message ?? "Bulk creation failed");
      setStage("review");
    }
  }

  // ── Selection helpers ─────────────────────────────────────────────────

  function toggleWt(i: number) {
    setSelectedWts((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleWtExpand(i: number) {
    setExpandedWts((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function getSelectedMts(wtName: string): Set<number> {
    return selectedMts.get(wtName) ?? new Set();
  }

  function toggleMt(wtName: string, mi: number) {
    setSelectedMts((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(wtName) ?? []);
      set.has(mi) ? set.delete(mi) : set.add(mi);
      next.set(wtName, set);
      return next;
    });
  }

  function toggleMtExpand(wtName: string, mi: number) {
    setExpandedMts((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(wtName) ?? []);
      set.has(mi) ? set.delete(mi) : set.add(mi);
      next.set(wtName, set);
      return next;
    });
  }

  function updateWtField(i: number, field: "_name" | "_description", val: string) {
    if (!plan) return;
    setPlan({
      workTypes: plan.workTypes.map((wt, idx) =>
        idx === i ? { ...wt, [field]: val } : wt,
      ),
    });
  }

  function updateMtField(wtName: string, mi: number, field: "_name" | "_description", val: string) {
    if (!plan) return;
    setPlan({
      workTypes: plan.workTypes.map((wt) =>
        wt._name === wtName
          ? {
              ...wt,
              mainTasks: wt.mainTasks.map((mt, idx) =>
                idx === mi ? { ...mt, [field]: val } : mt,
              ),
            }
          : wt,
      ),
    });
  }

  // ── Counts ────────────────────────────────────────────────────────────

  function totalSelectedMtCount(): number {
    if (!plan) return 0;
    let count = 0;
    for (const [wi, wt] of plan.workTypes.entries()) {
      if (!selectedWts.has(wi)) continue;
      const mtSet = selectedMts.get(wt._name ?? wt.name);
      if (!mtSet || mtSet.size === 0) {
        count += wt.mainTasks.length;
      } else {
        count += mtSet.size;
      }
    }
    return count;
  }

  // ── Render ────────────────────────────────────────────────────────────

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-800">
            Import Scope of Work
          </span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded p-1 text-violet-400 hover:bg-violet-100 hover:text-violet-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {error && (
        <div className="mb-3 rounded-lg border border-red-300 bg-red-50 px-4 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* ── INPUT STAGE ────────────────────────────────────────────── */}
      {stage === "input" && (
        <>
          {/* Tabs */}
          <div className="mb-4 flex gap-1 rounded-lg bg-violet-100 p-1">
            <button
              type="button"
              onClick={() => setTab("upload")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "upload"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-violet-500 hover:text-violet-700"
              }`}
            >
              <Upload className="h-3.5 w-3.5" />
              Upload PDF
            </button>
            <button
              type="button"
              onClick={() => setTab("paste")}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                tab === "paste"
                  ? "bg-white text-violet-700 shadow-sm"
                  : "text-violet-500 hover:text-violet-700"
              }`}
            >
              <FileText className="h-3.5 w-3.5" />
              Paste Text
            </button>
          </div>

          {tab === "upload" && (
            <div className="rounded-xl border-2 border-dashed border-violet-300 bg-white px-6 py-10 text-center transition-colors hover:border-violet-400">
              <Upload className="mx-auto mb-3 h-8 w-8 text-violet-400" />
              <p className="mb-1 text-sm font-medium text-violet-700">
                Drop a PDF or text file here, or click to browse
              </p>
              <p className="mb-4 text-xs text-violet-400">
                PDF or .txt — max 20MB
              </p>
              <label className="inline-block cursor-pointer rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700">
                Browse Files
                <input
                  type="file"
                  accept=".pdf,.txt,application/pdf,text/plain"
                  className="hidden"
                  onChange={(e) => handleFile(e.target.files?.[0] ?? null)}
                />
              </label>
            </div>
          )}

          {tab === "paste" && (
            <div className="space-y-3">
              <textarea
                value={sowText}
                onChange={(e) => setSowText(e.target.value)}
                placeholder="Paste the Scope of Work text here..."
                rows={10}
                className="w-full resize-y rounded-lg border border-violet-200 bg-white px-3 py-2 text-sm text-gray-700 placeholder:text-gray-400 focus:border-violet-400 focus:outline-none"
              />
              <Button
                size="sm"
                onClick={handlePasteSubmit}
                disabled={!sowText.trim()}
                className="bg-violet-600 hover:bg-violet-700 text-white"
              >
                <Sparkles className="mr-1.5 h-3.5 w-3.5" />
                Analyze SOW
              </Button>
            </div>
          )}
        </>
      )}

      {/* ── LOADING STAGE ──────────────────────────────────────────── */}
      {stage === "loading" && (
        <div className="flex items-center gap-2 py-8 text-sm text-violet-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
          {tab === "upload" ? "Parsing PDF and analyzing…" : "Analyzing with AI…"}
        </div>
      )}

      {/* ── REVIEW STAGE ──────────────────────────────────────────── */}
      {stage === "review" && plan && (
        <>
          <p className="mb-3 text-xs text-violet-600">
            Review the AI-generated project structure. Edit names, select/deselect items, then click
            &quot;Bulk Create&quot; to add everything at once.
          </p>

          {/* Select / deselect all */}
          <div className="mb-3 flex items-center gap-3 text-xs text-violet-600">
            <button
              type="button"
              onClick={() => {
                if (!plan) return;
                setSelectedWts(new Set(plan.workTypes.map((_, i) => i)));
              }}
              className="hover:underline"
            >
              Select all work types
            </button>
            <span>·</span>
            <button
              type="button"
              onClick={() => setSelectedWts(new Set())}
              className="hover:underline"
            >
              Deselect all
            </button>
            <span className="ml-auto">
              {selectedWts.size} wt · {totalSelectedMtCount()} mt
            </span>
          </div>

          {/* Work type tree */}
          <div className="space-y-2">
            {plan.workTypes.map((wt, wi) => (
              <div key={wi} className="rounded-lg border border-violet-200 bg-white">
                {/* Work type header */}
                <div className="flex items-start gap-2 px-3 py-2">
                  <button
                    type="button"
                    onClick={() => toggleWt(wi)}
                    className="mt-0.5 shrink-0"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        selectedWts.has(wi)
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selectedWts.has(wi) && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </button>

                  {/* Expand/collapse */}
                  <button
                    type="button"
                    onClick={() => toggleWtExpand(wi)}
                    className="mt-0.5 shrink-0 text-gray-400 hover:text-violet-600"
                  >
                    {expandedWts.has(wi) ? (
                      <ChevronDown className="h-3.5 w-3.5" />
                    ) : (
                      <ChevronRight className="h-3.5 w-3.5" />
                    )}
                  </button>

                  <div className="min-w-0 flex-1">
                    <input
                      type="text"
                      value={wt._name ?? wt.name}
                      onChange={(e) => updateWtField(wi, "_name", e.target.value)}
                      className="w-full bg-transparent text-sm font-semibold text-violet-800 focus:outline-none"
                    />
                    {expandedWts.has(wi) && (
                      <textarea
                        value={wt._description ?? wt.description}
                        onChange={(e) => updateWtField(wi, "_description", e.target.value)}
                        rows={2}
                        className="mt-1 w-full resize-none rounded border border-violet-100 bg-violet-50 px-2 py-1 text-xs text-gray-600 focus:border-violet-300 focus:outline-none"
                      />
                    )}
                    {!expandedWts.has(wi) && (
                      <span className="text-[11px] text-gray-400">
                        {wt.mainTasks.length} main task{wt.mainTasks.length !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                </div>

                {/* Main tasks */}
                {expandedWts.has(wi) && wt.mainTasks.length > 0 && (
                  <div className="border-t border-violet-100 px-3 pb-2 pt-1">
                    {wt.mainTasks.map((mt, mi) => (
                      <div key={mi} className="ml-5 mt-1 rounded border border-violet-100 bg-violet-50/40">
                        {/* Main task header */}
                        <div className="flex items-start gap-2 px-2 py-1.5">
                          <button
                            type="button"
                            onClick={() => toggleMt(wt._name ?? wt.name, mi)}
                            className="mt-0.5 shrink-0"
                          >
                            <span
                              className={`flex h-3.5 w-3.5 items-center justify-center rounded border ${
                                (selectedMts.get(wt._name ?? wt.name)?.has(mi) ??
                                  selectedWts.has(wi))
                                  ? "border-violet-500 bg-violet-500 text-white"
                                  : "border-gray-300 bg-white"
                              }`}
                            >
                              {(selectedMts.get(wt._name ?? wt.name)?.has(mi) ??
                                selectedWts.has(wi)) && <Check className="h-2 w-2" />}
                            </span>
                          </button>

                          {/* Expand daily tasks */}
                          {mt.dailyTasks.length > 0 && (
                            <button
                              type="button"
                              onClick={() => toggleMtExpand(wt._name ?? wt.name, mi)}
                              className="mt-0.5 shrink-0 text-gray-400 hover:text-violet-600"
                            >
                              {expandedMts.get(wt._name ?? wt.name)?.has(mi) ? (
                                <ChevronDown className="h-3 w-3" />
                              ) : (
                                <ChevronRight className="h-3 w-3" />
                              )}
                            </button>
                          )}

                          <div className="min-w-0 flex-1">
                            <input
                              type="text"
                              value={mt._name ?? mt.name}
                              onChange={(e) => updateMtField(wt._name ?? wt.name, mi, "_name", e.target.value)}
                              className="w-full bg-transparent text-xs font-medium text-gray-700 focus:outline-none"
                            />
                            <div className="flex items-center gap-2 text-[10px] text-gray-400">
                              <span>Est. {mt.estimatedDays} day{mt.estimatedDays !== 1 ? "s" : ""}</span>
                              <span>·</span>
                              <span>{mt.dailyTasks.length} step{mt.dailyTasks.length !== 1 ? "s" : ""}</span>
                            </div>
                          </div>
                        </div>

                        {/* Daily tasks */}
                        {expandedMts.get(wt._name ?? wt.name)?.has(mi) && mt.dailyTasks.length > 0 && (
                          <div className="border-t border-violet-100 px-2 pb-1">
                            {mt.dailyTasks.map((dt, di) => (
                              <div
                                key={di}
                                className="flex items-start gap-1.5 px-3 py-1 text-[11px] text-gray-500"
                              >
                                <span className="mt-0.5 shrink-0 text-violet-300">•</span>
                                <div>
                                  <span className="font-medium text-gray-600">{dt.title}</span>
                                  {dt.description && (
                                    <span className="ml-1 text-gray-400">— {dt.description}</span>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Action buttons */}
          <div className="mt-4 flex items-center gap-2">
            <Button
              size="sm"
              onClick={handleBulkCreate}
              disabled={selectedWts.size === 0}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {totalSelectedMtCount() > 0
                ? `Bulk Create (${totalSelectedMtCount()} main tasks)`
                : "Bulk Create"}
            </Button>
            <Button size="sm" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
          </div>
        </>
      )}

      {/* ── CREATING STAGE ─────────────────────────────────────────── */}
      {stage === "creating" && (
        <div className="space-y-3 py-4">
          <div className="flex items-center justify-between text-sm text-violet-700">
            <span className="font-medium">Creating project structure…</span>
            <span>
              {progress.current} / {progress.total}
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-violet-200">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-300"
              style={{
                width: progress.total > 0
                  ? `${Math.round((progress.current / progress.total) * 100)}%`
                  : "0%",
              }}
            />
          </div>
          <p className="text-xs text-violet-400">
            {progress.current < progress.total
              ? "Creating work types, tasks, and steps…"
              : "Done! Refreshing…"}
          </p>
        </div>
      )}
    </div>
  );
}
