-- Align app-facing tables created by earlier seeds with current schema.

ALTER TABLE players ADD COLUMN IF NOT EXISTS espn_athlete_id text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS headshot_url text;
ALTER TABLE players ADD COLUMN IF NOT EXISTS created_at timestamptz DEFAULT now();

ALTER TABLE player_projections ADD COLUMN IF NOT EXISTS updated_at timestamptz DEFAULT now();
