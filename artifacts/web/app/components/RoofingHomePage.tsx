import ContactSection from "./ContactSection";
import GallerySection from "./GallerySection";
import HeroSection from "./HeroSection";
import ServicesSection from "./ServicesSection";
import SocialProofSection from "./SocialProofSection";
import TrustBadges from "./TrustBadges";
import { roofingProjects } from "./galleryData";

export default function RoofingHomePage() {
  return (
    <div id="top" className="flex flex-col bg-white">
      <HeroSection />
      <div className="bg-white px-4 sm:px-6 lg:px-8">
        <TrustBadges />
      </div>
      <ServicesSection />
      <GallerySection projects={roofingProjects} />
      <SocialProofSection />
      <ContactSection />
    </div>
  );
}
