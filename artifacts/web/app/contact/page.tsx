import type { Metadata } from "next";
import Link from "next/link";
import ContactPageForm from "../components/ContactPageForm";

export const metadata: Metadata = {
  title: "Contact Revive Repair Specialists | Central PA",
  description:
    "Request a free inspection or estimate from Revive Repair Specialists. Roofing, general contracting, renovations, and demolition across Harrisburg and Central PA.",
};

const serviceAreas = [
  "Harrisburg",
  "Hershey",
  "Mechanicsburg",
  "Camp Hill",
  "Carlisle",
  "Lancaster",
  "York",
  "Lemoyne",
];

export default function ContactPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="bg-[var(--color-primary)] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Get in touch
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Tell us what&apos;s going on. We&apos;ll take it from there.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Free estimates, fast response, and honest answers. Reach out by phone, email,
            or the form below — most requests get a callback within two hours during
            business hours.
          </p>
        </div>
      </section>

      <section className="bg-[var(--color-surface)] py-20 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-8">
          <div className="rounded-[32px] bg-[var(--color-primary)] p-8 text-white shadow-[0_26px_70px_rgba(15,23,42,0.16)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              Contact info
            </p>
            <h2 className="mt-3 text-3xl font-bold sm:text-4xl">
              The fastest way to reach us.
            </h2>

            <dl className="mt-8 space-y-6 text-base">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  Phone
                </dt>
                <dd className="mt-2">
                  <a
                    href="tel:+17175001434"
                    className="text-2xl font-bold text-white transition hover:text-[var(--color-amber)]"
                  >
                    (717) 500-1434
                  </a>
                  <p className="mt-1 text-sm text-white/70">
                    Emergency calls answered around the clock.
                  </p>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  Email
                </dt>
                <dd className="mt-2">
                  <a
                    href="mailto:info@reviveroofrepair.com"
                    className="text-lg font-semibold text-white transition hover:text-[var(--color-amber)]"
                  >
                    info@reviveroofrepair.com
                  </a>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  Hours
                </dt>
                <dd className="mt-2 text-white/85">
                  <p>Monday – Saturday · 8:00 AM – 8:00 PM</p>
                  <p>Sunday · Emergency response only</p>
                </dd>
              </div>

              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.24em] text-white/60">
                  Based in
                </dt>
                <dd className="mt-2 text-white/85">
                  Harrisburg, Pennsylvania — serving the surrounding Central PA region.
                </dd>
              </div>
            </dl>

            <div className="mt-10 rounded-2xl border border-white/10 bg-white/5 p-6">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)]">
                Service areas
              </p>
              <div className="mt-4 grid grid-cols-2 gap-2 text-sm text-white/85">
                {serviceAreas.map((area) => (
                  <p key={area}>{area}</p>
                ))}
              </div>
              <p className="mt-4 text-xs text-white/60">
                Don&apos;t see your town? Call us — we likely cover it.
              </p>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-[0_26px_70px_rgba(15,23,42,0.08)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              Free estimate request
            </p>
            <h2 className="mt-3 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
              Tell us about your project.
            </h2>
            <p className="mt-3 text-base text-[var(--color-slate)]">
              Share a few details and we&apos;ll follow up to schedule a walk-through or
              inspection.
            </p>
            <div className="mt-6">
              <ContactPageForm />
            </div>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold sm:text-3xl">
            Got a roof leaking right now?
          </h2>
          <p className="max-w-2xl text-base text-[var(--color-slate)]">
            Skip the form — call us directly and we&apos;ll get a crew rolling.
          </p>
          <a
            href="tel:+17175001434"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-base font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a]"
          >
            Call (717) 500-1434
          </a>
          <Link
            href="/services"
            className="text-sm font-semibold text-[var(--color-primary)] underline-offset-4 hover:underline"
          >
            Or browse our services →
          </Link>
        </div>
      </section>
    </div>
  );
}
