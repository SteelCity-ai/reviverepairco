import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Storm Damage Roof Repair | Insurance Claim Help | Revive Roof Repair",
  description:
    "Professional storm damage roof repair in Central PA. We work with your insurance company to simplify claims. Free inspection + claim assistance. Call (717) 500-1434",
  keywords:
    "storm damage roof repair, hail damage, wind damage, roof inspection, insurance claim, storm restoration, Harrisburg, Hershey, York, Lancaster",
};

export default function StormDamageRepair() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-[#1a1a2e] py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d2d44] to-[#1a1a2e]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🌪️</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Storm Damage Roof Repair
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Pennsylvania storms can cause serious roof damage. We specialize in complete
            storm restoration and work directly with your insurance company.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="tel:+17175001434"
              className="flex items-center gap-2 bg-[#e63946] hover:bg-[#c5303c] text-white font-bold py-4 px-8 rounded-lg transition-all text-lg"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              CALL NOW: (717) 500-1434
            </a>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                We Handle Storm Damage From Start to Finish
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                After a major storm, you need someone who understands the insurance process
                and can restore your roof to perfect condition. We&apos;ve helped hundreds of
                Central PA homeowners navigate storm damage claims.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Free comprehensive storm damage inspection",
                  "Detailed documentation for insurance claims",
                  "We meet with adjusters on your behalf",
                  "Complete restoration using quality materials",
                  "Work with all major insurance carriers",
                ].map((item, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-green-500 flex-shrink-0"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span className="text-gray-700">{item}</span>
                  </div>
                ))}
              </div>

              <div className="bg-[#1a1a2e] rounded-xl p-6 text-white">
                <h3 className="font-bold text-xl mb-2">📋 Insurance Claim Assistance</h3>
                <p className="mb-4">
                  We&apos;ll help you understand your coverage and work with your adjuster.
                </p>
                <a
                  href="tel:+17175001434"
                  className="inline-flex items-center gap-2 bg-[#e63946] text-white font-bold py-2 px-6 rounded-lg transition-all"
                >
                  Call (717) 500-1434
                </a>
              </div>
            </div>

            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-6">
                Types of Storm Damage We Repair
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Hail Damage", desc: "Dented shingles, damaged flashing, and bruising that shortens roof life" },
                  { title: "Wind Damage", desc: "Missing shingles, lifted edges, and exposed underlayment" },
                  { title: "Fallen Debris", desc: "Tree limbs and branches that puncture or crush roof sections" },
                  { title: "Flash Flooding", desc: "Water intrusion through compromised areas" },
                ].map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 border border-gray-100">
                    <h4 className="font-semibold text-gray-900">{item.title}</h4>
                    <p className="text-gray-600 text-sm">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-50 py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Had a Storm? Get a Free Inspection!
          </h2>
          <p className="text-gray-600 mb-6">
            Don&apos;t wait until small damage becomes a major problem. We&apos;ll assess the
            damage and help you with your claim.
          </p>
          <a
            href="tel:+17175001434"
            className="inline-flex items-center gap-2 bg-[#e63946] text-white font-bold py-3 px-8 rounded-lg transition-all text-lg"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            (717) 500-1434
          </a>
        </div>
      </section>
    </div>
  );
}
