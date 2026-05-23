#!/usr/bin/env bash
#
# run-pipeline-tests.sh — pytest for computation engine modules
set -euo pipefail

REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
VENV_DIR="$REPO_ROOT/pipeline/.venv"

if [[ ! -d "$VENV_DIR" ]]; then
  python3 -m venv "$VENV_DIR"
fi

# shellcheck disable=SC1091
source "$VENV_DIR/bin/activate"
pip install -q -r "$REPO_ROOT/pipeline/requirements.txt"

cd "$REPO_ROOT/pipeline"
python -m pytest tests/ -q --tb=short 2>&1 | head -n 40 | cut -c -200
