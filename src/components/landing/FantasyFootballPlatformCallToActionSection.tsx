import Link from "next/link";

/**
 * FantasyFootballPlatformCallToActionSection
 *
 * Bottom-of-page conversion block on the marketing homepage. Repeats the
 * primary CTA after users scroll through features so momentum converts.
 */
export function FantasyFootballPlatformCallToActionSection() {
  return (
    <section className="px-6 py-20">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-3xl border border-emerald-700/40 bg-gradient-to-br from-emerald-900/50 via-[#0a1628] to-[#060d18] px-8 py-16 text-center md:px-16">
        <h2 className="text-3xl font-black text-white md:text-4xl">
          Ready to run your best season yet?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-emerald-100/70">
          Create a league in minutes. Invite your managers. Draft live when
          everyone&apos;s ready.
        </p>
        <Link
          href="/leagues"
          className="mt-8 inline-flex items-center justify-center rounded-full bg-white px-8 py-4 text-base font-bold text-emerald-900 shadow-xl transition hover:bg-emerald-50"
        >
          Get Started Free
        </Link>
      </div>
    </section>
  );
}
