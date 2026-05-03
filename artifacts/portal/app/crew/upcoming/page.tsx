import Link from "next/link";
import { api } from "@/lib/api-server";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

interface DailyTaskRow {
  id: string;
  title: string;
  scheduledDate: string | null;
  status: string;
}

function dateRangeET(daysAhead: number): { from: string; to: string } {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const end = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
  return { from: fmt(tomorrow), to: fmt(end) };
}

export const dynamic = "force-dynamic";

export default async function CrewUpcomingPage() {
  const { from, to } = dateRangeET(7);
  const tasks =
    (await api<DailyTaskRow[]>(
      `/daily-tasks?dateFrom=${from}&dateTo=${to}&status=NOT_STARTED`,
    )) ?? [];

  const grouped = tasks.reduce<Record<string, DailyTaskRow[]>>((acc, t) => {
    const key = t.scheduledDate ?? "Unscheduled";
    if (!acc[key]) acc[key] = [];
    acc[key].push(t);
    return acc;
  }, {});

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-4 text-xl font-bold text-[var(--color-primary)]">
        Upcoming
      </h1>
      {tasks.length === 0 ? (
        <EmptyState
          icon="📅"
          title="Nothing in the next 7 days"
          description="You're all caught up."
        />
      ) : (
        <div className="space-y-6">
          {Object.entries(grouped)
            .sort(([a], [b]) => a.localeCompare(b))
            .map(([date, items]) => (
              <section key={date}>
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-400">
                  {date}
                </h2>
                <div className="space-y-3">
                  {items.map((t) => (
                    <Link key={t.id} href={`/crew/task/${t.id}`}>
                      <Card>
                        <CardContent>
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium text-[var(--color-primary)]">
                              {t.title}
                            </span>
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
