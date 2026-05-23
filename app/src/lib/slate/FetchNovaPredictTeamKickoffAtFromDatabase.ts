/*
  FetchNovaPredictTeamKickoffAtFromDatabase.ts
  --------------------------------------------
  Reads ESPN-derived kickoff timestamp for a team's slate week — used for pick locks.
*/

import { sql } from "drizzle-orm";

import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export async function FetchNovaPredictTeamKickoffAtFromDatabase(
  team: string,
  season: number,
  week: number,
): Promise<Date | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return null;
  }

  const result = await databaseClient.execute(sql`
    SELECT kickoff_at
    FROM weekly_team_matchups
    WHERE season = ${season}
      AND week = ${week}
      AND upper(team) = ${team.toUpperCase()}
    LIMIT 1
  `);

  const row = result.rows?.[0] as { kickoff_at: string | null } | undefined;
  if (!row?.kickoff_at) {
    return null;
  }

  return new Date(row.kickoff_at);
}
