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
      absolute: `Roof Leak Repair | Fast Leak Detection & Fix | ${config.shortName}`,
    },
    description:
      "Fast roof leak detection and repair across Harrisburg and Central PA. We trace the source, fix the flashing, and document the damage so the leak actually stops — not just the drip.",
    keywords:
      "roof leak repair, leak detection, water damage, ceiling leak, flashing repair, vent boot leak, Harrisburg, Hershey, York, Lancaster, Central PA",
    alternates: {
      canonical: `https://${ROOFING_DOMAIN}/services/roof-leak-repair`,
    },
    openGraph: {
      url: `https://${ROOFING_DOMAIN}/services/roof-leak-repair`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Roof leak repair",
    title: "Find the leak. Fix it once. Stop the damage spreading.",
    description:
      "Water on the ceiling almost never enters where it shows up. We trace the leak back to the actual source — flashing, vent boot, valley, or skylight — and rebuild the detail so it stays sealed.",
    image: "/images/services/repair.jpg",
    imageAlt: "Roofer repairing flashing on a residential roof in Central Pennsylvania",
  },
  scope: {
    eyebrow: "What we repair",
    heading: "Most leaks aren't the shingles — they're the details around them.",
    intro:
      "After 15+ years of leak calls in Central PA, the same five culprits show up over and over. We diagnose the actual entry point, fix the failed detail, and check the surrounding system so you're not back on the phone next storm.",
    bullets: [
      "Pipe boot and vent flashing failures",
      "Step flashing on chimneys, dormers, and walls",
      "Valley repairs and ice-dam damage",
      "Skylight reseals and full re-flashing",
      "Wind-lifted or missing shingle replacement",
      "Hidden decking and underlayment damage",
    ],
    sideTitle: "Included with every leak call",
    sideItems: [
      {
        title: "Source diagnosis",
        desc: "We trace the water back to the actual entry point — not just patch the spot the drywall stained.",
      },
      {
        title: "Photo documentation",
        desc: "Before-and-after photos of every repair, ready for your records or an insurance claim.",
      },
      {
        title: "Interior damage check",
        desc: "We look in the attic for wet insulation, stained sheathing, and active drips so nothing gets missed.",
      },
      {
        title: "Workmanship warranty",
        desc: "Every repair is backed in writing. If the same spot leaks again, we come back and own it.",
      },
    ],
  },
  process: {
    eyebrow: "How a leak call runs",
    heading: "From the call to a dry ceiling, in four steps.",
    description:
      "Leak calls are urgent — but rushing the diagnosis is how the same leak comes back six months later. Here's how we work through it.",
    steps: [
      {
        number: "01",
        title: "Same- or next-day inspection",
        body: "We get a tech on the roof and into the attic to find the actual source — not the spot directly above the stain.",
      },
      {
        number: "02",
        title: "Written diagnosis & quote",
        body: "Photos of the failed detail, a clear explanation of what's wrong, and a fixed price for the fix.",
      },
      {
        number: "03",
        title: "Repair & weather seal",
        body: "We rebuild the failed detail — flashing, boot, shingle, or valley — using the right materials for a long-term seal.",
      },
      {
        number: "04",
        title: "Verify & document",
        body: "Hose-test or wait for the next storm, then walk the attic with you to confirm everything stays dry.",
      },
    ],
  },
  gallery: {
    eyebrow: "Recent repair work",
    heading: "Roof details and repairs we've handled this year.",
    subheading:
      "Flashing rebuilds, vent-boot replacements, valley work, and shingle repairs across Harrisburg and the surrounding area.",
    projects: [
      roofingProjects[1],
      roofingProjects[2],
      roofingProjects[3],
      roofingProjects[4],
      roofingProjects[5],
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Leak repair, answered.",
    items: [
      {
        q: "How fast can someone come out?",
        a: "For active leaks we aim for same- or next-day. If it's actively dripping into the house, call (717) 500-1434 and we'll get a tarp on it the same day if needed.",
      },
      {
        q: "Why does the leak inside not match where the roof is failing?",
        a: "Water hits the deck, runs down the underlayment or a rafter, and shows up on the ceiling sometimes 6–12 feet away from the actual entry point. We trace it back to the real source instead of guessing.",
      },
      {
        q: "Is a single leak a sign I need a full replacement?",
        a: "Almost never. Most leaks are a failed detail — a cracked vent boot, a lifted shingle, a step-flashing miss. We tell you straight whether you need a repair or a replacement, and we don't upsell.",
      },
      {
        q: "Will you document the damage for an insurance claim?",
        a: "Yes. We provide photos, a written cause-of-loss report, and an itemized scope your adjuster can work with. We've worked with most major Pennsylvania carriers.",
      },
      {
        q: "Do you warranty leak repairs?",
        a: "Yes — every repair is backed in writing. If the same spot leaks again within the warranty period, we come back at no charge.",
      },
    ],
  },
  cta: {
    eyebrow: "Don't wait it out",
    heading: "Active leak? Let's stop it today.",
    body: "Call us, send a photo of the stain, or request an inspection. We'll get a tech on the roof and the leak diagnosed before it spreads.",
  },
  backLink: {
    label: "← All roofing services",
    href: "/roofing",
  },
  seo: {
    pagePath: "/services/roof-leak-repair",
    serviceName: "Roof Leak Repair",
    serviceDescription:
      "Fast roof leak detection and repair across Harrisburg and Central PA — flashing, vent boots, valleys, and skylights diagnosed back to the actual source and fixed for good.",
    brandOverride: "roofing",
    breadcrumbs: [
      { name: "Roofing Services", path: "/roofing" },
      { name: "Roof Leak Repair" },
    ],
  },
};

export default function RoofLeakRepairPage() {
  return <GCServicePage config={pageConfig} />;
}
