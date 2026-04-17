import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "What to Do After a Storm - PA Homeowner's Checklist | Revive",
  description:
    "Step-by-step checklist for Pennsylvania homeowners after a storm hits. Document damage, tarp your roof, file insurance claims, and get repairs started. Revive Roof Repair.",
  keywords:
    "what to do after storm roof damage Pennsylvania, storm damage checklist, roof emergency Pennsylvania, file insurance claim storm roof PA",
  openGraph: {
    title: "What to Do After a Storm - PA Homeowner's Checklist",
    description:
      "Complete checklist for Pennsylvania homeowners dealing with storm damage to their roof.",
    images: ["/images/blog/storm-damage-checklist.jpg"],
  },
};

export default function StormChecklist() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        <Image
          src="/images/blog/storm-damage-checklist.jpg"
          alt="Professional roofer assessing storm damage on a Pennsylvania home with dark stormy sky"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Storm Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            What to Do After a Storm - PA Homeowner&apos;s Checklist
          </h1>
          <p className="text-gray-200 text-sm">
            Written by Revive Roof Repair - 6 min read - Central Pennsylvania
          </p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Every year in Pennsylvania - particularly during spring and summer thunderstorm season -
            severe weather tears through Central PA and leaves damaged roofs in its wake. If a
            storm just hit your home, here&apos;s exactly what to do, in the right order.
          </p>

          {/* Emergency CTA */}
          <div className="bg-red-600 rounded-2xl p-6 my-8">
            <p className="text-white font-bold text-lg mb-1">Storm Damage? Call Now - 24/7</p>
            <p className="text-red-100 text-sm mb-4">
              If water is actively entering your home, do not wait. We dispatch emergency crews
              around the clock in Harrisburg and surrounding areas.
            </p>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center gap-2 bg-white text-red-600 font-bold py-2 px-5 rounded-lg transition-all text-sm"
            >
              Call (717) 500-1434
            </a>
          </div>

          <h2>Step 1: Ensure Your Safety First</h2>
          <p>Before you do anything - storm damage creates dangerous conditions.</p>
          <ul>
            <li>Do NOT go up on the roof while there is active lightning, high winds, or wet conditions</li>
            <li>If you hear cracking or creaking, stay out of the house</li>
            <li>Turn off electricity at the breaker if you suspect water has entered electrical systems</li>
            <li>If water is pooling inside your home, call 911 if it is an emergency</li>
          </ul>

          <h2>Step 2: Document Everything - Before You Fix Anything</h2>
          <p>
            This is the most important step for your insurance claim. Take extensive photos and
            video of all damage - <strong>before</strong> you cover anything or make repairs.
          </p>
          <ul>
            <li>Wide shots of all four sides of your home</li>
            <li>Close-up photos of individual damage points</li>
            <li>Photos of any fallen tree limbs, dented gutters, or damaged siding</li>
            <li>Interior ceiling stains, bulging drywall, or active drips</li>
          </ul>
          <p>
            <strong>Pro tip:</strong> Turn on your phone&apos;s timestamp feature. Insurance adjusters
            and attorneys both care about being able to verify when photos were taken.
          </p>

          <h2>Step 3: Prevent Further Damage</h2>
          <p>
            If your roof has active leaks, preventing further interior damage is critical - and
            insurance companies expect homeowners to take reasonable steps to mitigate additional
            losses. Keep all receipts for any materials you purchase for temporary repairs.
          </p>
          <ul>
            <li>
              <strong>Tarp coverage:</strong> A heavy-duty tarp secured over damaged areas stops rain
              from entering until permanent repairs are made
            </li>
            <li>
              <strong>Interior buckets:</strong> Place buckets under active drips to protect floors
              and furnishings
            </li>
            <li>
              <strong>Move valuables:</strong> Get furniture, electronics, and keepsakes away from
              water intrusion zones
            </li>
          </ul>

          <h2>Step 4: Call Your Insurance Company</h2>
          <p>
            Report the damage as soon as reasonably possible. In Pennsylvania, the statute of
            limitations for filing a claim is typically <strong>2 years from the date of loss</strong>,
            but do not wait that long.
          </p>

          <h2>Step 5: Get a Professional Inspection</h2>
          <p>
            After you have called your insurance company, but before the adjuster comes - get your
            own roofer&apos;s assessment. Insurance adjusters work for the insurance company. Your
            roofer works for you.
          </p>

          <h2>Step 6: Meet the Adjuster On-Site</h2>
          <p>
            When your insurance company schedules an adjuster inspection, <strong>be present</strong>.
            Better yet - have your roofing contractor there too. We frequently attend adjuster
            inspections with homeowners, and we have seen it make a significant difference in the
            final settlement.
          </p>

          <h2>Step 7: Review Your Settlement Before Signing</h2>
          <p>
            Do not sign anything or authorize repairs until you have reviewed the insurance
            company&apos;s estimate. We review insurance estimates for free.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 my-8">
            <p className="font-bold text-[#1a202c] mb-2">
              Emergency Storm Response - Available 24/7
            </p>
            <p className="text-gray-600 text-sm mb-4">
              From emergency tarping to complete roof replacement, Revive Roof Repair handles it
              all. Licensed, insured, and backed by a 10-year workmanship warranty.
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
            <Link href="/services/emergency-roof-repair" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Emergency Tarping</p>
              <p className="text-xs text-gray-500 mt-1">24/7 rapid response</p>
            </Link>
            <Link href="/services/roof-leak-repair" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Roof Leak Repair</p>
              <p className="text-xs text-gray-500 mt-1">Stop water intrusion fast</p>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
