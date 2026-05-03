import { Clock, CalendarDays, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

function addDays(date: Date, n: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + n);
  return d;
}

const upcomingTasks = [
  {
    id: "dt-101",
    title: "Install drip edge — north slope",
    projectName: "Smith Residence",
    scheduledDate: tomorrow.toISOString().split("T")[0],
    scheduledTime: "7:00 AM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-102",
    title: "Replace damaged sheathing panels",
    projectName: "Smith Residence",
    scheduledDate: addDays(today, 2).toISOString().split("T")[0],
    scheduledTime: "10:00 AM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-103",
    title: "Install ice & water shield",
    projectName: "Smith Residence",
    scheduledDate: addDays(today, 2).toISOString().split("T")[0],
    scheduledTime: "1:00 PM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-104",
    title: "Flat roof inspection",
    projectName: "Johnson Commercial",
    scheduledDate: addDays(today, 3).toISOString().split("T")[0],
    scheduledTime: "9:00 AM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-105",
    title: "Measure and cut tapered insulation",
    projectName: "Johnson Commercial",
    scheduledDate: addDays(today, 4).toISOString().split("T")[0],
    scheduledTime: "1:00 PM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-106",
    title: "Full tear-off — garage",
    projectName: "Williams Estate",
    scheduledDate: addDays(today, 5).toISOString().split("T")[0],
    scheduledTime: "7:00 AM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-107",
    title: "Install ridge vent — garage",
    projectName: "Williams Estate",
    scheduledDate: addDays(today, 6).toISOString().split("T")[0],
    scheduledTime: "1:00 PM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-108",
    title: "Chimney flashing replacement",
    projectName: "Davis Home",
    scheduledDate: addDays(today, 9).toISOString().split("T")[0],
    scheduledTime: "8:00 AM",
    status: "NOT_STARTED",
  },
];

// ── Grouping Logic ──────────────────────────────────────────

function groupByPeriod(tasks: typeof upcomingTasks) {
  const now = new Date();
  now.setHours(0, 0, 0, 0);

  const tomorrowDate = new Date(now);
  tomorrowDate.setDate(tomorrowDate.getDate() + 1);
  tomorrowDate.setHours(0, 0, 0, 0);

  const tomorrowEnd = new Date(now);
  tomorrowEnd.setDate(tomorrowEnd.getDate() + 1);
  tomorrowEnd.setHours(23, 59, 59, 999);

  const weekEnd = new Date(now);
  const daysUntilSaturday = 6 - weekEnd.getDay();
  weekEnd.setDate(weekEnd.getDate() + daysUntilSaturday);
  weekEnd.setHours(23, 59, 59, 999);

  const tomorrow: typeof upcomingTasks = [];
  const thisWeek: typeof upcomingTasks = [];
  const nextWeek: typeof upcomingTasks = [];

  for (const task of tasks) {
    const d = new Date(task.scheduledDate);
    d.setHours(0, 0, 0, 0);

    if (d.getTime() === tomorrowDate.getTime()) {
      tomorrow.push(task);
    } else if (d > tomorrowEnd && d <= weekEnd) {
      thisWeek.push(task);
    } else {
      nextWeek.push(task);
    }
  }

  return { tomorrow, thisWeek, nextWeek };
}

// ── Page ────────────────────────────────────────────────────

export default function CrewUpcomingPage() {
  const { tomorrow, thisWeek, nextWeek } = groupByPeriod(upcomingTasks);
  const totalCount = upcomingTasks.length;

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-4 text-xl font-bold text-[var(--color-primary)]">Upcoming Tasks</h1>

      {totalCount === 0 ? (
        <EmptyState
          icon="📅"
          title="No upcoming tasks"
          description="No future tasks are scheduled yet."
        />
      ) : (
        <div className="space-y-6">
          {/* Tomorrow */}
          {tomorrow.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Tomorrow</h2>
              <div className="space-y-3">
                {tomorrow.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* This Week */}
          {thisWeek.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">This Week</h2>
              <div className="space-y-3">
                {thisWeek.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}

          {/* Next Week */}
          {nextWeek.length > 0 && (
            <section>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">Next Week</h2>
              <div className="space-y-3">
                {nextWeek.map((task) => (
                  <TaskCard key={task.id} task={task} />
                ))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub-component ───────────────────────────────────────────

function TaskCard({
  task,
}: {
  task: {
    id: string;
    title: string;
    projectName: string;
    scheduledDate: string;
    scheduledTime: string;
    status: string;
  };
}) {
  return (
    <a href={`/crew/task/${task.id}`} className="block transition active:scale-[0.98]">
      <Card>
        <CardContent>
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[var(--color-primary)]">{task.title}</h3>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-gray-400">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {task.projectName}
                </span>
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {formatDate(task.scheduledDate)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {task.scheduledTime}
                </span>
              </div>
            </div>
            <StatusBadge status={task.status} />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}
