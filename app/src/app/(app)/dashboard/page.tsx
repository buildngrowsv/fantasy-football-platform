import Link from "next/link";
import type { NovaPredictPlayerRecord } from "@/lib/db/schema";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";

function positionColor(player: NovaPredictPlayerRecord): string {
  if (player.position === "QB") return "var(--np-amber)";
  if (player.position === "RB") return "var(--np-accent)";
  if (player.position === "TE") return "#a36bc8";
  return "var(--np-cyan)";
}

export default async function DashboardPage() {
  const [metrics, players] = await Promise.all([getNovaPredictHomepageMetrics(), getNovaPredictPlayerRecords(12)]);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.4rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.7rem", letterSpacing: "-0.03em" }}>Week Overview</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          Your command center for this slate: market intelligence, blended projections, and player-level ranges from the latest model run.
        </p>
      </article>

      <article className="np-card" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", overflow: "hidden" }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{ padding: "1.1rem", borderRight: "1px solid var(--np-border-subtle)" }}>
            <div style={{ fontFamily: "var(--font-jetbrains-mono)", color: "var(--np-text-strong)", fontSize: "1.3rem" }}>{metric.value}</div>
            <div style={{ marginTop: 4, color: "var(--np-text-dim)", fontSize: "0.68rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {metric.label}
            </div>
          </div>
        ))}
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
          <h2 style={{ margin: 0, fontSize: "1.2rem", color: "var(--np-text-strong)", letterSpacing: "-0.02em" }}>Top Player Cards</h2>
          <Link href="/slate" style={{ color: "var(--np-cyan)", fontWeight: 600, fontSize: "0.8rem", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Open Pick Slate →
          </Link>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.75rem" }}>
          {players.map((player) => (
            <Link
              key={player.id}
              href={`/players/${encodeURIComponent(player.id)}`}
              className="np-card-muted"
              style={{ padding: "0.85rem", display: "grid", gap: "0.45rem" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem" }}>
                <div style={{ fontWeight: 600, color: "var(--np-text-strong)" }}>{player.fullName}</div>
                <span className="np-pill" style={{ border: "1px solid var(--np-border)", color: positionColor(player), padding: "0.18rem 0.45rem" }}>
                  {player.position}
                </span>
              </div>
              <div style={{ color: "var(--np-text-dim)", fontSize: "0.72rem" }}>
                {player.team} vs {player.opponent}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.35rem", marginTop: "0.2rem" }}>
                <div className="np-card-muted" style={{ padding: "0.45rem 0.5rem" }}>
                  <div style={{ color: "#395275", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Vegas PPR</div>
                  <div style={{ color: "#7a9bbb", fontFamily: "var(--font-jetbrains-mono)" }}>{player.vegasPprProjection.toFixed(1)}</div>
                </div>
                <div className="np-card-muted" style={{ padding: "0.45rem 0.5rem" }}>
                  <div style={{ color: "rgba(0,210,140,0.58)", fontSize: "0.62rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Nova PPR</div>
                  <div style={{ color: "var(--np-accent)", fontFamily: "var(--font-jetbrains-mono)" }}>{player.novaPprProjection.toFixed(1)}</div>
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "var(--np-text-dim)", fontSize: "0.68rem", fontFamily: "var(--font-jetbrains-mono)" }}>
                <span>Boom {player.boomProbability.toFixed(0)}%</span>
                <span>Bust {player.bustProbability.toFixed(0)}%</span>
              </div>
            </Link>
          ))}
        </div>
      </article>
    </section>
  );
}
