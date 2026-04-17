import Image from "next/image";

const services = [
  {
    title: "Roof Repair",
    description:
      "Fast leak detection, shingle repairs, flashing fixes, and permanent solutions before interior damage spreads.",
    image: "/images/service-repair.jpg",
    accent: "Rapid response for active leaks",
  },
  {
    title: "Roof Replacement",
    description:
      "Full tear-offs and replacements designed for curb appeal, ventilation, and long-term weather resilience.",
    image: "/images/service-replacement.jpg",
    accent: "Premium shingles and clean installs",
  },
  {
    title: "Storm Damage Recovery",
    description:
      "Emergency tarping, damage documentation, and repair planning after hail, wind, or tree impact events.",
    image: "/images/service-storm.jpg",
    accent: "Insurance-ready documentation",
  },
];

export default function ServicesSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Core services
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            Built to convert the jobs Revive wants most in Harrisburg and Central PA.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
            Clear service positioning, stronger visuals, and high-intent calls to action help homeowners
            understand exactly how Revive can help — and why they should call now.
          </p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)]"
            >
              <div className="relative h-60 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(26,32,44,0.72))]" />
                <div className="absolute bottom-5 left-5 inline-flex rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                  {service.accent}
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-bold text-[var(--color-primary)]">{service.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--color-slate)]">{service.description}</p>
                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[var(--color-primary)]">
                  <span>Free inspection available</span>
                  <a href="#contact" className="text-[var(--color-amber)] transition hover:text-[#c98f17]">
                    Request estimate →
                  </a>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
