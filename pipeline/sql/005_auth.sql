-- Email/password auth tables for NovaPredict web app (Cloudflare Worker + Neon sessions)

CREATE TABLE IF NOT EXISTS novapredict_users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL,
  password_hash text NOT NULL,
  display_name text,
  created_at timestamptz NOT NULL DEFAULT NOW(),
  updated_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS uq_novapredict_users_email_lower
  ON novapredict_users (lower(email));

CREATE TABLE IF NOT EXISTS novapredict_user_sessions (
  id text PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES novapredict_users (id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_novapredict_user_sessions_user_id
  ON novapredict_user_sessions (user_id);

CREATE INDEX IF NOT EXISTS idx_novapredict_user_sessions_expires
  ON novapredict_user_sessions (expires_at);
