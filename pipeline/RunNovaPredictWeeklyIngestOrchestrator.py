"""
RunNovaPredictWeeklyIngestOrchestrator
---------------------------------------
Full weekly pipeline: ingest → normalize → compute → MC → accountability.
"""

from __future__ import annotations

import sys
import time
import uuid
from pathlib import Path

PIPELINE_ROOT = Path(__file__).resolve().parent
sys.path.insert(0, str(PIPELINE_ROOT))

from ApplyNovaPredictIngestionSqlMigrations import ApplyNovaPredictIngestionSqlMigrations  # noqa: E402
from accountability.ComputeAccountabilityCallsFromHistoricalBacktestJob import (  # noqa: E402
    ComputeAccountabilityCallsFromHistoricalBacktestJob,
)
from compute.ComputeWeeklyProjectionsFromRealWeeklyStatsJob import (  # noqa: E402
    ComputeWeeklyProjectionsFromRealWeeklyStatsJob,
)
from compute.EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob import (  # noqa: E402
    EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob,
)
from ingest.FetchApifyDraftKingsOddsCrossValidationIngestJob import (  # noqa: E402
    FetchApifyDraftKingsOddsCrossValidationIngestJob,
)
from ingest.FetchApifyHarvestSportsbookOddsIngestJob import (  # noqa: E402
    FetchApifyHarvestSportsbookOddsIngestJob,
)
from ingest.FetchEspnNflNewsHeadlinesIngestJob import FetchEspnNflNewsHeadlinesIngestJob  # noqa: E402
from ingest.FetchEspnNflScoreboardIngestJob import FetchEspnNflScoreboardIngestJob  # noqa: E402
from ingest.FetchNflverseGamesScheduleIngestJob import FetchNflverseGamesScheduleIngestJob  # noqa: E402
from ingest.FetchNflverseWeeklyPlayerStatsIngestJob import FetchNflverseWeeklyPlayerStatsIngestJob  # noqa: E402
from ingest.FetchOpenWeatherMapStadiumForecastIngestJob import (  # noqa: E402
    FetchOpenWeatherMapStadiumForecastIngestJob,
)
from ingest.FetchSleeperNflPlayerCatalogIngestJob import FetchSleeperNflPlayerCatalogIngestJob  # noqa: E402
from ingest.FetchSportsDataIoNflInjuriesIngestJob import FetchSportsDataIoNflInjuriesIngestJob  # noqa: E402
from ingest.FetchTheOddsApiNflEventsIngestJob import FetchTheOddsApiNflEventsIngestJob  # noqa: E402
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.PersistPipelineRunSummaryRecord import (  # noqa: E402
    PersistPipelineRunSummaryRecordFinishFailed,
    PersistPipelineRunSummaryRecordFinishSuccess,
    PersistPipelineRunSummaryRecordStart,
)
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
    run_id: uuid.UUID | None = None

    migration_names = ApplyNovaPredictIngestionSqlMigrations()
    results["migrations_applied"] = len(migration_names)

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        run_id = PersistPipelineRunSummaryRecordStart(
            connection,
            "RunNovaPredictWeeklyIngestOrchestrator",
        )

    try:
        results["espn_scoreboard_events"] = FetchEspnNflScoreboardIngestJob()
        results["espn_news_articles"] = FetchEspnNflNewsHeadlinesIngestJob()
        results["sleeper_players"] = FetchSleeperNflPlayerCatalogIngestJob()
        results["nflverse_weekly_rows"] = FetchNflverseWeeklyPlayerStatsIngestJob()
        results["nflverse_games"] = FetchNflverseGamesScheduleIngestJob()
        results["apify_draftkings_events"] = FetchApifyDraftKingsOddsCrossValidationIngestJob()
        results["apify_harvest_sportsbook_odds"] = FetchApifyHarvestSportsbookOddsIngestJob()
        results["odds_api_events"] = FetchTheOddsApiNflEventsIngestJob()
        results["openweather_forecasts"] = FetchOpenWeatherMapStadiumForecastIngestJob()
        results["sportsdataio_injuries"] = FetchSportsDataIoNflInjuriesIngestJob()

        results["players_upserted"] = NormalizeSleeperCatalogIntoPlayersTable()
        results["matchups_upserted"] = NormalizeEspnScoreboardIntoWeeklyMatchupsTable()
        results["weekly_actuals_upserted"] = NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable()
        results["projections_upserted"] = ComputeWeeklyProjectionsFromRealWeeklyStatsJob()
        results["projections_mc_enhanced"] = EnhanceProjectionsWithMonteCarloFromEmpiricalDistributionJob()
        results["accountability_calls_inserted"] = ComputeAccountabilityCallsFromHistoricalBacktestJob()

        results["elapsed_seconds"] = round(time.time() - started, 2)

        with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
            if run_id:
                PersistPipelineRunSummaryRecordFinishSuccess(connection, run_id, results)

        return results
    except Exception as exc:
        with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
            if run_id:
                PersistPipelineRunSummaryRecordFinishFailed(connection, run_id, str(exc), results)
        raise


if __name__ == "__main__":
    summary = RunNovaPredictWeeklyIngestOrchestrator()
    print("NovaPredict weekly ingest complete:")
    for stage, value in summary.items():
        print(f"  {stage}: {value}")
