"""
FetchTheOddsApiNflEventsIngestJob
----------------------------------
Pulls NFL events from The Odds API when THE_ODDS_API_KEY is configured.

Why optional / skip-without-key:
- Paid subscription required for props; we do not fake or scrape odds in its place.
- Pipeline orchestrator still runs; this job logs a skipped audit row when key missing.
- When key is present, stores real event list for future prop ladder ingest.

Does NOT use mock data.
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

THE_ODDS_API_EVENTS_URL = "https://api.the-odds-api.com/v4/sports/americanfootball_nfl/events"
SPORT_KEY = "americanfootball_nfl"


def FetchTheOddsApiNflEventsIngestJob() -> int:
    """
    Fetches NFL events from The Odds API or skips cleanly when key is absent.
    Returns events stored (0 when skipped).
    """
    LoadNovaPredictEnvironmentVariables()

    api_key = os.environ.get("THE_ODDS_API_KEY", "").strip()
    if not api_key:
        print("FetchTheOddsApiNflEventsIngestJob skipped — THE_ODDS_API_KEY not set")
        return 0

    response = httpx.get(
        THE_ODDS_API_EVENTS_URL,
        params={"apiKey": api_key},
        timeout=30.0,
    )
    response.raise_for_status()
    events = response.json()

    if not isinstance(events, list):
        raise RuntimeError("The Odds API events response is not a list")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchTheOddsApiNflEventsIngestJob",
            source_provider="the_odds_api",
            metadata={"endpoint": THE_ODDS_API_EVENTS_URL},
        )

        try:
            for event in events:
                event_id = str(event.get("id", "")).strip()
                if not event_id:
                    continue

                connection.execute(
                    """
                    INSERT INTO raw_the_odds_api_events (
                      ingest_run_id, event_id, sport_key, commence_time, home_team, away_team, payload
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s::jsonb)
                    """,
                    (
                        ingest_run_id,
                        event_id,
                        SPORT_KEY,
                        event.get("commence_time"),
                        event.get("home_team"),
                        event.get("away_team"),
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
    count = FetchTheOddsApiNflEventsIngestJob()
    print(f"FetchTheOddsApiNflEventsIngestJob persisted {count} events")
