"""
RemoveVigFromTwoWayAmericanOddsMarket
--------------------------------------
Removes vig from primary over/under two-sided markets.

Spec: Dev Stack Prompt 2 / vig_removal FUNCTION 2.
"""

from computation.vig.ConvertAmericanOddsToRawImpliedProbability import (
    ConvertAmericanOddsToRawImpliedProbability,
)


def RemoveVigFromTwoWayAmericanOddsMarket(over_odds: int, under_odds: int) -> tuple[float, float]:
    """
    Returns (novig_over_probability, novig_under_probability) summing to 1.0.
    """
    raw_over = ConvertAmericanOddsToRawImpliedProbability(over_odds)
    raw_under = ConvertAmericanOddsToRawImpliedProbability(under_odds)
    total = raw_over + raw_under

    novig_over = raw_over / total
    novig_under = raw_under / total

    if abs((novig_over + novig_under) - 1.0) > 0.000001:
        raise ValueError("No-vig probabilities do not sum to 1.0")

    return novig_over, novig_under
