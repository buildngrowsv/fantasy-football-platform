"""
ResolveLatestSuccessfulIngestRunId
------------------------------------
Returns the most recent successful ingest_runs.id for a given job name.

Why centralize this lookup:
- Normalization jobs always read from the freshest successful pull, not stale partial runs.
- Keeps normalize modules decoupled from how ingest jobs write audit rows.

Called by:
- All Normalize* modules under pipeline/normalize/
"""

from __future__ import annotations

import uuid

import psycopg


def ResolveLatestSuccessfulIngestRunId(
    connection: psycopg.Connection,
    job_name: str,
) -> uuid.UUID | None:
    """
    Fetches latest success ingest run UUID for job_name, or None if never succeeded.
    """
    row = connection.execute(
        """
        SELECT id
        FROM ingest_runs
        WHERE job_name = %s AND status = 'success'
        ORDER BY finished_at DESC NULLS LAST, started_at DESC
        LIMIT 1
        """,
        (job_name,),
    ).fetchone()

    if not row:
        return None

    return row[0]
