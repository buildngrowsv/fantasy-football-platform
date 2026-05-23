"""CDF computation tests."""

from computation.cdf.ValidateCumulativeDistributionFunctionPoints import (
    ValidateCumulativeDistributionFunctionPoints,
)
from computation.cdf.FitMonotonicPlayerPropCumulativeDistributionFunction import (
    FitMonotonicPlayerPropCumulativeDistributionFunction,
)
from computation.cdf.ExtractPercentileFromCumulativeDistributionFunction import (
    ExtractPercentileFromCumulativeDistributionFunction,
)


SAMPLE_CDF_POINTS = [
    (25.0, 0.912),
    (50.0, 0.748),
    (75.0, 0.543),
    (100.0, 0.331),
    (125.0, 0.187),
    (150.0, 0.094),
]


def test_validate_cdf_points_ok():
    is_valid, status = ValidateCumulativeDistributionFunctionPoints(SAMPLE_CDF_POINTS)
    assert is_valid is True
    assert status == "OK"


def test_validate_cdf_insufficient():
    is_valid, status = ValidateCumulativeDistributionFunctionPoints(SAMPLE_CDF_POINTS[:2])
    assert is_valid is False
    assert status == "INSUFFICIENT"


def test_fit_cdf_pchip_median_near_75():
    cdf_fn = FitMonotonicPlayerPropCumulativeDistributionFunction(SAMPLE_CDF_POINTS)
    median = ExtractPercentileFromCumulativeDistributionFunction(cdf_fn, 0.50)
    assert 70 <= median <= 85
