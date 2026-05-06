"use client";

import { useRef, useState } from "react";
import GallerySection from "./GallerySection";
import { gcProjects, roofingProjects } from "./galleryData";

type Tab = "roofing" | "gc";
const TABS: Tab[] = ["roofing", "gc"];

export default function GalleryTabs() {
  const [tab, setTab] = useState<Tab>("roofing");
  const tabRefs = useRef<Record<Tab, HTMLButtonElement | null>>({
    roofing: null,
    gc: null,
  });

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const currentIdx = TABS.indexOf(tab);
    if (e.key === "ArrowRight" || e.key === "ArrowLeft") {
      e.preventDefault();
      const delta = e.key === "ArrowRight" ? 1 : -1;
      const next = TABS[(currentIdx + delta + TABS.length) % TABS.length];
      setTab(next);
      tabRefs.current[next]?.focus();
    } else if (e.key === "Home") {
      e.preventDefault();
      setTab(TABS[0]);
      tabRefs.current[TABS[0]]?.focus();
    } else if (e.key === "End") {
      e.preventDefault();
      const last = TABS[TABS.length - 1];
      setTab(last);
      tabRefs.current[last]?.focus();
    }
  };

  const tabConfig: Record<Tab, { label: string; panelId: string; tabId: string }> = {
    roofing: {
      label: "Roofing",
      panelId: "gallery-panel-roofing",
      tabId: "gallery-tab-roofing",
    },
    gc: {
      label: "General Contracting",
      panelId: "gallery-panel-gc",
      tabId: "gallery-tab-gc",
    },
  };

  return (
    <>
      <div className="bg-white py-8">
        <div className="mx-auto flex max-w-7xl justify-center px-4 sm:px-6 lg:px-8">
          <div
            role="tablist"
            aria-label="Gallery sections"
            onKeyDown={handleKeyDown}
            className="inline-flex rounded-full border border-slate-200 bg-[var(--color-surface)] p-1.5 shadow-sm"
          >
            {TABS.map((t) => {
              const cfg = tabConfig[t];
              const selected = tab === t;
              return (
                <button
                  key={t}
                  ref={(el) => {
                    tabRefs.current[t] = el;
                  }}
                  type="button"
                  role="tab"
                  id={cfg.tabId}
                  aria-selected={selected}
                  aria-controls={cfg.panelId}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setTab(t)}
                  className={`rounded-full px-5 py-2.5 text-sm font-semibold transition ${
                    selected
                      ? "bg-[var(--color-primary)] text-white shadow"
                      : "text-[var(--color-primary)] hover:bg-white"
                  }`}
                >
                  {cfg.label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div
        role="tabpanel"
        id={tabConfig.roofing.panelId}
        aria-labelledby={tabConfig.roofing.tabId}
        hidden={tab !== "roofing"}
      >
        {tab === "roofing" && (
          <GallerySection
            projects={roofingProjects}
            eyebrow="Roofing projects"
            heading="Recent roofing work across Central PA."
            subheading="Repairs, full replacements, commercial flat roofs, and storm response work from the Revive crew."
          />
        )}
      </div>

      <div
        role="tabpanel"
        id={tabConfig.gc.panelId}
        aria-labelledby={tabConfig.gc.tabId}
        hidden={tab !== "gc"}
      >
        {tab === "gc" && (
          <GallerySection
            projects={gcProjects}
            eyebrow="General contracting projects"
            heading="Sample builds, additions, and renovations."
            subheading="A look at the kind of work Revive crews deliver. Real project photos are added as builds wrap up."
            showPlaceholderNote
          />
        )}
      </div>
    </>
  );
}
