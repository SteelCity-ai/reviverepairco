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
  completedAt: string | null;
}

function rangeET(daysBack: number): { from: string; to: string } {
  const fmt = (d: Date) =>
    new Intl.DateTimeFormat("en-CA", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(d);
  const now = new Date();
  const start = new Date(now.getTime() - daysBack * 24 * 60 * 60 * 1000);
  return { from: fmt(start), to: fmt(now) };
}

export const dynamic = "force-dynamic";

export default async function CrewDonePage() {
  const { from, to } = rangeET(30);
  const tasks =
    (await api<DailyTaskRow[]>(
      `/daily-tasks?dateFrom=${from}&dateTo=${to}&status=DONE`,
    )) ?? [];

  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-4 text-xl font-bold text-[var(--color-primary)]">
        Completed (last 30 days)
      </h1>
      {tasks.length === 0 ? (
        <EmptyState
          icon="✅"
          title="No completed tasks yet"
          description="Tasks you mark done will appear here."
        />
      ) : (
        <div className="space-y-3">
          {tasks.map((t) => (
            <Link key={t.id} href={`/crew/task/${t.id}`}>
              <Card>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-[var(--color-primary)]">
                        {t.title}
                      </p>
                      <p className="text-xs text-gray-400">
                        {t.scheduledDate ?? "—"}
                      </p>
                    </div>
                    <StatusBadge status={t.status} />
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
