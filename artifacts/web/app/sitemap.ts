import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { brandConfig, brandFromHostname } from "../lib/brand";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "reviveroofrepair.com";
  const brand = brandFromHostname(host);
  const baseUrl = `https://${brandConfig(brand).domain}`;

  const sharedPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${baseUrl}/gallery`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const roofingDetailPages: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/services/roof-replacement`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/roof-leak-repair`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/storm-damage-repair`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/emergency-roof-repair`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services/commercial-roofing`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
  ];

  const blogPosts: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/blog/how-to-spot-hail-damage-roof-pennsylvania`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/does-insurance-cover-roof-replacement-pennsylvania`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/asphalt-shingle-vs-metal-roof-cost-pennsylvania`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/what-to-do-after-storm-pennsylvania`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/blog/best-roof-shingles-pennsylvania`, lastModified: new Date(), changeFrequency: "yearly", priority: 0.6 },
  ];

  if (brand === "repair-co") {
    return [
      { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
      { url: `${baseUrl}/general-contracting`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.95 },
      { url: `${baseUrl}/roofing`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.9 },
      ...sharedPages,
      ...roofingDetailPages,
      ...blogPosts,
    ];
  }

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/general-contracting`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.7 },
    ...sharedPages,
    ...roofingDetailPages,
    ...blogPosts,
  ];
}
