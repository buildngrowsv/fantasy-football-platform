"""
OpenNovaPredictNeonDatabaseConnection
--------------------------------------
Opens a psycopg connection to Neon Postgres using DATABASE_URL.

Why psycopg directly (not SQLAlchemy yet):
- Ingest jobs are small, batch-oriented scripts. We want minimal dependencies for
  Workers Container cold starts and straightforward audit logging.
- Drizzle owns the TypeScript schema in `app/`; Python owns raw ingest persistence until
  we introduce a shared migration contract in Phase 0 monorepo hardening.

Called by:
- ApplyNovaPredictIngestionSqlMigrations.py
- PersistIngestRunAuditRecord.py
- All Fetch*IngestJob modules

Neon nuance:
- Use the pooler URL in production (Hyperdrive from Workers). Local dev can use direct
  branch endpoints from `neonctl connection-string`.
"""

from __future__ import annotations

import os
from contextlib import contextmanager
from typing import Generator

import psycopg


def OpenNovaPredictNeonDatabaseConnection() -> psycopg.Connection:
    """
    Returns an open psycopg connection. Caller must close or use connection_context().
    """
    database_url = os.environ["DATABASE_URL"]
    return psycopg.connect(database_url)


@contextmanager
def OpenNovaPredictNeonDatabaseConnectionContext() -> Generator[psycopg.Connection, None, None]:
    """
    Context manager that commits on success and rolls back on error.
    """
    connection = OpenNovaPredictNeonDatabaseConnection()
    try:
        yield connection
        connection.commit()
    except Exception:
        connection.rollback()
        raise
    finally:
        connection.close()
