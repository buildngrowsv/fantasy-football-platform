"""
FetchNflverseGamesScheduleIngestJob
------------------------------------
Downloads nflverse NFL game schedule CSV and stores 2024–2025 rows.

Why schedule ingest:
- Provides authoritative week numbers and team pairings when ESPN scoreboard is sparse (off-season).
- Feeds weekly_team_matchups normalization alongside ESPN live scoreboard.

Does NOT use mock data.
"""

from __future__ import annotations

import csv
import gzip
import io
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

NFLVERSE_GAMES_URL = "https://github.com/nflverse/nflverse-data/releases/download/schedules/games.csv.gz"
TARGET_SEASONS = {2024, 2025}
BATCH_SIZE = 200


def FetchNflverseGamesScheduleIngestJob() -> int:
    """
    Streams nflverse games.csv.gz into raw_nflverse_games for seasons 2024–2025.
    """
    LoadNovaPredictEnvironmentVariables()

    response = httpx.get(NFLVERSE_GAMES_URL, timeout=120.0, follow_redirects=True)
    response.raise_for_status()

    text_stream = io.TextIOWrapper(gzip.GzipFile(fileobj=io.BytesIO(response.content)), encoding="utf-8")
    reader = csv.DictReader(text_stream)

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchNflverseGamesScheduleIngestJob",
            source_provider="nflverse_github",
            metadata={"url": NFLVERSE_GAMES_URL, "seasons": sorted(TARGET_SEASONS)},
        )

        try:
            batch: list[tuple] = []
            stored = 0

            for row in reader:
                season = int(row.get("season") or 0)
                if season not in TARGET_SEASONS:
                    continue

                batch.append(
                    (
                        ingest_run_id,
                        row.get("game_id", ""),
                        season,
                        int(row.get("week") or 0),
                        row.get("game_type") or "REG",
                        row.get("away_team", ""),
                        row.get("home_team", ""),
                        json.dumps(row),
                    )
                )

                if len(batch) >= BATCH_SIZE:
                    with connection.cursor() as cursor:
                        cursor.executemany(
                            """
                            INSERT INTO raw_nflverse_games (
                              ingest_run_id, game_id, season, week, season_type, away_team, home_team, payload
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                            """,
                            batch,
                        )
                    stored += len(batch)
                    batch.clear()

            if batch:
                with connection.cursor() as cursor:
                    cursor.executemany(
                        """
                        INSERT INTO raw_nflverse_games (
                          ingest_run_id, game_id, season, week, season_type, away_team, home_team, payload
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                        """,
                        batch,
                    )
                stored += len(batch)

            PersistIngestRunAuditRecordFinishSuccess(connection, ingest_run_id, row_count=stored)
            return stored
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchNflverseGamesScheduleIngestJob()
    print(f"FetchNflverseGamesScheduleIngestJob persisted {count} games")
