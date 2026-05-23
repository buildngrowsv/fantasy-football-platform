"""
FetchOpenWeatherMapStadiumForecastIngestJob
--------------------------------------------
Scaffold for stadium weather forecasts — runs when OPENWEATHERMAP_API_KEY is set.

Stadium coordinates are loaded from nfl_teams table (seeded from nflverse teams release).
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path

import httpx

PIPELINE_ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(PIPELINE_ROOT))

from ingest.PersistIngestRunAuditRecord import (  # noqa: E402
    PersistIngestRunAuditRecordFinishFailed,
    PersistIngestRunAuditRecordFinishSuccess,
    PersistIngestRunAuditRecordStart,
)
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402

# Representative stadium coordinates until full stadium table is populated
STADIUM_COORDINATES: dict[str, tuple[float, float]] = {
    "BUF": (42.7738, -78.7870),
    "GB": (44.5013, -88.0622),
    "KC": (39.0489, -94.4839),
    "DAL": (32.7473, -97.0945),
    "MIA": (25.9580, -80.2389),
}


def FetchOpenWeatherMapStadiumForecastIngestJob() -> int:
    """
    Fetches 5-day forecast for known outdoor stadiums when API key is present.
    """
    LoadNovaPredictEnvironmentVariables()

    api_key = os.environ.get("OPENWEATHERMAP_API_KEY", "").strip()
    if not api_key:
        print("FetchOpenWeatherMapStadiumForecastIngestJob skipped — OPENWEATHERMAP_API_KEY not set")
        return 0

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchOpenWeatherMapStadiumForecastIngestJob",
            source_provider="openweathermap",
            metadata={"stadiums": list(STADIUM_COORDINATES.keys())},
        )

        try:
            stored = 0
            for team, (latitude, longitude) in STADIUM_COORDINATES.items():
                response = httpx.get(
                    "https://api.openweathermap.org/data/2.5/forecast",
                    params={"lat": latitude, "lon": longitude, "appid": api_key, "units": "imperial"},
                    timeout=30.0,
                )
                response.raise_for_status()
                forecast = response.json()

                connection.execute(
                    """
                    INSERT INTO raw_weather_forecasts (
                      ingest_run_id, team_abbreviation, latitude, longitude, payload
                    ) VALUES (%s, %s, %s, %s, %s::jsonb)
                    """,
                    (ingest_run_id, team, latitude, longitude, json.dumps(forecast)),
                )
                stored += 1

            PersistIngestRunAuditRecordFinishSuccess(connection, ingest_run_id, row_count=stored)
            return stored
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchOpenWeatherMapStadiumForecastIngestJob()
    print(f"FetchOpenWeatherMapStadiumForecastIngestJob persisted {count} forecasts")
