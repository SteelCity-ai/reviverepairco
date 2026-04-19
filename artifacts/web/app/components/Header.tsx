"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/about", label: "About" },
  { href: "/services", label: "Services" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
  { href: "/login", label: "Client Login" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [menuOpen]);

  const linkColor = isScrolled
    ? "text-[var(--color-primary)] hover:text-[var(--color-amber)]"
    : "text-white hover:text-[var(--color-amber)]";

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
          href="/#top"
          aria-label="Revive Repair Specialists — home"
          className="flex items-center"
        >
          <Image
            src="/images/revive-logo-v3.png"
            alt="Revive Repair Specialists"
            width={480}
            height={340}
            priority
            className={`h-16 w-auto transition sm:h-20 lg:h-24 ${
              isScrolled ? "" : "brightness-0 invert"
            }`}
          />
          <span className="sr-only">
            Revive Repair Specialists — Harrisburg &amp; Central PA Roofing
          </span>
        </a>

        <nav aria-label="Primary" className="hidden lg:block">
          <ul className="flex items-center gap-7">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className={`text-base font-semibold transition ${linkColor}`}
                >
                  {link.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <a
            href="tel:+17175001434"
            className={`hidden text-sm font-semibold sm:inline-flex ${
              isScrolled ? "text-[var(--color-primary)]" : "text-white"
            }`}
          >
            (717) 500-1434
          </a>
          <a
            href="/contact"
            className="hidden items-center justify-center rounded-full bg-[var(--color-amber)] px-4 py-2.5 text-sm font-semibold text-[var(--color-primary)] transition hover:bg-[#ebb13a] sm:inline-flex sm:px-5"
          >
            Free Inspection
          </a>
          <button
            type="button"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            onClick={() => setMenuOpen((v) => !v)}
            className={`inline-flex h-11 w-11 items-center justify-center rounded-full border transition lg:hidden ${
              isScrolled
                ? "border-[var(--color-primary)]/15 bg-white text-[var(--color-primary)]"
                : "border-white/30 bg-white/10 text-white"
            }`}
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              aria-hidden="true"
            >
              {menuOpen ? (
                <>
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </>
              ) : (
                <>
                  <line x1="4" y1="7" x2="20" y2="7" />
                  <line x1="4" y1="12" x2="20" y2="12" />
                  <line x1="4" y1="17" x2="20" y2="17" />
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {menuOpen && (
        <div
          id="mobile-nav"
          className="lg:hidden border-t border-black/5 bg-white shadow-[0_20px_50px_rgba(15,23,42,0.12)]"
        >
          <nav aria-label="Mobile" className="mx-auto max-w-7xl px-4 py-4 sm:px-6">
            <ul className="flex flex-col divide-y divide-black/5">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    onClick={() => setMenuOpen(false)}
                    className="block py-3 text-base font-semibold text-[var(--color-primary)] hover:text-[var(--color-amber)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col gap-2">
              <a
                href="tel:+17175001434"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full border border-[var(--color-primary)]/15 px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
              >
                Call (717) 500-1434
              </a>
              <a
                href="/contact"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center justify-center rounded-full bg-[var(--color-amber)] px-4 py-3 text-sm font-semibold text-[var(--color-primary)]"
              >
                Free Inspection
              </a>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
