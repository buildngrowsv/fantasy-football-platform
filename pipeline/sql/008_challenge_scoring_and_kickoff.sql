-- Challenge pick scoring + slate kickoff times for lock enforcement

ALTER TABLE weekly_team_matchups
  ADD COLUMN IF NOT EXISTS kickoff_at timestamptz;

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS player_team text;

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS player_position text;

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS actual_ppr numeric(6, 2);

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS user_abs_error numeric(6, 2);

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS model_abs_error numeric(6, 2);

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS user_beat_model boolean;

ALTER TABLE novapredict_user_challenge_picks
  ADD COLUMN IF NOT EXISTS scored_at timestamptz;

CREATE INDEX IF NOT EXISTS idx_weekly_team_matchups_kickoff
  ON weekly_team_matchups (season, week, kickoff_at);
