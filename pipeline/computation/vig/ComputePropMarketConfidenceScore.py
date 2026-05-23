"""
ComputePropMarketConfidenceScore
-----------------------------------
Measures cross-book line agreement for market confidence scoring.

Spec: Dev Stack Prompt 2 / vig_removal FUNCTION 5.
"""

import statistics


def ComputePropMarketConfidenceScore(
    primary_lines: list[float],
    is_stale: list[bool],
) -> float:
    """
    Returns confidence score in [0, 1] based on book spread vs median line.
    """
    active_lines = [line for line, stale in zip(primary_lines, is_stale) if not stale]

    if len(active_lines) < 2:
        return 0.50

    book_spread = max(active_lines) - min(active_lines)
    consensus_median = statistics.median(active_lines)

    if consensus_median == 0:
        return 0.50

    confidence = 1.0 - (book_spread / consensus_median)
    return max(0.0, min(1.0, confidence))
