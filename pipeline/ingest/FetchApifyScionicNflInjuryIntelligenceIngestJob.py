"""
FetchApifyScionicNflInjuryIntelligenceIngestJob
------------------------------------------------
Pulls NFL injury intelligence via Apify `scionic_dev/nfl-dfs-intelligence-monitor`.

Why this actor (authorized in Apify Console 2026-05-23):
- Scrapes ESPN/CBS/Yahoo injury pages with change detection + confidence scores.
- Supplements SportsDataIO when that key is not yet subscribed (see data-source-research.md).
- Requires one-time full-account permission approval in Apify Console — now approved for buildngrowsv.

Live validation: empty `{}` input returns ~296 player injury rows (May 2026 off-season).

Skips cleanly when APIFY_API_TOKEN is missing.
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

SCIONIC_NFL_INJURY_ACTOR_ID = "scionic_dev/nfl-dfs-intelligence-monitor"


def _ResolveScionicExternalPlayerId(row: dict) -> str:
    """
    Builds a stable external id from name + team when no numeric id exists in payload.
    """
    name = str(row.get("name") or row.get("playerName") or "").strip()
    team = str(row.get("team") or row.get("teamName") or "").strip()
    position = str(row.get("position") or "").strip()
    return "|".join(part for part in [name, team, position] if part)


def FetchApifyScionicNflInjuryIntelligenceIngestJob() -> int:
    """
    Fetches NFL injury rows from scionic_dev/nfl-dfs-intelligence-monitor into raw_injury_reports.
    """
    LoadNovaPredictEnvironmentVariables()

    try:
        ResolveApifyApiTokenFromEnvironment()
    except RuntimeError:
        print("FetchApifyScionicNflInjuryIntelligenceIngestJob skipped — APIFY_API_TOKEN not set")
        return 0

    rows = RunApifyActorSyncGetDatasetItems(
        SCIONIC_NFL_INJURY_ACTOR_ID,
        {},
        timeout_seconds=180,
        memory_megabytes=4096,
    )

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchApifyScionicNflInjuryIntelligenceIngestJob",
            source_provider="apify_scionic_nfl_injury_monitor",
            metadata={"actor": SCIONIC_NFL_INJURY_ACTOR_ID},
        )

        try:
            stored = 0
            for row in rows:
                if not isinstance(row, dict):
                    continue
                external_player_id = _ResolveScionicExternalPlayerId(row)
                connection.execute(
                    """
                    INSERT INTO raw_injury_reports (
                      ingest_run_id, external_player_id, payload
                    ) VALUES (%s, %s, %s::jsonb)
                    """,
                    (ingest_run_id, external_player_id, json.dumps(row)),
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
    count = FetchApifyScionicNflInjuryIntelligenceIngestJob()
    print(f"FetchApifyScionicNflInjuryIntelligenceIngestJob persisted {count} injury rows")
