/*
  FindNovaPredictUserChallengePickForPlayerWeekFromDatabase.ts
  ------------------------------------------------------------
  Single pick lookup for player card — shows whether user already agreed/overrode this week.
*/

import { sql } from "drizzle-orm";

import type { NovaPredictChallengePickType } from "@/lib/challenge/NovaPredictChallengePickConstants";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export async function FindNovaPredictUserChallengePickForPlayerWeekFromDatabase(
  novapredictUserId: string,
  playerId: string,
  season: number,
  week: number,
): Promise<{
  pickType: NovaPredictChallengePickType;
  userPprProjection: number | null;
  overrideReason: string | null;
} | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return null;
  }

  const result = await databaseClient.execute(sql`
    SELECT pick_type, user_ppr_projection, override_reason
    FROM novapredict_user_challenge_picks
    WHERE novapredict_user_id = ${novapredictUserId}
      AND player_id = ${playerId}
      AND season = ${season}
      AND week = ${week}
    LIMIT 1
  `);

  const row = result.rows?.[0] as
    | {
        pick_type: string;
        user_ppr_projection: string | null;
        override_reason: string | null;
      }
    | undefined;

  if (!row) {
    return null;
  }

  return {
    pickType: row.pick_type as NovaPredictChallengePickType,
    userPprProjection: row.user_ppr_projection === null ? null : Number(row.user_ppr_projection),
    overrideReason: row.override_reason,
  };
}
