"""Vig removal computation tests — Dev Stack Prompt 2 spec cases."""

import pytest

from computation.vig.ConvertAmericanOddsToRawImpliedProbability import (
    ConvertAmericanOddsToRawImpliedProbability,
)
from computation.vig.RemoveVigFromTwoWayAmericanOddsMarket import (
    RemoveVigFromTwoWayAmericanOddsMarket,
)
from computation.vig.RemoveVigFromOneSidedAmericanOddsMarket import (
    RemoveVigFromOneSidedAmericanOddsMarket,
)
from computation.vig.ComputeCrossBookConsensusNoVigProbability import (
    ComputeCrossBookConsensusNoVigProbability,
)
from computation.vig.ComputePropMarketConfidenceScore import ComputePropMarketConfidenceScore


def test_american_to_raw_prob_plus_100():
    assert round(ConvertAmericanOddsToRawImpliedProbability(100), 4) == 0.5


def test_american_to_raw_prob_minus_110():
    assert round(ConvertAmericanOddsToRawImpliedProbability(-110), 4) == 0.5238


def test_american_to_raw_prob_zero_raises():
    with pytest.raises(ValueError):
        ConvertAmericanOddsToRawImpliedProbability(0)


def test_remove_vig_two_sided_sums_to_one():
    over, under = RemoveVigFromTwoWayAmericanOddsMarket(-110, -110)
    assert round(over, 4) == 0.5
    assert round(under, 4) == 0.5
    assert abs(over + under - 1.0) < 0.000001


def test_remove_vig_one_sided_primary():
    result = RemoveVigFromOneSidedAmericanOddsMarket(-120, "PRIMARY")
    assert round(result, 4) == 0.5051


def test_consensus_median_excludes_stale():
    consensus, count = ComputeCrossBookConsensusNoVigProbability(
        [0.55, 0.50, 0.60],
        [False, False, False],
        [False, True, False],
    )
    assert count == 2
    assert consensus == 0.575


def test_market_confidence_tight_lines():
    confidence = ComputePropMarketConfidenceScore([82.5, 82.5, 83.0], [False, False, False])
    assert confidence > 0.95
