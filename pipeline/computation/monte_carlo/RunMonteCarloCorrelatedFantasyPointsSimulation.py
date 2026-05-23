"""
RunMonteCarloCorrelatedFantasyPointsSimulation
-------------------------------------------------
Simulates correlated yards/receptions/TDs into PPR outcomes via Gaussian copula.

Spec: Dev Stack Prompt 4 / monte_carlo FUNCTION 2.
When full Vegas CDFs are unavailable, callers can pass empirical CDFs built from
real nflverse weekly actuals — still real data, not synthetic placeholders.
"""

from __future__ import annotations

from typing import Callable

import numpy as np
from scipy.stats import norm

from computation.cdf.ExtractPercentileFromCumulativeDistributionFunction import (
    ExtractPercentileFromCumulativeDistributionFunction,
)


def _SampleFromCdfUsingUniformQuantiles(
    cdf_fn: Callable[[float], float],
    uniform_samples: np.ndarray,
    search_max: float = 400.0,
) -> np.ndarray:
    """
    Maps uniform [0,1] samples through inverse CDF via percentile extraction.
    """
    results = np.empty(len(uniform_samples), dtype=float)
    for index, uniform_value in enumerate(uniform_samples):
        target_probability = float(uniform_value)
        results[index] = ExtractPercentileFromCumulativeDistributionFunction(
            cdf_fn,
            target_probability,
            search_max=search_max,
        )
    return results


def RunMonteCarloCorrelatedFantasyPointsSimulation(
    yards_cdf: Callable[[float], float],
    receptions_cdf: Callable[[float], float],
    touchdown_probabilities: dict[str, float],
    correlation_coefficient: float,
    scenario_count: int = 100_000,
    scoring_format: str = "PPR",
) -> np.ndarray:
    """
    Returns array of simulated PPR fantasy point outcomes.
    """
    rec_points_multiplier = {"PPR": 1.0, "HALF_PPR": 0.5, "STANDARD": 0.0}.get(scoring_format, 1.0)

    covariance = np.array([[1.0, correlation_coefficient], [correlation_coefficient, 1.0]])
    cholesky = np.linalg.cholesky(covariance)
    normal_draws = np.random.standard_normal((2, scenario_count))
    correlated_normals = cholesky @ normal_draws
    uniform_draws = norm.cdf(correlated_normals)

    yards_samples = _SampleFromCdfUsingUniformQuantiles(yards_cdf, uniform_draws[0])
    receptions_samples = _SampleFromCdfUsingUniformQuantiles(receptions_cdf, uniform_draws[1], search_max=20.0)

    td_one_plus = max(0.0, touchdown_probabilities.get("td_1plus", 0.0))
    td_two_plus = max(0.0, touchdown_probabilities.get("td_2plus", 0.0))
    td_three_plus = max(0.0, touchdown_probabilities.get("td_3plus", 0.0))

    prob_zero = max(0.0, 1.0 - td_one_plus)
    prob_one = max(0.0, td_one_plus - td_two_plus)
    prob_two = max(0.0, td_two_plus - td_three_plus)
    prob_three = max(0.0, td_three_plus)

    td_samples = np.random.choice(
        [0, 1, 2, 3],
        size=scenario_count,
        p=[prob_zero, prob_one, prob_two, prob_three],
    )

    ppr_outcomes = (yards_samples / 10.0) + (receptions_samples * rec_points_multiplier) + (td_samples * 6.0)
    return np.maximum(ppr_outcomes, 0.0)
