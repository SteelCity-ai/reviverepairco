import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "How to Spot Hail Damage on Your Roof | PA Homeowner's Guide",
  description:
    "Learn to identify hail damage on your Pennsylvania roof before it causes leaks. Visual guide with photos. Free inspection available - call Revive Roof Repair.",
  keywords: "hail damage roof inspection, Pennsylvania hail damage, roof damage after storm, hail dents shingles, Central PA roofing",
  openGraph: {
    title: "How to Spot Hail Damage on Your Roof | PA Homeowner's Guide",
    description: "Visual guide to identifying hail damage on your Pennsylvania roof before small problems become expensive repairs.",
    images: ["/images/blog/hail-damage-inspection.jpg"],
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can I tell if my roof has hail damage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Look for bruising or dents in shingles, missing granules, cracked or split shingles, and damage to gutters, vents, or flashing. The underside of eaves often shows the first signs.",
      },
    },
    {
      "@type": "Question",
      name: "Does hail damage always cause leaks?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Not immediately. Small dents and bruises can take months or years to start leaking. But every day you wait, water intrusion slowly weakens the structure. Get a free inspection after any major hailstorm.",
      },
    },
    {
      "@type": "Question",
      name: "Will my Pennsylvania homeowner's insurance cover hail damage?",
      acceptedAnswer: {
        "@type": "Answer",
        text: 'In most cases, yes. Pennsylvania homeowners policies generally cover hail damage as an act of nature. You pay your deductible, and the insurer covers the rest. Revive Roof Repair can help you document damage and work with your adjuster.',
      },
    },
  ],
};

