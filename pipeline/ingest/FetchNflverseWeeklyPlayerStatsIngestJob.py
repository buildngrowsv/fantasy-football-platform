"""
FetchNflverseWeeklyPlayerStatsIngestJob
----------------------------------------
Downloads nflverse weekly player stats (2024 REG season) from GitHub releases.

Why 2024 weekly stats now:
- Real fantasy_points_ppr per week — used for trailing averages in projection compute.
- Free, no API key, verified release asset `player_stats_2024.csv.gz`.
- Full computation engine (Vegas CDF) comes later; this feeds honest historical baselines.

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

NFLVERSE_WEEKLY_STATS_URL = (
    "https://github.com/nflverse/nflverse-data/releases/download/player_stats/player_stats_2024.csv.gz"
)
TARGET_SEASON = 2024
TARGET_SEASON_TYPE = "REG"
FANTASY_POSITIONS = {"QB", "RB", "WR", "TE"}
BATCH_SIZE = 500


def FetchNflverseWeeklyPlayerStatsIngestJob() -> int:
    """
    Streams nflverse 2024 weekly CSV into raw_nflverse_weekly_player_stats.
    Returns rows inserted.
    """
    LoadNovaPredictEnvironmentVariables()

    response = httpx.get(NFLVERSE_WEEKLY_STATS_URL, timeout=180.0, follow_redirects=True)
    response.raise_for_status()

    text_stream = io.TextIOWrapper(gzip.GzipFile(fileobj=io.BytesIO(response.content)), encoding="utf-8")
    reader = csv.DictReader(text_stream)

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchNflverseWeeklyPlayerStatsIngestJob",
            source_provider="nflverse_github",
            metadata={"url": NFLVERSE_WEEKLY_STATS_URL, "season": TARGET_SEASON},
        )

        try:
            batch: list[tuple] = []
            stored = 0

            for row in reader:
                if row.get("season") != str(TARGET_SEASON):
                    continue
                if row.get("season_type") != TARGET_SEASON_TYPE:
                    continue
                position = (row.get("position") or "").strip()
                if position not in FANTASY_POSITIONS:
                    continue

                fantasy_ppr = row.get("fantasy_points_ppr") or "0"
                batch.append(
                    (
                        ingest_run_id,
                        row.get("player_id", ""),
                        row.get("player_display_name") or row.get("player_name") or "Unknown",
                        position,
                        row.get("recent_team") or row.get("team"),
                        TARGET_SEASON,
                        int(row.get("week") or 0),
                        TARGET_SEASON_TYPE,
                        row.get("opponent_team"),
                        fantasy_ppr,
                        json.dumps(row),
                    )
                )

                if len(batch) >= BATCH_SIZE:
                    with connection.cursor() as cursor:
                        cursor.executemany(
                            """
                            INSERT INTO raw_nflverse_weekly_player_stats (
                              ingest_run_id, nflverse_player_id, player_name, position, team,
                              season, week, season_type, opponent_team, fantasy_points_ppr, payload
                            ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                            """,
                            batch,
                        )
                    stored += len(batch)
                    batch.clear()

            if batch:
                with connection.cursor() as cursor:
                    cursor.executemany(
                        """
                        INSERT INTO raw_nflverse_weekly_player_stats (
                          ingest_run_id, nflverse_player_id, player_name, position, team,
                          season, week, season_type, opponent_team, fantasy_points_ppr, payload
                        ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s::jsonb)
                        """,
                        batch,
                    )
                stored += len(batch)

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=stored,
                metadata={"season": TARGET_SEASON, "season_type": TARGET_SEASON_TYPE},
            )
            return stored
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchNflverseWeeklyPlayerStatsIngestJob()
    print(f"FetchNflverseWeeklyPlayerStatsIngestJob persisted {count} weekly stat rows")
