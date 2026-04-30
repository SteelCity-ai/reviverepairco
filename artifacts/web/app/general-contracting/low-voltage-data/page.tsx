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
      absolute: `Low Voltage & Data Cabling | ${config.name} | Central PA`,
    },
    description:
      "Commercial low-voltage and structured data cabling across Harrisburg and Central Pennsylvania. Cat6/Cat6A network runs, fiber backbones, A/V, access control, and security cabling — installed clean and labeled right.",
    keywords:
      "low voltage cabling, structured cabling, Cat6 installation, fiber optic cabling, data cabling contractor, commercial network wiring, access control cabling, Harrisburg low voltage, Central PA",
    alternates: {
      canonical: `https://${config.domain}/general-contracting/low-voltage-data`,
    },
    openGraph: {
      url: `https://${config.domain}/general-contracting/low-voltage-data`,
    },
  };
}

const pageConfig: GCServicePageConfig = {
  hero: {
    eyebrow: "Low voltage & data",
    title: "Structured cabling and low-voltage systems, installed clean.",
    description:
      "Cat6/Cat6A network drops, fiber backbones, A/V, access control, and security cabling for commercial buildings across Central PA — pulled neat, labeled, tested, and documented.",
    image: "/images/gc-hero/gc-low-voltage-data.png",
    imageAlt:
      "Network technician installing structured Cat6 cabling in a commercial building ceiling",
  },
  scope: {
    eyebrow: "What we install",
    heading: "One crew for the cable plant and the systems on top of it.",
    intro:
      "Whether it's a new build, a tenant fit-out, or a rehab, we plan and pull the low-voltage infrastructure that everything else hangs off — data, voice, A/V, security, access control. Done right the first time so it tests clean and stays serviceable.",
    bullets: [
      "Cat6 and Cat6A structured network cabling",
      "Single-mode and multi-mode fiber backbones",
      "Voice cabling, paging, and intercom",
      "Conference room and A/V cabling (HDMI, USB-C, displays)",
      "Access control, door contacts, and request-to-exit",
      "IP camera and security system cabling",
      "Wireless access point drops and surveys",
      "Patch panels, racks, terminations, and labeling",
    ],
    sideTitle: "Built like an installer will thank you later",
    sideItems: [
      {
        title: "Tested and certified",
        desc: "Every drop is tested with a Fluke-class certifier and the results handed over so you have a real baseline.",
      },
      {
        title: "Labeled both ends",
        desc: "Permanent jack labels and patch panel labels match a port map you can actually use when something moves.",
      },
      {
        title: "Neat in the ceiling",
        desc: "Cable trays, J-hooks, and proper bend-radius support — not zip-ties to a sprinkler line.",
      },
      {
        title: "Documented",
        desc: "As-built drawings, port maps, and test results delivered as PDFs so the next IT vendor isn't guessing.",
      },
    ],
  },
  process: {
    eyebrow: "How a job runs",
    heading: "From walk-through to certified, documented, done.",
    description:
      "Same Revive process — clear scope, fixed price, one schedule, one phone number for the whole job.",
    steps: [
      {
        number: "01",
        title: "Site walk & needs",
        body: "We walk the building, count drops, identify pathways, and confirm what equipment connects to what.",
      },
      {
        number: "02",
        title: "Design & estimate",
        body: "Rack layout, drop locations, cable counts, terminations, and a written number you can plan around.",
      },
      {
        number: "03",
        title: "Pull, terminate, test",
        body: "Cables pulled in cable tray or J-hooks, terminated to spec, every run tested and certified.",
      },
      {
        number: "04",
        title: "Documentation handoff",
        body: "As-built drawings, port maps, and certifier reports delivered before we close out the job.",
      },
    ],
  },
  gallery: {
    eyebrow: "Sample work",
    heading: "Recent low-voltage and data installs.",
    subheading:
      "A look at the kind of structured cabling and low-voltage work Revive crews deliver across Central PA. New project photos are added as installs wrap up.",
    showPlaceholderNote: true,
    projects: [
      {
        src: "/images/gc-hero/gc-low-voltage-data.png",
        alt: "Cat6 cable bundles being pulled through a commercial ceiling",
        caption: "Structured Cat6 install · sample",
      },
      {
        src: "/images/gc-hero/gc-hero-2-commercial-rehab.png",
        alt: "Interior gut renovation of a commercial building with new framing",
        caption: "Cabling during a tenant fit-out",
      },
      {
        src: "/images/gc-hero/gc-hero-3-commercial-rehab.png",
        alt: "Historic commercial building being restored with new systems",
        caption: "Systems in a building rehab",
      },
      {
        src: "/images/gc-hero/gc-hero-4-commercial-rehab.png",
        alt: "Adaptive reuse mill conversion with new cabling infrastructure",
        caption: "Adaptive-reuse cabling",
      },
    ],
  },
  faq: {
    eyebrow: "Common questions",
    heading: "Low voltage & data, answered.",
    items: [
      {
        q: "Cat6 or Cat6A — which should I install?",
        a: "For most office, retail, and light-commercial fit-outs, Cat6 is plenty for gigabit and short-run 10G. We recommend Cat6A when you've got long runs powering high-PoE devices like cameras and APs, or when the space is being designed to last 15+ years.",
      },
      {
        q: "Do you handle the equipment too, or just the cable?",
        a: "We focus on the cable plant — pathways, drops, terminations, racks, patch panels, and labeling. We coordinate cleanly with whoever owns your switches, firewalls, phones, or access-control head end so the handoff is seamless.",
      },
      {
        q: "Will every drop be tested?",
        a: "Yes. Every run is tested and certified with a Fluke-class certifier, and you get the test results as PDFs so you have a real baseline if something acts up later.",
      },
      {
        q: "Can you pull cable while the building is occupied?",
        a: "Often, yes — we work around business hours, use proper ceiling protection, and stage the work so users aren't disrupted. For larger pulls we'll schedule after-hours or weekend work.",
      },
      {
        q: "Do you do fiber too?",
        a: "Yes — single-mode and multi-mode fiber backbones between IDF closets and to outbuildings, including fusion splicing, terminations, and OTDR/loss testing.",
      },
    ],
  },
  cta: {
    eyebrow: "Ready to scope it",
    heading: "Let's plan your low-voltage and data install.",
    body: "Free on-site walk-through and a real written estimate. We'll count drops, map pathways, and price it honestly.",
  },
};

export default function LowVoltageDataPage() {
  return <GCServicePage config={pageConfig} />;
}
