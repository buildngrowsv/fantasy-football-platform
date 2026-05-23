/*
  ListNovaPredictUserChallengePicksWithScoresForWeekFromDatabase.ts
  -----------------------------------------------------------------
  Scores pending picks when actuals exist, then returns the full pick list for UI.
*/

import { ListNovaPredictUserChallengePicksForWeekFromDatabase } from "@/lib/challenge/ListNovaPredictUserChallengePicksForWeekFromDatabase";
import { ScoreNovaPredictUserChallengePicksForWeekInDatabase } from "@/lib/challenge/ScoreNovaPredictUserChallengePicksForWeekInDatabase";

export async function ListNovaPredictUserChallengePicksWithScoresForWeekFromDatabase(
  novapredictUserId: string,
  season: number,
  week: number,
) {
  await ScoreNovaPredictUserChallengePicksForWeekInDatabase(novapredictUserId, season, week);
  return ListNovaPredictUserChallengePicksForWeekFromDatabase(novapredictUserId, season, week);
}
