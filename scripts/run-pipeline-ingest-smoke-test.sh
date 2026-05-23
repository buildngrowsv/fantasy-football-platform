#!/usr/bin/env bash
#
# run-pipeline-ingest-smoke-test.sh
# ---------------------------------
# Applies SQL migrations, then runs free-tier ingest jobs against Neon dev branch.
#
# Usage: ./scripts/run-pipeline-ingest-smoke-test.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIPELINE_DIR="$REPO_ROOT/pipeline"
VENV_DIR="$PIPELINE_DIR/.venv"

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "No .env found — running setup-neon-env.sh for dev branch..."
  bash "$REPO_ROOT/scripts/setup-neon-env.sh" dev
fi

set -a
# shellcheck disable=SC1090
source "$REPO_ROOT/.env"
set +a

if [[ ! -d "$VENV_DIR" ]]; then
  echo "Creating Python venv at $VENV_DIR"
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
pip install -q -r "$PIPELINE_DIR/requirements.txt"

cd "$PIPELINE_DIR"

echo "Applying SQL migrations..."
python ApplyNovaPredictIngestionSqlMigrations.py

echo ""
echo "Running ESPN scoreboard ingest..."
python ingest/FetchEspnNflScoreboardIngestJob.py

echo ""
echo "Running ESPN news ingest..."
python ingest/FetchEspnNflNewsHeadlinesIngestJob.py

echo ""
echo "Running Sleeper player catalog ingest (this may take ~30s)..."
python ingest/FetchSleeperNflPlayerCatalogIngestJob.py

echo ""
echo "Ingest smoke test complete. Query ingest_runs in Neon to verify audit rows."
