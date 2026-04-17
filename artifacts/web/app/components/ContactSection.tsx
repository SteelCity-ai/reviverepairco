"use client";

import { useState } from "react";

export default function ContactSection() {
  const [submitted, setSubmitted] = useState(false);

  return (
    <section id="contact" className="bg-[var(--color-surface)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div className="rounded-[32px] bg-[var(--color-primary)] p-8 text-white shadow-[0_26px_70px_rgba(15,23,42,0.16)] sm:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              Book your inspection
            </p>
            <h2 className="mt-4 text-3xl font-bold sm:text-4xl">
              Make it easy for serious homeowners to reach Revive right now.
            </h2>
            <p className="mt-4 max-w-xl text-lg leading-8 text-white/74">
              This upgraded section combines trust, urgency, and a clean lead form so the homepage feels like a true conversion page — not just a brochure.
            </p>

            <div className="mt-8 space-y-4 text-white/78">
              <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-amber)]">Call now</p>
                <a href="tel:+17175001434" className="mt-2 block text-2xl font-bold text-white">
                  (717) 500-1434
                </a>
                <p className="mt-2 text-sm">Emergency calls and inspection requests across Harrisburg, Hershey, Mechanicsburg, and nearby communities.</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/8 p-5">
                <p className="font-semibold text-white">Why this layout converts</p>
                <ul className="mt-3 space-y-2 text-sm leading-6">
                  <li>• Strong promise above the form</li>
                  <li>• Friction-light fields for mobile users</li>
                  <li>• Clear response expectation and local credibility</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="rounded-[32px] bg-white p-8 shadow-[0_24px_60px_rgba(15,23,42,0.08)] sm:p-10">
            {submitted ? (
              <div className="flex min-h-[420px] flex-col items-center justify-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-amber)]/15 text-2xl text-[var(--color-amber)]">
                  ✓
                </div>
                <h3 className="mt-6 text-3xl font-bold text-[var(--color-primary)]">Thanks — we got it.</h3>
                <p className="mt-4 max-w-md text-lg text-[var(--color-slate)]">
                  Revive will follow up shortly to schedule your inspection and learn more about the issue.
                </p>
              </div>
            ) : (
              <form
                className="space-y-5"
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmitted(true);
                }}
              >
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.24em] text-[var(--color-amber)]">
                    Free estimate request
                  </p>
                  <h3 className="mt-3 text-3xl font-bold text-[var(--color-primary)]">Tell us what’s happening with your roof.</h3>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[var(--color-slate)]">Name</span>
                    <input type="text" required placeholder="Your name" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-4 focus:ring-[var(--color-amber)]/10" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[var(--color-slate)]">Phone</span>
                    <input type="tel" required placeholder="(717) 555-1234" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-4 focus:ring-[var(--color-amber)]/10" />
                  </label>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[var(--color-slate)]">Email</span>
                    <input type="email" placeholder="you@example.com" className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-4 focus:ring-[var(--color-amber)]/10" />
                  </label>
                  <label className="space-y-2">
                    <span className="text-sm font-medium text-[var(--color-slate)]">Service needed</span>
                    <select className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3.5 text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-4 focus:ring-[var(--color-amber)]/10">
                      <option>Roof repair</option>
                      <option>Roof replacement</option>
                      <option>Storm damage</option>
                      <option>Emergency leak</option>
                      <option>Inspection</option>
                    </select>
                  </label>
                </div>

                <label className="block space-y-2">
                  <span className="text-sm font-medium text-[var(--color-slate)]">Project details</span>
                  <textarea rows={5} placeholder="Share what you’re seeing, when it started, and whether the issue is urgent." className="w-full rounded-[24px] border border-slate-200 bg-white px-4 py-3.5 text-[var(--color-primary)] outline-none transition focus:border-[var(--color-amber)] focus:ring-4 focus:ring-[var(--color-amber)]/10" />
                </label>

                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm leading-6 text-[var(--color-slate)]">
                    We’ll follow up quickly to confirm your request and schedule the next step.
                  </p>
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-7 py-4 text-base font-semibold text-[var(--color-primary)] shadow-[0_18px_40px_rgba(214,158,46,0.25)] transition hover:-translate-y-0.5 hover:bg-[#ebb13a]"
                  >
                    Request Free Inspection
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
