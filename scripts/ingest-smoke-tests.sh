#!/usr/bin/env bash
#
# ingest-smoke-tests.sh
# ---------------------
# Live endpoint smoke tests from documentation/data-source-research.md.
# Does NOT write mock data — only verifies external APIs respond.
#
# Usage: ./scripts/ingest-smoke-tests.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$REPO_ROOT/.env"

if [[ -f "$ENV_FILE" ]]; then
  set -a
  # shellcheck disable=SC1090
  source "$ENV_FILE"
  set +a
fi

pass=0
fail=0

check() {
  local name="$1"
  shift
  echo ""
  echo "=== $name ==="
  if "$@"; then
    echo "PASS: $name"
    pass=$((pass + 1))
  else
    echo "FAIL: $name"
    fail=$((fail + 1))
  fi
}

smoke_sleeper_players() {
  python3 - <<'PY'
import json, urllib.request
with urllib.request.urlopen("https://api.sleeper.app/v1/players/nfl", timeout=60) as r:
    data = json.load(r)
print(f"Sleeper players: {len(data)}")
assert len(data) > 10000
PY
}

smoke_espn_scoreboard() {
  python3 - <<'PY'
import json, urllib.request
url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"
with urllib.request.urlopen(url, timeout=30) as r:
    data = json.load(r)
events = data.get("events", [])
print(f"ESPN scoreboard events: {len(events)}")
assert isinstance(events, list)
PY
}

smoke_espn_news() {
  python3 - <<'PY'
import json, urllib.request
url = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=5"
with urllib.request.urlopen(url, timeout=30) as r:
    data = json.load(r)
articles = data.get("articles", [])
print(f"ESPN news articles: {len(articles)}")
assert len(articles) >= 1
PY
}

smoke_odds_api_endpoint() {
  python3 - <<'PY'
import json, urllib.error, urllib.request
url = "https://api.the-odds-api.com/v4/sports?apiKey=invalid_smoke_test"
try:
    with urllib.request.urlopen(url, timeout=20) as r:
        body = r.read().decode()
except urllib.error.HTTPError as exc:
    body = exc.read().decode()
data = json.loads(body)
print(f"Odds API response keys: {list(data.keys())}")
assert "error_code" in data or "message" in data
PY
}

smoke_apify_auth() {
  if [[ -z "${APIFY_API_TOKEN:-}" ]]; then
    echo "SKIP: APIFY_API_TOKEN not set"
    return 0
  fi
  python3 - <<PY
import json, os, urllib.request
token = os.environ["APIFY_API_TOKEN"]
req = urllib.request.Request(
    "https://api.apify.com/v2/users/me",
    headers={"Authorization": f"Bearer {token}"},
)
with urllib.request.urlopen(req, timeout=20) as r:
    data = json.load(r)
username = data.get("data", {}).get("username", "?")
print(f"Apify user: {username}")
PY
}

smoke_neon_database() {
  if [[ -z "${DATABASE_URL:-}" ]]; then
    echo "SKIP: DATABASE_URL not set — run ./scripts/setup-neon-env.sh first"
    return 0
  fi
  PYTHON_BIN="${REPO_ROOT}/pipeline/.venv/bin/python"
  if [[ ! -x "$PYTHON_BIN" ]]; then
    PYTHON_BIN="python3"
  fi
  "$PYTHON_BIN" - <<'PY'
import os
import psycopg
with psycopg.connect(os.environ["DATABASE_URL"]) as conn:
    row = conn.execute("SELECT current_database(), current_user").fetchone()
print(f"Neon connected: db={row[0]} user={row[1]}")
PY
}

check "Sleeper NFL player catalog" smoke_sleeper_players
check "ESPN NFL scoreboard" smoke_espn_scoreboard
check "ESPN NFL news" smoke_espn_news
check "The Odds API endpoint live" smoke_odds_api_endpoint
check "Apify auth" smoke_apify_auth
check "Neon DATABASE_URL" smoke_neon_database

echo ""
echo "Smoke test summary: $pass passed, $fail failed"
[[ "$fail" -eq 0 ]]
