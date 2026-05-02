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
      absolute: `Storm Damage Roof Repair | Insurance Claim Help | ${config.shortName}`,
    },
    description:
      "Hail, wind, and storm damage roof repair across Central PA. We document the damage, meet your adjuster on site, and rebuild the roof — one accountable Revive crew end to end.",
    keywords:
      "storm damage roof repair, hail damage, wind damage, insurance claim, roof inspection, storm restoration, Harrisburg, Hershey, York, Lancaster, Central PA",
    alternates: {
      canonical: `https://${ROOFING_DOMAIN}/services/storm-damage-repair`,
    },
    openGraph: {
      url: `https://${ROOFING_DOMAIN}/services/storm-damage-repair`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Storm damage repair",
    title: "Storm hit hard? We document the damage and rebuild the roof.",
    description:
      "Hail bruising, wind-lifted shingles, fallen limbs, and ice-dam damage — diagnosed, documented, and repaired by one accountable Revive crew. We meet your adjuster on the roof.",
    image: "/images/services/storm.jpg",
    imageAlt: "Storm-damaged residential roof with missing shingles in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we handle",
    heading: "Storm restoration done right — not patched and forgotten.",
    intro:
      "Pennsylvania storms hit roofs in patterns. We know what hail bruising actually looks like, where wind lifts the first row of shingles, and how to document it so the insurance carrier funds the right repair.",
    bullets: [
      "Hail damage inspection and documentation",
      "Wind-lifted and missing shingle replacement",
      "Fallen tree and impact damage repair",
      "Ice-dam damage and emergency tarping",
      "Full roof replacement when storm damage is total",
      "Gutter, fascia, and soffit storm repair",
    ],
    sideTitle: "Included with every storm call",
    sideItems: [
      {
        title: "Free storm inspection",
        desc: "Full roof, gutter, fascia, and ventilation walkthrough — with marked photos of every damaged area.",
      },
      {
        title: "Adjuster meet-on-site",
        desc: "We meet your insurance adjuster on the roof so the scope and damage are agreed in person, not over email.",
      },
      {
        title: "Claim documentation",
        desc: "Cause-of-loss report, itemized scope, and labor/material pricing your carrier can work with.",
      },
      {
        title: "Emergency tarping",
        desc: "If the roof is open and rain is coming, we can tarp the same day to stop further interior damage.",
      },
    ],
  },
  process: {
    eyebrow: "How a storm claim runs",
    heading: "From inspection to a finished roof, the same four steps.",
    description:
      "Insurance claims fall apart when nobody is driving the timeline. We own that — from the first inspection to the final supplement.",
    steps: [
      {
        number: "01",
        title: "Free inspection",
        body: "We document every damaged elevation with photos and notes you can hand to your carrier or adjuster.",
      },
      {
        number: "02",
        title: "Meet the adjuster",
        body: "We meet your adjuster on site, walk the roof together, and agree the scope so the claim is funded right.",
      },
      {
        number: "03",
        title: "Repair or full replacement",
        body: "Once the claim is approved, we schedule the work — usually within two to three weeks of approval.",
      },
      {
        number: "04",
        title: "Supplements & sign-off",
        body: "If hidden damage shows up during work, we file the supplement, document it, and get it covered.",
      },
    ],
  },
  gallery: {
    eyebrow: "Recent storm work",
    heading: "Storm restorations from the Revive crew.",
    subheading:
      "Tear-offs, full replacements, and storm repair work across Harrisburg, Hershey, York, and Lancaster County.",
    projects: [
      roofingProjects[3],
      roofingProjects[4],
      roofingProjects[5],
      roofingProjects[6],
      roofingProjects[8],
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Storm damage claims, answered.",
    items: [
      {
        q: "Should I file a claim before or after the inspection?",
        a: "Get the inspection first. We'll tell you whether the damage is claim-worthy or whether it's a small repair you'd rather pay out of pocket. There's no point burning a claim for damage your deductible would absorb.",
      },
      {
        q: "Will you meet with my insurance adjuster?",
        a: "Yes — and we strongly recommend it. We meet the adjuster on the roof, walk through the documented damage together, and agree the scope in person. This is where claims are won or lost.",
      },
      {
        q: "How long does an insurance claim take?",
        a: "From first inspection to approval is usually 2–4 weeks, depending on your carrier and the volume of claims after a storm. Once approved, we schedule the work within two to three weeks.",
      },
      {
        q: "What if the adjuster misses damage we found?",
        a: "We file a supplement with photos and documentation. Carriers honor supplements when the evidence is solid — and we know what they need to see.",
      },
      {
        q: "Does my deductible apply to a storm repair?",
        a: "Yes. Your deductible is your responsibility regardless of the contractor — and any roofer who offers to 'eat the deductible' is committing insurance fraud. We don't do that.",
      },
    ],
  },
  cta: {
    eyebrow: "After the storm",
    heading: "Storm rolled through? Get a documented inspection.",
    body: "Free roof inspection with photo documentation you can use for an insurance claim — even if you don't end up filing one.",
  },
  backLink: {
    label: "← All roofing services",
    href: "/roofing",
  },
  seo: {
    pagePath: "/services/storm-damage-repair",
    serviceName: "Storm Damage Roof Repair",
    serviceDescription:
      "Hail, wind, and storm damage roof repair across Central PA — full inspection, insurance documentation, adjuster meet-on-site, and repair or full replacement by one accountable Revive crew.",
    brandOverride: "roofing",
    breadcrumbs: [
      { name: "Roofing Services", path: "/roofing" },
      { name: "Storm Damage Repair" },
    ],
  },
};

export default function StormDamageRepairPage() {
  return <GCServicePage config={pageConfig} />;
}
