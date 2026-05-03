import { Clock, MapPin, Camera, CheckCircle2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";

// ── Mock Data ───────────────────────────────────────────────

const mockCompletedTasks = [
  {
    id: "dt-004",
    title: "Inspect flashing around chimney",
    projectName: "Johnson Commercial",
    completedTime: "Today, 2:30 PM",
    photosCount: 5,
    status: "DONE",
  },
  {
    id: "dt-005",
    title: "Remove old ridge vent",
    projectName: "Johnson Commercial",
    completedTime: "Today, 11:45 AM",
    photosCount: 3,
    status: "DONE",
  },
  {
    id: "dt-006",
    title: "Sweep & clean deck surface",
    projectName: "Smith Residence",
    completedTime: "Yesterday, 4:15 PM",
    photosCount: 2,
    status: "DONE",
  },
  {
    id: "dt-007",
    title: "Install synthetic underlayment",
    projectName: "Smith Residence",
    completedTime: "Yesterday, 1:30 PM",
    photosCount: 4,
    status: "DONE",
  },
  {
    id: "dt-008",
    title: "Drip edge installation",
    projectName: "Smith Residence",
    completedTime: "Yesterday, 11:00 AM",
    photosCount: 3,
    status: "DONE",
  },
  {
    id: "dt-009",
    title: "Tear off garage shingles",
    projectName: "Williams Estate",
    completedTime: "Mon, Apr 28",
    photosCount: 8,
    status: "DONE",
  },
  {
    id: "dt-010",
    title: "Underlayment — garage",
    projectName: "Williams Estate",
    completedTime: "Mon, Apr 28",
    photosCount: 2,
    status: "DONE",
  },
  {
    id: "dt-011",
    title: "Chimney re-flash",
    projectName: "Davis Home",
    completedTime: "Fri, Apr 25",
    photosCount: 6,
    status: "DONE",
  },
  {
    id: "dt-012",
    title: "Gutter inspection",
    projectName: "Davis Home",
    completedTime: "Fri, Apr 25",
    photosCount: 2,
    status: "DONE",
  },
  {
    id: "dt-013",
    title: "Replace shingle starter course",
    projectName: "Williams Estate",
    completedTime: "Thu, Apr 24",
    photosCount: 3,
    status: "DONE",
  },
  {
    id: "dt-014",
    title: "Install drip edge — back",
    projectName: "Smith Residence",
    completedTime: "Wed, Apr 23",
    photosCount: 2,
    status: "DONE",
  },
  {
    id: "dt-015",
    title: "Day 1 walkthrough / measurements",
    projectName: "Smith Residence",
    completedTime: "Tue, Apr 22",
    photosCount: 4,
    status: "DONE",
  },
];

const thisWeekCount = 12;
const totalCompleted = 47;

// ── Page ────────────────────────────────────────────────────

export default function CrewDonePage() {
  return (
    <div className="animate-fade-in-up px-4 py-5">
      <h1 className="mb-1 text-xl font-bold text-[var(--color-primary)]">Done</h1>

      {/* Stats */}
      <div className="mb-5 mt-3 rounded-2xl border border-[var(--color-border)] bg-white p-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-50">
            <CheckCircle2 className="h-6 w-6 text-green-500" />
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--color-primary)]">
              {thisWeekCount} tasks completed this week
            </p>
            <p className="text-xs text-gray-400">{totalCompleted} total completed tasks</p>
          </div>
        </div>
        {/* Mini progress */}
        <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
          <div className="h-full w-3/4 rounded-full bg-green-400" />
        </div>
      </div>

      {/* Completed list */}
      {mockCompletedTasks.length === 0 ? (
        <EmptyState
          icon="✓"
          title="No completed tasks yet"
          description="Completed tasks will appear here once you mark them as done."
        />
      ) : (
        <div className="space-y-3">
          {mockCompletedTasks.map((task) => (
            <a key={task.id} href={`/crew/task/${task.id}`} className="block transition active:scale-[0.98]">
              <Card className="opacity-80">
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
                          <Clock className="h-3 w-3" />
                          {task.completedTime}
                        </span>
                        {task.photosCount > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Camera className="h-3 w-3" />
                            {task.photosCount} photos
                          </span>
                        )}
                      </div>
                    </div>
                    <StatusBadge status={task.status} />
                  </div>
                </CardContent>
              </Card>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
