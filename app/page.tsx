import type { Metadata } from "next";
import RoofingHomePage from "./components/RoofingHomePage";
import { brandConfig, getBrand } from "../lib/brand";

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  return {
    alternates: { canonical: `https://${config.domain}/` },
    openGraph: { url: `https://${config.domain}/` },
  };
}

export default function Home() {
  return <RoofingHomePage />;
}
