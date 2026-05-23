"""
BuildEmpiricalCumulativeDistributionFromWeeklyFantasyPoints
------------------------------------------------------------
Builds a CDF callable from real weekly PPR scores (nflverse actuals).

Why this exists before paid Odds API keys:
- We can run Monte Carlo and percentile extraction on REAL historical performance
  instead of waiting for Vegas alt ladders.
- Once The Odds API is live, FitMonotonicPlayerPropCumulativeDistributionFunction
  replaces this for market-driven CDFs.

Called by:
- EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob.py
"""

from __future__ import annotations

from typing import Callable

import numpy as np


def BuildEmpiricalCumulativeDistributionFromWeeklyFantasyPoints(
    weekly_fantasy_points: list[float],
) -> Callable[[float], float]:
    """
    Returns cdf_fn(x) = P(weekly PPR >= x) from empirical sample.
    """
    if len(weekly_fantasy_points) < 3:
        raise ValueError("Need at least 3 weekly scores for empirical CDF")

    sorted_scores = np.sort(np.array(weekly_fantasy_points, dtype=float))
    sample_size = len(sorted_scores)

    def cdf_fn(threshold: float) -> float:
        count_at_or_above = np.sum(sorted_scores >= threshold)
        return float(count_at_or_above / sample_size)

    cdf_fn.method = "EMPIRICAL"  # type: ignore[attr-defined]
    cdf_fn.n_points = sample_size  # type: ignore[attr-defined]

    return cdf_fn
