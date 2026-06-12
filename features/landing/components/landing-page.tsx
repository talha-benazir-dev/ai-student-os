"use client";

import { AIShowcase } from "./ai-showcase";
import { BackgroundFX } from "./background-fx";
import { LandingCTA } from "./landing-cta";
import { LandingFeatures } from "./landing-features";
import { PricingSection } from "./pricing-section";
import { LandingFooter } from "./landing-footer";
import { LandingHero } from "./landing-hero";
import { LandingNavbar } from "./landing-navbar";
import { LandingStats } from "./landing-stats";
import { SocialStrip } from "./social-strip";

export function LandingPage() {
  return (
    <main className="landing-page relative min-h-screen overflow-hidden bg-[#0a0a0f] text-white">
      <BackgroundFX />
      <LandingNavbar />
      <LandingHero />
      <SocialStrip />
      <LandingFeatures />
      <PricingSection />
      <AIShowcase />
      <LandingStats />
      <LandingCTA />
      <LandingFooter />
    </main>
  );
}
