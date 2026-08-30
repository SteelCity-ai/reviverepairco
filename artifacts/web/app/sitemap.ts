import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { brandConfig, brandFromHostname } from "../lib/brand";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "reviveroofrepair.com";
  const brand = brandFromHostname(host);
  const baseUrl = `https://${brandConfig(brand).domain}`;
  const now = new Date();

  // Both brands list these primary routes per task requirements.
  const sharedRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/roofing`, lastModified: now, changeFrequency: "weekly", priority: 0.95 },
    { url: `${baseUrl}/general-contracting`, lastModified: now, changeFrequency: "monthly", priority: 0.95 },
    { url: `${baseUrl}/renovation`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/demolition`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Roofing brand additionally lists the existing roofing service detail
  // pages (already part of the production roofing site).
  const roofingDetailPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/services/roof-replacement`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/roof-leak-repair`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/storm-damage-repair`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/emergency-roof-repair`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/commercial-roofing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
  ];

  // Repair-co brand additionally lists the dedicated General Contracting
  // service detail pages.
  const gcDetailPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/general-contracting/additions`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/general-contracting/low-voltage-data`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/general-contracting/renovations`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
    { url: `${baseUrl}/general-contracting/demolition`, lastModified: now, changeFrequency: "monthly", priority: 0.85 },
  ];

  // Blog detail URLs: legacy static posts plus published posts from the
  // admin portal public blog API (drafts never appear — API filters status).
  let apiBlogPosts: MetadataRoute.Sitemap = [];
  try {
    const res = await fetch(
      `${process.env.PORTAL_API_URL ?? "https://portal-dev.reviverepairco.com/api/v1"}/blog/public?limit=100&offset=0`,
      { next: { revalidate: 300 } },
    );
    if (res.ok) {
      const json = (await res.json()) as { data?: Array<{ slug?: string }> };
      apiBlogPosts = (json.data ?? [])
        .filter((p): p is { slug: string } => typeof p.slug === "string")
        .map((p) => ({
          url: `${baseUrl}/blog/${p.slug}`,
          lastModified: now,
          changeFrequency: "monthly" as const,
          priority: 0.6,
        }));
    }
  } catch (err) {
    console.error("[sitemap] blog API unavailable, listing legacy posts only:", err);
  }

  const legacyBlogPosts: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog/how-to-spot-hail-damage-roof-pennsylvania`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/does-insurance-cover-roof-replacement-pennsylvania`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/asphalt-shingle-vs-metal-roof-cost-pennsylvania`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/what-to-do-after-storm-pennsylvania`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/best-roof-shingles-pennsylvania`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
  ];

  const blogPosts: MetadataRoute.Sitemap = [...legacyBlogPosts, ...apiBlogPosts];

  if (brand === "roofing") {
    return [...sharedRoutes, ...roofingDetailPages, ...blogPosts];
  }

  return [...sharedRoutes, ...gcDetailPages, ...blogPosts];
}
