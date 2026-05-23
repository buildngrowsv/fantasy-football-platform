"""
BuildNovaPredictPlayerIdentityCrosswalkKey
--------------------------------------------
Builds a deterministic lowercase key for joining Sleeper catalog rows to nflverse stats.

Why name+team+position instead of ID maps:
- Sleeper `gsis_id` is often null (verified on CeeDee Lamb payload).
- nflverse uses GSIS-style IDs; Sleeper uses numeric IDs.
- Full name + team + position is stable enough for weekly stats joins at our scale,
  and both catalogs are refreshed from the same real NFL universe.

Called by:
- NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable.py
- ComputeWeeklyProjectionsFromRealWeeklyStatsJob.py
"""


def BuildNovaPredictPlayerIdentityCrosswalkKey(
    full_name: str,
    team: str | None,
    position: str | None,
) -> str:
    """
    Returns a normalized join key like "ceedee lamb|dal|wr".
    """
    normalized_name = " ".join(full_name.lower().split())
    normalized_team = (team or "").strip().lower()
    normalized_position = (position or "").strip().lower()
    return f"{normalized_name}|{normalized_team}|{normalized_position}"
