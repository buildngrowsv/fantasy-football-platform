import Link from "next/link";
import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";

export default async function DashboardPage() {
  const [metrics, players] = await Promise.all([getNovaPredictHomepageMetrics(), getNovaPredictPlayerRecords(12)]);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article
        className="np-card np-hero-banner"
        style={{
          padding: "1.4rem",
          background: "linear-gradient(135deg, rgba(0,210,140,0.08) 0%, transparent 55%)",
        }}
      >
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.7rem", letterSpacing: "-0.03em" }}>Week Overview</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          Your command center for this slate: market intelligence, blended projections, and player-level ranges from the latest model run.
        </p>
      </article>

      <article className="np-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", overflow: "hidden" }}>
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

        <div className="np-player-card-grid">
          {players.map((player, index) => (
            <NovaPredictPlayerProjectionCard key={player.id} player={player} variant="compact" priorityImage={index < 3} />
          ))}
        </div>
      </article>
    </section>
  );
}
