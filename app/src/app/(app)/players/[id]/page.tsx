import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NovaPredictMatchupVisualStrip } from "@/components/media/NovaPredictMatchupVisualStrip";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import type { NovaPredictPlayerRecord } from "@/lib/db/schema";
import { getNovaPredictPlayerById, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPlayerPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPlayerPageSiteMetadata";

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const player = await getNovaPredictPlayerById(resolvedParams.id);

  if (!player) {
    return {
      title: "Player Not Found",
      robots: { index: false, follow: false },
    };
  }

  return BuildNovaPredictPlayerPageSiteMetadata(player);
}

function getTierLabel(player: NovaPredictPlayerRecord): string {
  if (player.novaPprProjection >= 23) return "Tier 1 · Start";
  if (player.novaPprProjection >= 17) return "Tier 2 · Strong Start";
  if (player.novaPprProjection >= 12) return "Tier 3 · Flex";
  return "Tier 4 · Caution";
}

export default async function PlayerCardPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const player = await getNovaPredictPlayerById(resolvedParams.id);

  if (!player) {
    notFound();
  }

  const relatedPlayers = (await getNovaPredictPlayerRecords(5)).filter((candidate) => candidate.id !== player.id);
  const modelEdge = player.novaPprProjection - player.vegasPprProjection;

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ maxWidth: 760, margin: "0 auto", width: "100%", overflow: "hidden" }}>
        <div
          style={{
            padding: "1.2rem 1.3rem",
            borderBottom: "1px solid var(--np-border-subtle)",
            background: player.teamPrimaryColor
              ? `linear-gradient(135deg, ${player.teamPrimaryColor}18 0%, #10151f 55%)`
              : "#10151f",
          }}
        >
          <div style={{ display: "flex", alignItems: "start", gap: "1rem" }}>
            <NovaPredictPlayerHeadshotAvatar
              fullName={player.fullName}
              position={player.position}
              headshotUrl={player.headshotUrl}
              localHeadshotPath={player.localHeadshotPath}
              initials={player.initials}
              size={96}
              showTeamRing
              teamPrimaryColor={player.teamPrimaryColor}
              priority
            />

            <div style={{ flex: 1 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", gap: "0.8rem" }}>
                <div>
                  <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.7rem", letterSpacing: "-0.03em" }}>{player.fullName}</h1>
                  <div style={{ marginTop: "0.35rem" }}>
                    <NovaPredictMatchupVisualStrip team={player.team} opponent={player.opponent} matchupLabel={player.matchupLabel} logoSize={26} />
                  </div>
                  <div style={{ marginTop: "0.25rem", color: "var(--np-text-dim)", fontSize: "0.78rem" }}>{player.position}</div>
                </div>
                <span className="np-pill np-pill-accent">{getTierLabel(player)}</span>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "0.9rem", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6rem" }}>
            <div className="np-card-muted" style={{ padding: "0.75rem 0.8rem" }}>
              <div style={{ fontSize: "0.67rem", color: "#4b6788", textTransform: "uppercase", letterSpacing: "0.09em" }}>Vegas-Implied PPR</div>
              <div style={{ marginTop: "0.25rem", fontFamily: "var(--font-jetbrains-mono)", fontSize: "1.8rem", color: "#7ea2c4" }}>
                {player.vegasPprProjection.toFixed(1)}
              </div>
            </div>
            <div className="np-card-muted" style={{ padding: "0.75rem 0.8rem" }}>
              <div style={{ fontSize: "0.67rem", color: "rgba(0,210,140,0.58)", textTransform: "uppercase", letterSpacing: "0.09em" }}>NovaPredict PPR</div>
              <div style={{ marginTop: "0.25rem", fontFamily: "var(--font-jetbrains-mono)", fontSize: "1.8rem", color: "var(--np-accent)" }}>
                {player.novaPprProjection.toFixed(1)}
              </div>
              <div style={{ marginTop: 4, color: "var(--np-cyan)", fontSize: "0.71rem", fontFamily: "var(--font-jetbrains-mono)" }}>
                {modelEdge >= 0 ? "+" : ""}
                {modelEdge.toFixed(1)} edge vs market
              </div>
            </div>
          </div>
        </div>

        <div style={{ padding: "1rem 1.3rem", borderBottom: "1px solid var(--np-border-subtle)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.7rem" }}>
            <span style={{ color: "var(--np-text-dim)", fontSize: "0.72rem", textTransform: "uppercase", letterSpacing: "0.11em" }}>
              Fantasy Point Breakdown
            </span>
            <span className="np-pill np-pill-cyan" style={{ padding: "0.2rem 0.55rem" }}>
              {player.marketSignalLabel}
            </span>
          </div>

          <div className="np-card-muted" style={{ overflow: "hidden" }}>
            {[
              ["Receptions", player.vegasPprProjection * 0.28, player.novaPprProjection * 0.29],
              ["Receiving / Passing Yards", player.vegasPprProjection * 0.36, player.novaPprProjection * 0.37],
              ["TD Probability Layer", player.vegasPprProjection * 0.22, player.novaPprProjection * 0.23],
              ["Signal Conditioning", 0, player.novaPprProjection * 0.08],
              ["Risk Penalty", 0, player.novaPprProjection * -0.03],
            ].map(([label, vegas, nova]) => (
              <div
                key={label}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 88px 88px 68px",
                  borderBottom: "1px solid var(--np-border-subtle)",
                  padding: "0.55rem 0.7rem",
                  alignItems: "center",
                }}
              >
                <span style={{ color: "var(--np-text-muted)", fontSize: "0.78rem" }}>{label}</span>
                <span style={{ color: "#668bad", fontFamily: "var(--font-jetbrains-mono)", textAlign: "right" }}>{Number(vegas).toFixed(2)}</span>
                <span style={{ color: "var(--np-accent)", fontFamily: "var(--font-jetbrains-mono)", textAlign: "right" }}>{Number(nova).toFixed(2)}</span>
                <span
                  style={{
                    color: Number(nova) - Number(vegas) >= 0 ? "var(--np-cyan)" : "var(--np-danger)",
                    fontFamily: "var(--font-jetbrains-mono)",
                    textAlign: "right",
                  }}
                >
                  {Number(nova) - Number(vegas) >= 0 ? "+" : ""}
                  {(Number(nova) - Number(vegas)).toFixed(2)}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ padding: "1rem 1.3rem", display: "grid", gap: "0.7rem" }}>
          <div className="np-card-muted" style={{ padding: "0.8rem 0.9rem" }}>
            <div style={{ color: "var(--np-text-dim)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.09em" }}>
              Distribution Snapshot
            </div>
            <div style={{ marginTop: 8, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem" }}>
              <div>
                <div style={{ color: "var(--np-text-dim)", fontSize: "0.65rem" }}>Boom ≥ 20</div>
                <div style={{ color: "var(--np-accent)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.boomProbability.toFixed(0)}%</div>
              </div>
              <div>
                <div style={{ color: "var(--np-text-dim)", fontSize: "0.65rem" }}>Bust &lt; 10</div>
                <div style={{ color: "var(--np-danger)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.bustProbability.toFixed(0)}%</div>
              </div>
              <div>
                <div style={{ color: "var(--np-text-dim)", fontSize: "0.65rem" }}>Median</div>
                <div style={{ color: "var(--np-cyan)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.novaPprProjection.toFixed(1)}</div>
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "0.55rem", flexWrap: "wrap" }}>
            <button className="np-accent-gradient np-btn">
              Agree · start
            </button>
            <button className="np-btn np-btn-secondary">
              Override projection
            </button>
          </div>
        </div>
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <h2 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.1rem" }}>Similar players</h2>
        <div className="np-player-card-grid" style={{ marginTop: "0.75rem", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
          {relatedPlayers.map((relatedPlayer) => (
            <NovaPredictPlayerProjectionCard key={relatedPlayer.id} player={relatedPlayer} variant="compact" />
          ))}
        </div>
      </article>
    </section>
  );
}
