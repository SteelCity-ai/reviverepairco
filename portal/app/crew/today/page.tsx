import { Clock, MapPin } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const mockCrewMember = {
  name: "Mike",
  clockedIn: false,
};

const mockTodayTasks = [
  {
    id: "dt-001",
    title: "Tear off shingles — front slope",
    projectName: "Smith Residence",
    scheduledTime: "7:00 AM",
    status: "IN_PROGRESS",
  },
  {
    id: "dt-002",
    title: "Install underlayment",
    projectName: "Smith Residence",
    scheduledTime: "10:00 AM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-003",
    title: "Replace ridge vent",
    projectName: "Johnson Commercial",
    scheduledTime: "1:00 PM",
    status: "NOT_STARTED",
  },
  {
    id: "dt-004",
    title: "Inspect flashing around chimney",
    projectName: "Johnson Commercial",
    scheduledTime: "3:00 PM",
    status: "DONE",
  },
];

// ── Helpers ─────────────────────────────────────────────────

function getGreeting(name: string): string {
  const hour = new Date().getHours();
  if (hour < 12) return `Good morning, ${name}`;
  if (hour < 17) return `Good afternoon, ${name}`;
  return `Good evening, ${name}`;
}

function formatTodayDate(): string {
  return new Date().toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
  });
}

// ── Page ────────────────────────────────────────────────────

export default function CrewTodayPage() {
  const grouped = mockTodayTasks.reduce<Record<string, typeof mockTodayTasks>>((acc, task) => {
    if (!acc[task.projectName]) acc[task.projectName] = [];
    acc[task.projectName].push(task);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in-up px-4 py-5">
      {/* Greeting */}
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          {getGreeting(mockCrewMember.name)}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{formatTodayDate()}</p>
      </div>

      {/* Clock-in reminder */}
      {!mockCrewMember.clockedIn && (
        <a
          href="/crew/clock-in"
          className="mb-5 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition hover:bg-amber-100"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-amber)] text-lg">
            ⏱
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-[var(--color-primary)]">You haven&apos;t clocked in yet</p>
            <p className="text-xs text-gray-500">Tap here to clock in and start your day</p>
          </div>
          <span className="text-xs font-semibold text-amber-600">Clock In →</span>
        </a>
      )}

      {/* Weather badge */}
      <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-sm shadow-sm">
        <span>⛅</span>
        <span className="font-medium text-[var(--color-primary)]">72°F</span>
        <span className="text-gray-400">Partly Cloudy</span>
      </div>

      {/* Today's Tasks */}
      {mockTodayTasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks scheduled for today"
          description="Enjoy your day! Check upcoming tasks for what's next."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([projectName, tasks]) => (
            <section key={projectName}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                <MapPin className="h-3.5 w-3.5" />
                {projectName}
              </h2>
              <div className="space-y-3">
                {tasks.map((task) => (
                  <a key={task.id} href={`/crew/task/${task.id}`} className="block transition active:scale-[0.98]">
                    <Card className={cn(task.status === "DONE" && "opacity-60")}>
                      <CardContent>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-[var(--color-primary)]">{task.title}</h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{task.scheduledTime}</span>
                            </div>
                          </div>
                          <StatusBadge status={task.status} />
                        </div>

                        {task.status === "NOT_STARTED" && (
                          <div className="mt-3">
                            <Button size="sm" className="w-full text-xs">
                              Start Task
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </a>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
