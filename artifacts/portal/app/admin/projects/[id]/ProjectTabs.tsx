"use client";

import { useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Tabs, type Tab } from "@/components/ui/Tabs";

export default function ProjectTabs({
  activeTab,
  pendingPhotoCount,
}: {
  activeTab: string;
  pendingPhotoCount: number;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const tabs: Tab[] = [
    { id: "overview", label: "Overview" },
    { id: "work", label: "Work" },
    { id: "schedule", label: "Schedule" },
    { id: "approvals", label: "Approvals", count: pendingPhotoCount || undefined },
    { id: "documents", label: "Documents" },
    { id: "activity", label: "Activity" },
  ];

  const onTabChange = useCallback(
    (tabId: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tabId);
      router.replace(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams],
  );

  return <Tabs tabs={tabs} activeTab={activeTab} onTabChange={onTabChange} />;
}
