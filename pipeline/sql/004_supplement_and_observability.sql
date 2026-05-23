-- Supplement ingest tables + pipeline observability (no paid keys required to migrate)

CREATE TABLE IF NOT EXISTS raw_apify_draftkings_events (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  event_id text NOT NULL,
  event_name text NOT NULL,
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_raw_apify_dk_run ON raw_apify_draftkings_events (ingest_run_id);

CREATE TABLE IF NOT EXISTS raw_weather_forecasts (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  team_abbreviation text NOT NULL,
  latitude numeric(9, 6) NOT NULL,
  longitude numeric(9, 6) NOT NULL,
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS raw_injury_reports (
  id bigserial PRIMARY KEY,
  ingest_run_id uuid NOT NULL REFERENCES ingest_runs (id) ON DELETE CASCADE,
  external_player_id text,
  payload jsonb NOT NULL,
  pulled_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS pipeline_run_summaries (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  orchestrator_name text NOT NULL,
  started_at timestamptz NOT NULL DEFAULT NOW(),
  finished_at timestamptz,
  status text NOT NULL CHECK (status IN ('running', 'success', 'failed')),
  stage_results jsonb NOT NULL DEFAULT '{}'::jsonb,
  error_message text
);

CREATE INDEX IF NOT EXISTS idx_pipeline_run_summaries_started
  ON pipeline_run_summaries (started_at DESC);

CREATE OR REPLACE VIEW pipeline_ingest_health AS
SELECT
  job_name,
  source_provider,
  status,
  row_count,
  started_at,
  finished_at,
  error_message
FROM ingest_runs
ORDER BY started_at DESC;
