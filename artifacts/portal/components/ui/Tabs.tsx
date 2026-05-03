"use client";

import { useState } from "react";

export interface Tab {
  id: string;
  label: string;
  count?: number;
}

export function Tabs({
  tabs,
  activeTab,
  onTabChange,
}: {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (tabId: string) => void;
}) {
  return (
    <nav className="flex gap-1 border-b border-[var(--color-border)]" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          role="tab"
          aria-selected={activeTab === tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`relative px-4 py-3 text-sm font-medium transition-colors ${
            activeTab === tab.id
              ? "text-[var(--color-primary)]"
              : "text-gray-500 hover:text-[var(--color-primary)]"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span className="ml-1.5 rounded-full bg-[var(--color-surface-alt)] px-1.5 py-0.5 text-xs text-gray-500">
              {tab.count}
            </span>
          )}
          {activeTab === tab.id && (
            <span className="absolute inset-x-0 -bottom-px h-0.5 bg-[var(--color-amber)]" />
          )}
        </button>
      ))}
    </nav>
  );
}
