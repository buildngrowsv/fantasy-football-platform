"""
FetchEspnNflNewsHeadlinesIngestJob
-----------------------------------
Pulls ESPN NFL news headlines into raw_espn_news_articles for narrative/sentiment pipeline.

Why news ingest early:
- Master Spec §4J requires beat reporter + headline context for the news overreaction filter.
- ESPN public news API is free and was verified live (2026-05-23) during data-source research.

Schedule (production):
- Wed–Sat every 6 hours per data-sources.md pull schedule.

Does NOT use mock data.
"""

from __future__ import annotations

import json
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

ESPN_NFL_NEWS_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=25"


def FetchEspnNflNewsHeadlinesIngestJob() -> int:
    """
    Fetches ESPN NFL news articles and persists raw JSON rows.
    Returns number of articles stored.
    """
    LoadNovaPredictEnvironmentVariables()

    response = httpx.get(ESPN_NFL_NEWS_URL, timeout=30.0)
    response.raise_for_status()
    payload = response.json()
    articles = payload.get("articles") or []

    if not isinstance(articles, list):
        raise RuntimeError("ESPN news response missing articles array")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchEspnNflNewsHeadlinesIngestJob",
            source_provider="espn_public_api",
            metadata={"endpoint": ESPN_NFL_NEWS_URL},
        )

        try:
            stored = 0
            for article in articles:
                article_id = str(article.get("id", "")).strip()
                headline = str(article.get("headline", "Untitled")).strip()
                if not article_id:
                    continue

                connection.execute(
                    """
                    INSERT INTO raw_espn_news_articles
                      (ingest_run_id, article_id, headline, payload)
                    VALUES (%s, %s, %s, %s::jsonb)
                    """,
                    (ingest_run_id, article_id, headline, json.dumps(article)),
                )
                stored += 1

            PersistIngestRunAuditRecordFinishSuccess(
                connection,
                ingest_run_id,
                row_count=stored,
            )
            return stored
        except Exception as exc:
            PersistIngestRunAuditRecordFinishFailed(connection, ingest_run_id, str(exc))
            raise


if __name__ == "__main__":
    count = FetchEspnNflNewsHeadlinesIngestJob()
    print(f"FetchEspnNflNewsHeadlinesIngestJob persisted {count} articles")
