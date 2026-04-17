import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Does Homeowners Insurance Cover Roof Replacement in PA? | Revive",
  description:
    "Does PA homeowners insurance cover roof replacement? Learn what's covered, what's excluded, and how to file a successful claim with your Pennsylvania insurer.",
  keywords:
    "does homeowners insurance cover roof replacement Pennsylvania, PA roof insurance claim, roof replacement insurance PA, storm damage claim Pennsylvania",
  openGraph: {
    title: "Does Homeowners Insurance Cover Roof Replacement in PA?",
    description:
      "Complete guide to Pennsylvania homeowners insurance and roof replacement coverage.",
    images: ["/images/blog/insurance-review.jpg"],
  },
};

export default function InsuranceCoveragePA() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline:
              "Does Homeowners Insurance Cover Roof Replacement in Pennsylvania?",
            author: { "@type": "Organization", name: "Revive Roof Repair" },
            areaServed: "Central Pennsylvania",
          }),
        }}
      />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        <Image
          src="/images/blog/insurance-review.jpg"
          alt="Professional roofer reviewing insurance documents with Pennsylvania homeowner"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Insurance Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Does Homeowners Insurance Cover Roof Replacement in Pennsylvania?
          </h1>
          <p className="text-gray-200 text-sm">
            Written by Revive Roof Repair - 9 min read - Central Pennsylvania
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            This is one of the most common questions we hear from Pennsylvania homeowners after a
            storm. The short answer: <strong>it depends on what caused the damage</strong> and the
            specific terms of your policy. Here&apos;s the full breakdown.
          </p>

          <div className="bg-[#1a202c] rounded-2xl p-6 my-8">
            <p className="text-amber-400 font-bold text-lg mb-2">
              The Most Important Thing Homeowners Miss
            </p>
            <p className="text-gray-300 text-sm">
              Even if your claim is approved, insurance companies often lowball the estimate. We
              review adjuster reports for free - and we have caught underestimated damage on over 80%
              of the claims we have reviewed.
            </p>
          </div>

          <h2>What Pennsylvania Policies Typically Cover</h2>
          <p>Most Pennsylvania homeowners insurance policies cover replacement cost for roof damage caused by:</p>
          <ul>
            <li>Hailstorms - Pennsylvania is one of the top hail states in the Mid-Atlantic</li>
            <li>Wind damage - including hurricane and tornado remnants</li>
            <li>Falling trees and limbs</li>
            <li>Fire and lightning</li>
            <li>Vandalism and theft</li>
          </ul>

          <h2>What&apos;s Usually NOT Covered</h2>
          <p>Standard policies generally do NOT cover:</p>
          <ul>
            <li>
              <strong>Wear and tear</strong> - If your 25-year-old roof is simply aging out, that is
              maintenance, not an insurable event
            </li>
            <li>
              <strong>Neglect</strong> - Failure to maintain your roof can void coverage
            </li>
            <li>
              <strong>Flood damage</strong> - Separate flood insurance required
            </li>
            <li>
              <strong>Earthquake damage</strong> - Requires a separate rider in most cases
            </li>
          </ul>

          <h2>Actual Cash Value vs. Replacement Cost</h2>
          <p>
            <strong>Replacement Cost (RCV)</strong> pays to rebuild your roof to current code
            standards, minus your deductible. This is what you want.
          </p>
          <p>
            <strong>Actual Cash Value (ACV)</strong> pays current value (replacement cost minus
            depreciation). If your 15-year-old roof has depreciated 50%, you only get 50% of
            replacement cost minus deductible.
          </p>

          <h2>The Deductible Rule in Pennsylvania</h2>
          <p>
            Pennsylvania law requires insurers to offer a <strong>minimum $500 deductible</strong>{" "}
            for roof claims. Know your deductible before you file - it comes off the top of every
            claim.
          </p>

          <h2>How to File a Roof Claim in PA</h2>
          <ol>
            <li>
              <strong>Call your insurance company</strong> - Report the damage as soon as possible
            </li>
            <li>
              <strong>Get a professional inspection</strong> - Before the adjuster comes, get your
              own roofer&apos;s assessment. We do free inspections and can meet the adjuster on-site.
            </li>
            <li>
              <strong>Document everything</strong> - Photos from multiple angles, weather records
              showing the storm date, and receipts for temporary repairs
            </li>
            <li>
              <strong>Review the estimate carefully</strong> - We review estimates for free and can
              show you what was overlooked
            </li>
            <li>
              <strong>Get the claim settled</strong> - If the estimate is too low, dispute it
            </li>
          </ol>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 my-8">
            <p className="font-bold text-[#1a202c] mb-2">Free Claim Review - No Obligation</p>
            <p className="text-gray-600 text-sm mb-4">
              If you have already received an insurance estimate, we will review it for free and
              tell you if we think you are being underpaid. No strings attached.
            </p>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center gap-2 bg-amber-500 hover:bg-amber-400 text-[#1a202c] font-bold py-2 px-5 rounded-lg transition-all text-sm"
            >
              Call (717) 500-1434
            </a>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Related Services
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link href="/services/storm-damage-repair" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Storm Damage Repair</p>
              <p className="text-xs text-gray-500 mt-1">Emergency response and full restoration</p>
            </Link>
            <Link href="/services/roof-replacement" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Roof Replacement</p>
              <p className="text-xs text-gray-500 mt-1">Full installation with warranty</p>
            </Link>
            <Link href="/#contact-form" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Free Estimate</p>
              <p className="text-xs text-gray-500 mt-1">No obligation roof inspection</p>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
