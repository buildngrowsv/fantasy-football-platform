import Link from "next/link";
import { NovaPredictMatchupVisualStrip } from "@/components/media/NovaPredictMatchupVisualStrip";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
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
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.3rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.6rem", letterSpacing: "-0.03em" }}>Pick Slate</h1>
        <p style={{ marginTop: "0.45rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          Mobile-first card stack for quick agree/override workflows before lock.
        </p>
      </article>

      <article className="np-card np-slate-stack" style={{ maxWidth: 520, margin: "0 auto", width: "100%", padding: "1rem", display: "grid", gap: "0.65rem" }}>
        {players.map((player, index) => (
          <div
            key={player.id}
            className="np-card-muted np-slate-row"
            style={{
              padding: "0.8rem",
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
                  <div className="np-card-muted" style={{ padding: "0.35rem 0.45rem" }}>
                    <div style={{ color: "var(--np-text-dim)", fontSize: "0.62rem" }}>NOVA</div>
                    <div style={{ color: "var(--np-accent)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.novaPprProjection.toFixed(1)}</div>
                  </div>
                  <div className="np-card-muted" style={{ padding: "0.35rem 0.45rem" }}>
                    <div style={{ color: "var(--np-text-dim)", fontSize: "0.62rem" }}>BOOM</div>
                    <div style={{ color: "var(--np-cyan)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.boomProbability.toFixed(0)}%</div>
                  </div>
                  <div className="np-card-muted" style={{ padding: "0.35rem 0.45rem" }}>
                    <div style={{ color: "var(--np-text-dim)", fontSize: "0.62rem" }}>BUST</div>
                    <div style={{ color: "var(--np-danger)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.bustProbability.toFixed(0)}%</div>
                  </div>
                </div>

                <div style={{ marginTop: "0.55rem", display: "flex", gap: "0.45rem" }}>
                  <button className="np-accent-gradient" style={{ flex: 1, borderRadius: 8, padding: "0.45rem 0.6rem", fontSize: "0.67rem", fontWeight: 700, letterSpacing: "0.06em", textTransform: "uppercase" }}>
                    Agree
                  </button>
                  <button
                    style={{
                      flex: 1,
                      borderRadius: 8,
                      border: "1px solid rgba(0,180,216,0.3)",
                      background: "rgba(0,180,216,0.08)",
                      color: "var(--np-cyan)",
                      padding: "0.45rem 0.6rem",
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Override
                  </button>
                  <Link
                    href={`/players/${encodeURIComponent(player.id)}`}
                    style={{
                      borderRadius: 8,
                      border: "1px solid var(--np-border)",
                      color: "var(--np-text-muted)",
                      padding: "0.45rem 0.6rem",
                      fontSize: "0.67rem",
                      fontWeight: 700,
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                    }}
                  >
                    Card
                  </Link>
                </div>

                {index === 0 ? (
                  <div style={{ marginTop: "0.55rem", color: "var(--np-text-dim)", fontSize: "0.67rem", fontFamily: "var(--font-jetbrains-mono)" }}>
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
