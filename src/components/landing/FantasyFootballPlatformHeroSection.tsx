import Link from "next/link";

/**
 * FantasyFootballPlatformHeroSection
 *
 * Primary marketing hero on the home page. Communicates value prop and
 * drives users toward league creation or exploring the live draft demo UI.
 */
export function FantasyFootballPlatformHeroSection() {
  return (
    <section className="relative overflow-hidden px-6 pb-20 pt-16 md:pb-28 md:pt-24">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(16,185,129,0.15)_0%,_transparent_60%)]"
      />

      <div className="relative mx-auto max-w-6xl">
        <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-sm font-medium text-emerald-300">
          <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
          2025 Season Ready
        </div>

        <h1 className="mt-8 max-w-3xl text-4xl font-black leading-tight tracking-tight text-white md:text-6xl md:leading-[1.1]">
          Your fantasy football command center
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-emerald-100/70 md:text-xl">
          Run live drafts, customize scoring, manage waivers, and track
          standings — all in one polished platform designed for serious
          league commissioners and competitive managers.
        </p>

        <div className="mt-10 flex flex-col gap-4 sm:flex-row">
          <Link
            href="/leagues"
            className="inline-flex items-center justify-center rounded-full bg-gradient-to-r from-emerald-500 to-emerald-600 px-8 py-4 text-base font-bold text-white shadow-xl shadow-emerald-900/40 transition hover:from-emerald-400 hover:to-emerald-500"
          >
            Create Your League
          </Link>
          <Link
            href="/draft"
            className="inline-flex items-center justify-center rounded-full border border-emerald-500/40 bg-white/5 px-8 py-4 text-base font-semibold text-emerald-100 transition hover:border-emerald-400 hover:bg-white/10"
          >
            Preview Live Draft
          </Link>
        </div>
      </div>
    </section>
  );
}
