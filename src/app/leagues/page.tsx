import { FantasyFootballPlatformEmptyStatePanel } from "@/components/shared/FantasyFootballPlatformEmptyStatePanel";

/**
 * LeaguesPage
 *
 * Index of leagues the signed-in user belongs to. The create-league form
 * and invite flow will mount here in the next milestone; for launch we
 * show onboarding empty state plus commissioner-oriented copy.
 */
export default function LeaguesPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-3xl font-black text-white">Your Leagues</h1>
          <p className="mt-2 text-emerald-100/60">
            Create a new league or accept an invite to get started.
          </p>
        </div>
        <button
          type="button"
          className="rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-emerald-400"
        >
          + Create League
        </button>
      </header>

      <FantasyFootballPlatformEmptyStatePanel
        title="Start your first league"
        description="Configure team count, scoring format (Standard, Half-PPR, or PPR), and draft style. Then invite managers to join before draft night."
        actionLabel="Create a League"
        actionHref="/leagues"
      />

      <section className="mt-12 grid gap-6 md:grid-cols-3">
        {[
          {
            step: "1",
            title: "Configure",
            body: "Pick scoring, roster size, and waiver rules.",
          },
          {
            step: "2",
            title: "Invite",
            body: "Send invite links to every manager in your group chat.",
          },
          {
            step: "3",
            title: "Draft",
            body: "Run a live snake or auction draft when everyone's ready.",
          },
        ].map((item) => (
          <article
            key={item.step}
            className="rounded-2xl border border-emerald-800/40 bg-emerald-950/20 p-6"
          >
            <span className="text-sm font-bold text-emerald-400">
              Step {item.step}
            </span>
            <h3 className="mt-2 text-lg font-bold text-white">{item.title}</h3>
            <p className="mt-2 text-sm text-emerald-100/60">{item.body}</p>
          </article>
        ))}
      </section>
    </main>
  );
}
