import { FantasyFootballLiveDraftRoomPanel } from "@/components/draft/FantasyFootballLiveDraftRoomPanel";

/**
 * DraftPage
 *
 * Public preview of the live draft room UI at /draft. Commissioners will
 * launch real draft sessions from league settings; this route demonstrates
 * layout and roster slot structure for stakeholders and early testers.
 */
export default function DraftPage() {
  return (
    <main className="mx-auto max-w-6xl px-6 py-12">
      <header className="mb-10">
        <h1 className="text-3xl font-black text-white">Live Draft Room</h1>
        <p className="mt-2 max-w-2xl text-emerald-100/60">
          Snake and auction drafts with pick timers, auto-pick queues, and
          real-time roster updates. Connect your league to populate the board
          with live NFL player data.
        </p>
      </header>

      <FantasyFootballLiveDraftRoomPanel />
    </main>
  );
}
