#!/usr/bin/env node
/**
 * Backfills weekly_team_matchups.kickoff_at from raw ESPN scoreboard payloads.
 */
import { neon } from "@neondatabase/serverless";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const sql = neon(databaseUrl);

const eventRows = await sql.query(`
  SELECT payload
  FROM raw_espn_scoreboard_events
  ORDER BY pulled_at DESC
  LIMIT 64
`);

let updated = 0;

for (const row of eventRows) {
  const payload = row.payload;
  if (!payload || typeof payload !== "object") {
    continue;
  }

  const season = Number(payload.season?.year ?? 2025);
  const week = Number(payload.week?.number ?? 1);
  const competition = payload.competitions?.[0];
  const kickoffAt = competition?.date ? new Date(competition.date).toISOString() : null;

  if (!kickoffAt) {
    continue;
  }

  const competitors = competition.competitors ?? [];
  let homeTeam = null;
  let awayTeam = null;

  for (const competitor of competitors) {
    const abbreviation = competitor.team?.abbreviation;
    if (!abbreviation) {
      continue;
    }
    if (competitor.homeAway === "home") {
      homeTeam = abbreviation;
    } else if (competitor.homeAway === "away") {
      awayTeam = abbreviation;
    }
  }

  for (const team of [homeTeam, awayTeam].filter(Boolean)) {
    await sql.query(
      `
      UPDATE weekly_team_matchups
      SET kickoff_at = $1, updated_at = NOW()
      WHERE season = $2 AND week = $3 AND upper(team) = upper($4)
      `,
      [kickoffAt, season, week, team],
    );
    updated += 1;
  }
}

console.log(`Backfilled kickoff_at on ${updated} team rows from ESPN scoreboard`);
