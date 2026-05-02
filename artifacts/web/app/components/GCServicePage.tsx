import Image from "next/image";
import Link from "next/link";
import ContactSection from "./ContactSection";
import GallerySection from "./GallerySection";
import TrustBadges from "./TrustBadges";
import type { Project } from "./galleryData";
import { brandConfig, getBrand, type Brand } from "../../lib/brand";

export type GCServicePageConfig = {
  hero: {
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imageAlt: string;
  };
  scope: {
    eyebrow: string;
    heading: string;
    intro: string;
    bullets: string[];
    sideTitle: string;
    sideItems: { title: string; desc: string }[];
  };
  process: {
    eyebrow: string;
    heading: string;
    description: string;
    steps: { number: string; title: string; body: string }[];
  };
  gallery: {
    eyebrow: string;
    heading: string;
    subheading: string;
    projects: Project[];
    showPlaceholderNote?: boolean;
  };
  faq: {
    eyebrow: string;
    heading: string;
    items: { q: string; a: string }[];
  };
  cta: {
    eyebrow: string;
    heading: string;
    body: string;
  };
  backLink?: {
    label: string;
    href: string;
  };
  seo?: {
    /** Path for this page, e.g. "/services/roof-replacement". */
    pagePath: string;
    /** Human-readable service name, e.g. "Roof Replacement". */
    serviceName: string;
    /**
     * Optional short description used for the Service JSON-LD `description` field.
     * Falls back to the hero description when omitted.
     */
    serviceDescription?: string;
    /** Optional override for the brand domain used in absolute URLs. */
    brandOverride?: Brand;
    /**
     * Breadcrumb trail. Should NOT include "Home" — that is prepended automatically.
     * The final entry is treated as the current page (no URL emitted).
     */
    breadcrumbs: { name: string; path?: string }[];
  };
};

const SERVICE_AREA_CITIES = [
  "Harrisburg",
  "Hershey",
  "Mechanicsburg",
  "York",
  "Lancaster",
  "Carlisle",
];

function buildServiceJsonLd(
  config: GCServicePageConfig,
  origin: string,
  brand: Brand,
) {
  const seo = config.seo!;
  const brandInfo = brandConfig(brand);
  const providerType =
    brand === "repair-co" ? "GeneralContractor" : "RoofingContractor";
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: seo.serviceName,
    serviceType: seo.serviceName,
    description: seo.serviceDescription ?? config.hero.description,
    url: `${origin}${seo.pagePath}`,
    image: `${origin}${config.hero.image}`,
    provider: {
      "@type": providerType,
      name: brandInfo.name,
      telephone: "+1-717-500-1434",
      url: `${origin}/`,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Harrisburg",
        addressRegion: "PA",
        addressCountry: "US",
      },
    },
    areaServed: SERVICE_AREA_CITIES.map((city) => ({
      "@type": "City",
      name: city,
      containedInPlace: {
        "@type": "AdministrativeArea",
        name: "Central Pennsylvania",
      },
    })),
  };
}

function buildFaqJsonLd(config: GCServicePageConfig) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: config.faq.items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };
}

function buildBreadcrumbJsonLd(config: GCServicePageConfig, origin: string) {
  const seo = config.seo!;
  const trail = [
    { name: "Home", path: "/" },
    ...seo.breadcrumbs.slice(0, -1),
    {
      name: seo.breadcrumbs[seo.breadcrumbs.length - 1].name,
      path: seo.pagePath,
    },
  ];
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((entry, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: entry.name,
      item: `${origin}${entry.path}`,
    })),
  };
}

