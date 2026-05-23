"""
NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable
----------------------------------------------------------
Promotes raw nflverse weekly rows into player_weekly_actuals (deduplicated).

Why a normalized actuals table:
- ComputeWeeklyProjectionsFromRealWeeklyStatsJob reads trailing PPR from here.
- Accountability engine (Phase 3) will compare projections to these actuals post-game.

Called by:
- RunNovaPredictWeeklyIngestOrchestrator.py after FetchNflverseWeeklyPlayerStatsIngestJob
"""

from __future__ import annotations

import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.ResolveLatestSuccessfulIngestRunId import ResolveLatestSuccessfulIngestRunId  # noqa: E402


def NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable() -> int:
    """
    Upserts player_weekly_actuals from latest nflverse weekly stats ingest.
    """
    LoadNovaPredictEnvironmentVariables()

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = ResolveLatestSuccessfulIngestRunId(
            connection,
            "FetchNflverseWeeklyPlayerStatsIngestJob",
        )
        if not ingest_run_id:
            raise RuntimeError("No successful nflverse weekly stats ingest run found")

        result = connection.execute(
            """
            INSERT INTO player_weekly_actuals (
              nflverse_player_id, player_name, position, team, season, week, season_type,
              opponent_team, fantasy_points_ppr, source_provider
            )
            SELECT
              nflverse_player_id,
              player_name,
              COALESCE(position, 'WR'),
              team,
              season,
              week,
              season_type,
              opponent_team,
              COALESCE(fantasy_points_ppr, 0),
              'nflverse'
            FROM raw_nflverse_weekly_player_stats
            WHERE ingest_run_id = %s
            ON CONFLICT (nflverse_player_id, season, week, season_type) DO UPDATE SET
              player_name = EXCLUDED.player_name,
              position = EXCLUDED.position,
              team = EXCLUDED.team,
              opponent_team = EXCLUDED.opponent_team,
              fantasy_points_ppr = EXCLUDED.fantasy_points_ppr,
              updated_at = NOW()
            """,
            (ingest_run_id,),
        )

        return result.rowcount or 0


if __name__ == "__main__":
    count = NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable()
    print(f"NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable upserted {count} actual rows")
