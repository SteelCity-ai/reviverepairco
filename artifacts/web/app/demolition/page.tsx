import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import ContactSection from "../components/ContactSection";
import TrustBadges from "../components/TrustBadges";
import { brandConfig, getBrand } from "../../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: { absolute: `Demolition & Site Prep | ${config.name} | Central PA` },
    description:
      "Selective interior tear-outs, garage and outbuilding demolition, and site cleanup across Harrisburg and Central Pennsylvania. Safe, clean, fully insured.",
    alternates: { canonical: `https://${config.domain}/demolition` },
    openGraph: { url: `https://${config.domain}/demolition` },
  };
}

export default function DemolitionPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-[var(--color-primary)] text-white">
        <Image
          src="/images/gallery-gc/gc-05-demolition.png"
          alt="Demolition crew preparing a site for a new home addition"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover opacity-40"
        />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Demolition & site prep
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Tear-outs and demo, done safely and cleaned up after.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Whether it&apos;s an interior gut for a renovation, a detached
            garage coming down, or full-site demolition before a new build, the
            Revive Repair crew handles the work and the cleanup.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#f0b94d]"
            >
              Request a demolition quote
            </Link>
            <Link
              href="/general-contracting"
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-white/10 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              See full general contracting →
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-white px-4 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-6xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              What we tear out
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
              The kinds of demolition we handle.
            </h2>
            <ul className="mt-6 space-y-3 text-lg text-[var(--color-slate)]">
              <li>• Selective interior demo — kitchens, bathrooms, basement walls</li>
              <li>• Detached garages, sheds, and outbuilding tear-downs</li>
              <li>• Pre-renovation gut-outs — flooring, drywall, cabinets</li>
              <li>• Roof and exterior tear-offs ahead of new construction</li>
              <li>• Site cleanup, debris haul-away, and dumpster coordination</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h3 className="text-2xl font-bold text-[var(--color-primary)]">
              Safe, insured, and considerate.
            </h3>
            <ul className="mt-6 space-y-4 text-base text-[var(--color-slate)]">
              <li>
                <span className="font-semibold text-[var(--color-primary)]">Fully insured.</span>{" "}
                General liability + workers&apos; comp on every demolition job.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-primary)]">Permits handled.</span>{" "}
                We pull the right permits and coordinate inspections.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-primary)]">Clean job sites.</span>{" "}
                Daily cleanup, dust control inside the home, no surprise debris.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-primary)]">Build-ready turnover.</span>{" "}
                If we&apos;re also doing the build, demo flows straight into framing.
              </li>
            </ul>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
            >
              Schedule a site visit
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
