/*
  ScoreNovaPredictUserChallengePicksForWeekInDatabase.ts
  ----------------------------------------------------
  When nflverse actuals exist, grades unscored Challenge picks for a user/week.

  Called before listing picks on /challenge so the board always reflects latest actuals
  without waiting for a separate batch cron (works for 2024 backtest weeks too).
*/

import { sql } from "drizzle-orm";

import { ComputeNovaPredictChallengePickScoreFromActual } from "@/lib/challenge/ComputeNovaPredictChallengePickScoreFromActual";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import { FetchNovaPredictPlayerActualPprForSlateWeekFromDatabase } from "@/lib/players/FetchNovaPredictPlayerActualPprForSlateWeekFromDatabase";

export async function ScoreNovaPredictUserChallengePicksForWeekInDatabase(
  novapredictUserId: string,
  season: number,
  week: number,
): Promise<number> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return 0;
  }

  const pendingResult = await databaseClient.execute(sql`
    SELECT
      id,
      player_name,
      player_team,
      player_position,
      pick_type,
      user_ppr_projection,
      model_ppr_projection
    FROM novapredict_user_challenge_picks
    WHERE novapredict_user_id = ${novapredictUserId}
      AND season = ${season}
      AND week = ${week}
      AND scored_at IS NULL
  `);

  let scoredCount = 0;

  for (const row of pendingResult.rows ?? []) {
    const pick = row as {
      id: string;
      player_name: string;
      player_team: string | null;
      player_position: string | null;
      pick_type: string;
      user_ppr_projection: string | null;
      model_ppr_projection: string;
    };

    if (!pick.player_team || !pick.player_position) {
      continue;
    }

    const actualPpr = await FetchNovaPredictPlayerActualPprForSlateWeekFromDatabase(
      pick.player_name,
      pick.player_team,
      pick.player_position,
      season,
      week,
    );

    if (actualPpr === null) {
      continue;
    }

    const userProjection =
      pick.pick_type === "override" && pick.user_ppr_projection !== null
        ? Number(pick.user_ppr_projection)
        : Number(pick.model_ppr_projection);

    const score = ComputeNovaPredictChallengePickScoreFromActual(
      userProjection,
      Number(pick.model_ppr_projection),
      actualPpr,
    );

    await databaseClient.execute(sql`
      UPDATE novapredict_user_challenge_picks
      SET
        actual_ppr = ${score.actualPpr},
        user_abs_error = ${score.userAbsError},
        model_abs_error = ${score.modelAbsError},
        user_beat_model = ${score.userBeatModel},
        scored_at = NOW()
      WHERE id = ${pick.id}
    `);

    scoredCount += 1;
  }

  return scoredCount;
}
