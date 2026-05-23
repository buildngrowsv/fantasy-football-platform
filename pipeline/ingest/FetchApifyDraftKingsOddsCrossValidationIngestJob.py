"""
FetchApifyDraftKingsOddsCrossValidationIngestJob
-------------------------------------------------
Pulls DraftKings NFL odds via Apify HTTP API for cross-validation storage.

Why Apify now (token already saved):
- Supplement layer per data-source-research.md — validates future Odds API pulls.
- Uses market=all (187 events off-season vs 0 for player_props-only).

Skips cleanly when APIFY_API_TOKEN is missing.
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

DRAFTKINGS_NFL_LEAGUE_ID = "88808"


def FetchApifyDraftKingsOddsCrossValidationIngestJob() -> int:
    """
    Fetches DraftKings NFL events via zen-studio Apify actor HTTP API.
    """
    LoadNovaPredictEnvironmentVariables()

    apify_token = os.environ.get("APIFY_API_TOKEN", "").strip()
    if not apify_token:
        print("FetchApifyDraftKingsOddsCrossValidationIngestJob skipped — APIFY_API_TOKEN not set")
        return 0

    url = (
        f"https://zen-studio--draftkings-odds.apify.actor/leagues/{DRAFTKINGS_NFL_LEAGUE_ID}"
        f"?market=all&token={apify_token}"
    )

    response = httpx.get(url, timeout=120.0)
    response.raise_for_status()
    payload = response.json()
    events = payload.get("events") or []

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchApifyDraftKingsOddsCrossValidationIngestJob",
            source_provider="apify_zen_studio_draftkings_odds",
            metadata={"url": url.split("token=")[0] + "token=REDACTED", "market": "all"},
        )

        try:
            for event in events:
                event_id = str(event.get("id") or event.get("eventId") or "")
                if not event_id:
                    continue

                connection.execute(
                    """
                    INSERT INTO raw_apify_draftkings_events (
                      ingest_run_id, event_id, event_name, payload
                    ) VALUES (%s, %s, %s, %s::jsonb)
                    """,
                    (
                        ingest_run_id,
                        event_id,
                        str(event.get("name") or event.get("eventName") or "Unknown"),
                        json.dumps(event),
                    ),
                )

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=len(events),
            )
            return len(events)
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchApifyDraftKingsOddsCrossValidationIngestJob()
    print(f"FetchApifyDraftKingsOddsCrossValidationIngestJob persisted {count} events")
