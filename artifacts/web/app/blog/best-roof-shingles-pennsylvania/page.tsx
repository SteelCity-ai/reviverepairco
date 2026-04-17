import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title:
    "Best Roof Shingles for Pennsylvania Weather | GAF vs CertainTeed vs Owens Corning",
  description:
    "Which shingle brands perform best in Pennsylvania weather? Honest comparison of GAF, CertainTeed, and Owens Corning - from a Central PA roofing contractor.",
  keywords:
    "best roof shingles Pennsylvania weather, GAF vs CertainTeed vs Owens Corning shingles, Pennsylvania roofing materials, GAF Timberline PA climate",
  openGraph: {
    title: "Best Roof Shingles for Pennsylvania Weather",
    description:
      "Honest comparison of GAF, CertainTeed, and Owens Corning shingles for Central PA homes.",
    images: ["/images/blog/shingle-brands-pa.jpg"],
  },
};

export default function BestShinglesPA() {
  return (
    <>
      {/* Hero */}
      <div className="relative h-[55vh] min-h-[400px] flex items-end">
        <Image
          src="/images/blog/shingle-brands-pa.jpg"
          alt="Professional roofer comparing premium shingle brands for a Pennsylvania home"
          fill
          priority
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
          <span className="inline-block bg-amber-500 text-[#1a202c] text-xs font-bold px-3 py-1 rounded-full mb-4">
            Product Guide
          </span>
          <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4">
            GAF vs CertainTeed vs Owens Corning: Best Shingles for PA Weather
          </h1>
          <p className="text-gray-200 text-sm">
            Written by Revive Roof Repair - 7 min read - Central Pennsylvania
          </p>
        </div>
      </div>

      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="prose prose-lg max-w-none">
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            If you&apos;re replacing your roof in Central Pennsylvania, you&apos;ve probably noticed that
            GAF, CertainTeed, and Owens Corning dominate the market. All three make excellent
            products - but they each have different strengths. Here&apos;s our honest breakdown as
            contractors who install all three.
          </p>

          {/* Comparison table */}
          <div className="overflow-x-auto my-8">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-gray-50">
                  <th className="text-left p-3 border border-gray-200 font-bold">Feature</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">GAF</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">CertainTeed</th>
                  <th className="text-left p-3 border border-gray-200 font-bold">Owens Corning</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Top Product Line", "Timberline HDZ", "Landmark PRO", "Duration Designer"],
                  ["Wind Rating", "130 mph (certified install)", "110-130 mph", "130 mph"],
                  ["Algae Warranty", "25 yr StainGuard PLUS", "30 yr StreakFighter", "10-15 yr (varies)"],
                  ["Best For PA", "Wind and storm resistance", "Overall durability and looks", "Value and color options"],
                  ["Certified Installer Required", "Yes (for full warranty)", "No", "No"],
                  ["Price Tier", "Mid-High", "Mid-High", "Mid"],
                ].map(([feature, gaf, certainteed, owens]) => (
                  <tr key={feature} className="even:bg-gray-50">
                    <td className="p-3 border border-gray-200 font-semibold">{feature}</td>
                    <td className="p-3 border border-gray-200">{gaf}</td>
                    <td className="p-3 border border-gray-200">{certainteed}</td>
                    <td className="p-3 border border-gray-200">{owens}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <h2>GAF Timberline HDZ - Best for Storm-Prone PA</h2>
          <p>
            <strong>What it is:</strong> GAF&apos;s flagship architectural shingle line. The Timberline
            HDZ offers excellent wind resistance (up to 130 mph when installed by a GAF Certified
            Contractor), strong algae resistance, and a wide range of colors.
          </p>
          <p>
            <strong>PA climate fit:</strong> Central PA gets high winds, hail, ice, and snow.
            Timberline HDZ handles all of it. GAF&apos;s StainGuard PLUS algae protection is
            especially valuable here - those dark streaks on roofs in Harrisburg are algae, and
            StainGuard holds up better than most competitors.
          </p>
          <p>
            <strong>Why certification matters:</strong> GAF&apos;s industry-best warranty (up to 50
            years on the shingles plus 25 years on workmanship) requires installation by a GAF
            Certified Contractor. We are one.
          </p>

          <h2>CertainTeed Landmark PRO - Best Overall Durability</h2>
          <p>
            <strong>What it is:</strong> Landmark PRO is CertainTeed&apos;s premium architectural
            shingle, offering 30-year StreakFighter algae resistance (the best in the industry) and
            excellent dimensional stability.
          </p>
          <p>
            <strong>PA climate fit:</strong> CertainTeed&apos;s algae protection is the best in class -
            important in humid Central PA summers. The heavier weight of Landmark PRO means it
            handles thermal expansion and contraction better over Pennsylvania&apos;s freeze-thaw
            cycles.
          </p>

          <h2>Owens Corning Duration Designer - Best Color Options</h2>
          <p>
            <strong>What it is:</strong> Owens Corning&apos;s Duration line is known for excellent
            color options and their proprietary SureNail technology - a woven fabric strip in the
            nailing zone that makes installation more consistent and holds nails better in high
            winds.
          </p>
          <p>
            <strong>PA climate fit:</strong> Duration shingles perform well in Pennsylvania weather
            and SureNail technology is genuinely useful for preventing blow-offs during our
            windstorms.
          </p>

          <h2>What Revive Installs and Why</h2>
          <ul>
            <li>
              <strong>Storm-prone areas (York, Lancaster, Gettysburg):</strong> GAF Timberline HDZ
              - best wind and algae warranty for the price
            </li>
            <li>
              <strong>Historic or high-end homes (Hershey, Carlisle):</strong> CertainTeed Landmark
              PRO - best aesthetics and color options
            </li>
            <li>
              <strong>Budget-conscious homeowners:</strong> Owens Corning Duration - best value with
              SureNail technology
            </li>
          </ul>

          <div className="bg-[#1a202c] rounded-2xl p-6 my-8">
            <p className="text-amber-400 font-bold text-lg mb-2">
              Not Sure Which Shingle Is Right for Your Home?
            </p>
            <p className="text-gray-300 text-sm mb-4">
              We will walk you through all three options with actual material samples. Free
              estimate, no pressure.
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
              <p className="text-xs text-gray-500 mt-1">GAF, CertainTeed, and Owens Corning certified</p>
            </Link>
            <Link href="/#contact-form" className="bg-gray-50 hover:bg-gray-100 rounded-xl p-4 text-center transition-colors">
              <p className="font-semibold text-[#1a202c]">Free Estimate</p>
              <p className="text-xs text-gray-500 mt-1">Get all three shingle options priced out</p>
            </Link>
          </div>
        </div>
      </article>
    </>
  );
}
