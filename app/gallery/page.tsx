import type { Metadata } from "next";
import GalleryTabs from "../components/GalleryTabs";
import { brandConfig, getBrand } from "../../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: { absolute: `Gallery | ${config.name} | Roofing & General Contracting` },
    description:
      "Recent roofing, addition, renovation, and demolition projects from Revive crews across Harrisburg and Central Pennsylvania.",
    alternates: { canonical: `https://${config.domain}/gallery` },
    openGraph: { url: `https://${config.domain}/gallery` },
  };
}

export default function GalleryPage() {
  return (
    <div className="flex flex-col bg-white">
      <section className="bg-[var(--color-primary)] py-20 text-white sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
            Project gallery
          </p>
          <h1 className="mt-4 max-w-3xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
            Real Central PA projects, finished by Revive crews.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/80">
            Browse roofing work or general contracting builds. New projects are
            added regularly.
          </p>
        </div>
      </section>

      <GalleryTabs />
    </div>
  );
}
