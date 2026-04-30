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
      absolute: `Home Renovations & Remodels | ${config.name} | Central PA`,
    },
    description:
      "Kitchen, bathroom, basement, and whole-home renovations across Harrisburg and Central Pennsylvania. Design-through-finish from one accountable Revive crew — no subcontractor shuffle.",
    keywords:
      "home renovation, kitchen remodel, bathroom remodel, basement finishing, whole home renovation, Harrisburg, Hershey, York, Lancaster, Central PA contractor",
    alternates: {
      canonical: `https://${config.domain}/general-contracting/renovations`,
    },
    openGraph: {
      url: `https://${config.domain}/general-contracting/renovations`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Home renovations",
    title: "Kitchens, baths, basements — built to live in for the next 20 years.",
    description:
      "Revive Repair handles the design coordination, demo, build-out, cabinetry, and finishes from one accountable crew. No subcontractor shuffle, no surprise scope creep, no disappearing crews.",
    image: "/images/gc-hero/gc-hero-3-kitchen.png",
    imageAlt: "Renovated open-concept kitchen with white cabinetry and brass pendants",
  },
  scope: {
    eyebrow: "What's included",
    heading: "Renovation work we take on regularly.",
    intro:
      "We focus on renovations where the design, the trades, and the finishes have to land at the same time — the kind of work where one accountable contractor saves you weeks of stress.",
    bullets: [
      "Full kitchen remodels — layout changes, cabinetry, counters, lighting",
      "Bathroom renovations — primary suites, guest baths, half baths",
      "Basement finishing — egress, framing, finishing, mechanicals",
      "Whole-home interior refreshes — flooring, trim, paint, lighting",
      "Structural changes — wall removal, beam installs, layout opens",
      "Cabinetry, counters, tile, and fixtures sourced and installed",
    ],
    sideTitle: "How a Revive renovation runs",
    sideItems: [
      {
        title: "Design alignment",
        desc: "Layout, finishes, and timeline are agreed in writing before demo starts.",
      },
      {
        title: "One accountable crew",
        desc: "Demo, framing, electrical, plumbing, drywall, paint, finish — all under one Revive schedule.",
      },
      {
        title: "Daily-managed job site",
        desc: "Crew lead on site, weekly client check-ins, dust contained, surfaces protected.",
      },
      {
        title: "Real warranty",
        desc: "Workmanship warranty in writing and a punch-list walk-through before final payment.",
      },
    ],
  },
  process: {
    eyebrow: "How we work",
    heading: "Four stages — no mystery, no scope creep.",
    description:
      "Every renovation moves through the same path so you always know what's next, what it costs, and when the crew shows up.",
    steps: [
      {
        number: "01",
        title: "Walk-through & estimate",
        body: "We meet at your home, scope the work, and price it honestly with a real written number.",
      },
      {
        number: "02",
        title: "Design alignment",
        body: "Layout, finishes, fixtures, and timeline are agreed in writing before demo starts.",
      },
      {
        number: "03",
        title: "Build-out",
        body: "Daily-managed crew, weekly client check-ins, clean and protected job site throughout.",
      },
      {
        number: "04",
        title: "Finish & punchlist",
        body: "Walk-through, fix list, warranty paperwork — and the keys to your new space.",
      },
    ],
  },
  gallery: {
    eyebrow: "Sample renovations",
    heading: "Recent renovation work from the Revive crew.",
    subheading:
      "A look at the kind of kitchens, baths, basements, and interior renovations we deliver across Central PA. New project photos are added as builds wrap up.",
    showPlaceholderNote: true,
    projects: [
      {
        src: "/images/gc-hero/gc-hero-3-kitchen.png",
        alt: "Renovated open-concept kitchen with white cabinetry and brass pendants",
        caption: "Kitchen renovation",
      },
      {
        src: "/images/gallery-gc/gc-03-bathroom.png",
        alt: "Sample remodeled bathroom (placeholder image — drop in real project photo)",
        caption: "Bathroom remodel · sample",
      },
      {
        src: "/images/gallery-gc/gc-02-basement.png",
        alt: "Sample finished basement remodel (placeholder image — drop in real project photo)",
        caption: "Basement finishing · sample",
      },
      {
        src: "/images/gallery-gc/gc-08-livingroom.png",
        alt: "Sample renovated living room with built-ins (placeholder image — drop in real project photo)",
        caption: "Interior renovation · sample",
      },
      {
        src: "/images/gallery-gc/gc-04-deck.png",
        alt: "Sample custom deck and pergola (placeholder image — drop in real project photo)",
        caption: "Outdoor build · sample",
      },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Renovations, answered.",
    items: [
      {
        q: "How long does a typical kitchen or bath renovation take?",
        a: "Most full kitchen remodels run 6–10 weeks from demo to walk-through. Bathroom renovations typically run 3–6 weeks. Basement finishing varies more — usually 6–12 weeks depending on size and mechanicals.",
      },
      {
        q: "Can I live in the house during the renovation?",
        a: "Yes — almost always. We seal off the work area, contain dust, protect floors and surfaces along the route, and stage the build so daily life keeps moving.",
      },
      {
        q: "Do you do design or do I need an outside designer?",
        a: "We handle layout, materials, and finish selections in-house for most renovations. If you already have a designer or specific products picked, we'll work with what you've got.",
      },
      {
        q: "Will my estimate change halfway through?",
        a: "We quote a fixed price after the design and scope are agreed in writing. The only changes are if you decide to add work — and any change order is priced and signed before it starts.",
      },
      {
        q: "Do you pull permits for renovations?",
        a: "Yes. Anything that touches structure, plumbing, or electrical gets the right permits and inspections. We own that — you don't coordinate with the township.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready when you are",
    heading: "Let's scope your renovation honestly.",
    body: "Free on-site walk-through and a real written estimate. We'll talk layout, materials, timeline, and a number you can actually plan around.",
  },
};

export default function RenovationsPage() {
  return <GCServicePage config={pageConfig} />;
}
