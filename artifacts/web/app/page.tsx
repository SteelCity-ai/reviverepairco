import ContactSection from "./components/ContactSection";
import HeroSection from "./components/HeroSection";
import ServicesSection from "./components/ServicesSection";
import SocialProofSection from "./components/SocialProofSection";
import TrustBadges from "./components/TrustBadges";

export default function Home() {
  return (
    <div id="top" className="flex flex-col bg-white">
      <HeroSection />
      <div className="bg-white px-4 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>
      <ServicesSection />
      <SocialProofSection />
      <ContactSection />
    </div>
  );
}
