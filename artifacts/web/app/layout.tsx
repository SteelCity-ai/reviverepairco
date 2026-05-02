import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";
import { brandConfig, getBrand } from "../lib/brand";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export async function generateMetadata(): Promise<Metadata> {
  const brand = await getBrand();
  const config = brandConfig(brand);
  const url = `https://${config.domain}`;

  return {
    metadataBase: new URL(url),
    title: {
      default: config.metaTitle,
      template: `%s | ${config.name}`,
    },
    description: config.metaDescription,
    openGraph: {
      title: config.metaTitle,
      description: config.metaDescription,
      siteName: config.name,
      locale: "en_US",
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const brand = await getBrand();
  const config = brandConfig(brand);

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": brand === "repair-co" ? "GeneralContractor" : "RoofingContractor",
    "@id": `https://${config.domain}/#business`,
    name: config.name,
    telephone: "+1-717-500-1434",
    url: `https://${config.domain}`,
    areaServed:
      "Central Pennsylvania including Harrisburg, Hershey, Mechanicsburg, York, Lancaster, Carlisle",
    address: {
      "@type": "PostalAddress",
      addressLocality: "Harrisburg",
      addressRegion: "PA",
      addressCountry: "US",
    },
    openingHours: "Mo-Su 08:00-20:00",
    priceRange: "$$",
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: "5.0",
      reviewCount: "100",
    },
  };

  return (
    <html lang="en" className={`${inter.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white font-sans text-[var(--color-primary)] antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
        />
        <Header />
        <main className="flex-1 pt-[76px]">{children}</main>
        <CookieBanner />
        <Footer />
      </body>
    </html>
  );
}
