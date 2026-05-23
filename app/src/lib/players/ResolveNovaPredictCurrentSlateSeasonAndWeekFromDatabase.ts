/*
  ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase.ts
  ----------------------------------------------------------
  Reads the latest season/week from player_projections — the active slate context
  for Challenge picks and slate pages until we wire live kickoff lock times.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface NovaPredictCurrentSlateContextRecord {
  season: number;
  week: number;
}

export async function ResolveNovaPredictCurrentSlateSeasonAndWeekFromDatabase(): Promise<NovaPredictCurrentSlateContextRecord> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return { season: 2025, week: 1 };
  }

  const result = await databaseClient.execute(sql`
    SELECT season, week
    FROM player_projections
    ORDER BY season DESC, week DESC
    LIMIT 1
  `);

  const row = result.rows?.[0] as { season: number; week: number } | undefined;
  if (!row) {
    return { season: 2025, week: 1 };
  }

  return { season: Number(row.season), week: Number(row.week) };
}
