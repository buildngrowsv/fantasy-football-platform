import { FantasyFootballPlatformCallToActionSection } from "@/components/landing/FantasyFootballPlatformCallToActionSection";
import { FantasyFootballPlatformFeaturesSection } from "@/components/landing/FantasyFootballPlatformFeaturesSection";
import { FantasyFootballPlatformHeroSection } from "@/components/landing/FantasyFootballPlatformHeroSection";

/**
 * HomePage
 *
 * Marketing landing route at /. Composes hero, features, and CTA sections.
 * Product routes (/dashboard, /leagues, /draft) live under separate segments
 * so we can add auth layouts later without touching this page.
 */
export default function HomePage() {
  return (
    <>
      <FantasyFootballPlatformHeroSection />
      <FantasyFootballPlatformFeaturesSection />
      <FantasyFootballPlatformCallToActionSection />
    </>
  );
}
