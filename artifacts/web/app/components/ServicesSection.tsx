import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "Roof Replacement",
    description:
      "Full tear-offs, deck repair, and architectural shingle or standing-seam metal installs — built to outlast the manufacturer warranty.",
    image: "/images/services/replacement.jpg",
    accent: "Manufacturer-backed warranty",
    href: "/services/roof-replacement",
  },
  {
    title: "Roof Leak Repair",
    description:
      "We trace leaks back to the actual source — flashing, vent boots, valleys, or skylights — and rebuild the detail so the drip stops for good.",
    image: "/images/services/repair.jpg",
    accent: "Source-traced, sealed once",
    href: "/services/roof-leak-repair",
  },
  {
    title: "Storm Damage Repair",
    description:
      "Hail, wind, and tree-impact damage documented for your insurance carrier and rebuilt by one accountable Revive crew.",
    image: "/images/services/storm.jpg",
    accent: "Insurance-ready documentation",
    href: "/services/storm-damage-repair",
  },
  {
    title: "Emergency Roof Repair",
    description:
      "24/7 response for active leaks, fallen trees, and wind-stripped roofs — same-day tarping and a rebuild plan from the first visit.",
    image: "/images/gallery/04-tear-off.webp",
    accent: "24/7 rapid response",
    href: "/services/emergency-roof-repair",
  },
  {
    title: "Commercial Roofing",
    description:
      "TPO, EPDM, and modified bitumen repair, recoating, and replacement for warehouses, retail, and HOA properties — phased to your schedule.",
    image: "/images/gallery/10-flat-roof.webp",
    accent: "Flat-roof systems & coatings",
    href: "/services/commercial-roofing",
  },
  {
    title: "Tree Trimming & Removal",
    description:
      "Certified climbers handle hazard limbs, full removals, and storm-downed trees near your roof and home — cleaned up the same day, no ruts in the yard.",
    image: "/images/services/tree-trimming.png",
    accent: "Roof-safe & fully insured",
    href: "/services/tree-trimming-removal",
  },
];

export default function ServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Our roofing services
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            Five focused roofing services for Harrisburg and Central PA homeowners.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
            From a single failed flashing to a full commercial flat-roof recoat, every job is run by
            one accountable Revive crew — diagnosed, documented, and built to last.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {services.map((service) => (
            <article
              key={service.title}
              className="group flex flex-col overflow-hidden rounded-[30px] border border-slate-200 bg-white shadow-[0_22px_60px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.12)]"
            >
              <div className="relative h-60 overflow-hidden">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(26,32,44,0.72))]" />
                <div className="absolute bottom-5 left-5 inline-flex rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                  {service.accent}
                </div>
              </div>
              <div className="flex flex-1 flex-col p-7">
                <h3 className="text-2xl font-bold text-[var(--color-primary)]">{service.title}</h3>
                <p className="mt-4 text-base leading-7 text-[var(--color-slate)]">
                  {service.description}
                </p>
                <div className="mt-auto flex items-center justify-between pt-6 text-sm font-semibold text-[var(--color-primary)]">
                  <Link
                    href="#contact"
                    className="transition hover:text-[var(--color-amber)]"
                  >
                    Free inspection available
                  </Link>
                  <Link
                    href={service.href}
                    className="text-[var(--color-amber)] transition hover:text-[#c98f17]"
                  >
                    Learn more →
                  </Link>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
