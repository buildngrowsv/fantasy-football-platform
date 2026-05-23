"""
ComputeAccountabilityCallsFromHistoricalBacktestJob
-----------------------------------------------------
Backtests trailing PPR projections against real nflverse weekly actuals.

Why historical backtest now (no API keys needed):
- Proves accountability UI with real projection vs actual pairs.
- Uses same trailing-4-week logic as live compute, applied to 2024 weeks 5–18.
- No fabricated hash-randomized numbers.
"""

from __future__ import annotations

import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from lib.BuildNovaPredictPlayerIdentityCrosswalkKey import BuildNovaPredictPlayerIdentityCrosswalkKey  # noqa: E402
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402

TRAILING_WEEKS = 4
HISTORICAL_SEASON = 2024
MIN_WEEK = 5
MAX_WEEK = 18


def ComputeAccountabilityCallsFromHistoricalBacktestJob() -> int:
    """
    Writes accountability_calls from trailing baseline backtest on 2024 actuals.
    """
    LoadNovaPredictEnvironmentVariables()

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        connection.execute("DELETE FROM accountability_calls WHERE week >= %s", (MIN_WEEK,))

        actual_rows = connection.execute(
            """
            SELECT player_name, team, position, week, fantasy_points_ppr
            FROM player_weekly_actuals
            WHERE season = %s AND season_type = 'REG'
            ORDER BY player_name, week
            """,
            (HISTORICAL_SEASON,),
        ).fetchall()

        weekly_by_key: dict[str, dict[int, float]] = {}
        for player_name, team, position, week, fantasy_points_ppr in actual_rows:
            key = BuildNovaPredictPlayerIdentityCrosswalkKey(player_name, team, position)
            weekly_by_key.setdefault(key, {})[int(week)] = float(fantasy_points_ppr)

        inserted = 0

        for key, week_map in weekly_by_key.items():
            for week in range(MIN_WEEK, MAX_WEEK + 1):
                if week not in week_map:
                    continue

                prior_weeks = sorted(week_number for week_number in week_map if week_number < week)
                trailing = prior_weeks[-TRAILING_WEEKS:]
                if len(trailing) < TRAILING_WEEKS:
                    continue

                projection = sum(week_map[week_number] for week_number in trailing) / len(trailing)
                actual = week_map[week]
                error = abs(actual - projection)

                if error <= 2.5:
                    classification = "correct"
                    diagnosis = "Trailing baseline held within 2.5 PPR of actual."
                elif error <= 6.0:
                    classification = "variance"
                    diagnosis = "Game script variance exceeded baseline but directionally plausible."
                else:
                    classification = "miss"
                    diagnosis = "Trailing baseline missed — role or usage shift likely."

                name_part, team_part, position_part = key.split("|")
                player_display = " ".join(word.capitalize() for word in name_part.split())

                connection.execute(
                    """
                    INSERT INTO accountability_calls (
                      player_name, position, team, projection, actual, classification, diagnosis, week
                    ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
                    """,
                    (
                        player_display,
                        position_part.upper(),
                        team_part.upper(),
                        round(projection, 2),
                        round(actual, 2),
                        classification,
                        diagnosis,
                        week,
                    ),
                )
                inserted += 1

        if inserted > 0:
            accuracy_row = connection.execute(
                """
                SELECT
                  AVG(CASE WHEN classification = 'correct' THEN 1.0 ELSE 0.0 END) * 100 AS accuracy
                FROM accountability_calls
                """
            ).fetchone()
            accuracy = float(accuracy_row[0] or 0)
            connection.execute(
                """
                UPDATE platform_metrics
                SET season_accuracy = %s
                WHERE id = (SELECT id FROM platform_metrics ORDER BY id LIMIT 1)
                """,
                (round(accuracy, 1),),
            )

        return inserted


if __name__ == "__main__":
    count = ComputeAccountabilityCallsFromHistoricalBacktestJob()
    print(f"ComputeAccountabilityCallsFromHistoricalBacktestJob inserted {count} calls")
