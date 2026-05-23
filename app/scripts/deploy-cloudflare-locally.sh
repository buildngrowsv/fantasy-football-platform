#!/usr/bin/env bash
set -euo pipefail
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
APP_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
LOG_FILE="$APP_DIR/tmp/deploy-cloudflare-local-latest.log"
mkdir -p "$APP_DIR/tmp"
exec > >(tee "$LOG_FILE") 2>&1

cd "$APP_DIR"
echo "=== NovaPredict Cloudflare deploy ==="

wrangler whoami
npm ci --legacy-peer-deps
npm run lint
npm run build:cf
npm run deploy:cf

echo "=== Deploy complete. Log: $LOG_FILE ==="
