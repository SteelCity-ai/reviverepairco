import type { Metadata } from "next";
import GCServicePage, {
  type GCServicePageConfig,
} from "../../components/GCServicePage";
import { roofingProjects } from "../../components/galleryData";
import { brandConfig, getBrand } from "../../../lib/brand";

const ROOFING_DOMAIN = brandConfig("roofing").domain;

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: {
      absolute: `Commercial Roofing | Flat Roof Repair & Coating | ${config.shortName}`,
    },
    description:
      "Commercial flat-roof repair, replacement, coatings, and maintenance programs across Central PA. TPO, EPDM, modified bitumen — minimal disruption, documented work, scheduled inspections.",
    keywords:
      "commercial roofing, flat roof repair, TPO, EPDM, modified bitumen, roof coating, maintenance program, Harrisburg, Hershey, York, Lancaster, Central PA",
    alternates: {
      canonical: `https://${ROOFING_DOMAIN}/services/commercial-roofing`,
    },
    openGraph: {
      url: `https://${ROOFING_DOMAIN}/services/commercial-roofing`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Commercial roofing",
    title: "Flat-roof systems repaired, recoated, and replaced — without shutting you down.",
    description:
      "TPO, EPDM, and modified bitumen work for warehouses, retail, offices, and HOA properties. Phased work plans, after-hours scheduling, and maintenance programs that stop small problems from becoming six-figure ones.",
    image: "/images/gallery/10-flat-roof.webp",
    imageAlt: "Completed commercial flat roof in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we install & service",
    heading: "Commercial roofing built around your operating schedule.",
    intro:
      "Commercial roofs fail differently than residential ones — slow leaks, ponding water, seam separation, ballast displacement. We diagnose what's actually happening on your roof and write a service plan that fits your budget and operating hours.",
    bullets: [
      "TPO single-ply membrane (mechanically attached & fully adhered)",
      "EPDM rubber roofing repair and replacement",
      "Modified bitumen and built-up roof systems",
      "Elastomeric and silicone roof coatings",
      "Flashing, scupper, and drain repair",
      "Annual maintenance and inspection programs",
    ],
    sideTitle: "Built for commercial property owners",
    sideItems: [
      {
        title: "After-hours scheduling",
        desc: "We schedule tear-off and tie-in work around your operating hours so tenants and customers aren't impacted.",
      },
      {
        title: "Phased work plans",
        desc: "Larger roofs can be sectioned and replaced in phases that fit your CapEx schedule, not all at once.",
      },
      {
        title: "Documented inspections",
        desc: "Photo reports for every visit — useful for property management, insurance, and warranty records.",
      },
      {
        title: "Maintenance programs",
        desc: "Twice-a-year inspections and minor-repair allowances that catch failures before they become claims.",
      },
    ],
  },
  process: {
    eyebrow: "How we work with property owners",
    heading: "From assessment to a written service plan.",
    description:
      "Commercial work starts with the same playbook every time so you know what's wrong, what it costs, and how it gets done.",
    steps: [
      {
        number: "01",
        title: "Roof assessment",
        body: "We walk the entire roof, document membrane condition, drains, flashings, and HVAC penetrations with photos.",
      },
      {
        number: "02",
        title: "Written service plan",
        body: "Recommended repairs, coating options, or replacement scope — with line-item pricing and a realistic timeline.",
      },
      {
        number: "03",
        title: "Phased execution",
        body: "Work is staged to minimize disruption: night and weekend shifts, sectional replacements, tenant notice in advance.",
      },
      {
        number: "04",
        title: "Maintenance handoff",
        body: "Final walk, photo report, manufacturer warranty registration, and an optional annual maintenance plan.",
      },
    ],
  },
  gallery: {
    eyebrow: "Recent commercial work",
    heading: "Flat-roof projects from the Revive crew.",
    subheading:
      "Commercial flat-roof installs, coatings, and torch-down membrane work across Harrisburg and Central PA.",
    projects: [
      roofingProjects[9],
      roofingProjects[10],
      roofingProjects[6],
      roofingProjects[7],
      roofingProjects[5],
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Commercial roofing, answered.",
    items: [
      {
        q: "Should I recoat or replace my flat roof?",
        a: "Depends on the membrane condition and age. A roof with intact membrane and isolated leaks is often a great candidate for a silicone or elastomeric coating — adds 10+ years of life at a fraction of replacement cost. We'll tell you straight which one your roof is.",
      },
      {
        q: "Can you work without shutting down the building?",
        a: "Yes. Most commercial work is done in phases, after hours, or on weekends so business operations and HVAC keep running. We coordinate access, parking, and tenant notice with property management.",
      },
      {
        q: "What warranty comes with a commercial replacement?",
        a: "Manufacturer system warranties (Carlisle, GAF Commercial, Firestone) of 15–30 years on materials, plus our workmanship warranty. We register the warranty in your name before the project closes.",
      },
      {
        q: "Do you offer maintenance contracts?",
        a: "Yes. Most clients opt for twice-a-year inspections (spring and fall) with documented photo reports and a small repair allowance. It's the cheapest insurance against a leak that takes out a tenant's inventory.",
      },
      {
        q: "What's the difference between TPO and EPDM?",
        a: "TPO is white, reflective, and energy-efficient — great for cooling-cost reduction. EPDM is black rubber, extremely durable, and easier to repair down the road. Both are excellent — the right choice depends on your building, budget, and energy goals.",
      },
    ],
  },
  cta: {
    eyebrow: "Built for property managers",
    heading: "Get a documented commercial roof assessment.",
    body: "Free walkthrough and a written service plan with line-item pricing — useful even if you're just budgeting for next year's CapEx.",
  },
  backLink: {
    label: "← All roofing services",
    href: "/roofing",
  },
  seo: {
    pagePath: "/services/commercial-roofing",
    serviceName: "Commercial Roofing",
    serviceDescription:
      "Commercial flat-roof repair, replacement, coatings, and maintenance programs across Central PA — TPO, EPDM, and modified bitumen with phased schedules and documented inspections.",
    brandOverride: "roofing",
    breadcrumbs: [
      { name: "Roofing Services", path: "/roofing" },
      { name: "Commercial Roofing" },
    ],
  },
};

export default function CommercialRoofingPage() {
  return <GCServicePage config={pageConfig} />;
}
