import type { Metadata } from "next";
import Link from "next/link";
import ContactSection from "../components/ContactSection";
import GallerySection from "../components/GallerySection";
import GCHeroSection from "../components/GCHeroSection";
import GCProcessSection from "../components/GCProcessSection";
import GCServicesSection from "../components/GCServicesSection";
import SocialProofSection from "../components/SocialProofSection";
import TrustBadges from "../components/TrustBadges";
import { gcProjects } from "../components/galleryData";
import { brandConfig, getBrand } from "../../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: { absolute: `${config.name} | Central PA General Contractor` },
    description:
      "Full-service general contracting across Central Pennsylvania — additions, garages, renovations, demolition, and roofing. Licensed, insured, locally owned.",
    alternates: { canonical: `https://${config.domain}/general-contracting` },
    openGraph: { url: `https://${config.domain}/general-contracting` },
  };
}

export default async function GeneralContractingPage() {
  const brand = await getBrand();
  const config = brandConfig(brand);
  const baseUrl = `https://${config.domain}`;
  const pageUrl = `${baseUrl}/general-contracting`;

  const serviceSchema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "General Contracting",
    serviceType: "General Contracting",
    description:
      "Full-service general contracting across Central Pennsylvania — additions, low voltage and data cabling, renovations, and demolition. Licensed, insured, and locally owned.",
    url: pageUrl,
    areaServed: {
      "@type": "AdministrativeArea",
      name: "Central Pennsylvania",
    },
    provider: { "@id": `${baseUrl}/#business` },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "General Contracting Services",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Home Additions & Room Expansions",
            url: `${baseUrl}/general-contracting/additions`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Low Voltage & Data Cabling",
            url: `${baseUrl}/general-contracting/low-voltage-data`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Home Renovations & Remodels",
            url: `${baseUrl}/general-contracting/renovations`,
          },
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Demolition & Site Prep",
            url: `${baseUrl}/general-contracting/demolition`,
          },
        },
      ],
    },
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${baseUrl}/` },
      {
        "@type": "ListItem",
        position: 2,
        name: "General Contracting",
        item: pageUrl,
      },
    ],
  };

  return (
    <div id="top" className="flex flex-col bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([serviceSchema, breadcrumbSchema]),
        }}
      />
      <GCHeroSection />
      <div className="bg-white px-4 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>
      <GCServicesSection />
      <GCProcessSection />
      <GallerySection
        projects={gcProjects}
        eyebrow="Recent work"
        heading="Sample builds, additions, and renovations."
        subheading="A look at the kind of work Revive crews deliver across Central PA. New project photos are added as builds wrap up."
        showPlaceholderNote
      />

      <section className="bg-white py-16 sm:py-20">
        <div className="mx-auto max-w-5xl rounded-[32px] border border-slate-200 bg-[var(--color-surface)] px-6 py-12 text-center shadow-[0_18px_60px_rgba(15,23,42,0.06)] sm:px-10">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Also need a roof?
          </p>
          <h2 className="mt-4 text-3xl font-bold text-[var(--color-primary)] sm:text-4xl">
            The same crews handle the roof, too.
          </h2>
          <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">
            Revive started in roofing. If your project needs roof repair,
            replacement, or storm-damage recovery, our roofing arm is one click
            away.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/roofing"
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[var(--color-primary)]/90"
            >
              See our roofing services
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary)]/15 bg-white px-6 py-3 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-white/70"
            >
              Request an estimate
            </Link>
          </div>
        </div>
      </section>

      <SocialProofSection />
      <ContactSection />
    </div>
  );
}
