const steps = [
  {
    number: "01",
    title: "Free on-site walk-through",
    body:
      "We meet at the property, listen to what you're trying to accomplish, and look at what the build actually requires.",
  },
  {
    number: "02",
    title: "Clear scope & honest estimate",
    body:
      "You get a written scope of work and a real number — not a brochure. We flag trade-offs early so the budget makes sense.",
  },
  {
    number: "03",
    title: "Permits, trades & schedule",
    body:
      "Revive coordinates the permits, subcontractors, materials, and timeline so you have one phone number for the whole job.",
  },
  {
    number: "04",
    title: "Build, finish, and walk-through",
    body:
      "Daily progress, clean job site, and a punch-list walk-through before we hand you the keys to the new space.",
  },
];

export default function GCProcessSection() {
  return (
    <section id="how-we-work" className="scroll-mt-24 bg-[var(--color-surface)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            How we work
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            A straightforward process built around honest communication.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
            No mystery pricing, no disappearing crews. Every project moves
            through the same four stages so you always know what comes next.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="rounded-3xl border border-slate-200 bg-white p-7 shadow-[0_18px_50px_rgba(15,23,42,0.06)]"
            >
              <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
                Step {step.number}
              </p>
              <h3 className="mt-4 text-xl font-bold text-[var(--color-primary)]">
                {step.title}
              </h3>
              <p className="mt-3 text-base leading-7 text-[var(--color-slate)]">
                {step.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
