/*
  FetchNovaPredictPlayerActualPprForSlateWeekFromDatabase.ts
  ----------------------------------------------------------
  Single-week actual lookup for Challenge pick scoring after games finish.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import { BuildNovaPredictPlayerIdentityCrosswalkKey } from "@/lib/players/BuildNovaPredictPlayerIdentityCrosswalkKey";

export async function FetchNovaPredictPlayerActualPprForSlateWeekFromDatabase(
  playerName: string,
  team: string,
  position: string,
  season: number,
  week: number,
): Promise<number | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return null;
  }

  const crosswalkKey = BuildNovaPredictPlayerIdentityCrosswalkKey(playerName, team, position);
  const [namePart, teamPart, positionPart] = crosswalkKey.split("|");

  const result = await databaseClient.execute(sql`
    SELECT fantasy_points_ppr
    FROM player_weekly_actuals
    WHERE season = ${season}
      AND week = ${week}
      AND season_type = 'REG'
      AND lower(player_name) = ${namePart}
      AND lower(COALESCE(team, '')) = ${teamPart}
      AND lower(COALESCE(position, '')) = ${positionPart}
    LIMIT 1
  `);

  const row = result.rows?.[0] as { fantasy_points_ppr: string | number } | undefined;
  if (!row) {
    return null;
  }

  return Number(row.fantasy_points_ppr);
}
