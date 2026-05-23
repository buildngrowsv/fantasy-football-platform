import { NovaPredictPlayerProjectionCard } from "@/components/players/NovaPredictPlayerProjectionCard";
import { getNovaPredictHomepageMetrics, getNovaPredictPlayerRecords } from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Challenge The Model",
  description:
    "Override NovaPredict projections, track your record by reason code, and discover where your instincts beat consensus and the model.",
  path: "/challenge",
});

export default async function ChallengePage() {
  const [metrics, challengePlayers] = await Promise.all([
    getNovaPredictHomepageMetrics(),
    getNovaPredictPlayerRecords(6),
  ]);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.4rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.65rem", letterSpacing: "-0.03em" }}>Challenge the model</h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.7 }}>
          Submit your own reads before lock, then see whether you beat the model and the field after Sunday.
        </p>
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <div style={{ color: "var(--np-text-strong)", fontWeight: 600, marginBottom: "0.75rem" }}>This week&apos;s slate</div>
        <div className="np-player-card-grid">
          {challengePlayers.map((player, index) => (
            <NovaPredictPlayerProjectionCard key={player.id} player={player} variant="compact" priorityImage={index < 3} />
          ))}
        </div>
      </article>

      <article className="np-card" style={{ padding: "1rem", display: "grid", gridTemplateColumns: "minmax(0, 1.1fr) minmax(0, 0.9fr)", gap: "0.85rem" }}>
        <div className="np-card-muted" style={{ padding: "0.95rem" }}>
          <div style={{ color: "var(--np-text-strong)", fontWeight: 600, marginBottom: "0.45rem" }}>Your record this week</div>
          <p style={{ color: "var(--np-text-muted)", margin: 0, lineHeight: 1.65, fontSize: "0.88rem" }}>
            Start/sit calls graded against the model and community once the week finishes.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "0.45rem", marginTop: "0.75rem" }}>
            <div className="np-card-muted" style={{ padding: "0.5rem" }}>
              <div style={{ color: "var(--np-text-dim)", fontSize: "0.63rem" }}>You</div>
              <div style={{ color: "var(--np-accent)", fontFamily: "var(--font-jetbrains-mono)" }}>69.2%</div>
            </div>
            <div className="np-card-muted" style={{ padding: "0.5rem" }}>
              <div style={{ color: "var(--np-text-dim)", fontSize: "0.63rem" }}>Model</div>
              <div style={{ color: "#7196ba", fontFamily: "var(--font-jetbrains-mono)" }}>76.9%</div>
            </div>
            <div className="np-card-muted" style={{ padding: "0.5rem" }}>
              <div style={{ color: "var(--np-text-dim)", fontSize: "0.63rem" }}>Community</div>
              <div style={{ color: "#a36bc8", fontFamily: "var(--font-jetbrains-mono)" }}>71.4%</div>
            </div>
          </div>
        </div>

        <div className="np-card-muted" style={{ padding: "0.95rem" }}>
          <div style={{ color: "var(--np-text-strong)", fontWeight: 600, marginBottom: "0.5rem" }}>Override history</div>
          <div style={{ display: "grid", gap: "0.45rem" }}>
            {[
              ["Vegas moved late", "12W · 4L", "75%"],
              ["Injury report", "10W · 3L", "77%"],
              ["Historical pattern", "7W · 5L", "58%"],
              ["Gut / other", "2W · 2L", "50%"],
            ].map(([reason, record, hitRate]) => (
              <div key={reason} className="np-card-muted" style={{ padding: "0.45rem 0.55rem", display: "grid", gridTemplateColumns: "1fr auto auto", gap: "0.5rem", alignItems: "center" }}>
                <span style={{ color: "var(--np-text-muted)", fontSize: "0.78rem" }}>{reason}</span>
                <span style={{ color: "var(--np-text-dim)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.73rem" }}>{record}</span>
                <span style={{ color: "var(--np-cyan)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "0.73rem" }}>{hitRate}</span>
              </div>
            ))}
          </div>
        </div>
      </article>

      <article className="np-card" style={{ padding: "1rem" }}>
        <div style={{ marginBottom: "0.7rem", color: "var(--np-text-strong)", fontWeight: 600 }}>Season benchmarks</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: "0.45rem" }}>
          {metrics.map((metric) => (
            <div key={metric.label} className="np-card-muted" style={{ padding: "0.55rem 0.6rem" }}>
              <div style={{ color: "var(--np-text-strong)", fontFamily: "var(--font-jetbrains-mono)" }}>{metric.value}</div>
              <div style={{ color: "var(--np-text-dim)", fontSize: "0.62rem", marginTop: 2 }}>{metric.label}</div>
            </div>
          ))}
        </div>
      </article>
    </section>
  );
}
