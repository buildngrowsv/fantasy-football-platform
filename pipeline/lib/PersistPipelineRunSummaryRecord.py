"""
PersistPipelineRunSummaryRecord
--------------------------------
Logs orchestrator runs to pipeline_run_summaries for admin observability.
"""

from __future__ import annotations

import json
import uuid
from typing import Any

import psycopg


def PersistPipelineRunSummaryRecordStart(
    connection: psycopg.Connection,
    orchestrator_name: str,
) -> uuid.UUID:
    run_id = uuid.uuid4()
    connection.execute(
        """
        INSERT INTO pipeline_run_summaries (id, orchestrator_name, status)
        VALUES (%s, %s, 'running')
        """,
        (run_id, orchestrator_name),
    )
    return run_id


def PersistPipelineRunSummaryRecordFinishSuccess(
    connection: psycopg.Connection,
    run_id: uuid.UUID,
    stage_results: dict[str, Any],
) -> None:
    connection.execute(
        """
        UPDATE pipeline_run_summaries
        SET status = 'success',
            finished_at = NOW(),
            stage_results = %s::jsonb
        WHERE id = %s
        """,
        (json.dumps(stage_results), run_id),
    )


def PersistPipelineRunSummaryRecordFinishFailed(
    connection: psycopg.Connection,
    run_id: uuid.UUID,
    error_message: str,
    stage_results: dict[str, Any] | None = None,
) -> None:
    connection.execute(
        """
        UPDATE pipeline_run_summaries
        SET status = 'failed',
            finished_at = NOW(),
            error_message = %s,
            stage_results = %s::jsonb
        WHERE id = %s
        """,
        (error_message[:4000], json.dumps(stage_results or {}), run_id),
    )
