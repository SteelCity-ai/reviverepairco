import Image from "next/image";

const stats = [
  "24-hour inspection scheduling",
  "Emergency leak response across Central PA",
  "Licensed, insured, and workmanship-backed",
];

export default function HeroSection() {
  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-[var(--color-primary)] text-white">
      <Image
        src="/images/hero-roof.jpg"
        alt="Revive Roof Repair team on a residential roofing project in Central Pennsylvania"
        fill
        priority
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[linear-gradient(110deg,rgba(26,32,44,0.88)_10%,rgba(26,32,44,0.68)_42%,rgba(26,32,44,0.5)_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(214,158,46,0.22),transparent_38%)]" />

      <div className="relative mx-auto flex w-full max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="max-w-3xl animate-fade-in-up">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur-sm">
            <span className="h-2 w-2 rounded-full bg-[var(--color-amber)]" />
            Roofing repair, replacements, and storm recovery for Harrisburg & Central PA
          </div>

          <h1 className="max-w-2xl text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-7xl">
            Roofing that restores peace of mind after storms, leaks, and sudden damage.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/82 sm:text-xl">
            Revive Roof Repair helps homeowners across Harrisburg, Mechanicsburg, Hershey,
            Carlisle, and surrounding communities get fast inspections, honest scope-of-work,
            and dependable crews that show up ready to solve the problem.
          </p>

          <div className="mt-8 flex flex-col gap-4 sm:flex-row sm:flex-wrap">
            <a
              href="#contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-7 py-4 text-base font-semibold text-[var(--color-primary)] shadow-[0_18px_40px_rgba(214,158,46,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ebb13a]"
            >
              Get Your Free Inspection
            </a>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/18"
            >
              Call (717) 500-1434
            </a>
          </div>

          <div className="mt-10 grid gap-3 text-sm text-white/78 sm:grid-cols-3 sm:text-base">
            {stats.map((stat) => (
              <div
                key={stat}
                className="rounded-2xl border border-white/10 bg-white/8 px-4 py-4 backdrop-blur-sm"
              >
                <div className="mb-2 h-1.5 w-12 rounded-full bg-[var(--color-amber)]" />
                <p>{stat}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
