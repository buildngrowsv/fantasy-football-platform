"""
NormalizeEspnScoreboardIntoWeeklyMatchupsTable
-----------------------------------------------
Parses the latest ESPN scoreboard raw ingest into weekly_team_matchups rows.

Why ESPN-first for matchups:
- Reflects the live slate the product UI shows (including preseason/off-season scheduling).
- nflverse schedule supplements when ESPN week metadata is missing.

Called by:
- RunNovaPredictWeeklyIngestOrchestrator.py after FetchEspnNflScoreboardIngestJob
"""

from __future__ import annotations

import json
import sys
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.ResolveLatestSuccessfulIngestRunId import ResolveLatestSuccessfulIngestRunId  # noqa: E402


def NormalizeEspnScoreboardIntoWeeklyMatchupsTable() -> int:
    """
    Upserts team/opponent pairings from latest ESPN scoreboard ingest.
    Returns matchup rows written.
    """
    LoadNovaPredictEnvironmentVariables()

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = ResolveLatestSuccessfulIngestRunId(
            connection,
            "FetchEspnNflScoreboardIngestJob",
        )
        if not ingest_run_id:
            raise RuntimeError("No successful ESPN scoreboard ingest run found")

        event_rows = connection.execute(
            """
            SELECT payload
            FROM raw_espn_scoreboard_events
            WHERE ingest_run_id = %s
            """,
            (ingest_run_id,),
        ).fetchall()

        if not event_rows:
            return 0

        sample_payload = event_rows[0][0]
        if isinstance(sample_payload, str):
            sample_payload = json.loads(sample_payload)

        season = int(sample_payload.get("season", {}).get("year") or 2025)
        week = int(sample_payload.get("week", {}).get("number") or 1)

        upserted = 0

        for (payload,) in event_rows:
            event = payload if isinstance(payload, dict) else json.loads(payload)
            competition = (event.get("competitions") or [{}])[0]
            competitors = competition.get("competitors") or []
            kickoff_at = competition.get("date")

            home_team = None
            away_team = None
            for competitor in competitors:
                abbreviation = competitor.get("team", {}).get("abbreviation")
                if not abbreviation:
                    continue
                if competitor.get("homeAway") == "home":
                    home_team = abbreviation
                elif competitor.get("homeAway") == "away":
                    away_team = abbreviation

            if not home_team or not away_team:
                continue

            for team, opponent, is_home in (
                (home_team, away_team, True),
                (away_team, home_team, False),
            ):
                matchup_label = f"{team} vs {opponent}" if is_home else f"{team} at {opponent}"
                connection.execute(
                    """
                    INSERT INTO weekly_team_matchups (
                      season, week, team, opponent, is_home, matchup_label, source_provider, kickoff_at
                    ) VALUES (%s, %s, %s, %s, %s, %s, 'espn_public_api', %s)
                    ON CONFLICT (season, week, team) DO UPDATE SET
                      opponent = EXCLUDED.opponent,
                      is_home = EXCLUDED.is_home,
                      matchup_label = EXCLUDED.matchup_label,
                      source_provider = EXCLUDED.source_provider,
                      kickoff_at = EXCLUDED.kickoff_at,
                      updated_at = NOW()
                    """,
                    (season, week, team, opponent, is_home, matchup_label, kickoff_at),
                )
                upserted += 1

            connection.execute(
                """
                INSERT INTO nfl_games (id, season, week, season_type, away_team, home_team, source_provider, payload)
                VALUES (%s, %s, %s, 'REG', %s, %s, 'espn_public_api', %s::jsonb)
                ON CONFLICT (id) DO UPDATE SET
                  away_team = EXCLUDED.away_team,
                  home_team = EXCLUDED.home_team,
                  payload = EXCLUDED.payload,
                  updated_at = NOW()
                """,
                (
                    str(event.get("id", "")),
                    season,
                    week,
                    away_team,
                    home_team,
                    json.dumps(event),
                ),
            )

        return upserted


if __name__ == "__main__":
    count = NormalizeEspnScoreboardIntoWeeklyMatchupsTable()
    print(f"NormalizeEspnScoreboardIntoWeeklyMatchupsTable upserted {count} matchups")
