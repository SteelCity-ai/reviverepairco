import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Emergency Roof Repair | 24/7 Rapid Response | Revive Roof Repair",
  description:
    "Need emergency roof repair in Central PA? Revive Roof Repair offers 24/7 emergency service with rapid response. Storm damage, leaks, tarping - we're here when you need us. Call (717) 500-1434",
  keywords:
    "emergency roof repair, 24/7 roofer, storm damage repair, roof tarping, urgent roof repair, Harrisburg emergency roofer, Central PA emergency roof",
};

export default function ServiceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
