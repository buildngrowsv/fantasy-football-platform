#!/usr/bin/env node
/**
 * Seeds Neon with real Sleeper NFL players + ESPN schedule matchups,
 * then computes deterministic weekly projections for the NovaPredict engine demo.
 *
 * Run: DATABASE_URL=... node scripts/seed-database.mjs
 */
import { neon } from "@neondatabase/serverless";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL required");
  process.exit(1);
}

const sql = neon(DATABASE_URL);
const SEASON = 2025;
const WEEK = 1;

function stableHash(input) {
  let hash = 0;
  for (let i = 0; i < input.length; i += 1) {
    hash = (hash * 31 + input.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function positionBaseline(position) {
  if (position === "QB") return 22.5;
  if (position === "RB") return 15.2;
  if (position === "WR") return 13.8;
  if (position === "TE") return 10.4;
  return 8;
}

function computeProjection(player) {
  const hash = stableHash(player.id);
  const base = positionBaseline(player.position);
  const vegas = base * (0.82 + (hash % 28) / 100);
  const sauceMultiplier = 1 + ((hash % 17) - 6) / 100;
  const nova = vegas * sauceMultiplier;
  const boom = Math.min(55, Math.max(18, 28 + (hash % 22)));
  const bust = Math.max(6, 18 - (hash % 10));
  const signals = ["Sharp steam detected", "High-total accelerator", "Public fade opportunity", "Injury-correlated move", "Weather-adjusted ceiling"];
  return {
    vegas: Number(vegas.toFixed(1)),
    nova: Number(nova.toFixed(1)),
    boom,
    bust,
    signal: signals[hash % signals.length],
  };
}

async function fetchJson(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed ${url}: ${response.status}`);
  return response.json();
}

function buildHeadshotUrl(espnId) {
  if (!espnId) return null;
  return `https://a.espncdn.com/i/headshots/nfl/players/full/${espnId}.png`;
}

function resolveEspnAthleteId(player) {
  if (player?.espn_id) return String(player.espn_id);
  return null;
}

async function main() {
  console.log("Fetching Sleeper players...");
  const sleeperPlayers = await fetchJson("https://api.sleeper.app/v1/players/nfl");

  const fantasyPlayers = Object.values(sleeperPlayers)
    .filter((player) => player && player.active && player.team && ["QB", "RB", "WR", "TE"].includes(player.position))
    .sort((a, b) => stableHash(b.player_id) - stableHash(a.player_id))
    .slice(0, 80);

  console.log(`Selected ${fantasyPlayers.length} active fantasy players`);

  console.log("Fetching ESPN NFL scoreboard for matchups...");
  const scoreboard = await fetchJson("https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard");
  const teamOpponent = {};
  for (const event of scoreboard.events ?? []) {
    const comp = event.competitions?.[0];
    if (!comp) continue;
    const home = comp.competitors?.find((c) => c.homeAway === "home")?.team?.abbreviation;
    const away = comp.competitors?.find((c) => c.homeAway === "away")?.team?.abbreviation;
    if (home && away) {
      teamOpponent[home] = away;
      teamOpponent[away] = home;
    }
  }

  console.log("Resetting tables...");
  await sql`DROP TABLE IF EXISTS league_connections, signal_weights, expert_comparisons, accountability_calls, platform_metrics, player_projections, players CASCADE`;

  await sql`
    CREATE TABLE players (
      id text PRIMARY KEY,
      sleeper_id text NOT NULL,
      full_name text NOT NULL,
      position text NOT NULL,
      team text,
      espn_athlete_id text,
      headshot_url text,
      created_at timestamptz DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE player_projections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      player_id text NOT NULL,
      player_name text NOT NULL,
      position text NOT NULL,
      team text NOT NULL,
      opponent text NOT NULL,
      matchup_label text NOT NULL,
      season int NOT NULL,
      week int NOT NULL,
      vegas_ppr numeric(6,2) NOT NULL,
      nova_ppr numeric(6,2) NOT NULL,
      boom_probability numeric(5,2) NOT NULL,
      bust_probability numeric(5,2) NOT NULL,
      move_type text NOT NULL,
      updated_at timestamptz DEFAULT now()
    )
  `;
  await sql`
    CREATE TABLE platform_metrics (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      season_accuracy numeric(5,2) NOT NULL,
      sharp_hit_rate numeric(5,2) NOT NULL,
      monte_carlo_runs int NOT NULL,
      published_record_rate numeric(5,2) NOT NULL
    )
  `;
  await sql`
    CREATE TABLE accountability_calls (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      player_name text NOT NULL,
      position text NOT NULL,
      team text NOT NULL,
      projection numeric(6,2) NOT NULL,
      actual numeric(6,2) NOT NULL,
      classification text NOT NULL,
      diagnosis text NOT NULL,
      week int NOT NULL
    )
  `;
  await sql`
    CREATE TABLE expert_comparisons (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      analyst_name text NOT NULL,
      source text NOT NULL,
      weekly_accuracy numeric(5,2) NOT NULL,
      season_accuracy numeric(5,2) NOT NULL,
      season_mae numeric(5,2) NOT NULL
    )
  `;
  await sql`
    CREATE TABLE signal_weights (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      signal_name text NOT NULL,
      weight_multiplier numeric(5,2) NOT NULL,
      status text NOT NULL
    )
  `;
  await sql`
    CREATE TABLE league_connections (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      provider text NOT NULL,
      external_league_id text NOT NULL,
      league_name text NOT NULL
    )
  `;

  for (const player of fantasyPlayers) {
    const espnAthleteId = resolveEspnAthleteId(player);
    const headshotUrl = buildHeadshotUrl(espnAthleteId);

    await sql`
      INSERT INTO players (id, sleeper_id, full_name, position, team, espn_athlete_id, headshot_url)
      VALUES (${player.player_id}, ${player.player_id}, ${player.full_name ?? `${player.first_name} ${player.last_name}`}, ${player.position}, ${player.team}, ${espnAthleteId}, ${headshotUrl})
    `;

    const opponent = teamOpponent[player.team] ?? "TBD";
    const matchupLabel = opponent === "TBD" ? `${player.team} matchup pending` : `${player.team} vs ${opponent}`;
    const projection = computeProjection({ id: player.player_id, position: player.position });

    await sql`
      INSERT INTO player_projections (
        player_id, player_name, position, team, opponent, matchup_label,
        season, week, vegas_ppr, nova_ppr, boom_probability, bust_probability, move_type
      ) VALUES (
        ${player.player_id},
        ${player.full_name ?? `${player.first_name} ${player.last_name}`},
        ${player.position},
        ${player.team},
        ${opponent},
        ${matchupLabel},
        ${SEASON},
        ${WEEK},
        ${projection.vegas},
        ${projection.nova},
        ${projection.boom},
        ${projection.bust},
        ${projection.signal}
      )
    `;
  }

  await sql`
    INSERT INTO platform_metrics (season_accuracy, sharp_hit_rate, monte_carlo_runs, published_record_rate)
    VALUES (71.8, 82.0, 10000, 100.0)
  `;

  const topProjections = fantasyPlayers.slice(0, 6);
  for (const player of topProjections) {
    const projection = computeProjection({ id: player.player_id, position: player.position });
    const actual = projection.nova + ((stableHash(player.player_id) % 7) - 3);
    const classification = Math.abs(actual - projection.nova) <= 2.5 ? "correct" : "miss";
    await sql`
      INSERT INTO accountability_calls (player_name, position, team, projection, actual, classification, diagnosis, week)
      VALUES (
        ${player.full_name ?? `${player.first_name} ${player.last_name}`},
        ${player.position},
        ${player.team},
        ${projection.nova},
        ${Number(actual.toFixed(1))},
        ${classification},
        ${classification === "correct" ? "Sharp steam signal held through close." : "Game script variance exceeded modeled range."},
        ${WEEK}
      )
    `;
  }

  await sql`
    INSERT INTO expert_comparisons (analyst_name, source, weekly_accuracy, season_accuracy, season_mae) VALUES
    ('NovaPredict', 'Model', 76.9, 71.8, 6.24),
    ('FantasyPros Consensus', 'Consensus', 71.4, 67.2, 7.08),
    ('DraftSharks', 'Analyst', 69.9, 66.1, 7.34),
    ('ESPN ECR', 'Consensus', 68.5, 65.4, 7.52)
  `;

  await sql`
    INSERT INTO signal_weights (signal_name, weight_multiplier, status) VALUES
    ('Sharp Steam', 1.00, 'active'),
    ('Injury-Driven Move', 1.00, 'active'),
    ('Public Action', 0.15, 'suppressed'),
    ('Weather Move', 0.60, 'experimental'),
    ('Reverse Line Movement', 0.85, 'active')
  `;

  console.log("Seed complete.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
