import Link from "next/link";

/**
 * FantasyFootballPlatformEmptyStatePanelProps
 *
 * Shared empty-state UI when a user has no leagues, no draft room, etc.
 * Avoids showing fabricated sample data while still guiding next steps.
 */
export interface FantasyFootballPlatformEmptyStatePanelProps {
  readonly title: string;
  readonly description: string;
  readonly actionLabel: string;
  readonly actionHref: string;
}

/**
 * FantasyFootballPlatformEmptyStatePanel
 *
 * Centered placeholder panel used on dashboard, leagues, and draft routes
 * until the user connects real league data or completes onboarding.
 */
export function FantasyFootballPlatformEmptyStatePanel({
  title,
  description,
  actionLabel,
  actionHref,
}: FantasyFootballPlatformEmptyStatePanelProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-emerald-700/50 bg-emerald-950/20 px-8 py-16 text-center">
      <div
        aria-hidden
        className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-500/10 text-3xl"
      >
        🏈
      </div>
      <h2 className="text-xl font-bold text-white">{title}</h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-emerald-100/60">
        {description}
      </p>
      <Link
        href={actionHref}
        className="mt-8 inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
      >
        {actionLabel}
      </Link>
    </div>
  );
}
