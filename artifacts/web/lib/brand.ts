import { headers } from "next/headers";

export type Brand = "roofing" | "repair-co";

export function brandFromHostname(host: string): Brand {
  const cleaned = host.toLowerCase().split(":")[0].trim();
  if (
    cleaned === "reviverepairco.com" ||
    cleaned === "www.reviverepairco.com" ||
    cleaned.endsWith(".reviverepairco.com")
  ) {
    return "repair-co";
  }
  return "roofing";
}

export async function getBrand(): Promise<Brand> {
  const h = await headers();
  const fromMiddleware = h.get("x-revive-brand");
  if (fromMiddleware === "repair-co" || fromMiddleware === "roofing") {
    return fromMiddleware;
  }
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  return brandFromHostname(host);
}

type BrandConfig = {
  name: string;
  shortName: string;
  logo: string;
  logoAlt: string;
  homeUrl: string;
  domain: string;
  metaTitle: string;
  metaDescription: string;
};

const CONFIGS: Record<Brand, BrandConfig> = {
  roofing: {
    name: "Revive Repair Specialists",
    shortName: "Revive Roof Repair",
    logo: "/images/revive-logo-v3.png",
    logoAlt: "Revive Repair Specialists",
    homeUrl: "/",
    domain: "reviveroofrepair.com",
    metaTitle: "Revive Roof Repair | Harrisburg & Central PA Roofing Experts",
    metaDescription:
      "Revive Roof Repair helps homeowners across Harrisburg and Central PA with roof repair, replacements, and storm damage recovery. Request your free inspection today.",
  },
  "repair-co": {
    name: "Revive Repair Company",
    shortName: "Revive Repair Co.",
    logo: "/images/revive-logo-company.png",
    logoAlt: "Revive Repair Company",
    homeUrl: "/",
    domain: "reviverepairco.com",
    metaTitle: "Revive Repair Company | Central PA General Contractor",
    metaDescription:
      "Full-service general contracting across Central Pennsylvania — additions, garages, renovations, demolition, and roofing. Licensed, insured, and locally owned.",
  },
};

export function brandConfig(brand: Brand): BrandConfig {
  return CONFIGS[brand];
}
