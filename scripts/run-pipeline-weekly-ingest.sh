#!/usr/bin/env bash
#
# run-pipeline-weekly-ingest.sh
# -----------------------------
# Full weekly pipeline: ingest → normalize → compute (real data only).
#
# Usage: ./scripts/run-pipeline-weekly-ingest.sh

set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PIPELINE_DIR="$REPO_ROOT/pipeline"
VENV_DIR="$PIPELINE_DIR/.venv"

if [[ ! -f "$REPO_ROOT/.env" ]]; then
  echo "No .env — running setup-neon-env.sh for dev branch..."
  bash "$REPO_ROOT/scripts/setup-neon-env.sh" dev
fi

set -a
# shellcheck disable=SC1090
source "$REPO_ROOT/.env"
set +a

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
pip install -q -r "$PIPELINE_DIR/requirements.txt"

cd "$PIPELINE_DIR"
python RunNovaPredictWeeklyIngestOrchestrator.py
