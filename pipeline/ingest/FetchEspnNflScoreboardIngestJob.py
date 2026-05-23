"""
FetchEspnNflScoreboardIngestJob
--------------------------------
Pulls the public ESPN NFL scoreboard and persists each event as raw JSON in Neon.

Fetch path (reworked 2026-05-23 — Apify Browser primary):
- **Primary:** Apify Playwright browser (`apify/playwright-scraper`) loads the ESPN JSON URL
  through managed Chromium + proxy rotation when `APIFY_API_TOKEN` is set and browser mode is on.
- **Fallback:** Direct httpx to site.api.espn.com when token missing or `APIFY_BROWSER_ENABLED=false`.

Why Apify Browser for ESPN:
- Same JSON endpoint, but Apify handles anti-bot egress that can block pipeline containers later.
- Live-tested: 16 NFL events via Playwright actor vs direct httpx during data-source-research.

Schedule (production):
- Wed–Sat lightweight pulls; Sun 7 AM ET full refresh per data-sources.md

Does NOT use mock data.
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
from lib.FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser import (  # noqa: E402
    FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser,
)
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.RunApifyActorSyncGetDatasetItems import ResolveApifyBrowserEnabledFromEnvironment  # noqa: E402

ESPN_NFL_SCOREBOARD_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard"


def _FetchEspnNflScoreboardPayload() -> tuple[dict, str]:
    """
    Returns (scoreboard_json, source_provider_label) using Apify browser or direct HTTP.
    """
    if ResolveApifyBrowserEnabledFromEnvironment():
        payload = FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser(ESPN_NFL_SCOREBOARD_URL)
        return payload, "apify_playwright_browser_espn_scoreboard"

    response = httpx.get(ESPN_NFL_SCOREBOARD_URL, timeout=30.0)
    response.raise_for_status()
    return response.json(), "espn_public_api"


def FetchEspnNflScoreboardIngestJob() -> int:
    """
    Fetches ESPN scoreboard events and inserts them into raw_espn_scoreboard_events.
    Returns the number of events persisted.
    """
    LoadNovaPredictEnvironmentVariables()

    payload, source_provider = _FetchEspnNflScoreboardPayload()
    events = payload.get("events") or []

    if not isinstance(events, list):
        raise RuntimeError("ESPN scoreboard response missing events array")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchEspnNflScoreboardIngestJob",
            source_provider=source_provider,
            metadata={
                "endpoint": ESPN_NFL_SCOREBOARD_URL,
                "fetch_mode": "apify_playwright_browser"
                if source_provider.startswith("apify_")
                else "direct_http",
            },
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
