"use client";

import { Badge, StatusBadge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { formatCurrency, cn } from "@/lib/utils";

// ── Types ──────────────────────────────────────────────────────────────────

export type ChangeOrderStatus = "DRAFT" | "SENT" | "APPROVED" | "REJECTED";

export interface ChangeOrder {
  id: string;
  title: string;
  description: string;
  reason: string;
  costImpact: number;
  scheduleImpactDays: number;
  affectedTasks: string[];
  status: ChangeOrderStatus;
  createdAt: string;
  sentAt: string | null;
  approvedAt: string | null;
  rejectedAt: string | null;
  clientResponse: string | null;
}

// ── Constants ──────────────────────────────────────────────────────────────

const STATUS_COLORS: Record<ChangeOrderStatus, { bg: string; text: string; dot: string }> = {
  DRAFT: { bg: "bg-gray-100", text: "text-gray-600", dot: "bg-gray-400" },
  SENT: { bg: "bg-amber-100", text: "text-amber-800", dot: "bg-amber-500" },
  APPROVED: { bg: "bg-emerald-100", text: "text-emerald-800", dot: "bg-emerald-500" },
  REJECTED: { bg: "bg-red-100", text: "text-red-800", dot: "bg-red-500" },
};

const STATUS_LABELS: Record<ChangeOrderStatus, string> = {
  DRAFT: "Draft",
  SENT: "Sent",
  APPROVED: "Approved",
  REJECTED: "Rejected",
};

// ── Props ─────────────────────────────────────────────────────────────────

interface ChangeOrderCardProps {
  order: ChangeOrder;
  onSend: (id: string) => void;
  allTasks: { id: string; name: string }[];
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChangeOrderCard({ order, onSend, allTasks }: ChangeOrderCardProps) {
  const statusStyle = STATUS_COLORS[order.status];

  const affectedTaskNames = order.affectedTasks
    .map((tId) => allTasks.find((t) => t.id === tId)?.name || tId)
    .join(", ");

  return (
    <Card className="rounded-2xl border border-[var(--color-border)] bg-white shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-5 space-y-3">
        {/* Header row */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-[#1a202c] truncate">{order.title}</h3>
            <p className="text-xs text-gray-400 mt-0.5">
              Created{" "}
              {new Date(order.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
          <Badge className={cn("text-xs rounded-full px-2.5 py-0.5", statusStyle.bg, statusStyle.text)}>
            <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5 inline-block", statusStyle.dot)} />
            {STATUS_LABELS[order.status]}
          </Badge>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-2">{order.description}</p>

        {/* Impact row */}
        <div className="flex items-center gap-4 text-xs">
          <span className="font-medium text-[#1a202c]">
            {formatCurrency(order.costImpact)}
          </span>
          <span className="text-gray-400">
            {order.scheduleImpactDays > 0
              ? `+${order.scheduleImpactDays} day${order.scheduleImpactDays > 1 ? "s" : ""}`
              : "No schedule impact"}
          </span>
        </div>

        {/* Affected tasks */}
        {affectedTaskNames && (
          <div className="text-xs text-gray-400">
            <span className="font-medium text-gray-500">Affects: </span>
            {affectedTaskNames}
          </div>
        )}

        {/* Client response tracking */}
        {order.status === "APPROVED" && order.approvedAt && (
          <div className="text-xs text-emerald-600 bg-emerald-50 rounded-lg px-3 py-1.5">
            ✓ Approved by client on{" "}
            {new Date(order.approvedAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
            })}
          </div>
        )}
        {order.status === "REJECTED" && order.clientResponse && (
          <div className="text-xs text-red-600 bg-red-50 rounded-lg px-3 py-1.5">
            ✗ Rejected: {order.clientResponse}
          </div>
        )}

        {/* SEND action for DRAFT */}
        {order.status === "DRAFT" && (
          <div className="pt-2 border-t border-gray-100">
            <Button
              size="sm"
              onClick={() => onSend(order.id)}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500 text-xs"
            >
              ✉ Send to Client
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
