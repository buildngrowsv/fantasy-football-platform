import Link from "next/link";
import { NovaPredictMatchupVisualStrip } from "@/components/media/NovaPredictMatchupVisualStrip";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { NovaPredictPageHeaderSection } from "@/components/layout/NovaPredictPageHeaderSection";
import type { NovaPredictPlayerRecord } from "@/lib/db/schema";
import { getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Pick Slate",
  description:
    "NovaPredict pick slate — ranked weekly player projections with matchup context, market signals, and start/sit guidance.",
  path: "/slate",
});

function getPositionBadgeClass(position: NovaPredictPlayerRecord["position"]): string {
  if (position === "QB") return "np-pill-amber";
  if (position === "RB") return "np-pill-accent";
  return "np-pill-cyan";
}

export default async function SlatePage() {
  const players = await getNovaPredictPlayerRecords(18);

  return (
    <section className="np-page-stack">
      <NovaPredictPageHeaderSection
        kicker="Weekly decisions"
        title="Pick slate"
        lead="Ranked starts and sits for this week — agree with Nova or override before lock."
      />

      <article className="np-card np-slate-stack" style={{ maxWidth: 540, margin: "0 auto", width: "100%", padding: "1rem", display: "grid", gap: "0.65rem" }}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className="np-card-muted np-slate-row"
            style={{
              padding: "0.85rem",
              borderLeft: player.teamPrimaryColor ? `3px solid ${player.teamPrimaryColor}` : undefined,
            }}
          >
            <div style={{ display: "flex", alignItems: "start", gap: "0.75rem" }}>
              <NovaPredictPlayerHeadshotAvatar
                fullName={player.fullName}
                position={player.position}
                headshotUrl={player.headshotUrl}
                localHeadshotPath={player.localHeadshotPath}
                initials={player.initials}
                size={56}
                showTeamRing
                teamPrimaryColor={player.teamPrimaryColor}
                priority={index < 2}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.75rem" }}>
                  <div>
                    <div style={{ color: "var(--np-text-strong)", fontWeight: 600 }}>{player.fullName}</div>
                    <div style={{ marginTop: "0.35rem" }}>
                      <NovaPredictMatchupVisualStrip team={player.team} opponent={player.opponent} logoSize={20} />
                    </div>
                  </div>
                  <span className={`np-pill ${getPositionBadgeClass(player.position)}`}>{player.position}</span>
                </div>

                <div style={{ marginTop: "0.55rem", display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.35rem" }}>
                  <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                    <div className="np-stat-label">Nova</div>
                    <div className="np-stat-value is-signal">{player.novaPprProjection.toFixed(1)}</div>
                  </div>
                  <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                    <div className="np-stat-label">Boom</div>
                    <div className="np-stat-value is-data">{player.boomProbability.toFixed(0)}%</div>
                  </div>
                  <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                    <div className="np-stat-label">Bust</div>
                    <div className="np-stat-value" style={{ color: "var(--np-danger)" }}>
                      {player.bustProbability.toFixed(0)}%
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: "0.55rem", display: "flex", gap: "0.45rem" }}>
                  <button type="button" className="np-btn np-btn-primary" style={{ flex: 1 }}>
                    Agree
                  </button>
                  <button type="button" className="np-btn np-btn-secondary" style={{ flex: 1 }}>
                    Override
                  </button>
                  <Link href={`/players/${encodeURIComponent(player.id)}`} className="np-btn np-btn-ghost" style={{ flex: 1 }}>
                    Profile
                  </Link>
                </div>

                {index === 0 ? (
                  <div className="np-metric-sublabel" style={{ marginTop: "0.55rem" }}>
                    Signal: {player.marketSignalLabel}
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        ))}
      </article>
    </section>
  );
}
