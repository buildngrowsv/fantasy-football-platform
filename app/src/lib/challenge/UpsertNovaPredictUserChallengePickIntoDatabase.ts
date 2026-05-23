/*
  UpsertNovaPredictUserChallengePickIntoDatabase.ts
  -------------------------------------------------
  Persists agree/override picks for Challenge the Model — one row per user/player/week.
*/

import { sql } from "drizzle-orm";

import type { NovaPredictChallengePickType } from "@/lib/challenge/NovaPredictChallengePickConstants";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface UpsertNovaPredictUserChallengePickPayload {
  novapredictUserId: string;
  playerId: string;
  playerName: string;
  playerTeam: string;
  playerPosition: string;
  season: number;
  week: number;
  pickType: NovaPredictChallengePickType;
  modelPprProjection: number;
  userPprProjection: number | null;
  overrideReason: string | null;
}

export async function UpsertNovaPredictUserChallengePickIntoDatabase(
  payload: UpsertNovaPredictUserChallengePickPayload,
): Promise<{ id: string }> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    throw new Error("Database unavailable");
  }

  const result = await databaseClient.execute(sql`
    INSERT INTO novapredict_user_challenge_picks (
      novapredict_user_id,
      player_id,
      player_name,
      player_team,
      player_position,
      season,
      week,
      pick_type,
      user_ppr_projection,
      override_reason,
      model_ppr_projection
    ) VALUES (
      ${payload.novapredictUserId},
      ${payload.playerId},
      ${payload.playerName},
      ${payload.playerTeam},
      ${payload.playerPosition},
      ${payload.season},
      ${payload.week},
      ${payload.pickType},
      ${payload.userPprProjection},
      ${payload.overrideReason},
      ${payload.modelPprProjection}
    )
    ON CONFLICT (novapredict_user_id, player_id, season, week)
    DO UPDATE SET
      pick_type = EXCLUDED.pick_type,
      player_name = EXCLUDED.player_name,
      player_team = EXCLUDED.player_team,
      player_position = EXCLUDED.player_position,
      user_ppr_projection = EXCLUDED.user_ppr_projection,
      override_reason = EXCLUDED.override_reason,
      model_ppr_projection = EXCLUDED.model_ppr_projection,
      actual_ppr = NULL,
      user_abs_error = NULL,
      model_abs_error = NULL,
      user_beat_model = NULL,
      scored_at = NULL,
      updated_at = NOW()
    RETURNING id
  `);

  const row = result.rows?.[0] as { id: string } | undefined;
  if (!row) {
    throw new Error("Failed to save challenge pick");
  }

  return { id: row.id };
}
