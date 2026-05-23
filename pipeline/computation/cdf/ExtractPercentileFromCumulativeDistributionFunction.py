"""
ExtractPercentileFromCumulativeDistributionFunction
----------------------------------------------------
Binary search inverse CDF for percentile extraction.

Spec: Dev Stack Prompt 3 / cdf_engine FUNCTION 3.
"""

from __future__ import annotations

from typing import Callable


def ExtractPercentileFromCumulativeDistributionFunction(
    cdf_fn: Callable[[float], float],
    target_probability: float,
    search_min: float = 0.0,
    search_max: float = 400.0,
    tolerance: float = 0.001,
) -> float:
    """
    Finds threshold x where P(stat >= x) ≈ target_probability.
    """
    if cdf_fn(search_min) < target_probability:
        return search_min
    if cdf_fn(search_max) > target_probability:
        return search_max

    low = search_min
    high = search_max

    while high - low > tolerance:
        mid = (low + high) / 2.0
        if cdf_fn(mid) > target_probability:
            low = mid
        else:
            high = mid

    return (low + high) / 2.0
