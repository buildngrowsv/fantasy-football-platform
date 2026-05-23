"""
NormalizeSleeperCatalogIntoPlayersTable
-----------------------------------------
Upserts the `players` table from the latest successful Sleeper catalog ingest snapshot.

Why this normalize step exists:
- Raw ingest stores full JSON blobs for audit; the Next.js app queries slim `players` rows.
- We preserve Sleeper numeric IDs as primary keys — required for league import later.

Called by:
- RunNovaPredictWeeklyIngestOrchestrator.py after FetchSleeperNflPlayerCatalogIngestJob
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.ResolveLatestSuccessfulIngestRunId import ResolveLatestSuccessfulIngestRunId  # noqa: E402

FANTASY_POSITIONS = {"QB", "RB", "WR", "TE"}
BATCH_SIZE = 500


def NormalizeSleeperCatalogIntoPlayersTable() -> int:
    """
    Upserts active fantasy-relevant players from latest Sleeper snapshot.
    Returns number of players upserted.
    """
    LoadNovaPredictEnvironmentVariables()

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = ResolveLatestSuccessfulIngestRunId(
            connection,
            "FetchSleeperNflPlayerCatalogIngestJob",
        )
        if not ingest_run_id:
            raise RuntimeError("No successful Sleeper catalog ingest run found")

        rows = connection.execute(
            """
            SELECT sleeper_player_id, full_name, position, team, payload
            FROM raw_sleeper_player_catalog_snapshots
            WHERE ingest_run_id = %s
              AND position IN ('QB', 'RB', 'WR', 'TE')
            """,
            (ingest_run_id,),
        ).fetchall()

        upserted = 0
        batch: list[tuple] = []

        for sleeper_player_id, full_name, position, team, payload in rows:
            payload_dict = payload if isinstance(payload, dict) else json.loads(payload)
            if not payload_dict.get("active"):
                continue

            espn_id = payload_dict.get("espn_id")
            espn_athlete_id = str(espn_id) if espn_id else None
            headshot_url = (
                f"https://a.espncdn.com/i/headshots/nfl/players/full/{espn_athlete_id}.png"
                if espn_athlete_id
                else None
            )

            batch.append(
                (
                    str(sleeper_player_id),
                    str(sleeper_player_id),
                    full_name,
                    position,
                    team,
                    espn_athlete_id,
                    headshot_url,
                )
            )

            if len(batch) >= BATCH_SIZE:
                with connection.cursor() as cursor:
                    cursor.executemany(
                        """
                        INSERT INTO players (id, sleeper_id, full_name, position, team, espn_athlete_id, headshot_url)
                        VALUES (%s, %s, %s, %s, %s, %s, %s)
                        ON CONFLICT (id) DO UPDATE SET
                          full_name = EXCLUDED.full_name,
                          position = EXCLUDED.position,
                          team = EXCLUDED.team,
                          espn_athlete_id = EXCLUDED.espn_athlete_id,
                          headshot_url = EXCLUDED.headshot_url
                        """,
                        batch,
                    )
                upserted += len(batch)
                batch.clear()

        if batch:
            with connection.cursor() as cursor:
                cursor.executemany(
                    """
                    INSERT INTO players (id, sleeper_id, full_name, position, team, espn_athlete_id, headshot_url)
                    VALUES (%s, %s, %s, %s, %s, %s, %s)
                    ON CONFLICT (id) DO UPDATE SET
                      full_name = EXCLUDED.full_name,
                      position = EXCLUDED.position,
                      team = EXCLUDED.team,
                      espn_athlete_id = EXCLUDED.espn_athlete_id,
                      headshot_url = EXCLUDED.headshot_url
                    """,
                    batch,
                )
            upserted += len(batch)

        return upserted


if __name__ == "__main__":
    count = NormalizeSleeperCatalogIntoPlayersTable()
    print(f"NormalizeSleeperCatalogIntoPlayersTable upserted {count} players")