export default async function GCServicePage({
  config,
}: {
  config: GCServicePageConfig;
}) {
  const backLink = config.backLink ?? {
    label: "← All general contracting",
    href: "/general-contracting",
  };

  let jsonLdScripts: React.ReactNode = null;
  if (config.seo) {
    const runtimeBrand = await getBrand();
    const brand = config.seo.brandOverride ?? runtimeBrand;
    const origin = `https://${brandConfig(brand).domain}`;
    const serviceLd = buildServiceJsonLd(config, origin, brand);
    const faqLd = buildFaqJsonLd(config);
    const breadcrumbLd = buildBreadcrumbJsonLd(config, origin);
    jsonLdScripts = (
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
      </>
    );
  }

  return (
    <div className="flex flex-col bg-white">
      {jsonLdScripts}
      {/* Hero */}
      <section className="relative isolate overflow-hidden bg-[var(--color-primary)] text-white">
        <Image
          src={config.hero.image}
          alt={config.hero.imageAlt}
          fill
          priority
          sizes="100vw"
          className="absolute inset-0 -z-10 object-cover opacity-45"
        />
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(110deg,rgba(26,32,44,0.85)_10%,rgba(26,32,44,0.6)_55%,rgba(26,32,44,0.4)_100%)]" />
        <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 sm:py-28 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            {config.hero.eyebrow}
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl lg:text-6xl">
            {config.hero.title}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/85 sm:text-xl">
            {config.hero.description}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-7 py-4 text-base font-semibold text-[var(--color-primary)] shadow-[0_18px_40px_rgba(214,158,46,0.32)] transition hover:-translate-y-0.5 hover:bg-[#ebb13a]"
            >
              Get Your Free Estimate
            </Link>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-white/30 bg-white/10 px-7 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/18"
            >
              Call (717) 500-1434
            </a>
            <Link
              href={backLink.href}
              className="inline-flex items-center justify-center rounded-full border border-white/20 bg-transparent px-6 py-4 text-base font-semibold text-white/85 transition hover:bg-white/10 hover:text-white"
            >
              {backLink.label}
            </Link>
          </div>
        </div>
      </section>

      <div className="bg-white px-4 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>

      {/* Scope details */}
      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              {config.scope.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
              {config.scope.heading}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
              {config.scope.intro}
            </p>
            <ul className="mt-8 space-y-3">
              {config.scope.bullets.map((bullet) => (
                <li key={bullet} className="flex items-start gap-3 text-[var(--color-slate)]">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="mt-1 h-5 w-5 flex-none text-[var(--color-amber)]"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-base leading-7">{bullet}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[28px] border border-slate-200 bg-[var(--color-surface)] p-8 shadow-[0_18px_50px_rgba(15,23,42,0.06)] sm:p-10">
            <h3 className="text-2xl font-bold text-[var(--color-primary)]">
              {config.scope.sideTitle}
            </h3>
            <div className="mt-6 space-y-4">
              {config.scope.sideItems.map((item) => (
                <div
                  key={item.title}
                  className="rounded-2xl border border-slate-200 bg-white p-5"
                >
                  <h4 className="font-semibold text-[var(--color-primary)]">
                    {item.title}
                  </h4>
                  <p className="mt-2 text-sm leading-6 text-[var(--color-slate)]">
                    {item.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Process recap */}
      <section className="bg-[var(--color-surface)] py-20 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              {config.process.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
              {config.process.heading}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
              {config.process.description}
            </p>
          </div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {config.process.steps.map((step) => (
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

      {/* Gallery */}
      <GallerySection
        projects={config.gallery.projects}
        eyebrow={config.gallery.eyebrow}
        heading={config.gallery.heading}
        subheading={config.gallery.subheading}
        showPlaceholderNote={config.gallery.showPlaceholderNote ?? false}
      />

      {/* FAQ */}
      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              {config.faq.eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
              {config.faq.heading}
            </h2>
          </div>
          <div className="mt-12 space-y-4">
            {config.faq.items.map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-slate-200 bg-[var(--color-surface)] p-6 shadow-[0_10px_30px_rgba(15,23,42,0.04)] open:bg-white open:shadow-[0_18px_50px_rgba(15,23,42,0.08)]"
              >
                <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-lg font-semibold text-[var(--color-primary)]">
                  <span>{item.q}</span>
                  <span
                    aria-hidden="true"
                    className="mt-1 inline-flex h-6 w-6 flex-none items-center justify-center rounded-full bg-[var(--color-amber)]/15 text-[var(--color-amber)] transition group-open:rotate-45"
                  >
                    <svg viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4">
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </span>
                </summary>
                <p className="mt-4 text-base leading-7 text-[var(--color-slate)]">
                  {item.a}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* CTA banner */}
      <section className="bg-white pb-16 sm:pb-20">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-[var(--color-surface)] px-6 py-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:mx-6 sm:px-10 lg:mx-auto">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            {config.cta.eyebrow}
          </p>
          <h2 className="mt-4 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
            {config.cta.heading}
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
            {config.cta.body}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
            >
              Request an estimate
            </Link>
            <a
              href="tel:+17175001434"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary)]/15 bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-white/70"
            >
              Call (717) 500-1434
            </a>
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
