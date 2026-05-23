"""
ComputeCrossBookConsensusNoVigProbability
------------------------------------------
Median consensus across books with Pinnacle double-weight and stale exclusion.

Spec: Dev Stack Prompt 2 / vig_removal FUNCTION 4.
"""

import statistics


def ComputeCrossBookConsensusNoVigProbability(
    probabilities: list[float],
    is_pinnacle: list[bool],
    is_stale: list[bool],
) -> tuple[float, int]:
    """
    Returns (consensus_probability, active_book_count).
    """
    weighted: list[float] = []

    for probability, pinnacle_flag, stale_flag in zip(probabilities, is_pinnacle, is_stale):
        if stale_flag:
            continue
        weighted.append(probability)
        if pinnacle_flag:
            weighted.append(probability)

    active_book_count = len([s for s in is_stale if not s])
    if active_book_count < 1:
        raise ValueError("No active books")

    if not weighted:
        raise ValueError("No active books")

    return statistics.median(weighted), active_book_count
