/*
  ListNovaPredictUserChallengePicksForWeekFromDatabase.ts
  -------------------------------------------------------
  Loads a user's Challenge picks for the active slate week (Challenge board + player card status).
*/

import { sql } from "drizzle-orm";

import type {
  NovaPredictChallengePickScoreStatus,
  NovaPredictChallengePickType,
} from "@/lib/challenge/NovaPredictChallengePickConstants";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface NovaPredictUserChallengePickRecord {
  id: string;
  playerId: string;
  playerName: string;
  playerTeam: string | null;
  playerPosition: string | null;
  season: number;
  week: number;
  pickType: NovaPredictChallengePickType;
  userPprProjection: number | null;
  overrideReason: string | null;
  modelPprProjection: number;
  scoreStatus: NovaPredictChallengePickScoreStatus;
  actualPpr: number | null;
  userAbsError: number | null;
  modelAbsError: number | null;
  userBeatModel: boolean | null;
}

export async function ListNovaPredictUserChallengePicksForWeekFromDatabase(
  novapredictUserId: string,
  season: number,
  week: number,
): Promise<NovaPredictUserChallengePickRecord[]> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return [];
  }

  const result = await databaseClient.execute(sql`
    SELECT
      id,
      player_id,
      player_name,
      player_team,
      player_position,
      season,
      week,
      pick_type,
      user_ppr_projection,
      override_reason,
      model_ppr_projection,
      actual_ppr,
      user_abs_error,
      model_abs_error,
      user_beat_model,
      scored_at
    FROM novapredict_user_challenge_picks
    WHERE novapredict_user_id = ${novapredictUserId}
      AND season = ${season}
      AND week = ${week}
    ORDER BY updated_at DESC
  `);

  return (result.rows ?? []).map((row) => {
    const record = row as {
      id: string;
      player_id: string;
      player_name: string;
      player_team: string | null;
      player_position: string | null;
      season: number;
      week: number;
      pick_type: string;
      user_ppr_projection: string | null;
      override_reason: string | null;
      model_ppr_projection: string;
      actual_ppr: string | null;
      user_abs_error: string | null;
      model_abs_error: string | null;
      user_beat_model: boolean | null;
      scored_at: string | null;
    };

    return {
      id: record.id,
      playerId: record.player_id,
      playerName: record.player_name,
      playerTeam: record.player_team,
      playerPosition: record.player_position,
      season: Number(record.season),
      week: Number(record.week),
      pickType: record.pick_type as NovaPredictChallengePickType,
      userPprProjection: record.user_ppr_projection === null ? null : Number(record.user_ppr_projection),
      overrideReason: record.override_reason,
      modelPprProjection: Number(record.model_ppr_projection),
      scoreStatus: record.scored_at ? "scored" : "pending",
      actualPpr: record.actual_ppr === null ? null : Number(record.actual_ppr),
      userAbsError: record.user_abs_error === null ? null : Number(record.user_abs_error),
      modelAbsError: record.model_abs_error === null ? null : Number(record.model_abs_error),
      userBeatModel: record.user_beat_model,
    };
  });
}
