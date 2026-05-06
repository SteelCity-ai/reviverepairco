"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import type { Project } from "./galleryData";

type GallerySectionProps = {
  projects: Project[];
  id?: string;
  eyebrow?: string;
  heading?: string;
  subheading?: string;
  showPlaceholderNote?: boolean;
};

export default function GallerySection({
  projects,
  id = "recent-work",
  eyebrow = "Recent work",
  heading = "Real Central PA roofs, finished by the Revive crew.",
  subheading = "Swipe through recent projects — repairs, full replacements, commercial flat roofs, and storm response work across Harrisburg and the surrounding area.",
  showPlaceholderNote = false,
}: GallerySectionProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const slideWidth = track.scrollWidth / projects.length;
        const idx = Math.round(track.scrollLeft / slideWidth);
        setActiveIndex(Math.max(0, Math.min(projects.length - 1, idx)));
      });
    };
    track.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      track.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, [projects.length]);

  const scrollToIndex = useCallback(
    (index: number) => {
      const track = trackRef.current;
      if (!track) return;
      const clamped = Math.max(0, Math.min(projects.length - 1, index));
      const slideWidth = track.scrollWidth / projects.length;
      track.scrollTo({ left: clamped * slideWidth, behavior: "smooth" });
    },
    [projects.length],
  );

  const handlePrev = () => scrollToIndex(activeIndex - 1);
  const handleNext = () => scrollToIndex(activeIndex + 1);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowRight")
        setLightboxIndex((i) => (i === null ? null : (i + 1) % projects.length));
      if (e.key === "ArrowLeft")
        setLightboxIndex((i) =>
          i === null ? null : (i - 1 + projects.length) % projects.length,
        );
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightboxIndex, projects.length]);

  return (
    <section id={id} className="scroll-mt-24 bg-[var(--color-cream,#f7f5f1)] py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[var(--color-amber)]">
              {eyebrow}
            </p>
            <h2 className="mt-4 text-3xl font-bold tracking-tight text-[var(--color-primary)] sm:text-4xl">
              {heading}
            </h2>
            <p className="mt-4 text-lg leading-8 text-[var(--color-slate)]">{subheading}</p>
            {showPlaceholderNote && (
              <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-[var(--color-amber)]/40 bg-[var(--color-amber)]/10 px-3 py-1.5 text-xs font-semibold text-[var(--color-primary)]">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-amber)]" />
                Sample images shown — real project photos coming soon
              </p>
            )}
          </div>

          <div className="hidden gap-2 sm:flex">
            <button
              type="button"
              onClick={handlePrev}
              disabled={activeIndex === 0}
              aria-label="Previous project"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-[var(--color-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              onClick={handleNext}
              disabled={activeIndex === projects.length - 1}
              aria-label="Next project"
              className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-slate-300 bg-white text-[var(--color-primary)] shadow-sm transition hover:-translate-y-0.5 hover:border-[var(--color-amber)] hover:text-[var(--color-amber)] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
            >
              <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
                <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
        </div>

        <div
          ref={trackRef}
          className="mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Project gallery"
        >
          {projects.map((project, index) => (
            <button
              key={project.src}
              type="button"
              onClick={() => setLightboxIndex(index)}
              className="group relative aspect-[4/5] w-[78%] flex-none snap-center overflow-hidden rounded-[28px] bg-slate-200 shadow-[0_22px_60px_rgba(15,23,42,0.10)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_26px_70px_rgba(15,23,42,0.16)] sm:aspect-[3/4] sm:w-[46%] lg:w-[32%]"
              aria-label={`Open project ${index + 1} of ${projects.length}: ${project.caption}`}
            >
              <Image
                src={project.src}
                alt={project.alt}
                fill
                sizes="(min-width: 1024px) 32vw, (min-width: 640px) 46vw, 78vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent_55%,rgba(15,23,42,0.78))]" />
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-left">
                <p className="text-base font-semibold text-white sm:text-lg">
                  {project.caption}
                </p>
                <span className="inline-flex h-9 w-9 flex-none items-center justify-center rounded-full bg-white/90 text-[var(--color-primary)] opacity-0 transition group-hover:opacity-100">
                  <svg viewBox="0 0 24 24" fill="none" className="h-4 w-4">
                    <path d="M15 3h6v6M14 10l7-7M9 21H3v-6M10 14l-7 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-2">
          {projects.map((project, index) => (
            <button
              key={project.src}
              type="button"
              onClick={() => scrollToIndex(index)}
              aria-label={`Go to project ${index + 1}`}
              aria-current={index === activeIndex ? "true" : undefined}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === activeIndex
                  ? "w-8 bg-[var(--color-amber)]"
                  : "w-2 bg-slate-300 hover:bg-slate-400"
              }`}
            />
          ))}
        </div>
      </div>

      {lightboxIndex !== null && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 sm:p-8"
          role="dialog"
          aria-modal="true"
          aria-label="Project image"
          onClick={() => setLightboxIndex(null)}
        >
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(null);
            }}
            aria-label="Close"
            className="absolute right-4 top-4 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(
                (i) => (i === null ? null : (i - 1 + projects.length) % projects.length),
              );
            }}
            aria-label="Previous"
            className="absolute left-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:left-6"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex((i) => (i === null ? null : (i + 1) % projects.length));
            }}
            aria-label="Next"
            className="absolute right-3 top-1/2 inline-flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur-sm transition hover:bg-white/25 sm:right-6"
          >
            <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
              <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>

          <div
            className="relative h-[80vh] w-full max-w-5xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={projects[lightboxIndex].src}
              alt={projects[lightboxIndex].alt}
              fill
              sizes="(min-width: 1024px) 80vw, 100vw"
              className="object-contain"
              priority
            />
            <p className="absolute bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-black/55 px-4 py-2 text-sm text-white backdrop-blur-sm">
              {projects[lightboxIndex].caption} · {lightboxIndex + 1} / {projects.length}
            </p>
          </div>
        </div>
      )}
    </section>
  );
}
