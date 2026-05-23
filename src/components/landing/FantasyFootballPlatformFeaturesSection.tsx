import { FantasyFootballPlatformFeatureCard } from "@/components/landing/FantasyFootballPlatformFeatureCard";

/**
 * FantasyFootballPlatformFeaturesSection
 *
 * Three-column feature grid on the landing page. Each card maps to a
 * roadmap pillar so prospects immediately see scope beyond a basic roster view.
 */
export function FantasyFootballPlatformFeaturesSection() {
  const platformFeatures = [
    {
      title: "Live Snake & Auction Drafts",
      description:
        "Real-time draft rooms with pick timers, auto-pick queues, and commissioner overrides when someone goes offline mid-draft.",
      iconEmoji: "🏈",
    },
    {
      title: "Flexible Scoring Presets",
      description:
        "Standard, half-PPR, and full PPR out of the box. Commissioners can fine-tune yardage and bonus rules before the season kicks off.",
      iconEmoji: "📊",
    },
    {
      title: "League Management Hub",
      description:
        "Waivers, trades, lineup locks, and playoff brackets — everything a commissioner needs without juggling spreadsheets.",
      iconEmoji: "🏆",
    },
    {
      title: "Mobile-First Lineups",
      description:
        "Set starters from your phone with large tap targets and clear position badges. No more squinting at tiny roster rows on gameday.",
      iconEmoji: "📱",
    },
    {
      title: "Head-to-Head Matchups",
      description:
        "Weekly scoreboards with projected vs. actual points. Managers see exactly where they gained or lost ground each week.",
      iconEmoji: "⚔️",
    },
    {
      title: "Commissioner Controls",
      description:
        "Edit rosters, reset draft picks, and lock leagues for playoffs. Built for the person who actually runs the league.",
      iconEmoji: "🛡️",
    },
  ];

  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl">
        <div className="max-w-2xl">
          <h2 className="text-3xl font-black tracking-tight text-white md:text-4xl">
            Everything your league needs
          </h2>
          <p className="mt-4 text-lg text-emerald-100/60">
            From draft night to championship week, Gridiron Dynasty keeps
            commissioners and managers aligned.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {platformFeatures.map((feature) => (
            <FantasyFootballPlatformFeatureCard
              key={feature.title}
              title={feature.title}
              description={feature.description}
              iconEmoji={feature.iconEmoji}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
