import { FantasyFootballPlatformEmptyStatePanel } from "@/components/shared/FantasyFootballPlatformEmptyStatePanel";

/**
 * DashboardPage
 *
 * Manager home screen — will show active matchups, lineup alerts, and
 * waiver priorities once leagues are connected. Starts with an empty state
 * so we never display fabricated scores or fake player news.
 */
export default function DashboardPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white">Dashboard</h1>
        <p className="mt-2 text-emerald-100/60">
          Your matchups, lineups, and league activity will appear here.
        </p>
      </header>

      <FantasyFootballPlatformEmptyStatePanel
        title="No active leagues yet"
        description="Join or create a league to see your weekly matchups, projected points, and lineup recommendations on this dashboard."
        actionLabel="Browse Leagues"
        actionHref="/leagues"
      />
    </main>
  );
}
