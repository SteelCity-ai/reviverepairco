"use client";

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { EmptyState } from "@/components/ui/EmptyState";
import ChangeOrderCard, { type ChangeOrder, type ChangeOrderStatus } from "@/components/admin/ChangeOrderCard";
import ChangeOrderForm from "@/components/admin/ChangeOrderForm";

// ── Mock task list ────────────────────────────────────────────────────────

const MOCK_TASKS = [
  { id: "t1", name: "Tear-off existing shingles" },
  { id: "t2", name: "Inspect & replace decking" },
  { id: "t3", name: "Install ice & water shield" },
  { id: "t4", name: "Install asphalt shingles" },
  { id: "t5", name: "Install ridge vents & flashing" },
  { id: "t6", name: "Replace fascia boards" },
  { id: "t7", name: "Install seamless gutters" },
  { id: "t8", name: "Final inspection & cleanup" },
];

// ── Mock data ──────────────────────────────────────────────────────────────

const MOCK_ORDERS: ChangeOrder[] = [
  {
    id: "co1",
    title: "Additional ridge vent — north peak",
    description:
      "Homeowner requested an additional ridge vent on the north peak to improve attic ventilation. Requires cutting new slot in ridge, installing vent, and flashing.",
    reason: "Client request — improved attic ventilation",
    costImpact: 450.0,
    scheduleImpactDays: 1,
    affectedTasks: ["t5"],
    status: "DRAFT",
    createdAt: "2026-04-18",
    sentAt: null,
    approvedAt: null,
    rejectedAt: null,
    clientResponse: null,
  },
  {
    id: "co2",
    title: "Upgrade to architectural shingles",
    description:
      "Client wants to upgrade from 3-tab to architectural shingles across the entire roof. Upgrade cost includes material delta and additional labor for proper alignment.",
    reason: "Client upgrade request",
    costImpact: 2850.0,
    scheduleImpactDays: 2,
    affectedTasks: ["t4"],
    status: "SENT",
    createdAt: "2026-04-15",
    sentAt: "2026-04-16",
    approvedAt: null,
    rejectedAt: null,
    clientResponse: null,
  },
  {
    id: "co3",
    title: "Replace additional decking sheets",
    description:
      "During tear-off, discovered 3 additional sheets of plywood decking that need replacement due to water damage. Original scope covered 2 sheets — this covers the extra 3.",
    reason: "Unforeseen condition — water-damaged decking",
    costImpact: 675.0,
    scheduleImpactDays: 1,
    affectedTasks: ["t2"],
    status: "APPROVED",
    createdAt: "2026-04-10",
    sentAt: "2026-04-10",
    approvedAt: "2026-04-11",
    rejectedAt: null,
    clientResponse: "Approved via portal — please proceed.",
  },
  {
    id: "co4",
    title: "Add gutter guards",
    description:
      "Client initially opted out of gutter guards. After seeing the new seamless gutters, they want to add gutter guards to prevent debris buildup.",
    reason: "Client request — added protection",
    costImpact: 1200.0,
    scheduleImpactDays: 0,
    affectedTasks: ["t7"],
    status: "REJECTED",
    createdAt: "2026-04-22",
    sentAt: "2026-04-22",
    approvedAt: null,
    rejectedAt: "2026-04-23",
    clientResponse: "Too expensive — will revisit after project completion.",
  },
];

const STATUS_ORDER: ChangeOrderStatus[] = ["DRAFT", "SENT", "APPROVED", "REJECTED"];

function groupByStatus(orders: ChangeOrder[]): Record<ChangeOrderStatus, ChangeOrder[]> {
  return {
    DRAFT: orders.filter((o) => o.status === "DRAFT"),
    SENT: orders.filter((o) => o.status === "SENT"),
    APPROVED: orders.filter((o) => o.status === "APPROVED"),
    REJECTED: orders.filter((o) => o.status === "REJECTED"),
  };
}

// ── Component ──────────────────────────────────────────────────────────────

export default function ChangeOrdersPage() {
  const [orders, setOrders] = useState<ChangeOrder[]>(MOCK_ORDERS);
  const [showNew, setShowNew] = useState(false);

  const grouped = groupByStatus(orders);

  const handleCreate = useCallback(
    (data: { title: string; description: string; reason: string; costImpact: string; scheduleImpactDays: string; affectedTasks: string[] }) => {
      const newOrder: ChangeOrder = {
        id: `co${Date.now()}`,
        title: data.title,
        description: data.description,
        reason: data.reason,
        costImpact: parseFloat(data.costImpact),
        scheduleImpactDays: parseInt(data.scheduleImpactDays) || 0,
        affectedTasks: data.affectedTasks,
        status: "DRAFT",
        createdAt: new Date().toISOString().split("T")[0],
        sentAt: null,
        approvedAt: null,
        rejectedAt: null,
        clientResponse: null,
      };
      setOrders((prev) => [newOrder, ...prev]);
      setShowNew(false);
    },
    [],
  );

  const handleSend = useCallback((id: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === id
          ? { ...o, status: "SENT" as ChangeOrderStatus, sentAt: new Date().toISOString().split("T")[0] }
          : o,
      ),
    );
  }, []);

  return (
    <div className="animate-fade-in-up p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1a202c]">Change Orders</h1>
          <p className="text-sm text-gray-500 mt-1">
            {orders.length} total · {orders.filter((o) => o.status === "DRAFT").length} drafts ·{" "}
            {formatCurrency(orders.reduce((sum, o) => sum + (o.status === "APPROVED" ? o.costImpact : 0), 0))} approved
          </p>
        </div>
        <Button
          onClick={() => setShowNew(true)}
          className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-amber-500"
        >
          + New Change Order
        </Button>
      </div>

      {/* Status-grouped lists */}
      {orders.length === 0 ? (
        <EmptyState
          title="No change orders yet"
          description="Create your first change order to track scope changes and client approvals."
          action={
            <Button
              onClick={() => setShowNew(true)}
              className="rounded-full bg-[var(--color-amber)] text-[var(--color-primary)]"
            >
              Create First Order
            </Button>
          }
        />
      ) : (
        <div className="space-y-8">
          {STATUS_ORDER.map((status) => {
            const items = grouped[status];
            if (items.length === 0) return null;

            const statusLabel = { DRAFT: "Drafts", SENT: "Sent for Approval", APPROVED: "Approved", REJECTED: "Rejected" };
            const statusColor = { DRAFT: "text-gray-400", SENT: "text-amber-500", APPROVED: "text-emerald-500", REJECTED: "text-red-500" };

            return (
              <div key={status}>
                <h3 className={`text-sm font-semibold uppercase tracking-wider mb-3 ${statusColor[status]}`}>
                  {statusLabel[status]} ({items.length})
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {items.map((order) => (
                    <ChangeOrderCard
                      key={order.id}
                      order={order}
                      onSend={handleSend}
                      allTasks={MOCK_TASKS}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* New Change Order Modal */}
      <Modal open={showNew} onClose={() => setShowNew(false)} title="New Change Order">
        <ChangeOrderForm
          tasks={MOCK_TASKS}
          onSubmit={handleCreate}
          onCancel={() => setShowNew(false)}
        />
      </Modal>
    </div>
  );
}

function formatCurrency(n: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(n);
}
