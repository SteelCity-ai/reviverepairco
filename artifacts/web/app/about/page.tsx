import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { brandConfig, getBrand } from "../../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: { absolute: `About ${config.name} | Central PA Contractor` },
    description: `Locally owned and operated in Central Pennsylvania, ${config.name} handles roofing, general contracting, renovations, and demolition with honest scope-of-work and dependable crews.`,
    alternates: { canonical: `https://${config.domain}/about` },
    openGraph: { url: `https://${config.domain}/about` },
  };
}

const values = [
  {
    title: "Honest scope of work",
    body: "We tell you what actually needs doing — and what can wait. No upsells, no scare tactics, just clear options.",
  },
  {
    title: "Dependable crews",
    body: "Our teams show up when promised, work cleanly, and treat your property the way they'd treat their own.",
  },
  {
    title: "Built to last",
    body: "Quality materials, careful workmanship, and proper installation so the work holds up through every Pennsylvania season.",
  },
  {
    title: "Local accountability",
    body: "We live and work in the same communities we serve. Your neighbors are our neighbors — and our reputation is everything.",
  },
];

const stats = [
  { label: "Years serving Central PA", value: "25+" },
  { label: "Projects across Central & Eastern PA", value: "Multiple" },
  { label: "5-star homeowner reviews", value: "100+" },
  { label: "Average response time", value: "< 2 hrs" },
];

export default function AboutPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="relative overflow-hidden bg-[var(--color-primary)] py-20 text-white sm:py-24">
        <div className="absolute inset-0 opacity-30">
          <Image
            src="/images/about/team.png"
            alt=""
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[var(--color-primary)] via-[var(--color-primary)]/85 to-transparent" />
        </div>
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            About Revive
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Central Pennsylvania&apos;s repair and renovation specialists.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Revive Repair Specialists is a locally owned contractor serving Harrisburg,
            Hershey, Mechanicsburg, Carlisle, Lancaster, and the surrounding communities.
            We handle roofing, general contracting, renovations, and demolition — all with
            the same focus on clear communication and craftsmanship.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a]"
            >
              Request a free estimate
            </Link>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              (717) 500-1434
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              Our story
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              Built around how homeowners actually want to be treated.
            </h2>
            <div className="mt-6 space-y-5 text-base leading-relaxed text-[var(--color-slate)]">
              <p>
                Revive started with a simple frustration: too many homeowners get vague
                quotes, ghosted contractors, and surprise change orders. We built the
                business to be the opposite of that.
              </p>
              <p>
                Every project starts with a clear scope of work, an honest assessment, and
                a written estimate you can actually understand. From a single shingle
                repair to a full kitchen renovation or a teardown, our crews show up on
                time, communicate as we go, and clean up like they were never there.
              </p>
              <p>
                We&apos;re licensed, insured, and proud to work in the same neighborhoods
                where we live. Most of our work comes from word of mouth — and that&apos;s
                exactly how we want to keep growing.
              </p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 self-start">
            {stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-black/5 bg-[var(--color-surface)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)]"
              >
                <p className="text-3xl font-bold text-[var(--color-primary)]">
                  {stat.value}
                </p>
                <p className="mt-2 text-sm text-[var(--color-slate)]">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              What we stand for
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              The four things we don&apos;t compromise on.
            </h2>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2">
            {values.map((value) => (
              <div
                key={value.title}
                className="rounded-3xl border border-black/5 bg-white p-8 shadow-[0_15px_40px_rgba(15,23,42,0.05)]"
              >
                <h3 className="text-xl font-semibold text-[var(--color-primary)]">
                  {value.title}
                </h3>
                <p className="mt-3 text-base leading-relaxed text-[var(--color-slate)]">
                  {value.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-[var(--color-primary)] py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Ready to talk through your project?
          </h2>
          <p className="max-w-2xl text-lg text-white/75">
            Free inspections and estimates across Central PA. We&apos;ll walk through your
            project, give you honest options, and only recommend the work you actually
            need.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a]"
            >
              Get in touch
            </Link>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Call (717) 500-1434
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
