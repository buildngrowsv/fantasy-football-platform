"""
LoadNovaPredictEnvironmentVariables
------------------------------------
Centralizes how the Python pipeline reads secrets and connection strings.

Why this exists:
- The web app (Next.js in `app/`) and the Python ingest containers both need the same
  Neon DATABASE_URL, but they run in different runtimes (OpenNext Worker vs local/Container).
- We load from repo-root `.env` first (developer machine), then fall back to process env
  (Cloudflare Workers Container secrets at deploy time).

Called by:
- ApplyNovaPredictIngestionSqlMigrations.py
- Every ingest job under pipeline/ingest/
- scripts/ingest-smoke-tests.sh (indirectly via Python entrypoints)

Product relevance:
- Without a single env loader, ingest jobs would silently use wrong branches (main vs dev)
  and corrupt production data during development. Fail-fast here protects accountability.
"""

from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv


def LoadNovaPredictEnvironmentVariables() -> None:
    """
    Loads environment variables from the repo-root `.env` when present, without overriding
    variables already set in the process environment (so CI/Wrangler secrets win).
    """
    repository_root = Path(__file__).resolve().parents[2]
    dotenv_path = repository_root / ".env"
    if dotenv_path.is_file():
        load_dotenv(dotenv_path, override=False)

    database_url = os.environ.get("DATABASE_URL", "").strip()
    if not database_url:
        raise RuntimeError(
            "DATABASE_URL is not set. Run scripts/setup-neon-env.sh or add DATABASE_URL to .env"
        )
