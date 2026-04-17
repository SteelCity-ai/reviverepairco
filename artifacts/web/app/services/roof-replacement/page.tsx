import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roof Replacement | New Roof Installation | Revive Roof Repair",
  description:
    "Professional roof replacement in Central PA. Asphalt shingle, metal, flat roofs. Quality materials, expert installation. Free estimate. Call (717) 500-1434",
  keywords:
    "roof replacement, new roof, roof installation, asphalt shingle, metal roofing, flat roof, Harrisburg, Hershey, York, Lancaster, Central PA",
};

export default function RoofReplacement() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative bg-[#1a1a2e] py-20">
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1a2e] via-[#2d2d44] to-[#1a1a2e]" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-4">🏠</div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
            Roof Replacement
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-3xl mx-auto">
            Time for a new roof? We offer complete roof replacement using premium materials
            and expert installation. Protect your home for decades to come.
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
                Expert Roof Replacement You Can Trust
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Whether your roof is past its lifespan or storm-damaged beyond repair,
                we&apos;ll guide you through the replacement process from material selection
                to final inspection.
              </p>

              <div className="space-y-4 mb-8">
                {[
                  "Free detailed estimate and material consultation",
                  "Asphalt shingle, metal, flat roof, and more",
                  "Quality materials from trusted manufacturers",
                  "Expert installation by licensed professionals",
                  "Comprehensive warranties on workmanship",
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
                <h3 className="font-bold text-xl mb-2">🏆 Quality Materials</h3>
                <p className="mb-4">
                  We use shingles from GAF, Owens Corning, and other top manufacturers
                  with industry-leading warranties.
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
                Roofing Materials We Install
              </h3>
              <div className="space-y-4">
                {[
                  { title: "Asphalt Shingles", desc: "Most popular choice - affordable, durable, and available in many colors" },
                  { title: "Metal Roofing", desc: "Long-lasting (50+ years), energy efficient, excellent for low-slope roofs" },
                  { title: "Flat Roof Systems", desc: "EPDM, TPO, and modified bitumen for commercial and residential flat roofs" },
                  { title: "Composite Shingles", desc: "Premium look with extended durability and warranties up to 50 years" },
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
            Need a New Roof? Get Your Free Estimate!
          </h2>
          <p className="text-gray-600 mb-6">
            We&apos;ll inspect your roof, discuss your options, and provide a transparent,
            no-obligation quote.
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
