"""
FetchEspnNflNewsHeadlinesIngestJob
-----------------------------------
Pulls ESPN NFL news headlines into raw_espn_news_articles for narrative/sentiment pipeline.

Fetch path (reworked 2026-05-23 — Apify Browser primary):
- **Primary:** Apify Playwright browser when `APIFY_API_TOKEN` is set (25 articles validated live).
- **Fallback:** Direct httpx when token missing or `APIFY_BROWSER_ENABLED=false`.

Why news via Apify Browser:
- Headline pulls run Wed–Sat q6h; consistent egress through Apify reduces intermittent blocks
  that would starve the Master Spec §4J news overreaction filter.

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
from lib.FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser import (  # noqa: E402
    FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser,
)
from lib.LoadNovaPredictEnvironmentVariables import LoadNovaPredictEnvironmentVariables  # noqa: E402
from lib.OpenNovaPredictNeonDatabaseConnection import OpenNovaPredictNeonDatabaseConnectionContext  # noqa: E402
from lib.RunApifyActorSyncGetDatasetItems import ResolveApifyBrowserEnabledFromEnvironment  # noqa: E402

ESPN_NFL_NEWS_URL = "https://site.api.espn.com/apis/site/v2/sports/football/nfl/news?limit=25"


def _FetchEspnNflNewsPayload() -> tuple[dict, str]:
    """
    Returns (news_json, source_provider_label) using Apify browser or direct HTTP.
    """
    if ResolveApifyBrowserEnabledFromEnvironment():
        payload = FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser(ESPN_NFL_NEWS_URL)
        return payload, "apify_playwright_browser_espn_news"

    response = httpx.get(ESPN_NFL_NEWS_URL, timeout=30.0)
    response.raise_for_status()
    return response.json(), "espn_public_api"


def FetchEspnNflNewsHeadlinesIngestJob() -> int:
    """
    Fetches ESPN NFL news articles and persists raw JSON rows.
    Returns number of articles stored.
    """
    LoadNovaPredictEnvironmentVariables()

    payload, source_provider = _FetchEspnNflNewsPayload()
    articles = payload.get("articles") or []

    if not isinstance(articles, list):
        raise RuntimeError("ESPN news response missing articles array")

    with OpenNovaPredictNeonDatabaseConnectionContext() as connection:
        ingest_run_id = PersistIngestRunAuditRecordStart(
            connection,
            job_name="FetchEspnNflNewsHeadlinesIngestJob",
            source_provider=source_provider,
            metadata={
                "endpoint": ESPN_NFL_NEWS_URL,
                "fetch_mode": "apify_playwright_browser"
                if source_provider.startswith("apify_")
                else "direct_http",
            },
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
