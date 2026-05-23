/*
  FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase.ts
  ---------------------------------------------------------
  Returns real nflverse PPR weekly scores for the player card performance chart.

  Uses name+team+position crosswalk (same as pipeline accountability backtest).
  Defaults to the latest season present in player_weekly_actuals (2024 today).
*/

import { sql } from "drizzle-orm";

import { NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON } from "@/lib/constants/NovaPredictNflSeasonConstants";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";
import { BuildNovaPredictPlayerIdentityCrosswalkKey } from "@/lib/players/BuildNovaPredictPlayerIdentityCrosswalkKey";

export interface NovaPredictPlayerWeeklyActualRecord {
  season: number;
  week: number;
  fantasyPointsPpr: number;
  opponentTeam: string | null;
}

export async function FetchNovaPredictPlayerWeeklyActualsHistoryFromDatabase(
  fullName: string,
  team: string,
  position: string,
  limit = 10,
  season = NOVA_PREDICT_ACCOUNTABILITY_BACKTEST_SEASON,
): Promise<NovaPredictPlayerWeeklyActualRecord[]> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return [];
  }

  const crosswalkKey = BuildNovaPredictPlayerIdentityCrosswalkKey(fullName, team, position);
  const [namePart, teamPart, positionPart] = crosswalkKey.split("|");

  const result = await databaseClient.execute(sql`
    SELECT season, week, fantasy_points_ppr, opponent_team
    FROM player_weekly_actuals
    WHERE season = ${season}
      AND season_type = 'REG'
      AND lower(player_name) = ${namePart}
      AND lower(COALESCE(team, '')) = ${teamPart}
      AND lower(COALESCE(position, '')) = ${positionPart}
    ORDER BY week DESC
    LIMIT ${limit}
  `);

  return (result.rows ?? []).map((row) => {
    const record = row as {
      season: number;
      week: number;
      fantasy_points_ppr: string | number;
      opponent_team: string | null;
    };

    return {
      season: Number(record.season),
      week: Number(record.week),
      fantasyPointsPpr: Number(record.fantasy_points_ppr),
      opponentTeam: record.opponent_team,
    };
  });
}
