"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-white/95 shadow-[0_15px_40px_rgba(15,23,42,0.08)] backdrop-blur-md"
          : "bg-[var(--color-primary)]/75 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#top"
          aria-label="Revive Repair Specialists — home"
          className={`flex items-center rounded-2xl px-3 py-2 transition ${
            isScrolled ? "bg-transparent" : "bg-white/95 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
          }`}
        >
          <Image
            src="/images/revive-logo-v2.png"
            alt="Revive Repair Specialists"
            width={480}
            height={340}
            priority
            className="h-16 w-auto sm:h-20 lg:h-24"
          />
          <span className="sr-only">
            Revive Repair Specialists — Harrisburg &amp; Central PA Roofing
          </span>
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="tel:+17175001434"
            className={`hidden text-sm font-semibold sm:inline-flex ${
              isScrolled ? "text-[var(--color-primary)]" : "text-white"
            }`}
          >
            (717) 500-1434
          </a>
          <a
            href="#contact"
            className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a] sm:px-5"
          >
            Free Inspection
          </a>
        </div>
      </div>
    </header>
  );
}
