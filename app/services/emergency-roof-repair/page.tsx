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
      absolute: `Emergency Roof Repair | 24/7 Rapid Response | ${config.shortName}`,
    },
    description:
      "24/7 emergency roof repair across Central PA. Fallen trees, sudden leaks, storm damage, emergency tarping — fast response from a licensed Revive crew. Call (717) 500-1434.",
    keywords:
      "emergency roof repair, 24/7 roofer, emergency tarping, storm damage repair, fallen tree roof, urgent roof repair, Harrisburg, Hershey, York, Lancaster, Central PA",
    alternates: {
      canonical: `https://${ROOFING_DOMAIN}/services/emergency-roof-repair`,
    },
    openGraph: {
      url: `https://${ROOFING_DOMAIN}/services/emergency-roof-repair`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "24/7 emergency repair",
    title: "Roof open to the sky? We tarp it today and rebuild it right.",
    description:
      "Tree through the roof, wind tearing shingles off, ceiling actively dripping — call any hour. We get a tech on site, stop the water, and document everything for the insurance claim.",
    image: "/images/gallery/04-tear-off.webp",
    imageAlt: "Roofers performing emergency tear-off and repair work on a residential roof",
  },
  scope: {
    eyebrow: "What we respond to",
    heading: "When the roof is open, every hour multiplies the damage.",
    intro:
      "Emergency calls are the worst day of a homeowner's year — and the wrong response makes it worse. We get there fast, stabilize the roof, and own the rest of the project so you only make one phone call.",
    bullets: [
      "Same-day emergency tarping",
      "Tree and limb impact damage",
      "Active interior leaks and water intrusion",
      "Wind-stripped shingle sections",
      "Skylight failures and full flashing blow-outs",
      "Insurance documentation from the first visit",
    ],
    sideTitle: "Included on every emergency call",
    sideItems: [
      {
        title: "Same-day response",
        desc: "When it's actively dripping, we don't make you wait three days for an estimate. We come out and stop the bleeding.",
      },
      {
        title: "Emergency tarping",
        desc: "Industrial-grade tarp, secured properly, to keep the inside dry until the permanent repair can be scheduled.",
      },
      {
        title: "Full damage documentation",
        desc: "Before-and-after photos, cause-of-loss notes, and a written scope ready for your insurance carrier.",
      },
      {
        title: "Permanent repair on the same contract",
        desc: "We don't tarp and disappear. The same Revive crew comes back for the permanent repair or replacement.",
      },
    ],
  },
  process: {
    eyebrow: "How an emergency runs",
    heading: "From your call to a stabilized roof, fast.",
    description:
      "Emergencies are chaotic enough. Here's exactly what happens once you call us.",
    steps: [
      {
        number: "01",
        title: "Call & triage",
        body: "Tell us what you're seeing. We dispatch the closest crew and tell you what to do in the meantime to limit interior damage.",
      },
      {
        number: "02",
        title: "Same-day stabilization",
        body: "Tarp goes on. Active leak gets stopped. Photos and notes for the insurance file before we leave the property.",
      },
      {
        number: "03",
        title: "Insurance & scope",
        body: "We help you file the claim, meet your adjuster on the roof, and agree the scope of the permanent repair.",
      },
      {
        number: "04",
        title: "Permanent repair",
        body: "Same crew comes back to do the real fix — repair, partial replacement, or full re-roof depending on the damage.",
      },
    ],
  },
  gallery: {
    eyebrow: "Recent emergency work",
    heading: "Emergency response and storm work from the Revive crew.",
    subheading:
      "A look at recent storm response, emergency tarping, and damage-repair projects across Harrisburg and Central PA.",
    projects: [
      roofingProjects[3],
      roofingProjects[4],
      roofingProjects[5],
      roofingProjects[7],
      roofingProjects[8],
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Emergency repairs, answered.",
    items: [
      {
        q: "How fast can you actually be on site?",
        a: "For active interior leaks in our Central PA service area, we aim for same-day. After a regional storm event, response can stretch to 24–48 hours because everyone's calling at once — but we keep you informed.",
      },
      {
        q: "Will the tarp hold until you can do the permanent repair?",
        a: "Yes. We use industrial-grade tarps secured with battens and capped fasteners — not a tarp from the hardware store with bricks on it. They typically hold 30–90 days, more than enough time to schedule the permanent fix.",
      },
      {
        q: "Do you charge extra for an emergency call?",
        a: "There's a service-call fee for after-hours emergency response, which is credited against the cost of the permanent repair. We're upfront about it before we dispatch.",
      },
      {
        q: "Can you work directly with my insurance company?",
        a: "Yes. We help you file the claim, document the damage, meet your adjuster on the roof, and negotiate supplements if hidden damage shows up during work.",
      },
      {
        q: "What should I do until you get there?",
        a: "If water is coming through the ceiling, move furniture out of the way, put down towels and a bucket, and if it's safe, poke a small hole in the bulging drywall to let trapped water drain in a controlled way. Don't go on the roof.",
      },
    ],
  },
  cta: {
    eyebrow: "Don't wait it out",
    heading: "Roof emergency? Call us right now.",
    body: "Tree through the roof, active leak, or wind-stripped shingles — we'll dispatch the closest crew and get the damage stopped today.",
  },
  backLink: {
    label: "← All roofing services",
    href: "/roofing",
  },
};

export default function EmergencyRoofRepairPage() {
  return <GCServicePage config={pageConfig} />;
}