export default function HailDamageGuide() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        <Image
          src="/images/blog/hail-damage-inspection.jpg"
          alt="Professional roofer inspecting a residential roof for hail damage in Pennsylvania"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Roofing Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            How to Spot Hail Damage on Your Roof
          </h1>
          <p className="text-gray-200 text-sm">
            Written by Revive Roof Repair - 7 min read - Central Pennsylvania
          </p>
        </div>
      </div>

      {/* Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            Pennsylvania gets hammered by severe hailstorms - especially in the summer. After the
            storm passes and your neighbor says &ldquo;my roof looks fine,&rdquo; it&apos;s worth getting
            up there yourself or calling a professional. Here&apos;s exactly what to look for.
          </p>

          {/* CTA Banner */}
          <div className="bg-[#1a202c] rounded-2xl p-6 my-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-lg">Not sure what you&apos;re looking at?</p>
              <p className="text-gray-400 text-sm">We offer free roof inspections after every storm.</p>
            </div>
            <Link
              href="/#contact-form"
              className="bg-amber-500 hover:bg-amber-400 text-[#1a202c] font-bold py-3 px-6 rounded-lg transition-all whitespace-nowrap"
            >
              Schedule Free Inspection
            </Link>
          </div>

          <h2>1. Start With the Ground Level</h2>
          <p>
            Before climbing anything, walk around your house and look at the roof from all angles.
            Hail damage on a roof often shows up first on the{' '}
            <strong>street-facing slope</strong>, since that&apos;s what took the brunt of the
            wind-driven hail. Look for:
          </p>
          <ul>
            <li>Dents or dings in gutters, downspouts, and gutter guards</li>
            <li>Scrapes and dents on window frames, siding, and doors</li>
            <li>Impact marks on the edge of the roof (rake edge)</li>
            <li>Granules that have collected in valleys or against the foundation</li>
          </ul>

          <h2>2. Look at the Shingles Directly</h2>
          <p>
            Asphalt shingles are the most common roofing material in Central PA, and they show hail
            damage clearly. You&apos;re looking for three main things:
          </p>

          <h3>Bruising</h3>
          <p>
            Run your hand gently over a shingle. If you feel a soft spot or a slight depression -
            like a small dent - that&apos;s bruising. It means the mat beneath the granules has been
            compromised. These are the most common and least obvious signs of hail damage.
          </p>

          <h3>Missing Granules</h3>
          <p>
            Shingles lose granules on impact. You&apos;ll see dark spots or exposed fiberglass mat
            where the granules have been knocked loose. On the ground, look for piles of grit in
            gutters or along foundation walls - that&apos;s granules washing off your roof.
          </p>

          <h3>Cracks and Splits</h3>
          <p>
            Larger hail can crack or split shingles entirely. Look for lines across the shingle that
            radiate from a central impact point. Cracked shingles will almost always leak
            eventually.
          </p>

          <h2>3. Check the Underside of Eaves and Overhangs</h2>
          <p>
            The underside of rake edges and eaves are often the most honest indicators of hail
            damage. Grab a flashlight and look up under the overhangs. If there&apos;s damage on the
            bottom of the plywood or sheathing, you&apos;ve got confirmed hail impact - even if the
            top of the shingles looks okay.
          </p>

          <h2>4. Document Everything</h2>
          <p>
            If you&apos;re filing an insurance claim, documentation is everything. Take extensive
            photos and video of all damage - <strong>before</strong> you cover anything or make
            repairs.
          </p>
          <p>
            <strong>Pro tip:</strong> Take photos BEFORE you call anyone to fix the damage. Your
            insurance company needs to see the original condition.
          </p>

          <h2>5. Know the Timeline</h2>
          <p>
            In Pennsylvania, you typically have <strong>2 years</strong> from the date of loss to
            file a homeowners insurance claim for storm damage. But don&apos;t wait - unaddressed hail
            damage worsens over time, and insurers can deny claims if you&apos;re seen to have
            neglected the problem.
          </p>

          <h2>6. When in Doubt, Call a Professional</h2>
          <p>
            A trained roofer can spot damage that an untrained eye misses. At Revive Roof Repair, we
            do free storm damage inspections throughout Harrisburg, Hershey, Mechanicsburg, York,
            and surrounding areas. We&apos;ll photograph everything, give you an honest assessment, and
            help you navigate the insurance process.
          </p>

          {/* FAQ */}
          <h2>Frequently Asked Questions</h2>
          <div className="space-y-4 my-6">
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="font-bold text-[#1a202c] mb-2">
                How can I tell if my roof has hail damage?
              </p>
              <p className="text-gray-600 text-sm">
                Look for bruising or dents in shingles, missing granules, cracked or split
                shingles, and damage to gutters, vents, or flashing. The underside of eaves often
                shows the first signs.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="font-bold text-[#1a202c] mb-2">
                Does hail damage always cause leaks?
              </p>
              <p className="text-gray-600 text-sm">
                Not immediately. Small dents and bruises can take months or years to start leaking.
                But every day you wait, water intrusion slowly weakens the structure.
              </p>
            </div>
            <div className="bg-gray-50 rounded-xl p-5">
              <p className="font-bold text-[#1a202c] mb-2">
                Will my Pennsylvania homeowner&apos;s insurance cover hail damage?
              </p>
              <p className="text-gray-600 text-sm">
                In most cases, yes. You pay your deductible and the insurer covers the rest. Revive
                Roof Repair can help you document damage and work with your adjuster.
              </p>
            </div>
          </div>
        </div>

        {/* Related services */}
        <div className="mt-12 pt-8 border-t border-gray-100">
          <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-4">
            Related Services
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Link
              href="/services/storm-damage-repair"
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors"
            >
              <p className="font-semibold text-[#1a202c]">Storm Damage Repair</p>
              <p className="text-xs text-gray-500 mt-1">Emergency response and full restoration</p>
            </Link>
            <Link
              href="/#contact-form"
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors"
            >
              <p className="font-semibold text-[#1a202c]">Free Roof Inspection</p>
              <p className="text-xs text-gray-500 mt-1">Detailed damage assessment and report</p>
            </Link>
            <Link
              href="/services/roof-leak-repair"
              className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors"
            >
              <p className="font-semibold text-[#1a202c]">Roof Leak Repair</p>
              <p className="text-xs text-gray-500 mt-1">Stop water intrusion fast</p>
            </Link>
          </div>
        </div>

        {/* Author / CTA */}
        <div className="mt-10 bg-amber-50 rounded-2xl p-6 flex flex-col sm:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-full bg-[#1a202c] flex items-center justify-center shrink-0">
            <span className="text-amber-400 font-bold text-lg">R</span>
          </div>
          <div>
            <p className="font-bold text-[#1a202c]">Revive Roof Repair Team</p>
            <p className="text-sm text-gray-600 mt-1">
              Licensed, insured roofing contractors serving Central Pennsylvania. We specialize in
              storm damage, insurance claims, and roof replacements.
            </p>
          </div>
          <Link
            href="tel:+17175001434"
            className="ml-auto bg-amber-500 hover:bg-amber-400 text-[#1a202c] font-bold py-2 px-5 rounded-lg transition-all whitespace-nowrap text-sm"
          >
            (717) 500-1434
          </Link>
        </div>
      </article>
    </>
  );
}
