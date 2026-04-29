import Image from "next/image";
import Link from "next/link";

const services = [
  {
    title: "Additions",
    description:
      "Second stories, room additions, sun rooms, and full structural expansions designed to look like they were always part of the home.",
    image: "/images/gc-hero/gc-hero-1-addition.png",
    accent: "Permits & framing handled",
    href: "/services#general-contracting",
  },
  {
    title: "Renovations",
    description:
      "Kitchens, baths, basements, and whole-home interiors — design coordination, demo, build-out, and finishes from one accountable crew.",
    image: "/images/gc-hero/gc-hero-3-kitchen.png",
    accent: "Design through finish",
    href: "/services#renovation",
  },
  {
    title: "Garages & Outbuildings",
    description:
      "Detached garages, workshops, and pole barns built to match your home and stand up to Central PA winters.",
    image: "/images/gallery-gc/gc-01-garage.png",
    accent: "Match-to-home craftsmanship",
    href: "/services#general-contracting",
  },
  {
    title: "Demolition & Site Prep",
    description:
      "Selective interior tear-outs, garage demolition, and site cleanup that leaves the project ready for the next phase.",
    image: "/images/gallery-gc/gc-05-demolition.png",
    accent: "Safe, clean, coordinated",
    href: "/services#demolition",
  },
];

export default function GCServicesSection() {
  return (
    <section id="services" className="scroll-mt-24 bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            What we build
          </p>
          <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
            Full-service general contracting for Central Pennsylvania homes.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
            One licensed team handling additions, renovations, outbuildings, and
            demolition — plus the roofing crews you already know.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2">
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
                  sizes="(min-width: 640px) 50vw, 100vw"
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,rgba(26,32,44,0.72))]" />
                <div className="absolute bottom-5 left-5 inline-flex rounded-full bg-white/92 px-4 py-2 text-sm font-semibold text-[var(--color-primary)]">
                  {service.accent}
                </div>
              </div>
              <div className="p-7">
                <h3 className="text-2xl font-bold text-[var(--color-primary)]">
                  {service.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-[var(--color-slate)]">
                  {service.description}
                </p>
                <div className="mt-6 flex items-center justify-between text-sm font-semibold text-[var(--color-primary)]">
                  <Link href="/contact" className="transition hover:text-[var(--color-amber)]">
                    Free estimate available
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
