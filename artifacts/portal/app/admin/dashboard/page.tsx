import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function AdminDashboard() {
  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">Project overview and key metrics</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Active Projects" value="12" trend="+2 this month" accent />
        <KpiCard label="Pending Approvals" value="5" trend="3 photos, 2 tasks" />
        <KpiCard label="Crew Tasks Today" value="24" trend="8 completed so far" />
        <KpiCard label="Revenue (MTD)" value="$48,250" trend="+12% vs last month" />
      </div>

      {/* Quick Actions */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <Button variant="primary" size="sm">+ New Project</Button>
          <Button variant="secondary" size="sm">+ New Client</Button>
          <Button variant="secondary" size="sm">+ Invite User</Button>
        </div>
      </Card>

      {/* Recent Activity */}
      <Card>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">Recent Activity</h2>
        <div className="space-y-3">
          {[
            { verb: "completed task", entity: "Shingle tear-off — Day 2", time: "10 min ago", actor: "Mike C." },
            { verb: "uploaded photos", entity: "Flashing installation", time: "32 min ago", actor: "Dave R." },
            { verb: "approved photos", entity: "Underlayment inspection", time: "1 hour ago", actor: "Sarah P." },
            { verb: "created project", entity: "Smith Residence — Roof Replacement", time: "2 hours ago", actor: "Sarah P." },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3 border-b border-[var(--color-border)] pb-3 last:border-0 last:pb-0">
              <div className="mt-0.5 h-2 w-2 rounded-full bg-[var(--color-amber)]" />
              <div className="flex-1 text-sm">
                <span className="font-medium text-[var(--color-primary)]">{item.actor}</span>
                {" "}{item.verb}{" "}
                <span className="text-gray-600">{item.entity}</span>
              </div>
              <span className="text-xs text-gray-400">{item.time}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  trend,
  accent,
}: {
  label: string;
  value: string;
  trend: string;
  accent?: boolean;
}) {
  return (
    <Card className="relative overflow-hidden">
      {accent && <div className="absolute left-0 top-0 h-1 w-full bg-[var(--color-amber)]" />}
      <p className="text-sm text-gray-500">{label}</p>
      <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">{value}</p>
      <p className="mt-1 text-xs text-gray-400">{trend}</p>
    </Card>
  );
}
