"""
ConvertAmericanOddsToRawImpliedProbability
---------------------------------------------
Converts American sportsbook odds to raw implied probability (includes vig).

Spec: Dev Stack Prompt 2 / vig_removal FUNCTION 1.
Pure function — no I/O. Used by all vig removal and consensus modules.
"""


def ConvertAmericanOddsToRawImpliedProbability(american_odds: int) -> float:
    """
    Returns raw implied probability for American odds.
    """
    if american_odds == 0:
        raise ValueError("Odds cannot be zero")

    if american_odds > 0:
        raw_probability = 100 / (american_odds + 100)
    else:
        raw_probability = abs(american_odds) / (abs(american_odds) + 100)

    if not 0.0 < raw_probability < 1.0:
        raise ValueError(f"Raw probability out of range: {raw_probability}")

    return raw_probability
