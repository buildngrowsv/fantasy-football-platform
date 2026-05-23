-- NovaPredict core entities + nflverse raw storage (Phase 1b)
-- Bridges raw ingest snapshots into queryable tables the Next.js app reads.

CREATE TABLE IF NOT EXISTS nfl_teams (
  abbreviation text PRIMARY KEY,
  full_name text,
  conference text,
  division text,
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS nfl_games (
  id text PRIMARY KEY,
  season int NOT NULL,
  week int NOT NULL,
  season_type text NOT NULL DEFAULT 'REG',
  gameday date,
  away_team text NOT NULL,
  home_team text NOT NULL,
  source_provider text NOT NULL,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_nfl_games_season_week ON nfl_games (season, week, season_type);

CREATE TABLE IF NOT EXISTS weekly_team_matchups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season int NOT NULL,
  week int NOT NULL,
  team text NOT NULL,
  opponent text NOT NULL,
  is_home boolean NOT NULL DEFAULT false,
  matchup_label text NOT NULL,
  source_provider text NOT NULL,
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (season, week, team)
);

CREATE TABLE IF NOT EXISTS raw_nflverse_weekly_player_stats (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  nflverse_player_id text NOT NULL,
  player_name text NOT NULL,
  position text,
  team text,
  season int NOT NULL,
  week int NOT NULL,
  season_type text NOT NULL,
  opponent_team text,
  fantasy_points_ppr numeric(8, 2),
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_nflverse_weekly_run ON raw_nflverse_weekly_player_stats (ingest_run_id);
CREATE INDEX IF NOT EXISTS idx_raw_nflverse_weekly_player ON raw_nflverse_weekly_player_stats (nflverse_player_id, season, week);

CREATE TABLE IF NOT EXISTS raw_nflverse_games (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  game_id text NOT NULL,
  season int NOT NULL,
  week int NOT NULL,
  season_type text NOT NULL,
  away_team text NOT NULL,
  home_team text NOT NULL,
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_nflverse_games_run ON raw_nflverse_games (ingest_run_id);

CREATE TABLE IF NOT EXISTS raw_the_odds_api_events (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  event_id text NOT NULL,
  sport_key text NOT NULL,
  commence_time timestamptz,
  home_team text,
  away_team text,
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_odds_events_run ON raw_the_odds_api_events (ingest_run_id);

CREATE TABLE IF NOT EXISTS player_weekly_actuals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nflverse_player_id text NOT NULL,
  player_name text NOT NULL,
  position text NOT NULL,
  team text,
  season int NOT NULL,
  week int NOT NULL,
  season_type text NOT NULL DEFAULT 'REG',
  opponent_team text,
  fantasy_points_ppr numeric(8, 2) NOT NULL,
  source_provider text NOT NULL DEFAULT 'nflverse',
  updated_at timestamptz NOT NULL DEFAULT NOW(),
  UNIQUE (nflverse_player_id, season, week, season_type)
);

CREATE INDEX IF NOT EXISTS idx_player_weekly_actuals_lookup
  ON player_weekly_actuals (player_name, team, position, season, week);

-- App-facing tables (created if missing — seed-database.mjs may have already created them)
CREATE TABLE IF NOT EXISTS players (
  id text PRIMARY KEY,
  sleeper_id text NOT NULL,
  full_name text NOT NULL,
  position text NOT NULL,
  team text,
  espn_athlete_id text,
  headshot_url text,
  created_at timestamptz DEFAULT now()
);

CREATE TABLE IF NOT EXISTS player_projections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_id text NOT NULL,
  player_name text NOT NULL,
  position text NOT NULL,
  team text NOT NULL,
  opponent text NOT NULL,
  matchup_label text NOT NULL,
  season int NOT NULL,
  week int NOT NULL,
  vegas_ppr numeric(6, 2) NOT NULL,
  nova_ppr numeric(6, 2) NOT NULL,
  boom_probability numeric(5, 2) NOT NULL,
  bust_probability numeric(5, 2) NOT NULL,
  move_type text NOT NULL,
  updated_at timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_player_projections_player_season_week
  ON player_projections (player_id, season, week);

CREATE TABLE IF NOT EXISTS platform_metrics (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  season_accuracy numeric(5, 2) NOT NULL,
  sharp_hit_rate numeric(5, 2) NOT NULL,
  monte_carlo_runs int NOT NULL,
  published_record_rate numeric(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS accountability_calls (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  player_name text NOT NULL,
  position text NOT NULL,
  team text NOT NULL,
  projection numeric(6, 2) NOT NULL,
  actual numeric(6, 2) NOT NULL,
  classification text NOT NULL,
  diagnosis text NOT NULL,
  week int NOT NULL
);

CREATE TABLE IF NOT EXISTS expert_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  analyst_name text NOT NULL,
  source text NOT NULL,
  weekly_accuracy numeric(5, 2) NOT NULL,
  season_accuracy numeric(5, 2) NOT NULL,
  season_mae numeric(5, 2) NOT NULL
);

CREATE TABLE IF NOT EXISTS signal_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  signal_name text NOT NULL,
  weight_multiplier numeric(5, 2) NOT NULL,
  status text NOT NULL
);

CREATE TABLE IF NOT EXISTS league_connections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  provider text NOT NULL,
  external_league_id text NOT NULL,
  league_name text NOT NULL
);
