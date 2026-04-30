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
      absolute: `Roof Replacement | New Roof Installation | ${config.shortName}`,
    },
    description:
      "Full roof replacement across Harrisburg and Central PA — asphalt shingle, metal, and flat-roof systems. Tear-off, decking, underlayment, and a manufacturer-backed warranty from one Revive crew.",
    keywords:
      "roof replacement, new roof, roof installation, asphalt shingle, metal roofing, flat roof, tear off, Harrisburg, Hershey, York, Lancaster, Central PA",
    alternates: {
      canonical: `https://${ROOFING_DOMAIN}/services/roof-replacement`,
    },
    openGraph: {
      url: `https://${ROOFING_DOMAIN}/services/roof-replacement`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Roof replacement",
    title: "A new roof, installed clean — and built to outlast the warranty.",
    description:
      "Full tear-offs, deck inspection, ice & water shield, synthetic underlayment, and architectural shingles or standing-seam metal. One Revive crew from the dumpster drop to the final ridge cap.",
    image: "/images/services/replacement.jpg",
    imageAlt: "Crew installing a new architectural shingle roof in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we install",
    heading: "Replacements that protect the deck, not just cover it.",
    intro:
      "Most roof failures start under the shingles — wet decking, missing underlayment, or skipped flashing details. We tear off down to the deck, fix what we find, and rebuild the system the manufacturer actually warrants.",
    bullets: [
      "Architectural asphalt shingles (GAF, Owens Corning, CertainTeed)",
      "Standing-seam and exposed-fastener metal roofing",
      "Flat and low-slope systems (TPO, EPDM, modified bitumen)",
      "Composite and synthetic slate options",
      "Full tear-off, decking repair, and ice & water shield",
      "Ridge venting, drip edge, and step-flashing details done right",
    ],
    sideTitle: "Included with every replacement",
    sideItems: [
      {
        title: "Complete tear-off",
        desc: "We strip down to the deck, replace any rotted sheathing, and start the new system on a sound surface.",
      },
      {
        title: "Manufacturer-backed warranty",
        desc: "GAF and Owens Corning system warranties on labor and materials — registered in your name before we leave.",
      },
      {
        title: "Magnetic clean-up",
        desc: "Magnet sweeps of the driveway, lawn, and gardens at the end of every day. No nails left behind.",
      },
      {
        title: "Permits & inspection",
        desc: "Township permits pulled and final inspection scheduled — you don't have to chase the municipality.",
      },
    ],
  },
  process: {
    eyebrow: "How a replacement runs",
    heading: "From estimate to clean-up, the same four steps every time.",
    description:
      "Every replacement runs the same playbook so you know exactly what's happening on your property — and what it will cost — before we start.",
    steps: [
      {
        number: "01",
        title: "Free roof inspection",
        body: "We walk the roof, photograph every elevation, and show you what's actually wrong instead of selling you a guess.",
      },
      {
        number: "02",
        title: "Materials & fixed quote",
        body: "Shingle color, vent layout, accessories, and a real total — no door-knocker pricing tricks.",
      },
      {
        number: "03",
        title: "Tear-off & install",
        body: "Most homes go from old roof to new in one to two days. Dumpster on site, daily cleanup, ground protection.",
      },
      {
        number: "04",
        title: "Final walk & warranty",
        body: "We walk the property with you, register the warranty, and hand you the paperwork before we leave.",
      },
    ],
  },
  gallery: {
    eyebrow: "Recent replacements",
    heading: "Real Central PA roofs, finished by the Revive crew.",
    subheading:
      "A look at recent tear-offs, architectural shingle installs, and full residential replacements across Harrisburg and the surrounding area.",
    projects: [
      roofingProjects[0],
      roofingProjects[2],
      roofingProjects[3],
      roofingProjects[5],
      roofingProjects[6],
      roofingProjects[8],
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Roof replacement, answered.",
    items: [
      {
        q: "How long does a roof replacement take?",
        a: "Most single-family homes go from tear-off to clean-up in one or two days. Larger or steeper roofs, or homes with multiple layers to remove, may run a third day. We give you a real schedule before we start.",
      },
      {
        q: "Do I have to leave the house during the install?",
        a: "No. You can stay in the house during the replacement. Expect noise from impact nailers and the dumpster — most homeowners run errands or work from another room during the loudest hours.",
      },
      {
        q: "Will you replace any rotted decking?",
        a: "Yes. The price quote includes decking inspection. If we find rotted sheathing during tear-off, we replace it at a transparent per-sheet rate that's spelled out in the contract — never a surprise.",
      },
      {
        q: "What warranty comes with the new roof?",
        a: "All replacements ship with the manufacturer's standard material warranty (typically 30–50 years on architectural shingles) plus our workmanship warranty. System warranties from GAF and Owens Corning are available on most installs.",
      },
      {
        q: "Do you handle the township permit?",
        a: "Yes. We pull the permit, schedule the final inspection, and own the code-compliance side of the job. You sign once and we handle the rest.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready when you are",
    heading: "Get a real number for your replacement.",
    body: "Free on-site inspection and a written, fixed-price estimate. No high-pressure pitch, no mystery line items.",
  },
  backLink: {
    label: "← All roofing services",
    href: "/roofing",
  },
};

export default function RoofReplacementPage() {
  return <GCServicePage config={pageConfig} />;
}
