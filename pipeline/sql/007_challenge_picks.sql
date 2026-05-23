-- Challenge the Model user picks (agree / override) scoped per slate week

CREATE TABLE IF NOT EXISTS novapredict_user_challenge_picks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  novapredict_user_id uuid NOT NULL REFERENCES novapredict_users (id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_name text NOT NULL,
  season int NOT NULL,
  week int NOT NULL,
  pick_type text NOT NULL CHECK (pick_type IN ('agree', 'override')),
  user_ppr_projection numeric(6, 2),
  override_reason text,
  model_ppr_projection numeric(6, 2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_novapredict_user_challenge_pick_player_week
  ON novapredict_user_challenge_picks (novapredict_user_id, player_id, season, week);

CREATE INDEX IF NOT EXISTS idx_novapredict_user_challenge_picks_user_week
  ON novapredict_user_challenge_picks (novapredict_user_id, season, week);
