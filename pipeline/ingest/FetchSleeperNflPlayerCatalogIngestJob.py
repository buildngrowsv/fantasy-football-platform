"""
FetchSleeperNflPlayerCatalogIngestJob
--------------------------------------
Downloads the full Sleeper NFL player catalog and stores active-relevant rows in Neon.

Why Sleeper first for player IDs:
- Verified live: 12,188 players returned (2026-05-23 smoke test).
- Sleeper IDs are the de-facto join key for league import (Master Spec league import path).
- Free, stable REST — no OAuth required for the global catalog endpoint.

We filter to players with a non-empty full_name to avoid polluting raw tables with empty stubs.
Large catalog (~12k) is acceptable for a weekly snapshot table with ingest_run audit.

Does NOT use mock data — hits api.sleeper.app/v1/players/nfl directly.
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

SLEEPER_NFL_PLAYERS_URL = "https://api.sleeper.app/v1/players/nfl"


def FetchSleeperNflPlayerCatalogIngestJob() -> int:
    """
    Fetches Sleeper player catalog and persists rows with full_name present.
    Returns count of rows inserted.
    """
    LoadNovaPredictEnvironmentVariables()

    response = httpx.get(SLEEPER_NFL_PLAYERS_URL, timeout=120.0)
    response.raise_for_status()
    catalog = response.json()

    if not isinstance(catalog, dict):
        raise RuntimeError("Sleeper players response is not an object map")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchSleeperNflPlayerCatalogIngestJob",
            source_provider="sleeper_api",
            metadata={"endpoint": SLEEPER_NFL_PLAYERS_URL},
        )

        try:
            stored = 0
            for sleeper_player_id, player_record in catalog.items():
                if not isinstance(player_record, dict):
                    continue

                full_name = str(player_record.get("full_name") or "").strip()
                if not full_name:
                    continue

                position = str(player_record.get("position") or "").strip() or None
                team = str(player_record.get("team") or "").strip() or None

                connection.execute(
                    """
                    INSERT INTO raw_sleeper_player_catalog_snapshots
                      (ingest_run_id, sleeper_player_id, full_name, position, team, payload)
                    VALUES (%s, %s, %s, %s, %s, %s::jsonb)
                    """,
                    (
                        ingest_run_id,
                        str(sleeper_player_id),
                        full_name,
                        position,
                        team,
                        json.dumps(player_record),
                    ),
                )
                stored += 1

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=stored,
                metadata={"catalog_total_keys": len(catalog)},
            )
            return stored
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchSleeperNflPlayerCatalogIngestJob()
    print(f"FetchSleeperNflPlayerCatalogIngestJob persisted {count} players")
