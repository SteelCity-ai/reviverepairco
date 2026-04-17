import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import CookieBanner from "./components/CookieBanner";
import Footer from "./components/Footer";
import Header from "./components/Header";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Revive Roof Repair | Harrisburg & Central PA Roofing Experts",
  description:
    "Revive Roof Repair helps homeowners across Harrisburg and Central PA with roof repair, replacements, and storm damage recovery. Request your free inspection today.",
  openGraph: {
    title: "Revive Roof Repair | Harrisburg & Central PA Roofing Experts",
    description:
      "Modern roofing website redesign for roof repair, roof replacement, and storm damage services across Central Pennsylvania.",
    url: "https://reviveroofrepair.com",
    siteName: "Revive Roof Repair",
    locale: "en_US",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "RoofingContractor",
    name: "Revive Roof Repair",
    telephone: "+1-717-500-1434",
    url: "https://reviveroofrepair.com",
    areaServed: "Central Pennsylvania including Harrisburg, Hershey, Mechanicsburg, York, Lancaster, Carlisle",
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
