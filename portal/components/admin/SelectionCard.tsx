"use client";

import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export type SelectionStatus = "PENDING" | "APPROVED" | "REJECTED";

export interface SelectionOption {
  description: string;
  priceDelta: number;
}

export interface Selection {
  id: string;
  name: string;
  options: SelectionOption[];
  deadline: string;
  status: SelectionStatus;
  clientChoice: number | null;
  workType: string;
  mainTask: string;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<SelectionStatus, { bg: string; text: string }> = {
  PENDING: { bg: "bg-amber-100", text: "text-amber-800" },
  APPROVED: { bg: "bg-emerald-100", text: "text-emerald-800" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800" },
};

const STATUS_LABELS: Record<SelectionStatus, string> = {
  PENDING: "Pending",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// ── Props ─────────────────────────────────────────────────────────────────

interface SelectionCardProps {
  selection: Selection;
  isExpanded: boolean;
  onToggle: () => void;
}

// ── Component ──────────────────────────────────────────────────────────────

export default function SelectionCard({ selection, isExpanded, onToggle }: SelectionCardProps) {
  const isOverdue =
    selection.status === "PENDING" && selection.deadline && new Date(selection.deadline) < new Date();

  return (
    <Card className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#1a202c] truncate">{selection.name}</h3>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <span>{selection.options.length} option{selection.options.length !== 1 ? "s" : ""}</span>
              {selection.deadline && (
                <>
                  <span>·</span>
                  <span className={isOverdue ? "text-red-500 font-medium" : ""}>
                    Due{" "}
                    {new Date(selection.deadline).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                    })}
                    {isOverdue && " ⚠️"}
                  </span>
                </>
              )}
              <span>·</span>
              <span>{selection.workType}</span>
            </div>
          </div>
          <Badge className={cn("text-xs rounded-full px-2.5 py-0.5", STATUS_COLORS[selection.status].bg, STATUS_COLORS[selection.status].text)}>
            {STATUS_LABELS[selection.status]}
          </Badge>
        </div>

        {/* Client choice */}
        {selection.clientChoice !== null && (
          <div className="text-sm bg-[#f7fafc] rounded-lg p-3 border border-gray-100">
            <span className="text-xs font-semibold text-[#1a202c] uppercase tracking-wide">
              Client chose:
            </span>
            <p className="text-sm text-[#1a202c] mt-1 font-medium">
              {selection.options[selection.clientChoice]?.description || `Option ${selection.clientChoice + 1}`}
            </p>
            {selection.options[selection.clientChoice]?.priceDelta > 0 && (
              <span className="text-xs text-amber-600 font-medium">
                +{formatCurrency(selection.options[selection.clientChoice].priceDelta)}
              </span>
            )}
          </div>
        )}

        {/* Expanded options */}
        {isExpanded && (
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Options</span>
            {selection.options.map((opt, idx) => (
              <div
                key={idx}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border text-sm",
                  selection.clientChoice === idx
                    ? "border-emerald-200 bg-emerald-50"
                    : "border-gray-100 bg-white",
                )}
              >
                <span className="text-[#1a202c]">{opt.description}</span>
                <span
                  className={cn(
                    "text-xs font-medium",
                    opt.priceDelta > 0 ? "text-amber-600" : "text-gray-400",
                  )}
                >
                  {opt.priceDelta > 0 ? `+${formatCurrency(opt.priceDelta)}` : "Included"}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Toggle */}
        <button
          onClick={onToggle}
          className="text-xs text-gray-400 hover:text-[#1a202c] transition-colors"
        >
          {isExpanded ? "▲ Show less" : "▼ Show options"}
        </button>
      </CardContent>
    </Card>
  );
}
