"use client";

import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

type ItemStatus = "PENDING" | "PASS" | "FAIL";
type InstanceStatus = "IN_PROGRESS" | "COMPLETE";

interface ChecklistItemInstance {
  label: string;
  status: ItemStatus;
  required: boolean;
}

interface ChecklistInstance {
  id: string;
  templateName: string;
  workType: string;
  mainTask: string;
  status: InstanceStatus;
  items: ChecklistItemInstance[];
  completedBy: string | null;
  completedAt: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

const ITEM_STATUS_ICONS: Record<ItemStatus, string> = {
  PENDING: "○",
  PASS: "✓",
  FAIL: "✗",
};

const ITEM_STATUS_COLORS: Record<ItemStatus, string> = {
  PENDING: "text-gray-300",
  PASS: "text-emerald-500",
  FAIL: "text-red-500",
};

// ── Mock Data ──────────────────────────────────────────────────────────────

const MOCK_INSTANCES: ChecklistInstance[] = [
  {
    id: "ci1",
    templateName: "Tear-off & Decking Inspection",
    workType: "DEMOLITION",
    mainTask: "Tear-off existing shingles",
    status: "COMPLETE",
    items: [
      { label: "All old shingles removed", status: "PASS", required: true },
      { label: "Felt/underlayment removed", status: "PASS", required: true },
      { label: "Decking inspected for rot/damage", status: "PASS", required: true },
      { label: "Damaged decking replaced", status: "PASS", required: true },
      { label: "Decking re-nailed per code", status: "PASS", required: true },
      { label: "Dumpster loaded and secured", status: "PASS", required: false },
    ],
    completedBy: "Carlos M.",
    completedAt: "2026-04-09T15:30:00",
  },
  {
    id: "ci2",
    templateName: "Roof Installation Final Inspection",
    workType: "ROOFING",
    mainTask: "Install asphalt shingles",
    status: "IN_PROGRESS",
    items: [
      { label: "Shingles properly aligned and fastened", status: "PASS", required: true },
      { label: "Ridge vent installed and sealed", status: "PENDING", required: true },
      { label: "Flashing around all penetrations", status: "PASS", required: true },
      { label: "Drip edge secured on all eaves", status: "PASS", required: true },
      { label: "No exposed fasteners", status: "PENDING", required: true },
      { label: "Gutters clean and flowing", status: "PENDING", required: false },
      { label: "Jobsite fully cleaned", status: "PENDING", required: true },
      { label: "Client walkthrough completed", status: "PENDING", required: false },
    ],
    completedBy: null,
    completedAt: null,
  },
  {
    id: "ci3",
    templateName: "Daily Safety Check",
    workType: "GENERAL",
    mainTask: "Daily operations",
    status: "COMPLETE",
    items: [
      { label: "All crew wearing proper PPE", status: "PASS", required: true },
      { label: "Harnesses inspected", status: "PASS", required: true },
      { label: "Ladders secured and stable", status: "PASS", required: true },
      { label: "First aid kit accessible", status: "PASS", required: true },
      { label: "Fire extinguisher on site", status: "FAIL", required: true },
      { label: "Weather conditions assessed", status: "PASS", required: true },
      { label: "Safety meeting held", status: "PASS", required: false },
    ],
    completedBy: "Marcus T.",
    completedAt: "2026-04-30T07:15:00",
  },
];

// ── Component ──────────────────────────────────────────────────────────────

export default function ProjectChecklistsPage() {
  const [instances, setInstances] = useState<ChecklistInstance[]>(MOCK_INSTANCES);

  const toggleItemStatus = (instanceId: string, itemIdx: number) => {
    setInstances((prev) =>
      prev.map((inst) => {
        if (inst.id !== instanceId) return inst;
        const newItems = inst.items.map((item, i) => {
          if (i !== itemIdx) return item;
          const next: ItemStatus =
            item.status === "PENDING" ? "PASS" : item.status === "PASS" ? "FAIL" : "PENDING";
          return { ...item, status: next };
        });
        // Check if all required passed
        const allPassed = newItems.filter((i) => i.required).every((i) => i.status === "PASS");
        return {
          ...inst,
          items: newItems,
          status: allPassed ? ("COMPLETE" as InstanceStatus) : ("IN_PROGRESS" as InstanceStatus),
          completedBy: allPassed ? "You" : inst.completedBy,
          completedAt: allPassed ? new Date().toISOString() : inst.completedAt,
        };
      }),
    );
  };

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Checklists</h1>
          <p className="text-sm text-gray-500 mt-1">
            Meadow Lane Residence — {instances.length} active checklist{instances.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>

      {instances.length === 0 ? (
        <EmptyState
          title="No checklists assigned"
          description="No checklist instances have been attached to this project's tasks yet."
        />
      ) : (
        <div className="space-y-4">
          {instances.map((instance) => {
            const passed = instance.items.filter((i) => i.status === "PASS").length;
            const failed = instance.items.filter((i) => i.status === "FAIL").length;
            const total = instance.items.length;

            return (
              <Card
                key={instance.id}
                className={cn(
                  "rounded-2xl border border-[var(--color-border)] bg-white shadow-sm",
                  instance.status === "COMPLETE" && "border-emerald-200",
                )}
              >
                <CardContent className="p-5">
                  {/* Instance header */}
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-semibold text-[#1a202c]">
                          {instance.templateName}
                        </h3>
                        <Badge
                          className={cn(
                            "text-[10px]",
                            instance.status === "COMPLETE"
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-amber-100 text-amber-700",
                          )}
                        >
                          {instance.status === "COMPLETE" ? "Complete" : "In Progress"}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-xs text-gray-400">
                        <span>{instance.workType}</span>
                        <span>·</span>
                        <span>{instance.mainTask}</span>
                      </div>
                    </div>
                    <div className="text-right text-xs text-gray-400">
                      <div>
                        {passed}/{total} passed
                      </div>
                      {failed > 0 && <div className="text-red-400">{failed} failed</div>}
                      {instance.completedBy && (
                        <div className="mt-1">
                          {instance.status === "COMPLETE" ? "✓" : ""} {instance.completedBy}
                          {instance.completedAt && (
                            <>
                              <br />
                              {new Date(instance.completedAt).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                                hour: "numeric",
                                minute: "2-digit",
                              })}
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {instance.items.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleItemStatus(instance.id, idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-colors border",
                          item.status === "PASS"
                            ? "bg-emerald-50 border-emerald-100 hover:bg-emerald-100"
                            : item.status === "FAIL"
                              ? "bg-red-50 border-red-100 hover:bg-red-100"
                              : "bg-white border-gray-100 hover:bg-gray-50",
                        )}
                      >
                        <span
                          className={cn(
                            "text-sm font-bold w-4 text-center flex-shrink-0",
                            ITEM_STATUS_COLORS[item.status],
                          )}
                        >
                          {ITEM_STATUS_ICONS[item.status]}
                        </span>
                        <span
                          className={cn(
                            "flex-1 text-gray-700",
                            item.status === "PASS" && "line-through text-gray-400",
                          )}
                        >
                          {item.label}
                        </span>
                        {item.required && (
                          <Badge className="text-[9px] bg-red-50 text-red-500 border-red-100 flex-shrink-0">
                            Required
                          </Badge>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-4 h-1.5 rounded-full bg-gray-100 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.round((passed / total) * 100)}%`,
                        backgroundColor: failed > 0 ? "#ef4444" : "#22c55e",
                      }}
                    />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
