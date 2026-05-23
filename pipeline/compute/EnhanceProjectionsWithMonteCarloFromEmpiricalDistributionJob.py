"""
EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob
-------------------------------------------------------------
Updates player_projections boom/bust/nova using bootstrap MC on real weekly actuals.

Runs without API keys — uses player_weekly_actuals from nflverse ingest.
"""

from __future__ import annotations

import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from computation.monte_carlo.RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples import (  # noqa: E402
    RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples,
)
from lib.BuildNovaPredictPlayerIdentityCrosswalkKey import BuildNovaPredictPlayerIdentityCrosswalkKey  # noqa: E402
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402

MIN_WEEKS_FOR_MC = 6
HISTORICAL_SEASON = 2024


def EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob() -> int:
    """
    Enhances current-week projections with MC stats derived from real weekly PPR history.
    """
    LoadNovaPredictEnvironmentVariables()

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        actual_rows = connection.execute(
            """
            SELECT player_name, team, position, week, fantasy_points_ppr
            FROM player_weekly_actuals
            WHERE season = %s AND season_type = 'REG'
            ORDER BY player_name, week
            """,
            (HISTORICAL_SEASON,),
        ).fetchall()

        weekly_by_key: dict[str, list[float]] = {}
        for player_name, team, position, week, fantasy_points_ppr in actual_rows:
            key = BuildNovaPredictPlayerIdentityCrosswalkKey(player_name, team, position)
            weekly_by_key.setdefault(key, []).append(float(fantasy_points_ppr))

        projection_rows = connection.execute(
            """
            SELECT id, player_id, player_name, position, team, season, week, vegas_ppr
            FROM player_projections
            ORDER BY updated_at DESC
            """
        ).fetchall()

        enhanced = 0

        for projection_id, player_id, player_name, position, team, season, week, vegas_ppr in projection_rows:
            key = BuildNovaPredictPlayerIdentityCrosswalkKey(player_name, team, position)
            weekly_scores = weekly_by_key.get(key, [])

            if len(weekly_scores) < MIN_WEEKS_FOR_MC:
                continue

            mc_stats = RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples(weekly_scores, scenario_count=10_000)

            connection.execute(
                """
                UPDATE player_projections
                SET nova_ppr = %s,
                    boom_probability = %s,
                    bust_probability = %s,
                    move_type = 'Empirical MC (10K bootstrap)',
                    updated_at = NOW()
                WHERE id = %s
                """,
                (
                    round(mc_stats["median_ppr"], 2),
                    round(mc_stats["boom_pct"], 2),
                    round(mc_stats["bust_pct"], 2),
                    projection_id,
                ),
            )
            enhanced += 1

        connection.execute(
            """
            UPDATE platform_metrics
            SET monte_carlo_runs = 10000
            WHERE id = (SELECT id FROM platform_metrics ORDER BY id LIMIT 1)
            """
        )

        return enhanced


if __name__ == "__main__":
    count = EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob()
    print(f"EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob enhanced {count} projections")
