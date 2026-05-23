"""
ExtractFantasyPointsDistributionStatisticsFromMonteCarloArray
---------------------------------------------------------------
Summarizes Monte Carlo PPR simulation output into floor/median/ceiling/boom/bust.

Spec: Dev Stack Prompt 4 / monte_carlo FUNCTION 3.
"""

from __future__ import annotations

import numpy as np


def ExtractFantasyPointsDistributionStatisticsFromMonteCarloArray(
    ppr_array: np.ndarray,
) -> dict[str, float]:
    """
    Returns distribution stats dict from simulated PPR outcomes.
    """
    return {
        "floor_ppr": float(np.percentile(ppr_array, 10)),
        "p25_ppr": float(np.percentile(ppr_array, 25)),
        "median_ppr": float(np.percentile(ppr_array, 50)),
        "p75_ppr": float(np.percentile(ppr_array, 75)),
        "ceiling_ppr": float(np.percentile(ppr_array, 90)),
        "boom_pct": float(np.mean(ppr_array >= 20.0) * 100),
        "bust_pct": float(np.mean(ppr_array < 10.0) * 100),
        "mean_ppr": float(np.mean(ppr_array)),
        "std_ppr": float(np.std(ppr_array)),
    }
