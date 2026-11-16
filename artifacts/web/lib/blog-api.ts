// Server-side client for the Revive admin portal public blog API (RAP-2.3 contract).
//
// Endpoints (no auth expected):
//   GET {base}/blog/public?limit=&offset=  -> { data: PublicBlogPost[], pagination }
//   GET {base}/blog/public/:slug           -> PublicBlogPost | 404
//
// The API already restricts responses to status="published" and omits
// internal-only fields (author_note, seo_*, ai_generated, source ids).
// Failures degrade gracefully: the site renders an empty/missing state
// rather than erroring the whole page.

export type PublicBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  bodyMd: string;
  heroImageUrl: string | null;
  contentFocus: string | null;
  localityTags: string[];
  tags: string[];
  publishedAt: string | null;
  createdAt: string;
};

export type BlogListResult = {
  posts: PublicBlogPost[];
  pagination: { total: number; limit: number; offset: number };
};

export const PORTAL_API_BASE = (
  process.env.PORTAL_API_URL ?? "https://portal-dev.reviverepairco.com/api/v1"
).replace(/\/+$/, "");

// Revalidate fetched posts every 5 minutes (ISR-style caching).
const REVALIDATE_SECONDS = 300;

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((v): v is string => typeof v === "string");
}

function toPublicBlogPost(raw: unknown): PublicBlogPost | null {
  if (typeof raw !== "object" || raw === null) return null;
  const r = raw as Record<string, unknown>;
  if (typeof r.slug !== "string" || typeof r.title !== "string") return null;
  if (typeof r.bodyMd !== "string") return null;
  return {
    id: typeof r.id === "string" ? r.id : "",
    slug: r.slug,
    title: r.title,
    excerpt: typeof r.excerpt === "string" ? r.excerpt : null,
    bodyMd: r.bodyMd,
    heroImageUrl: typeof r.heroImageUrl === "string" ? r.heroImageUrl : null,
    contentFocus: typeof r.contentFocus === "string" ? r.contentFocus : null,
    localityTags: asStringArray(r.localityTags),
    tags: asStringArray(r.tags),
    publishedAt: typeof r.publishedAt === "string" ? r.publishedAt : null,
    createdAt: typeof r.createdAt === "string" ? r.createdAt : "",
  };
}

/** Published posts only — the API filters by status; the site never lists drafts. */
export async function getPublishedPosts(
  limit = 24,
  offset = 0,
): Promise<BlogListResult> {
  const url = `${PORTAL_API_BASE}/blog/public?limit=${limit}&offset=${offset}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (!res.ok) {
      throw new Error(`blog/public responded ${res.status}`);
    }
    const json = (await res.json()) as { data?: unknown; pagination?: unknown };
    const posts = Array.isArray(json.data)
      ? json.data
          .map(toPublicBlogPost)
          .filter((p): p is PublicBlogPost => p !== null)
      : [];
    const pagination =
      typeof json.pagination === "object" && json.pagination !== null
        ? (json.pagination as BlogListResult["pagination"])
        : { total: posts.length, limit, offset };
    return { posts, pagination };
  } catch (err) {
    console.error("[blog-api] Failed to load published posts:", err);
    return { posts: [], pagination: { total: 0, limit, offset } };
  }
}

/** Single published post by slug; returns null for drafts, missing posts, or API failure. */
export async function getPublishedPostBySlug(
  slug: string,
): Promise<PublicBlogPost | null> {
  const url = `${PORTAL_API_BASE}/blog/public/${encodeURIComponent(slug)}`;
  try {
    const res = await fetch(url, { next: { revalidate: REVALIDATE_SECONDS } });
    if (res.status === 404) return null;
    if (!res.ok) {
      throw new Error(`blog/public/${slug} responded ${res.status}`);
    }
    return toPublicBlogPost(await res.json());
  } catch (err) {
    console.error(`[blog-api] Failed to load post "${slug}":`, err);
    return null;
  }
}

/** Human date (UTC-stable) for a published post. */
export function formatPostDate(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const months = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
  ];
  return `${months[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
}

/** Strip markdown syntax for plain-text meta descriptions. */
export function excerptFromBody(bodyMd: string, max = 155): string {
  const plain = bodyMd
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`|-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (plain.length <= max) return plain;
  return `${plain.slice(0, max - 1).trimEnd()}…`;
}
