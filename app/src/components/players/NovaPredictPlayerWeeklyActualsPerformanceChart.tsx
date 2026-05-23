/*
  NovaPredictPlayerWeeklyActualsPerformanceChart.tsx
  --------------------------------------------------
  Bar chart of real nflverse weekly PPR scores — replaces synthetic breakdown math on player cards.

  Rendered server-side with CSS height bars (no chart library) so Cloudflare Workers stay lean.
*/

import type { NovaPredictPlayerWeeklyActualRecord } from "@/lib/players/FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase";
import type { NovaPredictTrailingWeeklyPprSummaryRecord } from "@/lib/players/ComputeNovaPredictTrailingWeeklyPprSummaryFromActuals";

interface NovaPredictPlayerWeeklyActualsPerformanceChartProps {
  weeklyActuals: NovaPredictPlayerWeeklyActualRecord[];
  trailingSummary: NovaPredictTrailingWeeklyPprSummaryRecord;
  seasonLabel: number;
  currentProjection: number;
}

export function NovaPredictPlayerWeeklyActualsPerformanceChart({
  weeklyActuals,
  trailingSummary,
  seasonLabel,
  currentProjection,
}: NovaPredictPlayerWeeklyActualsPerformanceChartProps) {
  if (weeklyActuals.length === 0) {
    return (
      <div className="np-player-weekly-chart np-card-muted" style={{ padding: "1rem" }}>
        <p style={{ margin: 0, color: "var(--np-text-muted)", lineHeight: 1.65, fontSize: "0.88rem" }}>
          Weekly actuals will appear after nflverse ingest matches this player in{" "}
          <span style={{ fontFamily: "var(--font-jetbrains-mono)" }}>player_weekly_actuals</span>.
        </p>
      </div>
    );
  }

  const chronologicalWeeks = [...weeklyActuals].sort((left, right) => left.week - right.week);
  const maxScore = Math.max(...chronologicalWeeks.map((week) => week.fantasyPointsPpr), currentProjection, 1);

  return (
    <div className="np-player-weekly-chart">
      <div className="np-player-weekly-chart-header">
        <span>{seasonLabel} weekly PPR (real)</span>
        {trailingSummary.trailingFourWeekAverage !== null ? (
          <span className="np-player-weekly-chart-trailing">
            Trailing-4 avg {trailingSummary.trailingFourWeekAverage.toFixed(1)} · Nova {currentProjection.toFixed(1)}
          </span>
        ) : null}
      </div>

      <div className="np-player-weekly-chart-bars" aria-label={`${seasonLabel} weekly fantasy points chart`}>
        {chronologicalWeeks.map((week) => {
          const barHeightPercent = Math.max(8, (week.fantasyPointsPpr / maxScore) * 100);
          const beatProjection = week.fantasyPointsPpr >= currentProjection;

          return (
            <div key={`${week.season}-${week.week}`} className="np-player-weekly-chart-bar-col">
              <div
                className={`np-player-weekly-chart-bar${beatProjection ? " is-above-projection" : ""}`}
                style={{ height: `${barHeightPercent}%` }}
                title={`Week ${week.week}: ${week.fantasyPointsPpr.toFixed(1)} PPR vs ${week.opponentTeam ?? "opp"}`}
              />
              <span className="np-player-weekly-chart-bar-score">{week.fantasyPointsPpr.toFixed(0)}</span>
              <span className="np-player-weekly-chart-bar-label">W{week.week}</span>
            </div>
          );
        })}
      </div>

      <div className="np-player-weekly-chart-stats">
        <div>
          <span>Avg</span>
          <strong>{trailingSummary.averagePpr.toFixed(1)}</strong>
        </div>
        <div>
          <span>High</span>
          <strong>{trailingSummary.highPpr.toFixed(1)}</strong>
        </div>
        <div>
          <span>Low</span>
          <strong>{trailingSummary.lowPpr.toFixed(1)}</strong>
        </div>
        <div>
          <span>Games</span>
          <strong>{trailingSummary.gamesPlayed}</strong>
        </div>
      </div>
    </div>
  );
}
