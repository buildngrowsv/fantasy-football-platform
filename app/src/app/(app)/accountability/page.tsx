import { NovaPredictAccountabilityWeekSelector } from "@/components/accountability/NovaPredictAccountabilityWeekSelector";
import { NovaPredictPageHeaderSection } from "@/components/layout/NovaPredictPageHeaderSection";
import { NovaPredictMetricStripSection } from "@/components/layout/NovaPredictMetricStripSection";
import { NovaPredictNflTeamLogoBadge } from "@/components/media/NovaPredictNflTeamLogoBadge";
import { NovaPredictPlayerHeadshotAvatar } from "@/components/media/NovaPredictPlayerHeadshotAvatar";
import { NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON } from "@/lib/constants/NovaPredictNflSeasonConstants";
import { ResolveNovaPredictPlayerVisualAssets } from "@/lib/assets/ResolveNovaPredictPlayerVisualAssets";
import type { NovaPredictAccountabilityCallRecord, FantasyFootballPlayerPosition } from "@/lib/db/schema";
import {
  getNovaPredictAccountabilityCalls,
  getNovaPredictAccountabilitySummaryMetrics,
} from "@/lib/db/queries";
import { BuildNovaPredictPageSiteMetadata } from "@/lib/seo/BuildNovaPredictPageSiteMetadata";

export const metadata = BuildNovaPredictPageSiteMetadata({
  title: "Gradebook",
  description: "Every NovaPredict call graded — wins, misses, and what we learned from each one.",
  path: "/accountability",
});

function callClassStyles(call: NovaPredictAccountabilityCallRecord): { border: string; badge: string; text: string } {
  if (call.classification === "correct") {
    return { border: "rgba(200,150,12,0.35)", badge: "rgba(200,150,12,0.1)", text: "var(--np-accent-bright)" };
  }
  if (call.classification === "miss") {
    return { border: "rgba(196,92,74,0.35)", badge: "rgba(196,92,74,0.1)", text: "var(--np-danger)" };
  }
  return { border: "rgba(184,132,46,0.35)", badge: "rgba(184,132,46,0.1)", text: "var(--np-amber)" };
}

export default async function AccountabilityPage({
  searchParams,
}: {
  searchParams: Promise<{ week?: string }>;
}) {
  const resolvedSearchParams = await searchParams;
  const selectedWeek = resolvedSearchParams.week ? Number.parseInt(resolvedSearchParams.week, 10) : undefined;
  const weekFilter = selectedWeek && Number.isFinite(selectedWeek) ? selectedWeek : undefined;

  const [summary, calls] = await Promise.all([
    getNovaPredictAccountabilitySummaryMetrics(),
    getNovaPredictAccountabilityCalls(24, weekFilter),
  ]);

  const isLiveBacktest = summary.totalCalls > 0;

  return (
    <section className="np-page-stack">
      <NovaPredictPageHeaderSection
        kicker={summary.seasonLabel}
        title="Gradebook"
        lead={
          isLiveBacktest
            ? `Every pick on the record — wins, misses, and why the model was right or wrong. Showing real trailing-baseline backtest rows from ${NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON} weeks 5–18.`
            : "Every pick on the record — wins, misses, and exactly why the model was right or wrong."
        }
      />

      <NovaPredictMetricStripSection
        metrics={[
          {
            label: "Hit rate",
            value: isLiveBacktest ? `${summary.hitRatePercent.toFixed(1)}%` : "—",
            subLabel: isLiveBacktest ? `${summary.correctCount} correct` : "Run pipeline backtest",
            tone: "accent",
          },
          {
            label: "Graded calls",
            value: isLiveBacktest ? summary.totalCalls.toLocaleString() : "—",
            subLabel: isLiveBacktest ? "projection vs actual" : "pending",
          },
          {
            label: "Misses",
            value: isLiveBacktest ? summary.missCount.toLocaleString() : "—",
            subLabel: isLiveBacktest ? `${summary.varianceCount} variance` : "pending",
          },
          {
            label: "Mean abs error",
            value: isLiveBacktest ? summary.meanAbsoluteError.toFixed(2) : "—",
            subLabel: "PPR points",
            tone: "data",
          },
        ]}
      />

      <NovaPredictAccountabilityWeekSelector availableWeeks={summary.availableWeeks} selectedWeek={weekFilter} />

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
                    localHeadshotPath={visualAssets.localHeadshotPath}
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
                      {call.position} · Week {call.week || "—"} · projection vs actual
                    </div>
                  </div>
                </div>
                <span className={`np-pill ${call.classification === "correct" ? "np-pill-accent" : call.classification === "miss" ? "np-pill-amber" : "np-pill-cyan"}`}>
                  {call.classification}
                </span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "0.45rem", marginBottom: "0.5rem" }}>
                <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                  <div className="np-stat-label">Projection</div>
                  <div className="np-stat-value is-data">{call.projection.toFixed(1)}</div>
                </div>
                <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                  <div className="np-stat-label">Actual</div>
                  <div className="np-stat-value">{call.actual.toFixed(1)}</div>
                </div>
                <div className="np-card-muted" style={{ padding: "0.4rem 0.5rem" }}>
                  <div className="np-stat-label">Error</div>
                  <div className="np-stat-value" style={{ color: error >= 0 ? "var(--np-data)" : "var(--np-danger)" }}>
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
