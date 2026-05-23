"""
FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser
--------------------------------------------------
Uses Apify's managed Playwright browser (`apify/playwright-scraper`) to load a URL and
return parsed JSON from the response body.

Why Playwright browser instead of raw httpx:
- ESPN and other sports APIs sometimes block or rate-limit cloud/datacenter egress.
- Apify Playwright runs in their browser pool with proxy rotation — same pattern we validated
  live on 2026-05-23 (16 NFL scoreboard events, 25 news articles).
- `apify/rag-web-browser` was tested but returned empty text for JSON API URLs; Playwright
  pageFunction with `response.text()` + `JSON.parse` is the reliable path for our feeds.

Called by:
- FetchEspnNflScoreboardIngestJob.py
- FetchEspnNflNewsHeadlinesIngestJob.py

Does NOT use mock/sample data — executes a real Apify actor run against the target URL.
"""

from __future__ import annotations

from typing import Any

from lib.RunApifyActorSyncGetDatasetItems import RunApifyActorSyncGetDatasetItems

APIFY_PLAYWRIGHT_SCRAPER_ACTOR_ID = "apify/playwright-scraper"

# Minimal pageFunction: navigate, read body, parse JSON. Kept inline so actor input is self-contained.
APIFY_PLAYWRIGHT_JSON_PAGE_FUNCTION = """
async function pageFunction(context) {
    const response = await context.page.goto(context.request.url);
    const text = await response.text();
    return JSON.parse(text);
}
""".strip()


def BuildApifyPlaywrightJsonFetchActorInput(target_url: str) -> dict[str, Any]:
    """
    Builds actor input for a single-URL JSON document fetch via Playwright browser.
    """
    return {
        "startUrls": [{"url": target_url}],
        "pageFunction": APIFY_PLAYWRIGHT_JSON_PAGE_FUNCTION,
        "maxRequestsPerCrawl": 1,
    }


def FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser(
    target_url: str,
    *,
    timeout_seconds: int = 120,
) -> dict[str, Any]:
    """
    Loads `target_url` in Apify Playwright browser and returns the parsed JSON object.

    The actor dataset normally contains one item — the root JSON document from the endpoint.
    """
    actor_input = BuildApifyPlaywrightJsonFetchActorInput(target_url)
    dataset_items = RunApifyActorSyncGetDatasetItems(
        APIFY_PLAYWRIGHT_SCRAPER_ACTOR_ID,
        actor_input,
        timeout_seconds=timeout_seconds,
    )

    if not dataset_items:
        raise RuntimeError(f"Apify Playwright browser returned no dataset items for {target_url}")

    document = dataset_items[0]
    if not isinstance(document, dict):
        raise RuntimeError(
            f"Apify Playwright browser expected JSON object for {target_url}, got {type(document).__name__}"
        )

    return document
