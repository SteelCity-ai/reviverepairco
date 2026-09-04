"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge, Badge } from "@/components/ui/Badge";
import { Tabs, type Tab } from "@/components/ui/Tabs";
import { EmptyState } from "@/components/ui/EmptyState";
import { Loading } from "@/components/ui/Loading";
import { formatDate } from "@/lib/utils";
import { useApi } from "@/lib/api-browser";

// ── Types ─────────────────────────────────────────────────────────────────

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  tags: string[] | null;
  metaTitle: string | null;
  metaDescription: string | null;
  featuredImage: string | null;
  status: string;
  sourceInsightId: string | null;
  sourceUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

interface BlogInsight {
  id: string;
  title: string;
  summary: string;
  category: string | null;
  sourceUrl: string | null;
  status: string;
  publishedAt: string | null;
  createdAt: string;
}

interface AIBlogJob {
  id: string;
  type: string;
  status: string;
  postId: string | null;
  postTitle?: string;
  error: string | null;
  createdAt: string;
}

interface PaginatedRes<T> {
  data: T[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

// ── Constants ─────────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "", label: "All Statuses" },
  { value: "draft", label: "Draft" },
  { value: "pending_review", label: "Pending Review" },
  { value: "published", label: "Published" },
];

const CATEGORY_OPTIONS = [
  { value: "", label: "All Categories" },
  { value: "roofing", label: "Roofing" },
  { value: "renovation", label: "Renovation" },
  { value: "contracting", label: "Contracting" },
  { value: "seasonal_home_tips", label: "Seasonal Home Tips" },
  { value: "central_pa", label: "Central PA" },
];

const INSIGHT_FILTER_OPTIONS = [
  { value: "", label: "All" },
  { value: "new", label: "New" },
  { value: "dismissed", label: "Dismissed" },
  { value: "used", label: "Used" },
];

// ── Page ──────────────────────────────────────────────────────────────────

export default function BlogAdminPage() {
  const { api } = useApi();

  // Tab state
  const [activeTab, setActiveTab] = useState("posts");

  // ── Posts tab ──────────────────────────────────────────────────────────

  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [postsLoading, setPostsLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, total: 0, totalPages: 0 });
  const [statusFilter, setStatusFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [searchFilter, setSearchFilter] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchPosts = useCallback(async () => {
    setPostsLoading(true);
    try {
      const qs = new URLSearchParams();
      if (statusFilter) qs.set("status", statusFilter);
      if (categoryFilter) qs.set("category", categoryFilter);
      if (searchFilter) qs.set("search", searchFilter);
      qs.set("page", String(currentPage));
      qs.set("limit", "25");
      const r = await api<PaginatedRes<BlogPost>>(`/api/v1/blog?${qs.toString()}`);
      setPosts(r.data);
      setPagination(r.pagination);
    } catch {
      setPosts([]);
      setPagination({ page: 1, total: 0, totalPages: 0 });
    } finally {
      setPostsLoading(false);
    }
  }, [api, statusFilter, categoryFilter, searchFilter, currentPage]);

  useEffect(() => {
    if (activeTab === "posts") fetchPosts();
  }, [fetchPosts, activeTab]);

  const applyFilters = () => {
    setSearchFilter(searchInput);
    setCurrentPage(1);
  };

  // ── Insights tab ───────────────────────────────────────────────────────

  const [insights, setInsights] = useState<BlogInsight[]>([]);
  const [insightsLoading, setInsightsLoading] = useState(false);
  const [insightFilter, setInsightFilter] = useState("");
  const [researchRunning, setResearchRunning] = useState(false);
  const [researchError, setResearchError] = useState<string | null>(null);
  const [researchJobId, setResearchJobId] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true);
    try {
      const r = await api<{ data: BlogInsight[] }>("/api/v1/blog-ai/insights");
      setInsights(r.data ?? []);
    } catch {
      setInsights([]);
    } finally {
      setInsightsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (activeTab === "insights") fetchInsights();
  }, [fetchInsights, activeTab]);

  const doResearch = async () => {
    setResearchRunning(true);
    setResearchError(null);
    try {
      const r = await api<{ jobId: string; status: string }>("/api/v1/blog-ai/research", {
        method: "POST",
      });
      setResearchJobId(r.jobId);
      // Poll for job completion
      pollRef.current = setInterval(async () => {
        try {
          const job = await api<AIBlogJob>(`/api/v1/blog-ai/jobs/${r.jobId}`);
          if (job.status === "succeeded") {
            if (pollRef.current) clearInterval(pollRef.current);
            setResearchRunning(false);
            setResearchJobId(null);
            fetchInsights();
          } else if (job.status === "failed") {
            if (pollRef.current) clearInterval(pollRef.current);
            setResearchRunning(false);
            setResearchJobId(null);
            setResearchError(
              job.error ?? "Research stopped rather than inventing news. No insights were created.",
            );
          }
        } catch {
          // Poll continues
        }
      }, 3000);
      // Safety timeout after 2 min
      setTimeout(() => {
        if (pollRef.current) {
          clearInterval(pollRef.current);
          setResearchRunning(false);
          setResearchError("Research is taking longer than expected. Check the AI Jobs tab.");
        }
      }, 120000);
    } catch (err) {
      setResearchRunning(false);
      setResearchError((err as Error).message);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  };

  const promoteInsight = async (insightId: string) => {
    try {
      const r = await api<{ post: BlogPost }>(`/api/v1/blog-ai/insights/${insightId}/promote`, {
        method: "POST",
      });
      // Update local state to show as used
      setInsights((prev) =>
        prev.map((i) =>
          i.id === insightId ? { ...i, status: "used", sourceUrl: i.sourceUrl } : i,
        ),
      );
    } catch (err) {
      const msg = (err as Error).message;
      if (msg.toLowerCase().includes("already")) {
        alert("This insight has already been promoted.");
      }
    }
  };

  const dismissInsight = async (insightId: string) => {
    try {
      await api(`/api/v1/blog-ai/insights/${insightId}`, {
        method: "PATCH",
        body: { status: "dismissed" },
      });
      setInsights((prev) =>
        prev.map((i) => (i.id === insightId ? { ...i, status: "dismissed" } : i)),
      );
    } catch {
      // ignore
    }
  };

  const undoDismiss = async (insightId: string) => {
    try {
      await api(`/api/v1/blog-ai/insights/${insightId}`, {
        method: "PATCH",
        body: { status: "new" },
      });
      setInsights((prev) =>
        prev.map((i) => (i.id === insightId ? { ...i, status: "new" } : i)),
      );
    } catch {
      // ignore
    }
  };

  // ── AI Jobs tab ────────────────────────────────────────────────────────

  const [jobs, setJobs] = useState<AIBlogJob[]>([]);
  const [jobsLoading, setJobsLoading] = useState(false);

  const fetchJobs = useCallback(async () => {
    setJobsLoading(true);
    try {
      const r = await api<{ data: AIBlogJob[] }>("/api/v1/blog-ai/jobs");
      setJobs(r.data ?? []);
    } catch {
      setJobs([]);
    } finally {
      setJobsLoading(false);
    }
  }, [api]);

  useEffect(() => {
    if (activeTab === "jobs") fetchJobs();
  }, [fetchJobs, activeTab]);

  // ── Tab config ─────────────────────────────────────────────────────────

  const tabs: Tab[] = [
    { id: "posts", label: "Posts", count: pagination.total },
    {
      id: "insights",
      label: "Insights",
      count: insights.length,
    },
    { id: "jobs", label: "AI Jobs", count: jobs.length },
  ];

  const hasActiveFilters = !!(statusFilter || categoryFilter || searchFilter);

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="animate-fade-in-up space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">Blog</h1>
          <p className="mt-1 text-sm text-gray-500">
            {pagination.total} post{pagination.total !== 1 ? "s" : ""}
          </p>
        </div>
        <div className="flex gap-2">
          {activeTab === "insights" && (
            <Button
              variant="outline"
              size="sm"
              disabled={researchRunning}
              onClick={doResearch}
            >
              {researchRunning ? "Researching…" : "Run Research"}
            </Button>
          )}
          <Link href="/admin/blog/new">
            <Button variant="primary">＋ New Post</Button>
          </Link>
        </div>
      </div>

      {/* Tabs */}
      <Tabs tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />

      {/* ── Posts Tab ──────────────────────────────────────────────────── */}
      {activeTab === "posts" && (
        <div className="space-y-6">
          {/* Filter Row */}
          <Card>
            <div className="flex flex-wrap gap-3">
              <div className="w-40">
                <Select
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                />
              </div>
              <div className="w-44">
                <Select
                  options={CATEGORY_OPTIONS}
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
              <div className="min-w-[200px] flex-1">
                <Input
                  placeholder="Search by title"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && applyFilters()}
                />
              </div>
              <Button variant="secondary" size="sm" onClick={applyFilters}>
                Apply
              </Button>
              <button
                className="text-sm text-gray-500 hover:text-[var(--color-primary)] transition"
                onClick={() => {
                  setStatusFilter("");
                  setCategoryFilter("");
                  setSearchFilter("");
                  setSearchInput("");
                  setCurrentPage(1);
                }}
              >
                Reset
              </button>
            </div>
          </Card>

          {postsLoading ? (
            <Loading message="Loading posts…" />
          ) : posts.length === 0 ? (
            <EmptyState
              icon="✎"
              title={hasActiveFilters ? "No posts match these filters" : "No posts yet"}
              description={
                hasActiveFilters
                  ? "Try adjusting your filter criteria."
                  : "Create a post or run AI research to draft your first article."
              }
              action={
                <div className="flex gap-2">
                  <Link href="/admin/blog/new">
                    <Button variant="primary" size="sm">
                      ＋ New Post
                    </Button>
                  </Link>
                </div>
              }
            />
          ) : (
            <>
              <Card className="overflow-hidden p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                        <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Title</th>
                        <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Category</th>
                        <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                        <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Sourced</th>
                        <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Updated</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-border)]">
                      {posts.map((p) => (
                        <tr
                          key={p.id}
                          className="transition-colors hover:bg-[var(--color-surface)]"
                        >
                          <td className="px-6 py-3">
                            <Link
                              href={`/admin/blog/${p.id}`}
                              className="font-medium text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                            >
                              {p.title}
                            </Link>
                          </td>
                          <td className="px-6 py-3 text-gray-600">
                            {p.category
                              ? p.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
                              : "—"}
                          </td>
                          <td className="px-6 py-3">
                            <StatusBadge status={p.status} />
                          </td>
                          <td className="px-6 py-3">
                            {(p.sourceInsightId || p.sourceUrl) ? (
                              <span
                                className="inline-flex items-center rounded-full bg-purple-50 px-2 py-0.5 text-xs font-medium text-purple-600"
                                title={p.sourceUrl ?? undefined}
                              >
                                AI · sourced
                              </span>
                            ) : (
                              <span className="text-gray-300">—</span>
                            )}
                          </td>
                          <td className="px-6 py-3 text-gray-500">{formatDate(p.updatedAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-500">
                    Page {pagination.page} of {pagination.totalPages} · {pagination.total} total
                  </p>
                  <div className="flex gap-2">
                    {pagination.page > 1 ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p - 1)}
                      >
                        Previous
                      </Button>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold text-gray-300">
                        Previous
                      </span>
                    )}
                    {pagination.page < pagination.totalPages ? (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => setCurrentPage((p) => p + 1)}
                      >
                        Next
                      </Button>
                    ) : (
                      <span className="inline-flex items-center justify-center rounded-full px-3 py-1.5 text-sm font-semibold text-gray-300">
                        Next
                      </span>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* ── Insights Tab ───────────────────────────────────────────────── */}
      {activeTab === "insights" && (
        <div className="space-y-6">
          {/* Research State */}
          {researchRunning && (
            <Card>
              <div className="flex items-center gap-3 py-4 px-4 text-sm text-purple-600">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-purple-200 border-t-purple-600" />
                Researching Central-PA trade news…
              </div>
            </Card>
          )}

          {researchError && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4">
              <p className="text-sm text-red-600">{researchError}</p>
              {researchError.includes("rather than inventing") && (
                <p className="mt-1 text-xs text-red-400">
                  Research stopped rather than inventing news. No insights were created.
                </p>
              )}
              <Button
                variant="secondary"
                size="sm"
                className="mt-2"
                onClick={doResearch}
              >
                Retry Research
              </Button>
            </div>
          )}

          {/* Filter chips */}
          {insights.length > 0 && (
            <div className="flex gap-2">
              {INSIGHT_FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setInsightFilter(opt.value)}
                  className={`rounded-full px-3 py-1 text-xs font-medium transition ${
                    insightFilter === opt.value
                      ? "bg-[var(--color-amber)] text-[var(--color-primary)]"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Insight Cards */}
          {insightsLoading ? (
            <Loading message="Loading insights…" />
          ) : insights.filter((i) => !insightFilter || i.status === insightFilter).length === 0 ? (
            <EmptyState
              icon="✉"
              title="No insights yet"
              description="Click Run Research to pull the latest Central-PA renovation and roofing news."
              action={
                <Button variant="outline" size="sm" onClick={doResearch} disabled={researchRunning}>
                  Run Research
                </Button>
              }
            />
          ) : (
            insights
              .filter((i) => !insightFilter || i.status === insightFilter)
              .map((insight) => (
                <Card
                  key={insight.id}
                  className={`border-l-4 border-l-purple-400 ${
                    insight.status === "dismissed" ? "opacity-40" : ""
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-[var(--color-primary)]">{insight.title}</h3>
                        <p className="text-sm text-gray-600">{insight.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 text-xs">
                      {insight.category && (
                        <Badge variant="draft">
                          {insight.category.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                        </Badge>
                      )}
                      {insight.sourceUrl && (
                        <a
                          href={insight.sourceUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-1 text-purple-500 hover:underline"
                        >
                          Source: {insight.sourceUrl}
                        </a>
                      )}
                      <span className="text-gray-400">{formatDate(insight.createdAt)}</span>
                    </div>
                    {insight.status === "used" ? (
                      <p className="text-sm text-gray-400">Promoted to draft</p>
                    ) : insight.status === "dismissed" ? (
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-400">Dismissed</span>
                        <button
                          className="text-xs text-[var(--color-amber)] hover:underline"
                          onClick={() => undoDismiss(insight.id)}
                        >
                          Undo
                        </button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <Button
                          variant="primary"
                          size="sm"
                          onClick={() => promoteInsight(insight.id)}
                        >
                          Use →
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => dismissInsight(insight.id)}
                        >
                          Dismiss
                        </Button>
                      </div>
                    )}
                  </div>
                </Card>
              ))
          )}
        </div>
      )}

      {/* ── AI Jobs Tab ────────────────────────────────────────────────── */}
      {activeTab === "jobs" && (
        <div className="space-y-4">
          <div className="flex justify-end">
            <Button variant="secondary" size="sm" onClick={fetchJobs}>
              Refresh
            </Button>
          </div>
          {jobsLoading ? (
            <Loading message="Loading jobs…" />
          ) : jobs.length === 0 ? (
            <EmptyState
              icon="⚙"
              title="No AI jobs yet"
              description="AI jobs from research, article generation, and image generation will appear here."
            />
          ) : (
            <Card className="overflow-hidden p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-border)] bg-[var(--color-surface)]">
                      <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Type</th>
                      <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Post</th>
                      <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Status</th>
                      <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Started</th>
                      <th className="px-6 py-3 font-semibold text-[var(--color-primary)]">Error</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--color-border)]">
                    {jobs.map((j) => (
                      <tr
                        key={j.id}
                        className="transition-colors hover:bg-[var(--color-surface)]"
                      >
                        <td className="px-6 py-3 text-gray-600">
                          {j.type.charAt(0).toUpperCase() + j.type.slice(1)}
                        </td>
                        <td className="px-6 py-3">
                          {j.postId ? (
                            <Link
                              href={`/admin/blog/${j.postId}`}
                              className="text-[var(--color-primary)] hover:text-[var(--color-amber)] transition"
                            >
                              {j.postTitle || j.postId}
                            </Link>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-6 py-3">
                          <StatusBadge status={j.status} />
                        </td>
                        <td className="px-6 py-3 text-gray-500">{formatDate(j.createdAt)}</td>
                        <td className="px-6 py-3">
                          {j.error ? (
                            <span
                              className="max-w-[200px] truncate block text-red-500"
                              title={j.error}
                            >
                              {j.error}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
