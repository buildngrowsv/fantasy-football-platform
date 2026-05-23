"""
ValidateCumulativeDistributionFunctionPoints
----------------------------------------------
Validates alt-ladder CDF input points before PCHIP fitting.

Spec: Dev Stack Prompt 3 / cdf_engine FUNCTION 1.
"""

from __future__ import annotations


def ValidateCumulativeDistributionFunctionPoints(
    points: list[tuple[float, float]],
) -> tuple[bool, str]:
    """
    Validates (threshold, probability) CDF ladder points.
    Returns (is_valid, status_code).
    """
    if len(points) < 4:
        return False, "INSUFFICIENT"

    thresholds = [point[0] for point in points]
    probabilities = [point[1] for point in points]

    if thresholds != sorted(thresholds) or len(set(thresholds)) != len(thresholds):
        return False, "NON_MONOTONIC"

    if probabilities != sorted(probabilities, reverse=True):
        return False, "NON_MONOTONIC"

    for probability in probabilities:
        if not 0.0 < probability < 1.0:
            return False, "OUT_OF_RANGE"

    return True, "OK"
