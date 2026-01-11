import HeroSection from './hero-section';
import NavbarSection from './navbar-section';
import EventsSection from './events-section';
import AboutUsSection from './about-us-section';
import FeaturesSection from './features-section';
import ContactUsSection from './contact-us-section';

import FooterSection from './footer-section';

export default async function HomePage() {
  return (
    <div className="min-h-screen w-full bg-black flex flex-col">
      <NavbarSection />
      <div className="flex-1 flex items-center justify-center py-28 min-h-screen">
        <HeroSection />
      </div>
      <div className="bg-neutral-950 min-h-screen">
        <EventsSection />
      </div>
      <div className="bg-black">
        <AboutUsSection />
      </div>
      <div className="bg-neutral-950">
        <FeaturesSection />
      </div>
      <div>
        <ContactUsSection />
      </div>
      <div>
        <FooterSection />
      </div>
    </div>
  );
}
