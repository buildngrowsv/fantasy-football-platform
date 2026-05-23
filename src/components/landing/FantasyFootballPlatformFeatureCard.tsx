/**
 * FantasyFootballPlatformFeatureCardProps
 *
 * Props for individual feature tiles on the marketing homepage.
 */
export interface FantasyFootballPlatformFeatureCardProps {
  readonly title: string;
  readonly description: string;
  readonly iconEmoji: string;
}

/**
 * FantasyFootballPlatformFeatureCard
 *
 * Renders one capability highlight (draft, scoring, waivers, etc.) in the
 * features grid. Emoji icons keep the initial launch asset-free; SVG
 * illustrations can replace them without changing page structure.
 */
export function FantasyFootballPlatformFeatureCard({
  title,
  description,
  iconEmoji,
}: FantasyFootballPlatformFeatureCardProps) {
  return (
    <article className="group rounded-2xl border border-emerald-800/40 bg-gradient-to-b from-emerald-950/40 to-[#0a1628] p-6 transition hover:border-emerald-600/50 hover:shadow-lg hover:shadow-emerald-900/20">
      <div
        aria-hidden
        className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-500/10 text-2xl transition group-hover:scale-110"
      >
        {iconEmoji}
      </div>
      <h3 className="text-lg font-bold text-white">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-emerald-100/60">
        {description}
      </p>
    </article>
  );
}
