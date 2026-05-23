"""
FetchSportsDataIoNflInjuriesIngestJob
--------------------------------------
Scaffold for SportsDataIO injury feed — activates when SPORTSDATAIO_API_KEY is set.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from ingest.PersistIngestRunAuditRecord import (  # noqa: E402
    PersistIngestRunAuditRecordFinishFailed,
    PersistIngestRunAuditRecordFinishSuccess,
    PersistIngestRunAuditRecordStart,
)
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402

SPORTSDATAIO_INJURIES_URL = "https://api.sportsdata.io/v3/nfl/scores/json/Injuries/2025REG/1"


def FetchSportsDataIoNflInjuriesIngestJob() -> int:
    """
    Fetches SportsDataIO injuries when key is configured.
    """
    LoadNovaPredictEnvironmentVariables()

    api_key = os.environ.get("SPORTSDATAIO_API_KEY", "").strip()
    if not api_key:
        print("FetchSportsDataIoNflInjuriesIngestJob skipped — SPORTSDATAIO_API_KEY not set")
        return 0

    response = httpx.get(
        SPORTSDATAIO_INJURIES_URL,
        headers={"Ocp-Apim-Subscription-Key": api_key},
        timeout=30.0,
    )
    response.raise_for_status()
    injuries = response.json()

    if not isinstance(injuries, list):
        raise RuntimeError("SportsDataIO injuries response is not a list")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchSportsDataIoNflInjuriesIngestJob",
            source_provider="sportsdataio",
            metadata={"endpoint": SPORTSDATAIO_INJURIES_URL},
        )

        try:
            for injury in injuries:
                player_id = str(injury.get("PlayerID") or injury.get("PlayerId") or "")
                connection.execute(
                    """
                    INSERT INTO raw_injury_reports (
                      ingest_run_id, external_player_id, payload
                    ) VALUES (%s, %s, %s::jsonb)
                    """,
                    (ingest_run_id, player_id, json.dumps(injury)),
                )

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=len(injuries),
            )
            return len(injuries)
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchSportsDataIoNflInjuriesIngestJob()
    print(f"FetchSportsDataIoNflInjuriesIngestJob persisted {count} injuries")
