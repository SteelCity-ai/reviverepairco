"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const stats = [
  "24-hour inspection scheduling",
  "Emergency leak response across Central PA",
  "Licensed, insured, and workmanship-backed",
];

const heroImages = [
  {
    src: "/images/hero/hero-1-sunset.jpg",
    alt: "Revive Roof Repair crew working on a residential roof at sunset in Central Pennsylvania",
  },
  {
    src: "/images/hero/hero-2-roofer.jpg",
    alt: "Professional roofer silhouetted against a sunset sky on a Pennsylvania home",
  },
  {
    src: "/images/hero/hero-3-skylight.jpg",
    alt: "Roofing technician installing a skylight during a roof replacement",
  },
  {
    src: "/images/hero/hero-4-install.jpg",
    alt: "Roofing crew installing new roofing material on a Central PA home",
  },
];

const ROTATION_MS = 5500;

export default function HeroSection() {
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => {
      setActiveIndex((i) => (i + 1) % heroImages.length);
    }, ROTATION_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="relative isolate flex min-h-[80vh] items-center overflow-hidden bg-[var(--color-primary)] text-white">
      {heroImages.map((image, index) => (
        <Image
          key={image.src}
          src={image.src}
          alt={image.alt}
          fill
          priority={index === 0}
          sizes="100vw"
          className={`object-cover transition-opacity duration-[1500ms] ease-in-out ${
            index === activeIndex ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}
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

      <div className="absolute bottom-6 left-1/2 z-10 flex -translate-x-1/2 gap-2">
        {heroImages.map((image, index) => (
          <button
            key={image.src}
            type="button"
            aria-label={`Show hero image ${index + 1}`}
            aria-current={index === activeIndex ? "true" : undefined}
            onClick={() => setActiveIndex(index)}
            className={`h-2 rounded-full transition-all duration-300 ${
              index === activeIndex ? "w-8 bg-[var(--color-amber)]" : "w-2 bg-white/40 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
