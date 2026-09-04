"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { StatusBadge } from "@/components/ui/Badge";
import { Modal } from "@/components/ui/Modal";
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

// ── Constants ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
  { value: "", label: "Select category" },
  { value: "roofing", label: "Roofing" },
  { value: "renovation", label: "Renovation" },
  { value: "contracting", label: "Contracting" },
  { value: "seasonal_home_tips", label: "Seasonal Home Tips" },
  { value: "central_pa", label: "Central PA" },
];

function titleToSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

// ── Page ──────────────────────────────────────────────────────────────────

export default function EditBlogPostPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { api, upload } = useApi();

  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);

  // Save state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Status flow
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [statusMsg, setStatusMsg] = useState<string | null>(null);

  // AI state
  const [aiError, setAiError] = useState<string | null>(null);
  const [articleRunning, setArticleRunning] = useState(false);
  const [imageRunning, setImageRunning] = useState(false);
  const [uploadingImage, setUploadingImage] = useState(false);
  const aiPollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchPost = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      const p = await api<BlogPost>(`/api/v1/blog/${params.id}`);
      setPost(p);
      setTitle(p.title);
      setSlug(p.slug);
      setSlugEdited(true);
      setExcerpt(p.excerpt ?? "");
      setContent(p.content ?? "");
      setCategory(p.category ?? "");
      setTags((p.tags ?? []).join(", "));
      setMetaTitle(p.metaTitle ?? "");
      setMetaDescription(p.metaDescription ?? "");
      setFeaturedImage(p.featuredImage);
    } catch (err) {
      setLoadError((err as Error).message);
    } finally {
      setLoading(false);
    }
  }, [api, params.id]);

  useEffect(() => {
    fetchPost();
  }, [fetchPost]);

  // Cleanup AI polling on unmount
  useEffect(() => {
    return () => {
      if (aiPollRef.current) clearInterval(aiPollRef.current);
    };
  }, []);

  // ── Save ───────────────────────────────────────────────────────────────

  const save = async (status?: string) => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const body: Record<string, unknown> = {
        title,
        slug,
        excerpt: excerpt || null,
        content: content || null,
        category: category || null,
        tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : null,
        metaTitle: metaTitle || null,
        metaDescription: metaDescription || null,
        featuredImage: featuredImage || null,
      };
      if (status) body.status = status;

      const updated = await api<BlogPost>(`/api/v1/blog/${params.id}`, {
        method: "PATCH",
        body,
      });
      setPost(updated);
      setStatusMsg("Post saved.");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      const msg = (err as Error).message;
      setError(msg);
      if (msg.toLowerCase().includes("slug")) {
        setFieldErrors({ slug: "Slug already in use" });
      }
    } finally {
      setSaving(false);
    }
  };

  // ── Status actions ─────────────────────────────────────────────────────

  const submitForReview = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api<BlogPost>(`/api/v1/blog/${params.id}/submit-review`, {
        method: "POST",
      });
      setPost(updated);
      setStatusMsg("Submitted for review.");
      setTimeout(() => setStatusMsg(null), 3000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  const doPublish = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api<BlogPost>(`/api/v1/blog/${params.id}/publish`, {
        method: "POST",
      });
      setPost(updated);
      setShowPublishModal(false);
      setStatusMsg("Published — live on reviveroofrepair.com/blog.");
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      setError((err as Error).message);
      setShowPublishModal(false);
    } finally {
      setSaving(false);
    }
  };

  const doUnpublish = async () => {
    setSaving(true);
    setError(null);
    try {
      const updated = await api<BlogPost>(`/api/v1/blog/${params.id}/unpublish`, {
        method: "POST",
      });
      setPost(updated);
      setStatusMsg("Post unpublished — hidden from the public site.");
      setTimeout(() => setStatusMsg(null), 5000);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  };

  // ── AI: Generate Article ────────────────────────────────────────────────

  const generateArticle = async () => {
    setArticleRunning(true);
    setAiError(null);
    try {
      const r = await api<{ jobId: string }>(`/api/v1/blog-ai/generate-article/${params.id}`, {
        method: "POST",
      });
      aiPollRef.current = setInterval(async () => {
        try {
          const job = await api<{ status: string; error: string | null }>(
            `/api/v1/blog-ai/jobs/${r.jobId}`,
          );
          if (job.status === "succeeded") {
            if (aiPollRef.current) clearInterval(aiPollRef.current);
            setArticleRunning(false);
            await fetchPost();
          } else if (job.status === "failed") {
            if (aiPollRef.current) clearInterval(aiPollRef.current);
            setArticleRunning(false);
            setAiError(job.error ?? "Article generation failed.");
          }
        } catch {
          // keep polling
        }
      }, 3000);
      setTimeout(() => {
        if (aiPollRef.current) {
          clearInterval(aiPollRef.current);
          setArticleRunning(false);
          setAiError("Article generation timed out after 3 minutes.");
        }
      }, 180000);
    } catch (err) {
      setArticleRunning(false);
      setAiError((err as Error).message);
    }
  };

  // ── AI: Generate Image ─────────────────────────────────────────────────

  const generateImage = async () => {
    setImageRunning(true);
    setAiError(null);
    try {
      const r = await api<{ jobId: string }>(`/api/v1/blog-ai/generate-image/${params.id}`, {
        method: "POST",
      });
      aiPollRef.current = setInterval(async () => {
        try {
          const job = await api<{ status: string; error: string | null }>(
            `/api/v1/blog-ai/jobs/${r.jobId}`,
          );
          if (job.status === "succeeded") {
            if (aiPollRef.current) clearInterval(aiPollRef.current);
            setImageRunning(false);
            await fetchPost();
          } else if (job.status === "failed") {
            if (aiPollRef.current) clearInterval(aiPollRef.current);
            setImageRunning(false);
            setAiError(
              "Image generation failed — the post can still be saved without an image",
            );
          }
        } catch {
          // keep polling
        }
      }, 3000);
      setTimeout(() => {
        if (aiPollRef.current) {
          clearInterval(aiPollRef.current);
          setImageRunning(false);
        }
      }, 180000);
    } catch (err) {
      setImageRunning(false);
      setAiError((err as Error).message);
    }
  };

  // ── Image Upload ───────────────────────────────────────────────────────

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await upload<{ url: string }>("/api/v1/media", fd);
      setFeaturedImage(r.url);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setUploadingImage(false);
      e.target.value = "";
    }
  };

  // ── Slug auto-suggest ──────────────────────────────────────────────────

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(titleToSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugEdited(true);
  };

  // ── Render ─────────────────────────────────────────────────────────────

  if (loading) return <Loading message="Loading post…" />;
  if (loadError || !post) {
    return (
      <div className="animate-fade-in-up">
        <Link href="/admin/blog" className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[var(--color-amber)] transition">
          <ArrowLeft size={14} /> Back to Blog
        </Link>
        <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
          <p className="text-sm text-red-600">
            {loadError || "Post not found."}
          </p>
          <Link href="/admin/blog" className="mt-2 inline-block">
            <Button variant="secondary" size="sm">Back to list</Button>
          </Link>
        </div>
      </div>
    );
  }

  const isPublished = post.status === "PUBLISHED";
  const hasProv = !!(post.sourceInsightId || post.sourceUrl);

  return (
    <div className="animate-fade-in-up max-w-2xl">
      {/* Back Link */}
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[var(--color-amber)] transition"
      >
        <ArrowLeft size={14} /> Back to Blog
      </Link>

      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-[var(--color-primary)]">
            {post.title || "Untitled"}
          </h1>
          <StatusBadge status={post.status} />
        </div>
      </div>

      {/* Status Message */}
      {statusMsg && (
        <div className="mb-4 rounded-lg bg-green-50 border border-green-200 p-3 text-sm text-green-700">
          {statusMsg}
        </div>
      )}

      {/* Provenance */}
      {hasProv && (
        <div className="mb-4 rounded-lg border border-purple-200 bg-purple-50 p-3 text-xs text-purple-600">
          <Sparkles size={14} className="inline mr-1" />
          AI-generated from research insight
          {post.sourceUrl && (
            <>
              {" — "}
              <a
                href={post.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="underline hover:text-purple-800"
              >
                Source: {post.sourceUrl}
              </a>
            </>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-4 text-sm text-red-500">{error}</div>
      )}

      <Card>
        <CardContent>
          <div className="space-y-4 pt-4">
            {/* Title */}
            <Input
              label="Title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
            />

            {/* Slug */}
            <div>
              <Input
                label="Slug"
                value={slug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-suggested — edit to override"
                error={fieldErrors.slug}
              />
              <p className="mt-1 text-xs text-gray-400">auto-suggested — edit to override</p>
            </div>

            {/* Excerpt */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-primary)]">
                Excerpt
              </label>
              <textarea
                className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20"
                rows={3}
                maxLength={180}
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
              />
              <p className="mt-1 text-right text-xs text-gray-400">{excerpt.length}/180</p>
            </div>

            {/* Content */}
            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-primary)]">
                Content
              </label>
              <textarea
                className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <p className="mt-1 text-xs text-gray-400">
                HTML allowed: h2, h3, p, ul, li, strong.
              </p>
            </div>

            {/* Category & Tags */}
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={CATEGORY_OPTIONS}
                value={category}
                onChange={(e) => setCategory(e.target.value)}
              />
              <Input
                label="Tags"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                placeholder="comma-separated"
              />
            </div>

            {/* SEO */}
            <div className="border-t border-[var(--color-border)] pt-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-primary)]">SEO</h3>
              <div className="space-y-3">
                <div>
                  <Input
                    label="Meta Title"
                    value={metaTitle}
                    onChange={(e) => setMetaTitle(e.target.value)}
                    placeholder="Page title for search results"
                  />
                  <p
                    className={`mt-1 text-right text-xs ${metaTitle.length > 60 ? "text-amber-600" : "text-gray-400"}`}
                  >
                    {metaTitle.length}/60
                  </p>
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-[var(--color-primary)]">
                    Meta Description
                  </label>
                  <textarea
                    className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20"
                    rows={2}
                    maxLength={155}
                    value={metaDescription}
                    onChange={(e) => setMetaDescription(e.target.value)}
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{metaDescription.length}/155</p>
                </div>
              </div>
            </div>

            {/* Featured Image */}
            <div className="border-t border-[var(--color-border)] pt-4">
              <h3 className="mb-3 text-sm font-semibold text-[var(--color-primary)]">Featured Image</h3>
              {featuredImage && (
                <div className="mb-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={featuredImage}
                    alt="Featured"
                    className="w-full aspect-video rounded-lg object-cover border border-[var(--color-border)]"
                  />
                </div>
              )}
              <div className="flex flex-wrap gap-2">
                <label className="inline-flex items-center justify-center rounded-full px-5 py-2.5 text-sm font-semibold bg-[var(--color-amber)] text-[var(--color-primary)] hover:bg-[var(--color-amber-light)] transition cursor-pointer">
                  {uploadingImage ? "Uploading…" : "Upload Image"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploadingImage}
                  />
                </label>
                {featuredImage && (
                  <Button
                    variant="ghost"
                    size="md"
                    onClick={() => setFeaturedImage(null)}
                  >
                    Remove
                  </Button>
                )}
              </div>
              <div className="mt-2">
                <Input
                  placeholder="Or paste image URL"
                  value={featuredImage ?? ""}
                  onChange={(e) => setFeaturedImage(e.target.value || null)}
                />
              </div>
            </div>

            {/* Status Flow Buttons */}
            <div className="border-t border-[var(--color-border)] pt-4 flex flex-wrap items-center gap-3">
              <Button
                variant="primary"
                disabled={saving}
                onClick={() => save()}
              >
                {saving ? "Saving…" : "Save"}
              </Button>

              {!isPublished && post.status === "draft" && (
                <>
                  <Button
                    variant="secondary"
                    disabled={saving}
                    onClick={submitForReview}
                  >
                    Submit for Review
                  </Button>
                  <Button
                    variant="primary"
                    disabled={saving}
                    onClick={() => setShowPublishModal(true)}
                  >
                    Publish…
                  </Button>
                </>
              )}

              {!isPublished && post.status === "pending_review" && (
                <Button
                  variant="primary"
                  disabled={saving}
                  onClick={() => setShowPublishModal(true)}
                >
                  Publish…
                </Button>
              )}

              {isPublished && (
                <Button
                  variant="secondary"
                  disabled={saving}
                  onClick={doUnpublish}
                >
                  Unpublish
                </Button>
              )}

              <Link href="/admin/blog">
                <Button variant="ghost">Cancel</Button>
              </Link>
            </div>

            {/* ── AI Controls ──────────────────────────────────────────── */}
            {!isPublished && (
              <div className="border-t border-purple-200 pt-4">
                <div className="rounded-lg border border-purple-200 bg-purple-50/50 p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Sparkles size={16} className="text-purple-500" />
                    <h3 className="text-sm font-semibold text-purple-700">AI Assistant</h3>
                  </div>

                  {aiError && (
                    <div className="mb-3 rounded bg-red-50 border border-red-200 p-2 text-xs text-red-600">
                      {aiError}
                    </div>
                  )}

                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={articleRunning || imageRunning}
                      onClick={generateArticle}
                    >
                      {articleRunning ? (
                        <>
                          <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border border-purple-300 border-t-purple-600" />
                          Writing article…
                        </>
                      ) : (
                        "Generate Article"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={articleRunning || imageRunning}
                      onClick={generateImage}
                    >
                      {imageRunning ? (
                        <>
                          <span className="mr-1 inline-block h-3 w-3 animate-spin rounded-full border border-purple-300 border-t-purple-600" />
                          Generating image…
                        </>
                      ) : (
                        "Generate Image"
                      )}
                    </Button>
                  </div>

                  {post.sourceInsightId && (
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-200 p-2 text-xs text-amber-700">
                      AI draft generated — review and edit before publishing
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Publish Modal */}
      <Modal
        open={showPublishModal}
        onClose={() => setShowPublishModal(false)}
        title="Publish this post?"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            &ldquo;{title}&rdquo; will be live on reviveroofrepair.com/blog immediately.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="secondary" onClick={() => setShowPublishModal(false)}>
              Cancel
            </Button>
            <Button variant="primary" disabled={saving} onClick={doPublish}>
              {saving ? "Publishing…" : "Publish"}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
