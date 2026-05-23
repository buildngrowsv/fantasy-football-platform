"""
ApplyNovaPredictIngestionSqlMigrations
--------------------------------------
Applies ordered SQL files from pipeline/sql/ to the Neon branch pointed at by DATABASE_URL.

Why a simple SQL runner (not Alembic yet):
- Phase 0 needs ingest tables before the full 40+ table Drizzle schema lands in `app/`.
- Python pipeline and web app can evolve migrations independently until monorepo packages/shared-db exists.

Called by:
- scripts/setup-neon-env.sh (after writing DATABASE_URL)
- scripts/run-pipeline-ingest-smoke-test.sh
- Future Cloudflare Cron → Workers Container entrypoint

Idempotency:
- Migration files use CREATE TABLE IF NOT EXISTS — safe to re-run locally.
"""

from __future__ import annotations

import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PIPELINE_ROOT))

from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402

SQL_DIRECTORY = PIPELINE_ROOT / "sql"


def ApplyNovaPredictIngestionSqlMigrations() -> list[str]:
    """
    Executes each *.sql file in pipeline/sql/ in lexical order.
    Returns list of applied filenames.
    """
    LoadNovaPredictEnvironmentVariables()

    if not SQL_DIRECTORY.is_dir():
        raise RuntimeError(f"SQL directory not found: {SQL_DIRECTORY}")

    sql_files = sorted(SQL_DIRECTORY.glob("*.sql"))
    if not sql_files:
        raise RuntimeError(f"No SQL migration files in {SQL_DIRECTORY}")

    applied: list[str] = []

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        for sql_file in sql_files:
            sql_text = sql_file.read_text(encoding="utf-8")
            connection.execute(sql_text)
            applied.append(sql_file.name)

    return applied


if __name__ == "__main__":
    names = ApplyNovaPredictIngestionSqlMigrations()
    print(f"Applied {len(names)} migration(s): {', '.join(names)}")
