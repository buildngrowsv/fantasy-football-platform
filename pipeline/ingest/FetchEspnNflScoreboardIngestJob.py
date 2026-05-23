"""
FetchEspnNflScoreboardIngestJob
--------------------------------
Pulls the public ESPN NFL scoreboard and persists each event as raw JSON in Neon.

Why ESPN scoreboard first:
- Free, no API key, verified live during data-source-research (2026-05-23).
- Gives us real game IDs, team pairings, and status fields for scheduling ingest windows
  before we pay for The Odds API during off-season development.

Schedule (production):
- Wed–Sat lightweight pulls; Sun 7 AM ET full refresh per data-sources.md

Does NOT use mock data — hits site.api.espn.com directly.
"""

from __future__ import annotations

import json
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

ESPN_NFL_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"


def FetchEspnNflScoreboardIngestJob() -> int:
    """
    Fetches ESPN scoreboard events and inserts them into raw_espn_scoreboard_events.
    Returns the number of events persisted.
    """
    LoadNovaPredictEnvironmentVariables()

    response = httpx.get(ESPN_NFL_SCOREBOARD_URL, timeout=30.0)
    response.raise_for_status()
    payload = response.json()
    events = payload.get("events") or []

    if not isinstance(events, list):
        raise RuntimeError("ESPN scoreboard response missing events array")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchEspnNflScoreboardIngestJob",
            source_provider="espn_public_api",
            metadata={"endpoint": ESPN_NFL_SCOREBOARD_URL},
        )

        try:
            for event in events:
                event_id = str(event.get("id", "")).strip()
                event_name = str(event.get("name", "Unknown event")).strip()
                if not event_id:
                    continue

                connection.execute(
                    """
                    INSERT INTO raw_espn_scoreboard_events
                      (ingest_run_id, event_id, event_name, payload)
                    VALUES (%s, %s, %s, %s::jsonb)
                    """,
                    (ingest_run_id, event_id, event_name, json.dumps(event)),
                )

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=len(events),
                metadata={"season_type": payload.get("season", {}).get("type")},
            )
            return len(events)
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchEspnNflScoreboardIngestJob()
    print(f"FetchEspnNflScoreboardIngestJob persisted {count} events")
