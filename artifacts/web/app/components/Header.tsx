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
        isScrolled ? "bg-white/95 shadow-[0_15px_40px_rgba(15,23,42,0.08)] backdrop-blur-md" : "bg-[var(--color-primary)]/75 backdrop-blur-sm"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <a href="#top" className="flex items-center gap-3">
          <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-white/10 p-2">
            <Image src="/images/logo-color-primary.png" alt="Revive Roof Repair logo" fill className="object-contain p-2" />
          </div>
          <div>
            <p className={`text-base font-bold ${isScrolled ? "text-[var(--color-primary)]" : "text-white"}`}>
              Revive Roof Repair
            </p>
            <p className={`text-xs ${isScrolled ? "text-[var(--color-slate)]" : "text-white/70"}`}>
              Harrisburg & Central PA Roofing
            </p>
          </div>
        </a>

        <div className="flex items-center gap-3 sm:gap-4">
          <a
            href="tel:+17175001434"
            className={`hidden text-sm font-semibold sm:inline-flex ${isScrolled ? "text-[var(--color-primary)]" : "text-white"}`}
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
