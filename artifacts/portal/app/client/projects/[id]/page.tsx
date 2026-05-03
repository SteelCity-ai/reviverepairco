import Link from "next/link";
import {
  MapPin,
  Calendar,
  ArrowLeft,
  Clock,
  ChevronRight,
  FileCheck,
  AlertTriangle,
  Palette,
} from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const mockProject = {
  id: "proj-001",
  name: "Full Roof Replacement",
  address: "124 Oak Lane, Pittsburgh, PA 15237",
  status: "IN_PROGRESS",
  overallProgress: 65,
};

const workTypes = [
  { name: "Tear-off & Prep", progress: 100, status: "COMPLETE" },
  { name: "Decking Repair", progress: 80, status: "IN_PROGRESS" },
  { name: "Underlayment", progress: 60, status: "IN_PROGRESS" },
  { name: "Shingle Installation", progress: 0, status: "NOT_STARTED" },
  { name: "Gutter Work", progress: 0, status: "NOT_STARTED" },
  { name: "Final Inspection", progress: 0, status: "NOT_STARTED" },
];

const upcomingTasks = [
  { id: "dt-102", title: "Replace damaged sheathing panels", date: "Fri, May 1", time: "10:00 AM" },
  { id: "dt-103", title: "Install ice & water shield", date: "Fri, May 1", time: "1:00 PM" },
  { id: "dt-101", title: "Install drip edge — north slope", date: "Tomorrow", time: "7:00 AM" },
  { id: "dt-105", title: "Shingle laying begins", date: "Mon, May 4", time: "7:00 AM" },
  { id: "dt-106", title: "Ridge cap installation", date: "Wed, May 6", time: "9:00 AM" },
].slice(0, 5);

const activityFeed = [
  { id: "a1", action: "Task completed", detail: "Inspect flashing around chimney", time: "Today, 2:30 PM", icon: "✓" },
  { id: "a2", action: "Photo uploaded", detail: "Decking after shingle removal", time: "Today, 11:45 AM", icon: "📷" },
  { id: "a3", action: "Task started", detail: "Tear off shingles — front slope", time: "Today, 7:00 AM", icon: "▶" },
  { id: "a4", action: "Crew clocked in", detail: "Mike checked in at Smith Residence", time: "Today, 6:58 AM", icon: "⏱" },
  { id: "a5", action: "Task completed", detail: "Sweep & clean deck surface", time: "Yesterday, 4:15 PM", icon: "✓" },
  { id: "a6", action: "Note added", detail: "Rot found near southern edge — PM notified", time: "Yesterday, 2:00 PM", icon: "📝" },
  { id: "a7", action: "Material logged", detail: "12 bundles architectural shingles delivered", time: "Yesterday, 10:30 AM", icon: "📦" },
  { id: "a8", action: "Task completed", detail: "Install synthetic underlayment", time: "Yesterday, 1:30 PM", icon: "✓" },
  { id: "a9", action: "Crew clocked out", detail: "Mike clocked out — 7h 32m", time: "Yesterday, 2:30 PM", icon: "⏱" },
  { id: "a10", action: "Change order submitted", detail: "Decking repair addendum — $850", time: "Mon, Apr 28", icon: "📋" },
];

const pendingApprovals = [
  { id: "mt-001", name: "Decking Repair", status: "CLIENT_SIGNOFF", date: "Today" },
];

const pendingChangeOrders = [
  { id: "co-001", name: "Decking Repair Addendum", amount: "$850.00", date: "Mon, Apr 28" },
];

const pendingSelections = [
  { id: "sel-001", name: "Shingle Color", options: "3 options provided", date: "Wed, Apr 23" },
];

// ── Page ────────────────────────────────────────────────────

