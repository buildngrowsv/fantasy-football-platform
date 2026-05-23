# Apify Browser — NovaPredict Setup

**Date:** 2026-05-23  
**Account:** `buildngrowsv` · **Plan:** Starter ($29/mo + $29 usage credits)

This doc describes how NovaPredict uses **Apify Browser** (managed Playwright/Chromium) and related Apify actors for data ingestion.

---

## What “Apify Browser” means here

Apify does not ship a single product literally named “Apify Browser.” For our pipeline, **Apify Browser** means:

| Layer | Actor / API | Use in NovaPredict |
|-------|-------------|-------------------|
| **Playwright browser pool** | `apify/playwright-scraper` | Primary fetch for ESPN JSON endpoints (scoreboard, news) |
| **HTTP actor (Apify-hosted)** | `zen-studio/draftkings-odds` | DraftKings cross-validation vs The Odds API |
| **Multi-book browser scraper** | `harvest/sportsbook-odds-scraper` | FanDuel/DK/BetMGM/Caesars NFL backup lines |
| **RAG browser (not used for JSON APIs)** | `apify/rag-web-browser` | Tested — empty body for JSON URLs; keep for future HTML/RAG |
| **Dedicated ESPN actor (avoid)** | `hgservices/apify-actor-espn` | Returns NBA regardless of `sport:nfl` input (2026-05-23) |

---

## Environment variables

Add to repo-root `.env` (see `.env.example`):

```bash
APIFY_API_TOKEN=apify_api_...
APIFY_USER_ID=...                    # optional reference
APIFY_BROWSER_ENABLED=true           # default on when token set; set false for direct httpx
```

---

## Shared pipeline libraries

| File | Role |
|------|------|
| `pipeline/lib/RunApifyActorSyncGetDatasetItems.py` | REST client for `run-sync-get-dataset-items` |
| `pipeline/lib/FetchJsonDocumentFromUrlViaApifyPlaywrightBrowser.py` | ESPN-style JSON URL → parsed dict via Playwright |

---

## Ingest jobs wired to Apify

| Job | Source provider | Notes |
|-----|-----------------|-------|
| `FetchEspnNflScoreboardIngestJob` | `apify_playwright_browser_espn_scoreboard` | Falls back to `espn_public_api` |
| `FetchEspnNflNewsHeadlinesIngestJob` | `apify_playwright_browser_espn_news` | Falls back to `espn_public_api` |
| `FetchApifyDraftKingsOddsCrossValidationIngestJob` | `apify_zen_studio_draftkings_odds` | Skips if no token |
| `FetchApifyHarvestSportsbookOddsIngestJob` | `apify_harvest_sportsbook_odds` | Input: `{"league":"NFL"}` |

Neon tables: `raw_apify_draftkings_events`, `raw_apify_harvest_sportsbook_odds` (migration `009_apify_browser_ingest_tables.sql`).

---

## Actors evaluated but not wired yet

| Actor | Blocker |
|-------|---------|
| `scionic_dev/nfl-dfs-intelligence-monitor` | Requires full-account permission approval in Apify Console |
| `parseforge/nflverse-data-scraper` | Direct GitHub download is free/preferred |
| `hgservices/apify-actor-espn` | NFL input ignored (returns NBA) |

---

## Smoke tests

```bash
./scripts/ingest-smoke-tests.sh
```

New checks when `APIFY_API_TOKEN` is set:

- Apify auth + plan
- Playwright browser ESPN scoreboard (16 events off-season, May 2026)
- Harvest NFL sportsbook odds (~20 matchups)

---

## Cost guidance

| Item | Estimate |
|------|----------|
| Apify Starter | $29/mo base + $29 credits |
| Playwright ESPN pulls (2×/day × 7 days) | Low CU — well within Starter credits for dev |
| `harvest/sportsbook-odds-scraper` | Optional $49/mo actor subscription for heavy schedules |
| Production total (Apify supplement) | **$49–100/mo** on top of The Odds API + SportsDataIO |

---

## Related docs

- [data-source-research.md](./data-source-research.md) — full API vs Apify evaluation
- [data-sources.md](./data-sources.md) — operational feed map
