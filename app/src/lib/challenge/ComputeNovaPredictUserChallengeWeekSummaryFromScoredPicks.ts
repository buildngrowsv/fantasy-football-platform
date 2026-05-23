/*
  ComputeNovaPredictUserChallengeWeekSummaryFromScoredPicks.ts
  ------------------------------------------------------------
  Aggregates scored Challenge picks for the scoreboard header on /challenge.
*/

import { NOVA_PREDICT_CHALLENGE_MINIMUM_PICKS_FOR_SCORED_WEEK } from "@/lib/challenge/NovaPredictChallengePickConstants";
import type { NovaPredictUserChallengePickRecord } from "@/lib/challenge/ListNovaPredictUserChallengePicksForWeekFromDatabase";

export interface NovaPredictUserChallengeWeekSummaryRecord {
  totalPicks: number;
  scoredPicks: number;
  pendingPicks: number;
  userBeatModelCount: number;
  overrideCount: number;
  overrideBeatModelCount: number;
  overrideWinRatePercent: number | null;
  meetsMinimumForScoredWeek: boolean;
}

export function ComputeNovaPredictUserChallengeWeekSummaryFromScoredPicks(
  picks: NovaPredictUserChallengePickRecord[],
): NovaPredictUserChallengeWeekSummaryRecord {
  const scoredPicks = picks.filter((pick) => pick.scoreStatus === "scored");
  const userBeatModelCount = scoredPicks.filter((pick) => pick.userBeatModel).length;
  const overridePicks = scoredPicks.filter((pick) => pick.pickType === "override");
  const overrideBeatModelCount = overridePicks.filter((pick) => pick.userBeatModel).length;

  return {
    totalPicks: picks.length,
    scoredPicks: scoredPicks.length,
    pendingPicks: picks.length - scoredPicks.length,
    userBeatModelCount,
    overrideCount: picks.filter((pick) => pick.pickType === "override").length,
    overrideBeatModelCount,
    overrideWinRatePercent:
      overridePicks.length > 0 ? (overrideBeatModelCount / overridePicks.length) * 100 : null,
    meetsMinimumForScoredWeek: picks.length >= NOVA_PREDICT_CHALLENGE_MINIMUM_PICKS_FOR_SCORED_WEEK,
  };
}
