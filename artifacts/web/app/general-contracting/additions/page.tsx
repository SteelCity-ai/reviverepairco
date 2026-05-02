import type { Metadata } from "next";
import GCServicePage, {
  type GCServicePageConfig,
} from "../../components/GCServicePage";
import { brandConfig, getBrand } from "../../../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: {
      absolute: `Home Additions & Room Expansions | ${config.name} | Central PA`,
    },
    description:
      "Second-story additions, room additions, sun rooms, and full structural expansions across Harrisburg and Central Pennsylvania. Permits, framing, finishes — one licensed Revive crew.",
    keywords:
      "home additions, room additions, second story addition, sun room, in-law suite, Harrisburg, Hershey, York, Lancaster, Central PA general contractor",
    alternates: {
      canonical: `https://${config.domain}/general-contracting/additions`,
    },
    openGraph: {
      url: `https://${config.domain}/general-contracting/additions`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  seo: {
    pagePath: "/general-contracting/additions",
    serviceName: "Home Additions & Room Expansions",
    serviceDescription:
      "Second-story additions, room additions, sun rooms, in-law suites, and full structural expansions across Harrisburg and Central Pennsylvania. Permits, framing, mechanicals, and finishes handled by one licensed Revive crew.",
    breadcrumbs: [
      { name: "General Contracting", path: "/general-contracting" },
      { name: "Additions" },
    ],
  },
  hero: {
    eyebrow: "Home additions",
    title: "Add the room your family actually needs — built to look original.",
    description:
      "Second stories, primary suites, sun rooms, and full structural expansions designed and built by one accountable Revive crew. Permits, framing, mechanicals, and finishes all under one contract.",
    image: "/images/gc-hero/gc-hero-1-addition.png",
    imageAlt: "Two-story home addition under construction in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we build",
    heading: "Additions that match your home — not bolt onto it.",
    intro:
      "Most additions fail because they look added on. We design the rooflines, siding, and trim to read as part of the original house, then build the interior to live the way you actually use it.",
    bullets: [
      "Second-story additions over existing footprint",
      "Primary suite and bedroom additions",
      "Sun rooms, four-season rooms, and screened additions",
      "In-law suites and accessory dwellings",
      "Bump-outs for kitchens, baths, and mudrooms",
      "Architectural drawings, permits, and inspections handled in-house",
    ],
    sideTitle: "What's included with every addition",
    sideItems: [
      {
        title: "Design & engineering",
        desc: "Floor plans, elevations, and structural engineering coordinated before a single nail goes in.",
      },
      {
        title: "Permits & code review",
        desc: "We pull township permits, schedule inspections, and own code compliance from start to finish.",
      },
      {
        title: "All trades coordinated",
        desc: "Framing, electrical, plumbing, HVAC, insulation, drywall, and finishes — one Revive schedule.",
      },
      {
        title: "Match-to-home exterior",
        desc: "Siding, roofing, and trim chosen so the addition reads as part of the original house.",
      },
    ],
  },
  process: {
    eyebrow: "How an addition runs",
    heading: "From sketch on a napkin to a punch-list walk-through.",
    description:
      "Every addition moves through the same four stages so the budget, schedule, and finishes never drift sideways on you.",
    steps: [
      {
        number: "01",
        title: "Walk-through & feasibility",
        body: "We meet at the property, talk through what you're trying to add, and confirm the structure can support it.",
      },
      {
        number: "02",
        title: "Design & fixed estimate",
        body: "Plans, elevations, materials, and a real number — not a brochure range — before you sign anything.",
      },
      {
        number: "03",
        title: "Permits & build",
        body: "Township approvals, foundation, framing, weather-tight envelope, then mechanicals and finishes — one crew, one schedule.",
      },
      {
        number: "04",
        title: "Final walk-through",
        body: "Inspections cleared, punch list closed out, warranty paperwork in your hand before we leave.",
      },
    ],
  },
  gallery: {
    eyebrow: "Sample additions",
    heading: "Recent addition work from the Revive crew.",
    subheading:
      "A look at the kind of additions, sun rooms, and exterior expansions we build across Central PA. New project photos drop in as builds wrap up.",
    showPlaceholderNote: true,
    projects: [
      {
        src: "/images/gc-hero/gc-hero-1-addition.png",
        alt: "Two-story home addition under construction in Central Pennsylvania",
        caption: "Two-story addition · in progress",
      },
      {
        src: "/images/gc-hero/gc-hero-2-framing.png",
        alt: "Contractors framing a new room addition on a residential home",
        caption: "Framing a room addition",
      },
      {
        src: "/images/gc-hero/gc-hero-4-exterior.png",
        alt: "Exterior of a finished home addition blending with the original house",
        caption: "Finished addition · exterior",
      },
      {
        src: "/images/gallery-gc/gc-06-sunroom.png",
        alt: "Sample finished sun room addition (placeholder image — drop in real project photo)",
        caption: "Sun room addition · sample",
      },
      {
        src: "/images/gallery-gc/gc-07-porch.png",
        alt: "Sample new front porch with stone columns (placeholder image — drop in real project photo)",
        caption: "Front porch build · sample",
      },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Additions, answered.",
    items: [
      {
        q: "How long does a typical addition take?",
        a: "Most single-room additions run 8–14 weeks from permit pull to walk-through. Two-story additions and primary suites typically run 14–22 weeks. We give you a real schedule with milestones in the contract.",
      },
      {
        q: "Do I need architectural drawings before you can quote?",
        a: "No. We handle the design and engineering in-house, including township-ready drawings. You'll see the plans and a fixed price before any commitment.",
      },
      {
        q: "Will the addition look like it was always part of the house?",
        a: "That's the whole goal. Roofline, siding, window styles, and trim are chosen specifically to match what's already there — both inside and out.",
      },
      {
        q: "Do you handle permits and inspections?",
        a: "Yes. We pull all township and county permits and schedule every required inspection. You don't have to coordinate with the municipality.",
      },
      {
        q: "Can I live in the house while you build?",
        a: "Almost always — yes. We seal the addition off from the existing living space, manage dust, and stage the build so daily life keeps moving.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready when you are",
    heading: "Let's price out your addition — for real.",
    body: "Free on-site walk-through and an honest written estimate. No high-pressure pitch, no mystery numbers.",
  },
};

export default function AdditionsPage() {
  return <GCServicePage config={pageConfig} />;
}