export default function ClientProjectDetailPage() {
  return (
    <div className="animate-fade-in-up">
      {/* Back */}
      <Link
        href="/client/projects"
        className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-[var(--color-amber)] transition"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Projects
      </Link>

      {/* Header */}
      <div className="mb-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)]">{mockProject.name}</h1>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-400">
              <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
              {mockProject.address}
            </p>
          </div>
          <StatusBadge status={mockProject.status} />
        </div>
        {/* Overall progress */}
        <div className="mt-4">
          <div className="flex items-center justify-between text-sm mb-1">
            <span className="text-gray-500">Overall Progress</span>
            <span className="font-mono font-bold text-[var(--color-primary)]">{mockProject.overallProgress}%</span>
          </div>
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-100">
            <div
              className="h-full rounded-full bg-[var(--color-amber)] transition-all duration-500"
              style={{ width: `${mockProject.overallProgress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Action Sections (alerts that need attention) */}
      <div className="mb-8 space-y-3">
        {/* Pending Approvals */}
        {pendingApprovals.length > 0 && (
          <a
            href={`/client/main-tasks/${pendingApprovals[0].id}/signoff`}
            className="block rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:border-amber-300 hover:shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-amber-100 text-lg">
                ✍️
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-primary)]">Review & Sign</p>
                <p className="text-xs text-gray-500">
                  {pendingApprovals[0].name} is ready for your sign-off
                </p>
              </div>
              <ChevronRight className="h-5 w-5 text-amber-500" />
            </div>
          </a>
        )}

        {/* Pending Change Orders */}
        {pendingChangeOrders.length > 0 && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-red-100 text-lg">
                📋
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-primary)]">Change Order Pending</p>
                <p className="text-xs text-gray-500">
                  {pendingChangeOrders[0].name} — {pendingChangeOrders[0].amount}
                </p>
              </div>
              <Link
                href={`/client/change-orders/${pendingChangeOrders[0].id}`}
                className="rounded-full border border-red-300 bg-white px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-100 transition"
              >
                Review
              </Link>
            </div>
          </div>
        )}

        {/* Pending Selections */}
        {pendingSelections.length > 0 && (
          <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100 text-lg">
                <Palette className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--color-primary)]">Make a Selection</p>
                <p className="text-xs text-gray-500">
                  {pendingSelections[0].name} — {pendingSelections[0].options}
                </p>
              </div>
              <Link
                href={`/client/selections/${pendingSelections[0].id}`}
                className="rounded-full border border-blue-300 bg-white px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-100 transition"
              >
                Choose
              </Link>
            </div>
          </div>
        )}
      </div>

      {/* Two-column: progress + upcoming */}
      <div className="mb-8 grid gap-6 lg:grid-cols-2">
        {/* Work Type Progress */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Work Progress</h3>
          </CardHeader>
          <CardContent>
            <ul className="divide-y divide-[var(--color-border)]">
              {workTypes.map((wt) => (
                <li key={wt.name} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                  <span className="text-sm text-[var(--color-primary)]">{wt.name}</span>
                  <div className="flex items-center gap-3">
                    <div className="h-1.5 w-20 overflow-hidden rounded-full bg-gray-100">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          wt.progress === 100 ? "bg-green-400" : "bg-[var(--color-amber)]",
                        )}
                        style={{ width: `${wt.progress}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-mono text-gray-400">{wt.progress}%</span>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        {/* Upcoming Tasks */}
        <Card>
          <CardHeader>
            <h3 className="text-sm font-semibold text-[var(--color-primary)]">Upcoming Tasks</h3>
          </CardHeader>
          <CardContent>
            {upcomingTasks.length === 0 ? (
              <p className="py-4 text-center text-sm text-gray-400">No upcoming tasks</p>
            ) : (
              <ul className="divide-y divide-[var(--color-border)]">
                {upcomingTasks.map((task) => (
                  <li key={task.id} className="flex items-center justify-between py-2.5 first:pt-0 last:pb-0">
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-[var(--color-primary)]">{task.title}</p>
                      <p className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {task.date} at {task.time}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <h3 className="text-sm font-semibold text-[var(--color-primary)]">Recent Activity</h3>
        </CardHeader>
        <CardContent>
          <ul className="space-y-1">
            {activityFeed.map((entry) => (
              <li
                key={entry.id}
                className="flex items-start gap-3 rounded-lg px-2 py-2 transition hover:bg-[var(--color-surface)]"
              >
                <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-surface)] text-sm">
                  {entry.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-[var(--color-primary)]">{entry.action}</p>
                  <p className="truncate text-xs text-gray-500">{entry.detail}</p>
                </div>
                <span className="flex-shrink-0 text-xs text-gray-400">{entry.time}</span>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
