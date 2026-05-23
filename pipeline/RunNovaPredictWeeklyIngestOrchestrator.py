"""
RunNovaPredictWeeklyIngestOrchestrator
---------------------------------------
Runs the full weekly ingest → normalize → compute chain in dependency order.

Why a single orchestrator entrypoint:
- Cloudflare Cron and n8n will invoke one command, not six separate scripts.
- Failures bubble up with clear stage names for Airtable error logging (Phase 1.3).

Stages:
1. Apply SQL migrations (idempotent)
2. Fetch external feeds (ESPN, Sleeper, nflverse, optional Odds API)
3. Normalize into core + app tables
4. Compute weekly projections from real trailing PPR stats

Called by:
- scripts/run-pipeline-weekly-ingest.sh
- Future workers/pipeline-orchestrator Cloudflare Cron binding
"""

from __future__ import annotations

import sys
import time
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PIPELINE_ROOT))

from ApplyNovaPredictIngestionSqlMigrations import ApplyNovaPredictIngestionSqlMigrations  # noqa: E402
from compute.ComputeWeeklyProjectionsFromRealWeeklyStatsJob import (  # noqa: E402
    ComputeWeeklyProjectionsFromRealWeeklyStatsJob,
)
from ingest.FetchEspnNflNewsHeadlinesIngestJob import FetchEspnNflNewsHeadlinesIngestJob  # noqa: E402
from ingest.FetchEspnNflScoreboardIngestJob import FetchEspnNflScoreboardIngestJob  # noqa: E402
from ingest.FetchNflverseGamesScheduleIngestJob import FetchNflverseGamesScheduleIngestJob  # noqa: E402
from ingest.FetchNflverseWeeklyPlayerStatsIngestJob import FetchNflverseWeeklyPlayerStatsIngestJob  # noqa: E402
from ingest.FetchSleeperNflPlayerCatalogIngestJob import FetchSleeperNflPlayerCatalogIngestJob  # noqa: E402
from ingest.FetchTheOddsApiNflEventsIngestJob import FetchTheOddsApiNflEventsIngestJob  # noqa: E402
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from normalize.NormalizeEspnScoreboardIntoWeeklyMatchupsTable import (  # noqa: E402
    NormalizeEspnScoreboardIntoWeeklyMatchupsTable,
)
from normalize.NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable import (  # noqa: E402
    NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable,
)
from normalize.NormalizeSleeperCatalogIntoPlayersTable import NormalizeSleeperCatalogIntoPlayersTable  # noqa: E402


def RunNovaPredictWeeklyIngestOrchestrator() -> dict[str, int | float]:
    """
    Executes the full pipeline and returns stage result counts.
    """
    LoadNovaPredictEnvironmentVariables()
    started = time.time()
    results: dict[str, int | float] = {}

    migration_names = ApplyNovaPredictIngestionSqlMigrations()
    results["migrations_applied"] = len(migration_names)

    results["espn_scoreboard_events"] = FetchEspnNflScoreboardIngestJob()
    results["espn_news_articles"] = FetchEspnNflNewsHeadlinesIngestJob()
    results["sleeper_players"] = FetchSleeperNflPlayerCatalogIngestJob()
    results["nflverse_weekly_rows"] = FetchNflverseWeeklyPlayerStatsIngestJob()
    results["nflverse_games"] = FetchNflverseGamesScheduleIngestJob()
    results["odds_api_events"] = FetchTheOddsApiNflEventsIngestJob()

    results["players_upserted"] = NormalizeSleeperCatalogIntoPlayersTable()
    results["matchups_upserted"] = NormalizeEspnScoreboardIntoWeeklyMatchupsTable()
    results["weekly_actuals_upserted"] = NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable()
    results["projections_upserted"] = ComputeWeeklyProjectionsFromRealWeeklyStatsJob()

    results["elapsed_seconds"] = round(time.time() - started, 2)
    return results


if __name__ == "__main__":
    summary = RunNovaPredictWeeklyIngestOrchestrator()
    print("NovaPredict weekly ingest complete:")
    for stage, value in summary.items():
        print(f"  {stage}: {value}")
