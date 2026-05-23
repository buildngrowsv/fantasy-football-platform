-- Apify Browser supplement tables (Phase 1b)
-- Stores multi-book odds from harvest/sportsbook-odds-scraper and generic browser fetch audit rows.

CREATE TABLE IF NOT EXISTS raw_apify_harvest_sportsbook_odds (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  matchup_key text NOT NULL,
  home_team_abbr text,
  away_team_abbr text,
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_apify_harvest_odds_run
  ON raw_apify_harvest_sportsbook_odds (ingest_run_id);

CREATE INDEX IF NOT EXISTS idx_raw_apify_harvest_odds_matchup
  ON raw_apify_harvest_sportsbook_odds (matchup_key);
