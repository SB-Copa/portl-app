import HeroSection from './hero-section';
import EventsSection from './events-section';
import AboutUsSection from './about-us-section';
import FeaturesSection from './features-section';
import ContactUsSection from './contact-us-section';

export default async function HomePage() {
  return (
    <div className="min-h-screen w-full bg-background flex flex-col dark">
      <div className="flex-1 flex items-center justify-center py-20 min-h-screen">
        <HeroSection />
      </div>
      <div className="bg-card min-h-screen">
        <EventsSection />
      </div>
      <div className="bg-background min-h-screen">
        <AboutUsSection />
      </div>
      <div className="bg-card min-h-screen">
        <FeaturesSection />
      </div>
      <div className="bg-background">
        <ContactUsSection />
      </div>
    </div>
  );
}
