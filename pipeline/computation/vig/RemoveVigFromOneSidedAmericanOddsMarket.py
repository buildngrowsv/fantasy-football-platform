"""
RemoveVigFromOneSidedAmericanOddsMarket
----------------------------------------
Removes vig from alt-line / milestone one-sided markets.

Spec: Dev Stack Prompt 2 / vig_removal FUNCTION 3.
"""

from computation.vig.ConvertAmericanOddsToRawImpliedProbability import (
    ConvertAmericanOddsToRawImpliedProbability,
)


def RemoveVigFromOneSidedAmericanOddsMarket(
    american_odds: int,
    book_tier: str = "PRIMARY",
) -> float:
    """
    Returns no-vig probability for a one-sided market.
    book_tier: PRIMARY (8% vig) or SECONDARY (10% vig).
    """
    vig_rate = 0.08 if book_tier == "PRIMARY" else 0.10
    raw_probability = ConvertAmericanOddsToRawImpliedProbability(american_odds)
    novig_probability = raw_probability / (1.0 + vig_rate)
    return max(0.0, min(1.0, novig_probability))
