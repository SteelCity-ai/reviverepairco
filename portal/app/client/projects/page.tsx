import { MapPin, Calendar, ArrowRight } from "lucide-react";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/Badge";
import { EmptyState } from "@/components/ui/EmptyState";
import { formatDate, cn } from "@/lib/utils";

// ── Mock Data ───────────────────────────────────────────────

const mockProjects = [
  {
    id: "proj-001",
    name: "Full Roof Replacement",
    address: "124 Oak Lane, Pittsburgh, PA 15237",
    startDate: "2026-04-22",
    status: "IN_PROGRESS",
    progress: 65,
  },
  {
    id: "proj-002",
    name: "Gutter Replacement & Inspection",
    address: "124 Oak Lane, Pittsburgh, PA 15237",
    startDate: "2026-05-15",
    status: "NOT_STARTED",
    progress: 0,
  },
  {
    id: "proj-003",
    name: "Attic Insulation Upgrade",
    address: "124 Oak Lane, Pittsburgh, PA 15237",
    startDate: "2026-03-10",
    status: "COMPLETE",
    progress: 100,
  },
];

// ── Page ────────────────────────────────────────────────────

export default function ClientProjectsPage() {
  return (
    <div className="animate-fade-in-up">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-primary)]">My Projects</h1>
        <p className="mt-1 text-sm text-gray-500">Track the progress of your roofing and repair projects.</p>
      </div>

      {mockProjects.length === 0 ? (
        <EmptyState
          icon="🏠"
          title="No projects yet"
          description="Contact your project manager to get started."
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {mockProjects.map((project) => (
            <a
              key={project.id}
              href={`/client/projects/${project.id}`}
              className="group block transition hover:scale-[1.01] active:scale-[0.99]"
            >
              <Card
                className={cn(
                  "flex h-full flex-col transition group-hover:border-[var(--color-amber)]/40 group-hover:shadow-md",
                  project.status === "COMPLETE" && "opacity-70",
                )}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-3">
                    <h2 className="text-base font-semibold text-[var(--color-primary)]">{project.name}</h2>
                    <StatusBadge status={project.status} />
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <div className="flex-1 space-y-2">
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                      <span className="truncate">{project.address}</span>
                    </p>
                    <p className="flex items-center gap-1.5 text-xs text-gray-400">
                      <Calendar className="h-3.5 w-3.5 flex-shrink-0" />
                      Started {formatDate(project.startDate)}
                    </p>

                    {/* Progress bar */}
                    <div className="pt-2">
                      <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
                        <span>Progress</span>
                        <span className="font-mono font-medium text-[var(--color-primary)]">
                          {project.progress}%
                        </span>
                      </div>
                      <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            project.progress === 100
                              ? "bg-green-400"
                              : project.progress > 0
                                ? "bg-[var(--color-amber)]"
                                : "bg-gray-200",
                          )}
                          style={{ width: `${project.progress}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* View link */}
                  <div className="mt-4 flex items-center gap-1 text-xs font-medium text-[var(--color-amber)] group-hover:underline">
                    View Details
                    <ArrowRight className="h-3 w-3" />
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
