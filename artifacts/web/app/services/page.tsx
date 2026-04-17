import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Services | Revive Repair Specialists | Central PA Contractor",
  description:
    "Roofing, general contracting, renovations, and demolition across Harrisburg and Central PA. Licensed, insured, and locally owned. Request a free estimate.",
};

type Service = {
  slug: string;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  image: string;
  href?: string;
};

const services: Service[] = [
  {
    slug: "roofing",
    title: "Roofing",
    tagline: "Repairs, replacements, and storm recovery",
    description:
      "From a single leak to a full tear-off and replacement, our roofing crews work fast, document everything, and stand behind the work. Storm damage assessments and emergency tarping available.",
    bullets: [
      "Roof repairs & leak fixes",
      "Full roof replacements & tear-offs",
      "Storm & hail damage recovery",
      "Insurance documentation support",
      "Commercial flat & low-slope roofing",
    ],
    image: "/images/services/roofing-hero.png",
    href: "/services/roof-leak-repair",
  },
  {
    slug: "general-contracting",
    title: "General Contracting",
    tagline: "Additions, builds, and full project management",
    description:
      "One licensed point of contact for the whole job. We coordinate trades, permits, and timelines so your build runs on schedule and on budget — additions, garages, decks, and full structural work.",
    bullets: [
      "Home additions & second stories",
      "Detached garages & outbuildings",
      "Decks, porches, and pergolas",
      "Structural repairs & framing",
      "Permitting & subcontractor management",
    ],
    image: "/images/services/general-contracting.png",
  },
  {
    slug: "renovation",
    title: "Renovation",
    tagline: "Kitchens, baths, and whole-home remodels",
    description:
      "Modern, functional spaces built around how you actually live. We handle design coordination, demo, build-out, finishes, and the punch list — all under one accountable team.",
    bullets: [
      "Kitchen remodels",
      "Bathroom remodels",
      "Basement finishing",
      "Whole-home interior renovations",
      "Trim, flooring, and finish carpentry",
    ],
    image: "/images/services/renovation.png",
  },
  {
    slug: "demolition",
    title: "Demolition",
    tagline: "Selective, structural, and site cleanup",
    description:
      "Controlled demolition done safely and cleanly. We take down what needs to go, salvage what makes sense, and leave the site ready for the next phase of work.",
    bullets: [
      "Interior selective demolition",
      "Garage & outbuilding teardowns",
      "Deck & porch removal",
      "Debris hauling & site cleanup",
      "Coordination with rebuild crews",
    ],
    image: "/images/services/demolition.png",
  },
];

export default function ServicesPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="bg-[var(--color-primary)] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Our services
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            One trusted team for the work your home actually needs.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Roofing, general contracting, renovations, and demolition — all handled by
            licensed, insured, locally owned Revive crews across Central Pennsylvania.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a]"
            >
              Request a free estimate
            </Link>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              (717) 500-1434
            </a>
          </div>
        </div>
      </section>

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto flex max-w-7xl flex-col gap-12 px-4 sm:px-6 lg:px-8">
          {services.map((service, index) => {
            const reversed = index % 2 === 1;
            return (
              <article
                key={service.slug}
                id={service.slug}
                className="scroll-mt-24 grid items-center gap-8 lg:grid-cols-2 lg:gap-12"
              >
                <div
                  className={`relative aspect-[16/10] overflow-hidden rounded-3xl shadow-[0_25px_60px_rgba(15,23,42,0.12)] ${
                    reversed ? "lg:order-2" : ""
                  }`}
                >
                  <Image
                    src={service.image}
                    alt={`${service.title} project`}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    className="object-cover"
                  />
                </div>
                <div className={reversed ? "lg:order-1" : ""}>
                  <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
                    {service.tagline}
                  </p>
                  <h2 className="mt-3 text-3xl font-bold sm:text-4xl">{service.title}</h2>
                  <p className="mt-4 text-base leading-relaxed text-[var(--color-slate)]">
                    {service.description}
                  </p>
                  <ul className="mt-6 space-y-3">
                    {service.bullets.map((bullet) => (
                      <li
                        key={bullet}
                        className="flex items-start gap-3 text-base text-[var(--color-primary)]"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[var(--color-amber)]"
                        />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href="/contact"
                      className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
                    >
                      Get a free estimate
                    </Link>
                    {service.href && (
                      <Link
                        href={service.href}
                        className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary)]/15 px-5 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[var(--color-surface)]"
                      >
                        Learn more
                      </Link>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="bg-[var(--color-primary)] py-16 text-white sm:py-20">
        <div className="mx-auto flex max-w-5xl flex-col items-center gap-6 px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold sm:text-4xl">
            Not sure which service you need?
          </h2>
          <p className="max-w-2xl text-lg text-white/75">
            Tell us what you&apos;re seeing and we&apos;ll point you in the right direction
            — even if it&apos;s a referral. No pressure, no obligation.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a]"
            >
              Contact us
            </Link>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Call (717) 500-1434
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
