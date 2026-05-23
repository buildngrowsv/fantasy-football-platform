/*
  ListNovaPredictLeagueConnectionsForUserFromDatabase.ts
  ------------------------------------------------------
  Returns persisted league_connections rows for the signed-in NovaPredict user.

  Called by /import page and GET /api/league-import/connections.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import type { NovaPredictLeagueConnectionRecord } from "@/lib/db/schema";

export async function ListNovaPredictLeagueConnectionsForUserFromDatabase(
  novapredictUserId: string,
): Promise<NovaPredictLeagueConnectionRecord[]> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return [];
  }

  const result = await databaseClient.execute(sql`
    SELECT
      id,
      provider,
      external_league_id,
      league_name,
      season,
      sleeper_username,
      connected_at
    FROM league_connections
    WHERE novapredict_user_id = ${novapredictUserId}
    ORDER BY connected_at DESC
  `);

  return (result.rows ?? []).map((row) => {
    const record = row as {
      id: string;
      provider: string;
      external_league_id: string;
      league_name: string;
      season: number;
      sleeper_username: string | null;
      connected_at: string;
    };

    return {
      id: record.id,
      provider: record.provider as NovaPredictLeagueConnectionRecord["provider"],
      externalLeagueId: record.external_league_id,
      leagueName: record.league_name,
      season: Number(record.season),
      sleeperUsername: record.sleeper_username,
      connectedAt: new Date(record.connected_at),
    };
  });
}
