"""
FitMonotonicPlayerPropCumulativeDistributionFunction
------------------------------------------------------
Fits PCHIP or linear CDF through vig-free prop ladder points.

Spec: Dev Stack Prompt 3 / cdf_engine FUNCTION 2.
"""

from __future__ import annotations

from typing import Callable

import numpy as np
from scipy.interpolate import PchipInterpolator, interp1d

from computation.cdf.ValidateCumulativeDistributionFunctionPoints import (
    ValidateCumulativeDistributionFunctionPoints,
)


def FitMonotonicPlayerPropCumulativeDistributionFunction(
    points: list[tuple[float, float]],
    boundary_lower: float = 0.0,
    boundary_upper: float = 500.0,
) -> Callable[[float], float]:
    """
    Returns callable cdf_fn(x) -> P(stat >= x), clamped to [0, 1].
    """
    is_valid, status = ValidateCumulativeDistributionFunctionPoints(points)
    if not is_valid:
        raise ValueError(f"Invalid CDF points: {status}")

    expanded = list(points)
    if expanded[0][0] > boundary_lower:
        expanded.insert(0, (boundary_lower, 1.0))
    if expanded[-1][0] < boundary_upper:
        expanded.append((boundary_upper, 0.0))

    thresholds = np.array([point[0] for point in expanded], dtype=float)
    probabilities = np.array([point[1] for point in expanded], dtype=float)

    if len(points) >= 6:
        interpolator = PchipInterpolator(thresholds, probabilities, extrapolate=False)
        method = "PCHIP"
        confidence_penalty = 0.0
    else:
        interpolator = interp1d(
            thresholds,
            probabilities,
            kind="linear",
            bounds_error=False,
            fill_value=(1.0, 0.0),
        )
        method = "LINEAR"
        confidence_penalty = 0.25

    def cdf_fn(value: float) -> float:
        if value <= boundary_lower:
            return 1.0
        if value >= boundary_upper:
            return 0.0
        result = float(interpolator(value))
        return max(0.0, min(1.0, result))

    cdf_fn.method = method  # type: ignore[attr-defined]
    cdf_fn.n_points = len(points)  # type: ignore[attr-defined]
    cdf_fn.confidence_penalty = confidence_penalty  # type: ignore[attr-defined]

    return cdf_fn
