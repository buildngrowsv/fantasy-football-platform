#!/usr/bin/env bash
#
# setup-neon-env.sh
# -----------------
# Non-interactive Neon bootstrap for local development.
# Writes DATABASE_URL and Neon metadata to repo-root .env without interactive neonctl prompts.
#
# Why this script exists:
# The other agent's neonctl create hung on the org picker. This uses --org-id and --project-id
# flags so agents and CI can provision connection strings in one shot.
#
# Usage:
#   ./scripts/setup-neon-env.sh              # dev branch (default)
#   ./scripts/setup-neon-env.sh main           # production branch (use carefully)
#   ./scripts/setup-neon-env.sh staging

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"
EXAMPLE_FILE="$REPO_ROOT/.env.example"

NEON_ORG_ID="${NEON_ORG_ID:-org-flat-fire-88103782}"
NEON_PROJECT_ID="${NEON_PROJECT_ID:-patient-sunset-77985570}"
BRANCH_NAME="${1:-dev}"

echo "NovaPredict Neon setup — org=$NEON_ORG_ID project=$NEON_PROJECT_ID branch=$BRANCH_NAME"

if ! command -v npx >/dev/null 2>&1; then
  echo "ERROR: npx not found. Install Node.js first." >&2
  exit 1
fi

CONNECTION_STRING="$(
  npx neonctl@latest connection-string \
    --org-id "$NEON_ORG_ID" \
    --project-id "$NEON_PROJECT_ID" \
    --branch "$BRANCH_NAME" \
    --role-name neondb_owner \
    2>/dev/null | tail -n 1
)"

if [[ -z "$CONNECTION_STRING" || "$CONNECTION_STRING" != postgresql://* ]]; then
  echo "ERROR: Failed to fetch connection string for branch '$BRANCH_NAME'" >&2
  exit 1
fi

touch "$ENV_FILE"

upsert_env() {
  local key="$1"
  local value="$2"
  if grep -q "^${key}=" "$ENV_FILE" 2>/dev/null; then
    # macOS sed in-place
    sed -i '' "s|^${key}=.*|${key}=${value}|" "$ENV_FILE"
  else
    echo "${key}=${value}" >> "$ENV_FILE"
  fi
}

upsert_env "DATABASE_URL" "$CONNECTION_STRING"
upsert_env "NEON_ORG_ID" "$NEON_ORG_ID"
upsert_env "NEON_PROJECT_ID" "$NEON_PROJECT_ID"
upsert_env "NEON_BRANCH" "$BRANCH_NAME"

if [[ ! -f "$EXAMPLE_FILE" ]]; then
  cp "$REPO_ROOT/.env.example" "$EXAMPLE_FILE" 2>/dev/null || true
fi

echo "Wrote DATABASE_URL for branch '$BRANCH_NAME' to $ENV_FILE"
echo "Project: novapredict ($NEON_PROJECT_ID)"
echo "Branches available: main, dev, staging"
