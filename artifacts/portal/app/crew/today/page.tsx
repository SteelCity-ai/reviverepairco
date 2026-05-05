import { Clock, MapPin, ChevronRight } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/api-server";
import { currentUser } from "@clerk/nextjs/server";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { cn } from "@/lib/utils";

interface DailyTaskRow {
  id: string;
  title: string;
  scheduledDate: string | null;
  status: string;
  mainTaskId: string;
}
interface MainTaskRow {
  id: string;
  name: string;
  workTypeId: string;
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

export const dynamic = "force-dynamic";

export default async function CrewTodayPage() {
  const today = todayET();
  const user = await currentUser();
  const tasks = (await api<DailyTaskRow[]>(`/daily-tasks?date=${today}`)) ?? [];
  const mainTaskMap = new Map<string, MainTaskRow>();
  if (tasks.length) {
    const mts = (await api<MainTaskRow[]>(`/main-tasks`)) ?? [];
    for (const m of mts) mainTaskMap.set(m.id, m);
  }

  // Group by mainTaskId so we can show one "View full checklist" link per group
  const grouped = tasks.reduce<Record<string, { mainTask: MainTaskRow | null; items: DailyTaskRow[] }>>(
    (acc, t) => {
      const mt = mainTaskMap.get(t.mainTaskId) ?? null;
      const key = t.mainTaskId;
      if (!acc[key]) acc[key] = { mainTask: mt, items: [] };
      acc[key]!.items.push(t);
      return acc;
    },
    {},
  );

  const name = user?.firstName ?? user?.username ?? "there";

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <div className="mb-4">
        <h1 className="text-xl font-bold text-[var(--color-primary)]">
          {getGreeting(name)}
        </h1>
        <p className="mt-0.5 text-sm text-gray-500">{formatTodayDate()}</p>
      </div>

      {tasks.length === 0 ? (
        <EmptyState
          icon="📋"
          title="No tasks scheduled for today"
          description="Enjoy your day! Check upcoming tasks for what's next."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped).map(([mainTaskId, { mainTask, items }]) => (
            <section key={mainTaskId}>
              <div className="mb-3 flex items-center justify-between">
                <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  <MapPin className="h-3.5 w-3.5" />
                  {mainTask?.name ?? "Tasks"}
                </h2>
                <Link
                  href={`/crew/main-task/${mainTaskId}`}
                  className="flex items-center gap-0.5 text-xs font-medium text-[var(--color-amber)] hover:underline"
                >
                  Full checklist
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              </div>
              <div className="space-y-3">
                {items.map((t) => (
                  <Link
                    key={t.id}
                    href={`/crew/task/${t.id}`}
                    className="block transition active:scale-[0.98]"
                  >
                    <Card className={cn(t.status === "DONE" && "opacity-60")}>
                      <CardContent>
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0 flex-1">
                            <h3 className="text-sm font-semibold text-[var(--color-primary)]">
                              {t.title}
                            </h3>
                            <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                              <Clock className="h-3 w-3" />
                              <span>{t.scheduledDate ?? "Today"}</span>
                            </div>
                          </div>
                          <StatusBadge status={t.status} />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
