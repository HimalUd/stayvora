import React from 'react';
import PortalHero from '../components/HotelOwnerPortal/PortalHero';
import FeaturesSection from '../components/HotelOwnerPortal/FeaturesSection';
import HowItWorksSection from '../components/HotelOwnerPortal/HowItWorksSection';
import StatsBarSection from '../components/HotelOwnerPortal/StatsBarSection';
import TestimonialsSection from '../components/HotelOwnerPortal/TestimonialsSection';
import CTASection from '../components/HotelOwnerPortal/CTASection';
import '../components/HotelOwnerPortal/HotelOwnerPortal.css';

export default function HotelOwnerPortal() {
  return (
    <div className="hop-page">
      <PortalHero />
      <FeaturesSection />
      <HowItWorksSection />
      <StatsBarSection />
      <TestimonialsSection />
      <CTASection />
    </div>
  );
}
