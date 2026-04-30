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
      absolute: `Detached Garages & Outbuildings | ${config.name} | Central PA`,
    },
    description:
      "Detached garages, workshops, pole barns, and outbuildings built across Harrisburg and Central Pennsylvania. Match-to-home exteriors, real foundations, and finishes that hold up to PA winters.",
    keywords:
      "detached garage, garage builder, pole barn, workshop build, outbuilding, Harrisburg garage, Central PA general contractor",
    alternates: {
      canonical: `https://${config.domain}/general-contracting/garages-outbuildings`,
    },
    openGraph: {
      url: `https://${config.domain}/general-contracting/garages-outbuildings`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Garages & outbuildings",
    title: "Detached garages and outbuildings built to match the house.",
    description:
      "Two-bay garages, workshops, pole barns, and storage outbuildings — designed to match your home's siding and roofline, sized for the way you actually use the space, and built to stand up to Central PA winters.",
    image: "/images/gallery-gc/gc-01-garage.png",
    imageAlt: "Sample finished detached garage build in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we build",
    heading: "Outbuildings designed for how you actually use them.",
    intro:
      "Every garage and outbuilding starts with how you'll use it day-to-day — vehicle storage, a workshop, a hobby space, equipment storage. The size, doors, electrical, and finishes follow from that, not the other way around.",
    bullets: [
      "Detached one-, two-, and three-bay garages",
      "Workshops with proper electrical, lighting, and insulation",
      "Pole barns and ag-style outbuildings",
      "Garage apartments and bonus space above",
      "Concrete slabs, footings, and frost-protected foundations",
      "Match-to-home siding, roofing, and trim",
    ],
    sideTitle: "Built right from the slab up",
    sideItems: [
      {
        title: "Real foundations",
        desc: "Footings poured below frost line, properly reinforced slab, drainage and grading planned for PA weather.",
      },
      {
        title: "Garage doors that last",
        desc: "Insulated overhead doors from manufacturers we stand behind, with quiet openers and proper weather seal.",
      },
      {
        title: "Electrical done right",
        desc: "Sub-panel sized for tools and EV charging, code-compliant outlets, real overhead lighting.",
      },
      {
        title: "Match-to-home exterior",
        desc: "Same siding, same roofing, same trim — so the new building reads like it belongs on the property.",
      },
    ],
  },
  process: {
    eyebrow: "How a build runs",
    heading: "From site walk to keys in hand.",
    description:
      "Same four-stage Revive process — clear scope, fixed price, one schedule, one phone number for the whole job.",
    steps: [
      {
        number: "01",
        title: "Site walk & sizing",
        body: "We measure the lot, talk through how you'll use the space, and confirm setbacks and grade.",
      },
      {
        number: "02",
        title: "Plans & estimate",
        body: "Drawings, materials, doors, and electrical scoped — with a written number you can plan around.",
      },
      {
        number: "03",
        title: "Permits & build",
        body: "Township permits pulled, slab poured, walls up, roof on, doors hung, electrical wired — one Revive crew.",
      },
      {
        number: "04",
        title: "Walk-through",
        body: "Final inspection passed, punch list closed, warranty paperwork delivered before we wrap.",
      },
    ],
  },
  gallery: {
    eyebrow: "Sample builds",
    heading: "Recent garage and outbuilding work.",
    subheading:
      "A look at detached garages, workshops, and outbuildings we've built across Central PA. Real project photos are added as builds wrap up.",
    projects: [
      {
        src: "/images/gallery-gc/gc-01-garage.png",
        alt: "Sample finished detached garage build (placeholder image — drop in real project photo)",
        caption: "Detached garage build · sample",
      },
      {
        src: "/images/gallery-gc/gc-04-deck.png",
        alt: "Sample exterior structure with stained wood details (placeholder image — drop in real project photo)",
        caption: "Exterior structure · sample",
      },
      {
        src: "/images/gallery-gc/gc-07-porch.png",
        alt: "Sample new front porch with stone columns (placeholder image — drop in real project photo)",
        caption: "Stone-column build · sample",
      },
      {
        src: "/images/gc-hero/gc-hero-4-exterior.png",
        alt: "Exterior of a finished structure blending with the original house",
        caption: "Match-to-home exterior",
      },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Garages & outbuildings, answered.",
    items: [
      {
        q: "How big can I build without rezoning?",
        a: "It depends on your township's setback and lot-coverage rules. We pull the rules for your specific property during the walk-through and tell you exactly what's allowed before we draw anything.",
      },
      {
        q: "Do you pour the concrete slab too?",
        a: "Yes — foundations and slabs are part of the build. We dig footings below frost line, pour reinforced slabs, and handle grading and drainage as one scope.",
      },
      {
        q: "Can I get electrical run for an EV charger or workshop?",
        a: "Absolutely. We size the sub-panel for what you actually plan to do — EV charging, welding, air compressors, full workshop lighting — and run code-compliant wiring.",
      },
      {
        q: "Will the new building look like it belongs with the house?",
        a: "That's the design intent. We match siding profile, color, roofing material, and trim so the garage or outbuilding reads as part of the property, not a kit drop.",
      },
      {
        q: "How long does a detached garage take?",
        a: "Most two-bay detached garages run 6–10 weeks from permit pull to keys, depending on weather and finish level. We give you a real schedule in the contract.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready to plan it",
    heading: "Let's scope your garage or outbuilding.",
    body: "Free on-site walk-through and a real written estimate. We'll confirm setbacks, talk sizing, and price the build honestly.",
  },
};

export default function GaragesOutbuildingsPage() {
  return <GCServicePage config={pageConfig} />;
}
