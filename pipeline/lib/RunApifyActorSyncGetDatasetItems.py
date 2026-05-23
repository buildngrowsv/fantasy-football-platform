"""
RunApifyActorSyncGetDatasetItems
---------------------------------
Shared HTTP client for calling Apify Actors synchronously and returning dataset items.

Why this exists (2026-05-23 Apify Browser rework):
- NovaPredict previously called ESPN/Sleeper/etc. with raw httpx from the pipeline container.
- Apify Browser (via `apify/playwright-scraper`) gives us managed Chromium, residential proxy
  rotation, and anti-bot handling without maintaining our own headless fleet on Cloudflare Workers.
- Every ingest job that uses Apify should go through ONE helper so token handling, actor slug
  formatting, timeout policy, and error parsing stay consistent.

Apify Browser actors we rely on today:
- `apify/playwright-scraper` — headless Chromium + Playwright pageFunction for JSON API URLs
- `zen-studio/draftkings-odds` — HTTP actor (not browser) for DK cross-validation
- `harvest/sportsbook-odds-scraper` — multi-book odds backup (browser-backed on Apify side)

Called by:
- FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser.py
- FetchApifyHarvestSportsbookOddsIngestJob.py
- FetchEspnNflScoreboardIngestJob.py (when APIFY_BROWSER_ENABLED=true)
- FetchEspnNflNewsHeadlinesIngestJob.py (when APIFY_BROWSER_ENABLED=true)

Environment:
- APIFY_API_TOKEN — required; stored in repo-root `.env` (gitignored)
- APIFY_BROWSER_ENABLED — optional; defaults to "true" when token is present

Product relevance:
- When ESPN throttles datacenter IPs, browser + Apify proxy keeps scoreboard/news flowing
  so matchup kickoff times and narrative filters do not stall mid-week.
"""

from __future__ import annotations

import os
from typing import Any

import httpx

APIFY_API_BASE_URL = "https://api.apify.com/v2"
DEFAULT_APIFY_SYNC_TIMEOUT_SECONDS = 120


def NormalizeApifyActorIdToApiSlug(actor_id: str) -> str:
    """
    Converts `username/actor-name` or `username~actor-name` into the Apify REST slug
    (`username~actor-name`) used by `/v2/acts/:actorId/...` endpoints.
    """
    normalized = actor_id.strip().replace("/", "~")
    if not normalized or "~" not in normalized:
        raise ValueError(f"Invalid Apify actor id: {actor_id!r}")
    return normalized


def ResolveApifyApiTokenFromEnvironment() -> str:
    """
    Returns APIFY_API_TOKEN or raises — ingest jobs should catch/skip when token missing.
    """
    token = os.environ.get("APIFY_API_TOKEN", "").strip()
    if not token:
        raise RuntimeError("APIFY_API_TOKEN is not set")
    return token


def ResolveApifyBrowserEnabledFromEnvironment() -> bool:
    """
    Browser-backed fetches are ON by default when a token exists unless explicitly disabled.

    Set APIFY_BROWSER_ENABLED=false to force direct httpx pulls during local debugging.
    """
    explicit = os.environ.get("APIFY_BROWSER_ENABLED", "").strip().lower()
    if explicit in {"0", "false", "no", "off"}:
        return False
    if explicit in {"1", "true", "yes", "on"}:
        return True
    return bool(os.environ.get("APIFY_API_TOKEN", "").strip())


def RunApifyActorSyncGetDatasetItems(
    actor_id: str,
    actor_input: dict[str, Any],
    *,
    timeout_seconds: int = DEFAULT_APIFY_SYNC_TIMEOUT_SECONDS,
    memory_megabytes: int | None = None,
) -> list[Any]:
    """
    Runs an Apify Actor synchronously via `run-sync-get-dataset-items` and returns dataset rows.

    Docs: https://docs.apify.com/api/v2/act-run-sync-get-dataset-items-post

    Raises RuntimeError when Apify returns an error object instead of a dataset list.
    """
    token = ResolveApifyApiTokenFromEnvironment()
    actor_slug = NormalizeApifyActorIdToApiSlug(actor_id)

    params: dict[str, str | int] = {
        "token": token,
        "timeout": timeout_seconds,
    }
    if memory_megabytes is not None:
        params["memory"] = memory_megabytes

    url = f"{APIFY_API_BASE_URL}/acts/{actor_slug}/run-sync-get-dataset-items"
    http_timeout = float(timeout_seconds + 45)

    response = httpx.post(url, params=params, json=actor_input, timeout=http_timeout)
    response.raise_for_status()
    payload = response.json()

    if isinstance(payload, dict) and payload.get("error"):
        error = payload["error"]
        message = error.get("message") if isinstance(error, dict) else str(error)
        error_type = error.get("type") if isinstance(error, dict) else "unknown"
        raise RuntimeError(f"Apify actor {actor_id} failed ({error_type}): {message}")

    if not isinstance(payload, list):
        raise RuntimeError(
            f"Apify actor {actor_id} returned unexpected payload type: {type(payload).__name__}"
        )

    return payload
