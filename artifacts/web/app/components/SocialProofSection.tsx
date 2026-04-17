const testimonials = [
  {
    quote:
      "Revive got to us quickly after a storm, documented everything clearly, and made the whole repair process feel manageable.",
    name: "Mechanicsburg homeowner",
  },
  {
    quote:
      "They explained what was urgent, what could wait, and gave us confidence we were making the right decision for our roof.",
    name: "Harrisburg customer",
  },
  {
    quote:
      "Professional crew, fast cleanup, and strong communication from inspection through completion.",
    name: "Camp Hill homeowner",
  },
];

const proof = [
  { label: "Google-ready trust positioning", value: "5-star experience" },
  { label: "Emergency response", value: "Central PA coverage" },
  { label: "Estimate flow", value: "Fast call-back promise" },
];

export default function SocialProofSection() {
  return (
    <section className="bg-[var(--color-primary)] py-20 text-white sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Trust & proof
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl">
            Stronger social proof, stronger urgency, and clearer reasons to choose Revive.
          </h2>
          <p className="mt-4 max-w-2xl text-lg leading-8 text-white/74">
            Phase 2 positions Revive like a premium local contractor with visible credibility, responsive communication,
            and a straightforward next step for homeowners who need help now.
          </p>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {proof.map((item) => (
              <div key={item.label} className="rounded-3xl border border-white/10 bg-white/6 p-5 backdrop-blur-sm">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="mt-2 text-sm text-white/65">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid gap-4">
          {testimonials.map((testimonial) => (
            <blockquote
              key={testimonial.name}
              className="rounded-[28px] border border-white/10 bg-white/7 p-6 shadow-[0_20px_50px_rgba(8,15,28,0.18)] backdrop-blur-sm"
            >
              <div className="mb-4 flex gap-1 text-[var(--color-amber)]">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={idx}>★</span>
                ))}
              </div>
              <p className="text-base leading-7 text-white/84">“{testimonial.quote}”</p>
              <footer className="mt-5 text-sm font-semibold text-white/68">— {testimonial.name}</footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
