/*
  UpsertNovaPredictSleeperLeagueConnectionForUserIntoDatabase.ts
  --------------------------------------------------------------
  Persists a Sleeper league link for the authenticated NovaPredict user.

  Uses ON CONFLICT on (user, provider, external_league_id) so re-import is idempotent.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface UpsertNovaPredictSleeperLeagueConnectionPayload {
  novapredictUserId: string;
  sleeperUserId: string;
  sleeperUsername: string;
  externalLeagueId: string;
  leagueName: string;
  season: number;
}

export async function UpsertNovaPredictSleeperLeagueConnectionForUserIntoDatabase(
  payload: UpsertNovaPredictSleeperLeagueConnectionPayload,
): Promise<{ id: string }> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    throw new Error("Database unavailable");
  }

  const existingResult = await databaseClient.execute(sql`
    SELECT id
    FROM league_connections
    WHERE novapredict_user_id = ${payload.novapredictUserId}
      AND provider = 'Sleeper'
      AND external_league_id = ${payload.externalLeagueId}
    LIMIT 1
  `);

  const existingRow = existingResult.rows?.[0] as { id: string } | undefined;

  if (existingRow) {
    const updateResult = await databaseClient.execute(sql`
      UPDATE league_connections
      SET
        league_name = ${payload.leagueName},
        sleeper_user_id = ${payload.sleeperUserId},
        sleeper_username = ${payload.sleeperUsername},
        season = ${payload.season},
        connected_at = NOW()
      WHERE id = ${existingRow.id}
      RETURNING id
    `);

    const updatedRow = updateResult.rows?.[0] as { id: string } | undefined;
    if (!updatedRow) {
      throw new Error("Failed to update league connection");
    }

    return { id: updatedRow.id };
  }

  const insertResult = await databaseClient.execute(sql`
    INSERT INTO league_connections (
      provider,
      external_league_id,
      league_name,
      novapredict_user_id,
      sleeper_user_id,
      sleeper_username,
      season
    ) VALUES (
      'Sleeper',
      ${payload.externalLeagueId},
      ${payload.leagueName},
      ${payload.novapredictUserId},
      ${payload.sleeperUserId},
      ${payload.sleeperUsername},
      ${payload.season}
    )
    RETURNING id
  `);

  const insertedRow = insertResult.rows?.[0] as { id: string } | undefined;
  if (!insertedRow) {
    throw new Error("Failed to persist league connection");
  }

  return { id: insertedRow.id };
}
