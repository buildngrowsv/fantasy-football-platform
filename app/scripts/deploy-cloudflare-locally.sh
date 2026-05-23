#!/usr/bin/env bash
#
# deploy-cloudflare-locally.sh
# Canonical NovaPredict production deploy — local OpenNext build + wrangler upload.
# See documentation/deploy-plan.md and app/package.json (`deploy:cf:full`).
#
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$APP_DIR/tmp/deploy-cloudflare-local-latest.log"

SKIP_INSTALL=false
SKIP_TYPECHECK=false
SKIP_TESTS=false
SKIP_BUILD=false
SKIP_SMOKE=false
DRY_RUN=false
DEPLOY_ENV="production"

usage() {
  cat <<'EOF'
Usage: deploy-cloudflare-locally.sh [flags]

Flags:
  --skip-install     Skip npm ci
  --skip-typecheck   Skip TypeScript check (when script exists)
  --skip-tests       Skip lint/tests preflight
  --skip-build       Skip npm run build:cf (deploy existing .open-next bundle)
  --skip-smoke       Skip post-deploy smoke checks (when script exists)
  --dry-run          Print planned steps without executing deploy
  --env=staging|prod Select target environment (prod default; staging requires wrangler.staging.jsonc)
  -h, --help         Show this help
EOF
}

for arg in "$@"; do
  case "$arg" in
    --skip-install) SKIP_INSTALL=true ;;
    --skip-typecheck) SKIP_TYPECHECK=true ;;
    --skip-tests) SKIP_TESTS=true ;;
    --skip-build) SKIP_BUILD=true ;;
    --skip-smoke) SKIP_SMOKE=true ;;
    --dry-run) DRY_RUN=true ;;
    --env=staging) DEPLOY_ENV="staging" ;;
    --env=prod|--env=production) DEPLOY_ENV="production" ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      echo "Unknown flag: $arg" >&2
      usage
      exit 1
      ;;
  esac
done

mkdir -p "$APP_DIR/tmp"
exec > >(tee "$LOG_FILE") 2>&1

cd "$APP_DIR"

echo "=== NovaPredict Cloudflare deploy ($DEPLOY_ENV) ==="
echo "Log: $LOG_FILE"

if [ "$DEPLOY_ENV" = "staging" ] && [ ! -f "$APP_DIR/wrangler.staging.jsonc" ]; then
  echo "ERROR: wrangler.staging.jsonc not found — staging deploy is not configured yet." >&2
  exit 1
fi

run_step() {
  local label="$1"
  shift
  echo ""
  echo ">>> $label"
  if [ "$DRY_RUN" = true ]; then
    echo "DRY RUN: $*"
    return 0
  fi
  if ! "$@"; then
    local exit_code=$?
    echo ""
    echo "AGENT_TRIAGE_BEGIN"
    echo "deploy_step=$label"
    echo "exit_code=$exit_code"
    echo "log_file=$LOG_FILE"
    echo "last_output:"
    tail -n 80 "$LOG_FILE" || true
    echo "AGENT_TRIAGE_END"
    exit "$exit_code"
  fi
}

run_step "wrangler whoami" wrangler whoami

if [ "$SKIP_INSTALL" = false ]; then
  run_step "npm ci" npm ci --legacy-peer-deps
else
  echo ">>> Skipping npm ci (--skip-install)"
fi

if [ "$SKIP_TYPECHECK" = false ] && npm run | grep -q '^  typecheck'; then
  run_step "npm run typecheck" npm run typecheck
elif [ "$SKIP_TYPECHECK" = true ]; then
  echo ">>> Skipping typecheck (--skip-typecheck)"
fi

if [ "$SKIP_TESTS" = false ]; then
  run_step "npm run lint" npm run lint
  if npm run | grep -q '^  test'; then
    run_step "npm test" npm test
  fi
else
  echo ">>> Skipping lint/tests (--skip-tests)"
fi

if [ "$SKIP_BUILD" = false ]; then
  run_step "npm run build:cf" npm run build:cf
else
  echo ">>> Skipping build (--skip-build)"
fi

run_step "npm run deploy:cf" npm run deploy:cf

if [ "$SKIP_SMOKE" = false ] && [ -x "$APP_DIR/scripts/smoke-test-after-deploy.sh" ]; then
  run_step "post-deploy smoke test" "$APP_DIR/scripts/smoke-test-after-deploy.sh" "${NEXT_PUBLIC_APP_URL:-https://novapredict.buildngrowsv.workers.dev}"
else
  echo ">>> Skipping smoke test (no script or --skip-smoke)"
fi

echo ""
echo "=== Deploy complete. Log: $LOG_FILE ==="
