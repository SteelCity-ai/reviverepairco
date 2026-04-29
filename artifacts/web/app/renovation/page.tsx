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
    title: { absolute: `Home Renovations | ${config.name} | Central PA` },
    description:
      "Kitchen, bathroom, basement, and whole-home renovations across Harrisburg and Central Pennsylvania. Design-through-finish from one accountable Revive crew.",
    alternates: { canonical: `https://${config.domain}/renovation` },
    openGraph: { url: `https://${config.domain}/renovation` },
  };
}

export default function RenovationPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-[var(--color-primary)] text-white">
        <Image
          src="/images/gc-hero/gc-hero-3-kitchen.png"
          alt="Renovated open-concept kitchen with white cabinetry and brass pendants"
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover opacity-40"
        />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Home renovations
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Kitchens, baths, basements — built to live in for the next 20 years.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85">
            Revive Repair handles the design coordination, demo, build-out,
            cabinetry, and finishes from one accountable crew. No subcontractor
            shuffle, no surprise scope creep.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#f0b94d]"
            >
              Request a renovation estimate
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
              What&apos;s included
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
              Renovation work we take on regularly.
            </h2>
            <ul className="mt-6 space-y-3 text-lg text-[var(--color-slate)]">
              <li>• Full kitchen remodels — layout changes, cabinetry, counters, lighting</li>
              <li>• Bathroom renovations — primary suites, guest baths, half baths</li>
              <li>• Basement finishing — egress, framing, finishing, mechanicals</li>
              <li>• Whole-home interior refreshes — flooring, trim, paint, lighting</li>
              <li>• Structural changes — wall removal, beam installs, layout opens</li>
            </ul>
          </div>
          <div className="rounded-[28px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)]">
            <h3 className="text-2xl font-bold text-[var(--color-primary)]">
              How a Revive renovation runs.
            </h3>
            <ol className="mt-6 space-y-5 text-base text-[var(--color-slate)]">
              <li>
                <span className="font-semibold text-[var(--color-primary)]">1. Walk-through & estimate.</span>{" "}
                We meet at your home, scope the work, and price it honestly.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-primary)]">2. Design alignment.</span>{" "}
                Layout, finishes, and timeline are agreed in writing before demo.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-primary)]">3. Build-out.</span>{" "}
                Daily-managed crew, weekly client check-ins, clean job site.
              </li>
              <li>
                <span className="font-semibold text-[var(--color-primary)]">4. Finish & punchlist.</span>{" "}
                Walk-through, fix list, warranty paperwork.
              </li>
            </ol>
            <Link
              href="/contact"
              className="mt-8 inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
            >
              Talk to our renovations team
            </Link>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
