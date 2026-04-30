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
      absolute: `Demolition & Site Prep | ${config.name} | Central PA`,
    },
    description:
      "Selective interior tear-outs, garage demolition, deck removal, and site prep across Harrisburg and Central Pennsylvania. Safe, clean, fully-permitted demolition by Revive Repair Company.",
    keywords:
      "demolition, interior demolition, garage demolition, deck removal, selective tear out, site prep, Harrisburg, Hershey, York, Lancaster, Central PA contractor",
    alternates: {
      canonical: `https://${config.domain}/general-contracting/demolition`,
    },
    openGraph: {
      url: `https://${config.domain}/general-contracting/demolition`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Demolition & site prep",
    title: "Tear it out cleanly so the next phase can actually start.",
    description:
      "Selective interior tear-outs, garage demolition, deck and shed removal, and full site cleanup. Safe, fully-permitted, dust-contained, and coordinated with whatever build comes next.",
    image: "/images/gallery-gc/gc-05-demolition.png",
    imageAlt: "Sample residential demolition project in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we tear out",
    heading: "Demolition done by people who'll build it back.",
    intro:
      "Most demolition jobs go sideways because the crew tearing things out doesn't have to live with the result. Revive demolition crews work the same job sites our build crews do, so cuts are clean, structure stays intact, and the site is ready for the next phase.",
    bullets: [
      "Selective interior demolition — kitchens, baths, basements, walls",
      "Detached garage and outbuilding demolition",
      "Deck, porch, and pergola tear-down",
      "Concrete slab and small foundation removal",
      "Drywall, flooring, and finish removal for renovations",
      "Site cleanup, hauling, and disposal",
    ],
    sideTitle: "Safe, clean, coordinated",
    sideItems: [
      {
        title: "Permits & utility shut-offs",
        desc: "We pull demolition permits and confirm gas, electric, and water are properly disconnected before any work starts.",
      },
      {
        title: "Dust and surface protection",
        desc: "Plastic containment, floor protection along the haul route, and HEPA vacuums for interior tear-outs.",
      },
      {
        title: "Structure protected",
        desc: "Selective work is planned around what stays — load paths, mechanicals, and finishes you want to keep are protected, not guessed at.",
      },
      {
        title: "Hauling & disposal",
        desc: "Dumpsters staged on-site, debris hauled, recyclables sorted where it makes sense, site swept clean.",
      },
    ],
  },
  process: {
    eyebrow: "How a tear-out runs",
    heading: "Four stages from walk-through to clean site.",
    description:
      "Same Revive process — clear scope, real timeline, one phone number for the whole job.",
    steps: [
      {
        number: "01",
        title: "Walk-through & scope",
        body: "We mark exactly what's coming out, what's staying, and how the structure has to be protected.",
      },
      {
        number: "02",
        title: "Permits & utilities",
        body: "Demolition permits pulled, gas and electric properly disconnected, dumpsters scheduled.",
      },
      {
        number: "03",
        title: "Tear-out",
        body: "Containment up, crew on site, debris hauled as we go — not piled in your yard for a week.",
      },
      {
        number: "04",
        title: "Site cleanup",
        body: "Final sweep, dumpsters pulled, site graded if needed, and ready for the next phase.",
      },
    ],
  },
  gallery: {
    eyebrow: "Recent work",
    heading: "Demolition and tear-out projects.",
    subheading:
      "A look at the kind of selective demolition and site prep work the Revive crew handles. Real project photos are added as jobs wrap up.",
    projects: [
      {
        src: "/images/gallery-gc/gc-05-demolition.png",
        alt: "Sample residential demolition project (placeholder image — drop in real project photo)",
        caption: "Selective demolition · sample",
      },
      {
        src: "/images/gallery-gc/gc-02-basement.png",
        alt: "Sample basement after tear-out and prep (placeholder image — drop in real project photo)",
        caption: "Basement prepped for build · sample",
      },
      {
        src: "/images/gc-hero/gc-hero-2-framing.png",
        alt: "Job site cleared and framed for the next phase of construction",
        caption: "Cleared and ready for framing",
      },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Demolition, answered.",
    items: [
      {
        q: "Do you handle just demolition, or do I have to use you for the rebuild too?",
        a: "Demolition can be a standalone job. A lot of customers do hire us for the build that follows because the same crew already knows the site — but you don't have to.",
      },
      {
        q: "Do I need a permit to demo a garage or interior wall?",
        a: "Usually yes. Detached structures, structural walls, and anything touching utilities require a township permit. We pull what's needed as part of the scope.",
      },
      {
        q: "Will my house be a dust mess for weeks?",
        a: "No. Interior demolition is contained with plastic walls, floors and pathways are protected, and debris is hauled out continuously rather than piled inside.",
      },
      {
        q: "Do you handle utility shut-offs?",
        a: "Yes — we coordinate gas, electric, and water disconnects with the utility companies before demo begins. You don't make those calls.",
      },
      {
        q: "What about disposal? Do I need to rent a dumpster?",
        a: "We stage the dumpsters, schedule swap-outs, and handle disposal as part of the demo scope. Site is swept clean before we leave.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready to clear it",
    heading: "Let's scope the tear-out.",
    body: "Free on-site walk-through, an honest written estimate, and a clear plan for what comes out and what stays.",
  },
};

export default function DemolitionPage() {
  return <GCServicePage config={pageConfig} />;
}
