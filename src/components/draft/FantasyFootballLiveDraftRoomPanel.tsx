/**
 * FantasyFootballLiveDraftRoomPanel
 *
 * Visual shell for the live draft experience. Shows draft order columns
 * and an empty player queue — real NFL player data will stream in through
 * a future adapter (Sleeper, ESPN, or custom ingestion pipeline).
 *
 * We intentionally render structural placeholders instead of invented stats
 * so the UI contract is honest until live data is wired up.
 */
export function FantasyFootballLiveDraftRoomPanel() {
  const draftRoundLabels = ["Round 1", "Round 2", "Round 3"];
  const rosterPositions = ["QB", "RB", "WR", "TE", "FLEX", "BN"];

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <section className="rounded-2xl border border-emerald-800/40 bg-[#0a1628] p-6">
        <header className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Draft Board</h2>
            <p className="text-sm text-emerald-100/50">
              Waiting for commissioner to start the draft
            </p>
          </div>
          <span className="rounded-full bg-amber-500/20 px-3 py-1 text-xs font-semibold text-amber-300">
            Pre-Draft
          </span>
        </header>

        <div className="grid gap-4 sm:grid-cols-3">
          {draftRoundLabels.map((roundLabel) => (
            <div
              key={roundLabel}
              className="rounded-xl border border-dashed border-emerald-700/40 bg-emerald-950/20 p-4"
            >
              <p className="text-xs font-semibold uppercase tracking-wider text-emerald-400">
                {roundLabel}
              </p>
              <p className="mt-4 text-sm text-emerald-100/40">
                Picks appear here once the draft begins
              </p>
            </div>
          ))}
        </div>
      </section>

      <aside className="rounded-2xl border border-emerald-800/40 bg-[#0a1628] p-6">
        <h2 className="text-lg font-bold text-white">Your Roster</h2>
        <p className="mt-1 text-sm text-emerald-100/50">
          Slots fill as you draft players
        </p>

        <ul className="mt-6 space-y-2">
          {rosterPositions.map((position) => (
            <li
              key={position}
              className="flex items-center justify-between rounded-lg border border-emerald-800/30 bg-emerald-950/30 px-4 py-3"
            >
              <span className="text-xs font-bold text-emerald-400">
                {position}
              </span>
              <span className="text-sm text-emerald-100/30">Empty</span>
            </li>
          ))}
        </ul>
      </aside>
    </div>
  );
}
