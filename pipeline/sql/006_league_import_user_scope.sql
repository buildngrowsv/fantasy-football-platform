-- League import scoped to NovaPredict accounts (Sleeper first, ESPN and Yahoo later)

ALTER TABLE league_connections
  ADD COLUMN IF NOT EXISTS novapredict_user_id uuid REFERENCES novapredict_users (id) ON DELETE CASCADE;

ALTER TABLE league_connections
  ADD COLUMN IF NOT EXISTS sleeper_user_id text;

ALTER TABLE league_connections
  ADD COLUMN IF NOT EXISTS sleeper_username text;

ALTER TABLE league_connections
  ADD COLUMN IF NOT EXISTS season int NOT NULL DEFAULT 2025;

ALTER TABLE league_connections
  ADD COLUMN IF NOT EXISTS connected_at timestamptz NOT NULL DEFAULT NOW();

CREATE UNIQUE INDEX IF NOT EXISTS uq_league_connections_user_provider_league
  ON league_connections (novapredict_user_id, provider, external_league_id)
  WHERE novapredict_user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_league_connections_user_id
  ON league_connections (novapredict_user_id);
