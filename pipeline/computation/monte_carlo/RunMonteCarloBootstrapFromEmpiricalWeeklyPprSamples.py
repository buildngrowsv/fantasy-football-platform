"""
RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples
----------------------------------------------------
Bootstraps fantasy PPR outcomes by resampling real weekly actuals.

Why bootstrap instead of yards/rec/TD copula without Vegas:
- We have real weekly PPR totals from nflverse now.
- Full correlated yards/rec simulation requires prop ladders (The Odds API — pending keys).
- Bootstrap MC still produces honest floor/median/ceiling/boom/bust from real history.
"""

from __future__ import annotations

import numpy as np

from computation.monte_carlo.ExtractFantasyPointsDistributionStatisticsFromMonteCarloArray import (
    ExtractFantasyPointsDistributionStatisticsFromMonteCarloArray,
)


def RunMonteCarloBootstrapFromEmpiricalWeeklyPprSamples(
    weekly_ppr_samples: list[float],
    scenario_count: int = 10_000,
) -> dict[str, float]:
    """
    Resamples weekly PPR scores with replacement and returns distribution stats.
    """
    if len(weekly_ppr_samples) < 3:
        raise ValueError("Need at least 3 weekly PPR samples")

    sample_array = np.array(weekly_ppr_samples, dtype=float)
    simulated = np.random.choice(sample_array, size=scenario_count, replace=True)
    return ExtractFantasyPointsDistributionStatisticsFromMonteCarloArray(simulated)
