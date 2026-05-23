import { NovaPredictNflTeamLogoBadge } from "@/components/media/NovaPredictNflTeamLogoBadge";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { ResolveNovaPredictPlayerVisualAssets } from "@/lib/assets/ResolveNovaPredictPlayerVisualAssets";
import type { NovaPredictAccountabilityCallRecord, FantasyFootballPlayerPosition } from "@/lib/db/schema";
import { getNovaPredictAccountabilityCalls, getNovaPredictHomepageMetrics } from "@/lib/db/queries";

function callClassStyles(call: NovaPredictAccountabilityCallRecord): { border: string; badge: string; text: string } {
  if (call.classification === "correct") {
    return { border: "rgba(0,210,140,0.35)", badge: "rgba(0,210,140,0.1)", text: "var(--np-accent)" };
  }
  if (call.classification === "miss") {
    return { border: "rgba(224,80,80,0.35)", badge: "rgba(224,80,80,0.1)", text: "var(--np-danger)" };
  }
  return { border: "rgba(201,140,42,0.35)", badge: "rgba(201,140,42,0.1)", text: "var(--np-amber)" };
}

export default async function AccountabilityPage() {
  const [calls, metrics] = await Promise.all([getNovaPredictAccountabilityCalls(12), getNovaPredictHomepageMetrics()]);

  return (
    <section style={{ display: "grid", gap: "1rem" }}>
      <article className="np-card" style={{ padding: "1.5rem" }}>
        <h1 style={{ margin: 0, color: "var(--np-text-strong)", fontSize: "1.7rem", letterSpacing: "-0.03em" }}>
          Accountability Report
        </h1>
        <p style={{ marginTop: "0.5rem", color: "var(--np-text-muted)", lineHeight: 1.75 }}>
          Every projection is auditable. Every miss has a diagnosis. This page is intentionally transparent because trust compounds only when uncertainty is visible.
        </p>
      </article>

      <article className="np-card" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", overflow: "hidden" }}>
        {metrics.map((metric) => (
          <div key={metric.label} style={{ borderRight: "1px solid var(--np-border-subtle)", padding: "1rem" }}>
            <div style={{ color: "var(--np-text-strong)", fontFamily: "var(--font-jetbrains-mono)", fontSize: "1.2rem" }}>{metric.value}</div>
            <div style={{ color: "var(--np-text-dim)", marginTop: 2, fontSize: "0.66rem", letterSpacing: "0.1em", textTransform: "uppercase" }}>
              {metric.label}
            </div>
          </div>
        ))}
      </article>

      <article className="np-card" style={{ padding: "1rem", display: "grid", gap: "0.75rem" }}>
        {calls.map((call) => {
          const styles = callClassStyles(call);
          const error = call.actual - call.projection;
          const visualAssets = ResolveNovaPredictPlayerVisualAssets({
            fullName: call.playerName,
            position: call.position as FantasyFootballPlayerPosition,
            team: call.team,
            opponent: "TBD",
          });

          return (
            <div key={call.id} className="np-card-muted" style={{ padding: "0.85rem", borderLeft: `2px solid ${styles.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.8rem", marginBottom: "0.5rem" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <NovaPredictPlayerHeadshotAvatar
                    fullName={call.playerName}
                    position={call.position}
                    headshotUrl={visualAssets.headshotUrl}
                    initials={visualAssets.initials}
                    size={44}
                    showTeamRing
                    teamPrimaryColor={visualAssets.teamPrimaryColor}
                  />
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.45rem" }}>
                      <div style={{ color: "var(--np-text-strong)", fontWeight: 600 }}>{call.playerName}</div>
                      <NovaPredictNflTeamLogoBadge teamAbbreviation={call.team} size={22} />
                    </div>
                    <div style={{ color: "var(--np-text-dim)", fontSize: "0.7rem", marginTop: 2 }}>
                      {call.position} · Projection vs actual diagnostic
                    </div>
                  </div>
                </div>
                <span
                  style={{
                    borderRadius: 999,
                    padding: "0.22rem 0.65rem",
                    border: `1px solid ${styles.border}`,
                    background: styles.badge,
                    color: styles.text,
                    fontSize: "0.66rem",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    fontWeight: 700,
                  }}
                >
                  {call.classification}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.45rem", marginBottom: "0.5rem" }}>
                <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                  <div style={{ color: "var(--np-text-dim)", fontSize: "0.63rem" }}>Projection</div>
                  <div style={{ color: "#6f92b5", fontFamily: "var(--font-jetbrains-mono)" }}>{call.projection.toFixed(1)}</div>
                </div>
                <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                  <div style={{ color: "var(--np-text-dim)", fontSize: "0.63rem" }}>Actual</div>
                  <div style={{ color: "var(--np-text-strong)", fontFamily: "var(--font-jetbrains-mono)" }}>{call.actual.toFixed(1)}</div>
                </div>
                <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                  <div style={{ color: "var(--np-text-dim)", fontSize: "0.63rem" }}>Error</div>
                  <div style={{ color: error >= 0 ? "var(--np-cyan)" : "var(--np-danger)", fontFamily: "var(--font-jetbrains-mono)" }}>
                    {error >= 0 ? "+" : ""}
                    {error.toFixed(1)}
                  </div>
                </div>
              </div>

              <p style={{ margin: 0, color: "var(--np-text-muted)", lineHeight: 1.65, fontSize: "0.86rem" }}>{call.diagnosis}</p>
            </div>
          );
        })}
      </article>
    </section>
  );
}
