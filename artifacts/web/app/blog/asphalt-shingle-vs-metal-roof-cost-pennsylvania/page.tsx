import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Asphalt Shingle vs Metal Roof Cost in PA | Revive Roof Repair",
  description:
    "Asphalt shingles vs metal roofing - cost comparison for Central Pennsylvania homes. Lifespan, durability, energy efficiency, and what contractors recommend.",
  keywords:
    "asphalt vs metal roof cost Pennsylvania, metal roof vs shingles PA, roof replacement cost Pennsylvania, best roofing material Pennsylvania",
  openGraph: {
    title: "Asphalt Shingle vs Metal Roof Cost in Central PA",
    description:
      "Honest cost comparison of asphalt vs metal roofing for Pennsylvania homeowners.",
    images: ["/images/blog/shingle-comparison.jpg"],
  },
};

export default function AsphaltVsMetalPA() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        <Image
          src="/images/blog/shingle-comparison.jpg"
          alt="Professional roofers comparing asphalt and metal roofing materials on a Central PA home"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Buying Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            Asphalt Shingle vs Metal Roof: Central PA Cost Comparison
          </h1>
          <p className="text-gray-200 text-sm">
            Written by Revive Roof Repair - 8 min read - Central Pennsylvania
          </p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            It&apos;s the question every Pennsylvania homeowner asks when it&apos;s time to replace their
            roof: <strong>asphalt shingles or metal?</strong> Both are excellent choices for Central
            PA - here&apos;s the honest comparison based on cost, longevity, weather performance, and
            real-world homeowner experience.
          </p>

          {/* Quick comparison table */}
          <div className="overflow-x-auto my-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-bold">Factor</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">Asphalt Shingles</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">Metal Roof</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Installed Cost (per sq ft)", "$4 - $7", "$8 - $16"],
                  ["Lifespan", "20-30 years", "40-70 years"],
                  ["Wind Resistance", "Up to 130 mph (architectural)", "Up to 160 mph"],
                  ["Hail Resistance", "Good (architectural)", "Excellent"],
                  ["Energy Efficiency", "Moderate", "High (reflective coatings)"],
                  ["Maintenance", "Low", "Very Low"],
                ].map(([factor, asphalt, metal]) => (
                  <tr key={factor} className="even:bg-gray-50">
                    <td className="p-3 border border-gray-200 font-semibold">{factor}</td>
                    <td className="p-3 border border-gray-200">{asphalt}</td>
                    <td className="p-3 border border-gray-200">{metal}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>Asphalt Shingles: The Pennsylvania Standard</h2>
          <p>
            <strong>Cost installed:</strong> $4-$7 per square foot for architectural (dimensional)
            shingles. A typical 2,000 sq ft Central PA home runs <strong>$10,000-$18,000</strong>{" "}
            fully installed.
          </p>
          <p>
            <strong>Why PA homeowners choose asphalt:</strong> It&apos;s affordable upfront, installs
            fast, and handles Pennsylvania weather well. Architectural shingles - the thick,
            dimensional kind - are significantly better than old 3-tab strips and are what most
            reputable contractors recommend.
          </p>
          <p>
            <strong>PA climate fit:</strong> Architectural shingles hold up well against wind, rain,
            and occasional hail. In snow and ice - which Central PA gets plenty of - traditional
            shingles perform adequately when paired with proper ventilation and ice dam prevention.
          </p>

          <h2>Metal Roofing: The Long-Term Play</h2>
          <p>
            <strong>Cost installed:</strong> $8-$16 per square foot depending on panel type. A
            typical 2,000 sq ft home runs <strong>$20,000-$40,000</strong> fully installed.
          </p>
          <p>
            <strong>Why PA homeowners choose metal:</strong> Longevity and low maintenance. A
            properly installed metal roof in Central PA will likely outlast your mortgage. Standing
            seam metal panels expand and contract with temperature swings without cracking.
          </p>
          <p>
            <strong>PA climate fit:</strong> Metal handles snow and ice better than shingles. Smooth
            surfaces let snow and ice slide off rather than accumulating. In summer, reflective
            metal coatings reduce heat transfer and lower cooling costs.
          </p>

          <h2>Energy Efficiency in Pennsylvania</h2>
          <p>
            Metal roofs with reflective coatings can reduce cooling costs by 10-25% in summer. For
            Harrisburg-area homes with older AC systems, this adds up over time.
          </p>

          <h2>What Revive Recommends for Central PA</h2>
          <ul>
            <li>
              <strong>Budget-conscious, planning to move in 10-15 years:</strong> Architectural
              asphalt shingles. Best bang-for-buck and great resale value.
            </li>
            <li>
              <strong>Long-term ownership, want to do it once:</strong> Standing seam metal. Higher
              upfront cost, but no maintenance and likely the last roof you will ever buy.
            </li>
            <li>
              <strong>Storm/hail-prone area:</strong> Both materials perform well, but metal has a
              slight edge in hail and ice.
            </li>
          </ul>

          <div className="bg-[#1a202c] rounded-2xl p-6 my-8">
            <p className="text-amber-400 font-bold text-lg mb-2">
              Get a Free Side-by-Side Quote
            </p>
            <p className="text-gray-300 text-sm mb-4">
              Not sure which is right for your home? We will price out both options with no
              obligation. Most estimates are done within 24 hours of your call.
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Link href="/services/roof-replacement" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Roof Replacement</p>
              <p className="text-xs text-gray-500 mt-1">Asphalt and metal - certified installation</p>
            </Link>
            <Link href="/#contact-form" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Free Estimate</p>
              <p className="text-xs text-gray-500 mt-1">Get both options priced out</p>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
