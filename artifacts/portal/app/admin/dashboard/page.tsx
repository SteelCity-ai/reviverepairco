import { Card } from "@/components/ui/Card";
import Link from "next/link";
import { api } from "@/lib/api-server";

interface ProjectRow {
  id: string;
  name: string;
  status: string;
  updatedAt: string;
}
interface MainTaskRow {
  id: string;
  name: string;
  status: string;
}
interface DailyTaskRow {
  id: string;
  title: string;
  status: string;
  scheduledDate: string | null;
}
interface ActivityRow {
  id: string;
  verb: string;
  entityType: string | null;
  createdAt: string;
}

function todayET(): string {
  const fmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/New_York",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  return fmt.format(new Date());
}

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const today = todayET();
  const [projects, mainTasks, todayTasks, openTasks] = await Promise.all([
    api<ProjectRow[]>("/projects"),
    api<MainTaskRow[]>("/main-tasks"),
    api<DailyTaskRow[]>(`/daily-tasks?date=${today}`),
    // Open (NOT_STARTED) daily tasks across all dates — filter overdue locally.
    api<DailyTaskRow[]>(`/daily-tasks?status=NOT_STARTED`),
  ]);

  const activeProjects = (projects ?? []).filter(
    (p) => p.status === "ACTIVE" || p.status === "PLANNED",
  ).length;
  const awaitingPm = (mainTasks ?? []).filter(
    (t) => t.status === "PM_REVIEW",
  ).length;
  const awaitingClient = (mainTasks ?? []).filter(
    (t) => t.status === "CLIENT_SIGNOFF",
  ).length;
  const todayCount = (todayTasks ?? []).length;
  const overdue = (openTasks ?? []).filter(
    (t) => t.scheduledDate !== null && t.scheduledDate < today,
  ).length;

  return (
    <div className="animate-fade-in-up space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">
          Dashboard
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Project overview and key metrics
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        <KpiCard
          label="Active Projects"
          value={String(activeProjects)}
          href="/admin/projects"
          accent
        />
        <KpiCard
          label="Awaiting PM Review"
          value={String(awaitingPm)}
          href="/admin/projects"
        />
        <KpiCard
          label="Awaiting Client Signoff"
          value={String(awaitingClient)}
          href="/admin/projects"
        />
        <KpiCard
          label="Daily Tasks Today"
          value={String(todayCount)}
          href="/admin/projects"
        />
        <KpiCard label="Overdue" value={String(overdue)} href="/admin/projects" />
      </div>

      <Card>
        <h2 className="mb-4 text-lg font-semibold text-[var(--color-primary)]">
          Recent Projects
        </h2>
        <div className="space-y-2">
          {(projects ?? []).slice(0, 8).map((p) => (
            <Link
              key={p.id}
              href={`/admin/projects/${p.id}`}
              className="flex items-center justify-between border-b border-[var(--color-border)] py-2 last:border-0"
            >
              <span className="text-sm text-[var(--color-primary)]">
                {p.name}
              </span>
              <span className="text-xs uppercase tracking-wide text-gray-400">
                {p.status}
              </span>
            </Link>
          ))}
          {!projects?.length && (
            <p className="text-sm text-gray-400">No projects yet.</p>
          )}
        </div>
      </Card>
    </div>
  );
}

function KpiCard({
  label,
  value,
  href,
  accent,
}: {
  label: string;
  value: string;
  href: string;
  accent?: boolean;
}) {
  return (
    <Link href={href} className="block">
      <Card className="relative overflow-hidden transition hover:shadow-md">
        {accent && (
          <div className="absolute left-0 top-0 h-1 w-full bg-[var(--color-amber)]" />
        )}
        <p className="text-sm text-gray-500">{label}</p>
        <p className="mt-1 text-3xl font-bold text-[var(--color-primary)]">
          {value}
        </p>
      </Card>
    </Link>
  );
}
