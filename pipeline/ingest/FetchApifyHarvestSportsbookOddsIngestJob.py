"""
FetchApifyHarvestSportsbookOddsIngestJob
-----------------------------------------
Pulls multi-book NFL odds via Apify `harvest/sportsbook-odds-scraper` for redundancy.

Why this actor (validated 2026-05-23):
- Returns ~20 NFL matchups with DraftKings/FanDuel/BetMGM/Caesars lines in one run.
- Complements `zen-studio/draftkings-odds` (HTTP API) and future The Odds API primary feed.
- Actor uses Apify-managed browser infrastructure on their side — we only call REST sync API.

Skips cleanly when APIFY_API_TOKEN is missing.
Requires Apify Starter+ for scheduled production use (harvest actor has $49/mo subscription option).

Does NOT use mock data.
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from ingest.PersistIngestRunAuditRecord import (  # noqa: E402
    PersistIngestRunAuditRecordFinishFailed,
    PersistIngestRunAuditRecordFinishSuccess,
    PersistIngestRunAuditRecordStart,
)
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.RunApifyActorSyncGetDatasetItems import (  # noqa: E402
    ResolveApifyApiTokenFromEnvironment,
    RunApifyActorSyncGetDatasetItems,
)

HARVEST_SPORTSBOOK_ODDS_ACTOR_ID = "harvest/sportsbook-odds-scraper"
HARVEST_NFL_LEAGUE = "NFL"


def _BuildHarvestMatchupKey(row: dict) -> str:
    """
    Stable key for upsert/reconciliation: away@home + scheduled time when present.
    """
    home = row.get("homeTeam") or {}
    away = row.get("awayTeam") or {}
    home_abbr = str(home.get("abbr") or home.get("shortName") or "HOME").upper()
    away_abbr = str(away.get("abbr") or away.get("shortName") or "AWAY").upper()
    scheduled = str(row.get("scheduledTime") or row.get("startTime") or "")
    return f"{away_abbr}@{home_abbr}|{scheduled}"


def FetchApifyHarvestSportsbookOddsIngestJob() -> int:
    """
    Fetches NFL multi-book odds rows from harvest/sportsbook-odds-scraper into Neon.
    """
    LoadNovaPredictEnvironmentVariables()

    try:
        ResolveApifyApiTokenFromEnvironment()
    except RuntimeError:
        print("FetchApifyHarvestSportsbookOddsIngestJob skipped — APIFY_API_TOKEN not set")
        return 0

    actor_input = {"league": HARVEST_NFL_LEAGUE}
    rows = RunApifyActorSyncGetDatasetItems(
        HARVEST_SPORTSBOOK_ODDS_ACTOR_ID,
        actor_input,
        timeout_seconds=180,
        memory_megabytes=2048,
    )

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchApifyHarvestSportsbookOddsIngestJob",
            source_provider="apify_harvest_sportsbook_odds",
            metadata={"actor": HARVEST_SPORTSBOOK_ODDS_ACTOR_ID, "league": HARVEST_NFL_LEAGUE},
        )

        try:
            stored = 0
            for row in rows:
                if not isinstance(row, dict):
                    continue
                matchup_key = _BuildHarvestMatchupKey(row)
                home = row.get("homeTeam") or {}
                away = row.get("awayTeam") or {}

                connection.execute(
                    """
                    INSERT INTO raw_apify_harvest_sportsbook_odds (
                      ingest_run_id, matchup_key, home_team_abbr, away_team_abbr, payload
                    ) VALUES (%s, %s, %s, %s, %s::jsonb)
                    """,
                    (
                        ingest_run_id,
                        matchup_key,
                        str(home.get("abbr") or home.get("shortName") or ""),
                        str(away.get("abbr") or away.get("shortName") or ""),
                        json.dumps(row),
                    ),
                )
                stored += 1

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=stored,
            )
            return stored
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchApifyHarvestSportsbookOddsIngestJob()
    print(f"FetchApifyHarvestSportsbookOddsIngestJob persisted {count} matchup odds rows")
