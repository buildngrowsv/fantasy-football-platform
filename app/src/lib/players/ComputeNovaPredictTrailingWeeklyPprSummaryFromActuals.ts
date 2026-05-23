/*
  ComputeNovaPredictTrailingWeeklyPprSummaryFromActuals.ts
  ----------------------------------------------------------
  Pure helper for player card trailing stats strip — avg/high/low from real weeks.
*/

import type { NovaPredictPlayerWeeklyActualRecord } from "@/lib/players/FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase";

export interface NovaPredictTrailingWeeklyPprSummaryRecord {
  gamesPlayed: number;
  averagePpr: number;
  highPpr: number;
  lowPpr: number;
  trailingFourWeekAverage: number | null;
}

export function ComputeNovaPredictTrailingWeeklyPprSummaryFromActuals(
  weeklyActuals: NovaPredictPlayerWeeklyActualRecord[],
): NovaPredictTrailingWeeklyPprSummaryRecord {
  if (weeklyActuals.length === 0) {
    return {
      gamesPlayed: 0,
      averagePpr: 0,
      highPpr: 0,
      lowPpr: 0,
      trailingFourWeekAverage: null,
    };
  }

  const scores = weeklyActuals.map((week) => week.fantasyPointsPpr);
  const sortedByWeek = [...weeklyActuals].sort((left, right) => right.week - left.week);
  const trailingFour = sortedByWeek.slice(0, 4).map((week) => week.fantasyPointsPpr);

  return {
    gamesPlayed: scores.length,
    averagePpr: scores.reduce((sum, score) => sum + score, 0) / scores.length,
    highPpr: Math.max(...scores),
    lowPpr: Math.min(...scores),
    trailingFourWeekAverage:
      trailingFour.length > 0 ? trailingFour.reduce((sum, score) => sum + score, 0) / trailingFour.length : null,
  };
}
