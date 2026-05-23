/*
  FetchNovaPredictEarliestSlateKickoffLockFromDatabase.ts
  -------------------------------------------------------
  Finds the soonest lock time across all teams in the active slate — powers header countdown.
*/

import { sql } from "drizzle-orm";

import { NOVA_PREDICT_CHALLENGE_LOCK_MINUTES_BEFORE_KICKOFF } from "@/lib/challenge/NovaPredictChallengePickConstants";
import { getNovaPredictDatabaseClient } from "@/lib/db/client";

export interface NovaPredictEarliestSlateKickoffLockRecord {
  season: number;
  week: number;
  kickoffAt: Date | null;
  lockAt: Date | null;
}

export async function FetchNovaPredictEarliestSlateKickoffLockFromDatabase(): Promise<NovaPredictEarliestSlateKickoffLockRecord | null> {
  const databaseClient = getNovaPredictDatabaseClient();
  if (!databaseClient) {
    return null;
  }

  const result = await databaseClient.execute(sql`
    SELECT season, week, kickoff_at
    FROM weekly_team_matchups
    WHERE kickoff_at IS NOT NULL
      AND kickoff_at > NOW() - INTERVAL '1 day'
    ORDER BY kickoff_at ASC
    LIMIT 1
  `);

  const row = result.rows?.[0] as { season: number; week: number; kickoff_at: string } | undefined;
  if (!row?.kickoff_at) {
    return null;
  }

  const kickoffAt = new Date(row.kickoff_at);
  const lockAt = new Date(kickoffAt.getTime() - NOVA_PREDICT_CHALLENGE_LOCK_MINUTES_BEFORE_KICKOFF * 60 * 1000);

  return {
    season: Number(row.season),
    week: Number(row.week),
    kickoffAt,
    lockAt,
  };
}
