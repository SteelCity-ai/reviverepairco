"use client";

import { useState } from "react";
import { Sparkles, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import { useApi } from "@/lib/api-browser";
import { Button } from "@/components/ui/Button";

interface Suggestion {
  title: string;
  description: string;
  _title?: string;
  _description?: string;
}

interface Props {
  mainTaskId: string;
  onAdded: () => void;
}

export default function AISuggestDailyTasks({ mainTaskId, onAdded }: Props) {
  const { api } = useApi();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  async function generate() {
    setLoading(true);
    setError(null);
    setSuggestions([]);
    setSelected(new Set());
    try {
      const res = await api<{ suggestions: Suggestion[] }>(
        "/ai/suggest-daily-tasks",
        { method: "POST", body: { mainTaskId, count: 8 } },
      );
      const items = (res.suggestions ?? []).map((s) => ({
        ...s,
        _title: s.title,
        _description: s.description,
      }));
      setSuggestions(items);
      setSelected(new Set(items.map((_, i) => i)));
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  async function addSelected() {
    const chosen = suggestions.filter((_, i) => selected.has(i));
    if (!chosen.length) return;
    setAdding(true);
    setError(null);
    try {
      for (const s of chosen) {
        await api("/daily-tasks", {
          method: "POST",
          body: {
            mainTaskId,
            title: s._title ?? s.title,
            description: s._description ?? s.description,
          },
        });
      }
      setOpen(false);
      setSuggestions([]);
      setSelected(new Set());
      onAdded();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setAdding(false);
    }
  }

  function toggleSelect(i: number) {
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function toggleExpand(i: number) {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  function updateField(i: number, field: "_title" | "_description", val: string) {
    setSuggestions((prev) =>
      prev.map((s, idx) => (idx === i ? { ...s, [field]: val } : s)),
    );
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => {
          setOpen(true);
          generate();
        }}
        className="flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 hover:underline transition-colors"
      >
        <Sparkles className="h-3.5 w-3.5" />
        AI Suggest Steps
      </button>
    );
  }

  return (
    <div className="rounded-xl border border-violet-200 bg-violet-50/60 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-violet-600" />
          <span className="text-sm font-semibold text-violet-800">
            AI Daily Step Suggestions
          </span>
        </div>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded p-1 text-violet-400 hover:bg-violet-100 hover:text-violet-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {loading && (
        <div className="flex items-center gap-2 py-6 text-sm text-violet-600">
          <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-violet-300 border-t-violet-600" />
          Generating step suggestions…
        </div>
      )}

      {error && (
        <p className="mb-3 text-sm text-red-600">{error}</p>
      )}

      {!loading && suggestions.length > 0 && (
        <>
          <p className="mb-3 text-xs text-violet-600">
            These are AI-suggested daily steps based on your main task. Edit names, check the ones you want, then click "Add Selected."
          </p>

          {/* Select all / none */}
          <div className="mb-2 flex items-center gap-3 text-xs text-violet-600">
            <button type="button" onClick={() => setSelected(new Set(suggestions.map((_, i) => i)))} className="hover:underline">
              Select all
            </button>
            <span>·</span>
            <button type="button" onClick={() => setSelected(new Set())} className="hover:underline">
              Deselect all
            </button>
            <span className="ml-auto">{selected.size} of {suggestions.length} selected</span>
          </div>

          <ul className="space-y-2">
            {suggestions.map((s, i) => (
              <li
                key={i}
                className={`rounded-lg border transition-colors ${
                  selected.has(i)
                    ? "border-violet-300 bg-white"
                    : "border-transparent bg-white/50 opacity-60"
                }`}
              >
                <div className="flex items-start gap-2 px-3 py-2">
                  {/* Checkbox */}
                  <button
                    type="button"
                    onClick={() => toggleSelect(i)}
                    className="mt-0.5 shrink-0"
                  >
                    <span
                      className={`flex h-4 w-4 items-center justify-center rounded border ${
                        selected.has(i)
                          ? "border-violet-500 bg-violet-500 text-white"
                          : "border-gray-300 bg-white"
                      }`}
                    >
                      {selected.has(i) && <Check className="h-2.5 w-2.5" />}
                    </span>
                  </button>

                  <div className="min-w-0 flex-1">
                    {/* Editable title */}
                    <input
                      type="text"
                      value={s._title ?? s.title}
                      onChange={(e) => updateField(i, "_title", e.target.value)}
                      className="w-full bg-transparent text-sm font-medium text-gray-800 focus:outline-none"
                      onClick={() => selected.has(i) || toggleSelect(i)}
                    />

                    {/* Expand description */}
                    <button
                      type="button"
                      onClick={() => toggleExpand(i)}
                      className="mt-0.5 flex items-center gap-1 text-[11px] text-gray-400 hover:text-gray-600"
                    >
                      {expanded.has(i) ? (
                        <>
                          <ChevronUp className="h-3 w-3" /> Hide description
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-3 w-3" /> Edit description
                        </>
                      )}
                    </button>

                    {expanded.has(i) && (
                      <textarea
                        value={s._description ?? s.description}
                        onChange={(e) => updateField(i, "_description", e.target.value)}
                        rows={2}
                        className="mt-1 w-full resize-none rounded border border-violet-200 bg-violet-50 px-2 py-1 text-xs text-gray-700 focus:border-violet-400 focus:outline-none"
                      />
                    )}
                  </div>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-3 flex items-center gap-2">
            <Button
              size="sm"
              onClick={addSelected}
              disabled={selected.size === 0 || adding}
              className="bg-violet-600 hover:bg-violet-700 text-white"
            >
              {adding ? "Adding…" : `Add ${selected.size} Step${selected.size !== 1 ? "s" : ""}`}
            </Button>
            <Button size="sm" variant="secondary" onClick={generate} disabled={loading || adding}>
              Regenerate
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
