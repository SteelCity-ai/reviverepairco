import { MetadataRoute } from "next";
import { headers } from "next/headers";
import { brandConfig, brandFromHostname } from "../lib/brand";

export const dynamic = "force-dynamic";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "reviveroofrepair.com";
  const brand = brandFromHostname(host);
  const domain = brandConfig(brand).domain;
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", "/_next/"],
      },
    ],
    sitemap: `https://${domain}/sitemap.xml`,
  };
}
