"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardHeader, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import { useApi } from "@/lib/api-browser";

// ── Constants ─────────────────────────────────────────────────────────────

const CATEGORY_OPTIONS = [
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

export default function NewBlogPostPage() {
  const router = useRouter();
  const { api } = useApi();

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugEdited, setSlugEdited] = useState(false);
  const [excerpt, setExcerpt] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const slugHint = !slugEdited && title ? titleToSlug(title) : null;

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!slugEdited) setSlug(titleToSlug(val));
  };

  const handleSlugChange = (val: string) => {
    setSlug(val);
    setSlugEdited(true);
  };

  const saveDraft = async () => {
    setSaving(true);
    setError(null);
    setFieldErrors({});
    try {
      const body: Record<string, unknown> = {
        title,
        slug: slug || titleToSlug(title),
        status: "draft",
      };
      if (excerpt) body.excerpt = excerpt;
      if (content) body.content = content;
      if (category) body.category = category;
      if (tags) body.tags = tags.split(",").map((t) => t.trim()).filter(Boolean);
      if (metaTitle) body.metaTitle = metaTitle;
      if (metaDescription) body.metaDescription = metaDescription;

      const post = await api<{ id: string }>("/api/v1/blog", {
        method: "POST",
        body,
      });
      router.push(`/admin/blog/${post.id}`);
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

  return (
    <div className="animate-fade-in-up max-w-2xl">
      {/* Back Link */}
      <Link
        href="/admin/blog"
        className="mb-4 inline-flex items-center gap-1 text-sm text-gray-400 hover:text-[var(--color-amber)] transition"
      >
        <ArrowLeft size={14} /> Back to Blog
      </Link>

      <h1 className="mb-6 text-2xl font-bold text-[var(--color-primary)]">New Post</h1>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-[var(--color-primary)]">Post Details</h2>
        </CardHeader>
        <CardContent>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              saveDraft();
            }}
          >
            {error && !error.toLowerCase().includes("slug") && (
              <p className="text-sm text-red-500">{error}</p>
            )}

            <Input
              label="Title"
              required
              value={title}
              onChange={(e) => handleTitleChange(e.target.value)}
              placeholder="Enter post title"
            />

            <div>
              <Input
                label="Slug"
                value={slug || slugHint || ""}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="auto-suggested — edit to override"
                error={fieldErrors.slug}
              />
              {slugHint && !slug && (
                <p className="mt-1 text-xs text-gray-400">Auto-suggested: {slugHint}</p>
              )}
            </div>

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
                placeholder="Brief summary for cards and SEO…"
              />
              <p className="mt-1 text-right text-xs text-gray-400">{excerpt.length}/180</p>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-[var(--color-primary)]">
                Content
              </label>
              <textarea
                className="w-full rounded-lg border border-[var(--color-border)] bg-white p-3 text-sm text-[var(--color-primary)] focus:border-[var(--color-amber)] focus:outline-none focus:ring-2 focus:ring-[var(--color-amber)]/20"
                rows={12}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Post body…"
              />
              <p className="mt-1 text-xs text-gray-400">
                HTML allowed: h2, h3, p, ul, li, strong.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                options={[{ value: "", label: "Select category" }, ...CATEGORY_OPTIONS]}
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

            {/* SEO Fields */}
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
                    placeholder="Search result description"
                  />
                  <p className="mt-1 text-right text-xs text-gray-400">{metaDescription.length}/155</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 border-t border-[var(--color-border)] pt-4">
              <Button type="submit" variant="primary" disabled={saving || !title}>
                {saving ? "Saving…" : "Save Draft"}
              </Button>
              <Link href="/admin/blog">
                <Button variant="ghost" type="button">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
