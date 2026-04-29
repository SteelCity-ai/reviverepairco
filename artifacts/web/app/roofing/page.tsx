import type { Metadata } from "next";
import RoofingHomePage from "../components/RoofingHomePage";
import { brandConfig, getBrand } from "../../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    title: { absolute: `Roofing | ${config.name} | Harrisburg & Central PA` },
    description:
      "Roof repair, replacement, and storm damage recovery across Harrisburg and Central Pennsylvania. Licensed, insured, and locally owned.",
    alternates: { canonical: `https://${config.domain}/roofing` },
    openGraph: { url: `https://${config.domain}/roofing` },
  };
}

export default function RoofingPage() {
  return <RoofingHomePage />;
}
