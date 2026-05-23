"""
PersistIngestRunAuditRecord
---------------------------
Writes lifecycle rows to `ingest_runs` so every external pull is traceable.

Why audit-first ingest:
- Master Spec accountability requires we know *which* provider snapshot produced a projection.
- When ESPN or Sleeper responses change shape, we compare ingest_run metadata instead of guessing.

Called by:
- FetchEspnNflScoreboardIngestJob.py
- FetchEspnNflNewsHeadlinesIngestJob.py
- FetchSleeperNflPlayerCatalogIngestJob.py
"""

from __future__ import annotations

import json
import uuid
from typing import Any

import psycopg


def PersistIngestRunAuditRecordStart(
    connection: psycopg.Connection,
    job_name: str,
    source_provider: str,
    metadata: dict[str, Any] | None = None,
) -> uuid.UUID:
    """
    Inserts a `running` ingest_runs row and returns its UUID primary key.
    """
    ingest_run_id = uuid.uuid4()
    connection.execute(
        """
        INSERT INTO ingest_runs (id, job_name, source_provider, status, metadata)
        VALUES (%s, %s, %s, 'running', %s::jsonb)
        """,
        (
            ingest_run_id,
            job_name,
            source_provider,
            json.dumps(metadata or {}),
        ),
    )
    return ingest_run_id


def PersistIngestRunAuditRecordFinishSuccess(
    connection: psycopg.Connection,
    ingest_run_id: uuid.UUID,
    row_count: int,
    metadata: dict[str, Any] | None = None,
) -> None:
    """
    Marks an ingest run successful with final row count and optional metadata merge.
    """
    connection.execute(
        """
        UPDATE ingest_runs
        SET status = 'success',
            finished_at = NOW(),
            row_count = %s,
            metadata = metadata || %s::jsonb
        WHERE id = %s
        """,
        (row_count, json.dumps(metadata or {}), ingest_run_id),
    )


def PersistIngestRunAuditRecordFinishFailed(
    connection: psycopg.Connection,
    ingest_run_id: uuid.UUID,
    error_message: str,
) -> None:
    """
    Marks an ingest run failed — pipeline orchestrator can alert via n8n on these rows.
    """
    connection.execute(
        """
        UPDATE ingest_runs
        SET status = 'failed',
            finished_at = NOW(),
            error_message = %s
        WHERE id = %s
        """,
        (error_message[:4000], ingest_run_id),
    )
