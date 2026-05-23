-- NovaPredict ingestion foundation (Phase 1)
-- Applied by pipeline/ApplyNovaPredictIngestionSqlMigrations.py
-- Keeps raw provider payloads auditable before normalization into core entities.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS ingest_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_name TEXT NOT NULL,
  source_provider TEXT NOT NULL,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  finished_at TIMESTAMPTZ,
  status TEXT NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  row_count INTEGER,
  error_message TEXT,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS idx_ingest_runs_job_started
  ON ingest_runs (job_name, started_at DESC);

CREATE TABLE IF NOT EXISTS raw_espn_scoreboard_events (
  id BIGSERIAL PRIMARY KEY,
  ingest_run_id UUID NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  event_id TEXT NOT NULL,
  event_name TEXT NOT NULL,
  payload JSONB NOT NULL,
  pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_espn_scoreboard_run
  ON raw_espn_scoreboard_events (ingest_run_id);

CREATE TABLE IF NOT EXISTS raw_espn_news_articles (
  id BIGSERIAL PRIMARY KEY,
  ingest_run_id UUID NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  article_id TEXT NOT NULL,
  headline TEXT NOT NULL,
  payload JSONB NOT NULL,
  pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_espn_news_run
  ON raw_espn_news_articles (ingest_run_id);

CREATE TABLE IF NOT EXISTS raw_sleeper_player_catalog_snapshots (
  id BIGSERIAL PRIMARY KEY,
  ingest_run_id UUID NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  sleeper_player_id TEXT NOT NULL,
  full_name TEXT,
  position TEXT,
  team TEXT,
  payload JSONB NOT NULL,
  pulled_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_sleeper_snapshots_run
  ON raw_sleeper_player_catalog_snapshots (ingest_run_id);

CREATE INDEX IF NOT EXISTS idx_raw_sleeper_snapshots_player
  ON raw_sleeper_player_catalog_snapshots (sleeper_player_id);
