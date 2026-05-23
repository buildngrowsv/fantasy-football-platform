# Data Source Research — API & Apify Evaluation

**Date:** 2026-05-23  
**Purpose:** Validate which APIs we need, whether they are sufficient for the Master Spec, and whether **Apify should replace or supplement** official feeds.  
**Method:** Perplexity (`vibe-tools web`), Apify Store search, live endpoint smoke tests, Apify actor runs on account `buildngrowsv`.

---

## 1. Executive conclusion

| Question | Answer |
|----------|--------|
| **Are official APIs sufficient?** | **Almost** — with one hard gap: **bet splits** has no good self-serve public API. Everything else has a clear vendor path. |
| **Apify instead of APIs?** | **No** for production pipeline. Scraping is brittle, ToS-risky, and **does not cover bet splits, PFF-grade participation, or reliable alt-ladder normalization**. |
| **Apify in addition?** | **Yes** — as **redundancy, cross-validation, and dev/staging fallback** for odds and injuries. Budget ~$50–150/mo on top of core APIs. |
| **Immediate signup priority** | 1) **The Odds API** (paid) 2) **SportsDataIO NFL free trial** (injuries + evaluate betting bundle for splits) 3) **OpenWeatherMap** 4) **PFF commercial quote** |

---

## 2. APIs we need (by Master Spec layer)

### Tier A — Required at launch (paid)

| Provider | Role | Master Spec | Est. cost | Status |
|----------|------|-------------|-----------|--------|
| **[The Odds API](https://the-odds-api.com)** | Game lines, player props, **alternate prop markets** (`player_pass_yds_alternate`, etc.), multi-book, historical odds | Phases 1, 3, 4, 6, 7 | $59–119+/mo | **Not yet subscribed** — endpoint verified, needs key |
| **Bet splits source** | Bet % vs money % for Line Move Classifier | Phase 6 | $50–200+/mo | **No public API found** — see §4 |
| **SportsDataIO NFL** | Injuries, depth charts, practice participation; optional betting/props bundle | §4F, classifier | Quote (~$1k–5k/yr) | **Free trial available** — not tested yet |
| **PFF Data (commercial)** | Snap counts, route participation, coverage/shadow | §4B, §4C, §4I | $5k–50k+/yr quote | Sales-only — no public API pricing |
| **OpenWeatherMap** | Stadium weather forecasts | §4L | $0–40/mo | Standard API — key needed |

### Tier B — Required at launch (free / low cost)

| Provider | Role | Cost | Live test (2026-05-23) |
|----------|------|------|------------------------|
| **nflverse / nflfastR** | Play-by-play, weekly stats, actuals, historical | $0 | GitHub releases reachable; Apify wrapper works |
| **FTN Data** | DVOA CSV | ~$70/yr | Manual weekly download — no API |
| **ESPN public APIs** | News, scoreboard, rosters (context + backup) | $0 | **Works** — scoreboard 16 events, news 5 articles, roster 92 players |
| **Sleeper API** | League import + player ID map | $0 | **Works** — 12,188 NFL players |
| **Beat reporter RSS** | Narrative / sentiment inputs | $0 | Standard RSS — per-team setup |

### Tier C — Post-game / verification (pick one)

| Provider | Role | Notes |
|----------|------|-------|
| **Sportradar NFL** | Official box scores, play-by-play | Enterprise quote; best for live Sunday if budget allows |
| **SportsDataIO** | Box scores + stats (may bundle with Tier A) | Often cheaper entry than Sportradar |
| **nflverse only** | Monday actuals | Sufficient for accountability if 12–24h delay acceptable |

### Tier D — Product only (not pipeline)

| Provider | Role |
|----------|------|
| Stripe, ConvertKit, Expo Push, Anthropic Claude | Billing, email, push, narrative copy |

---

## 3. The Odds API — verified capabilities

**Docs reviewed:** [Odds API V4](https://the-odds-api.com/liveapi/guides/v4/)

### Confirmed NFL player prop + alternate markets

The API documents explicit market keys including:

- `player_pass_yds`, `player_reception_yds`, `player_rush_yds`, `player_pass_tds`, `player_receptions`, …
- **Alternate:** `player_pass_yds_alternate`, `player_reception_yds_alternate`, `player_rush_yds_alternate`, …

### Usage pattern

```http
GET /v4/sports/americanfootball_nfl/events/{eventId}/odds
  ?regions=us
  &markets=player_pass_yds_alternate,player_reception_yds_alternate
  &oddsFormat=american
  &apiKey=...
```

### Important constraints

- Player props + alternates on **paid plans**; historical props after **2023-05-03**.
- Request cost scales by `markets × regions` (e.g. 3 markets × 3 regions = 90 credits on historical endpoint).
- **This remains the primary Vegas feed** — no Apify scraper matches its multi-book normalization.

### Smoke test

```bash
curl "https://api.the-odds-api.com/v4/sports?apiKey=invalid"
# → {"message":"API key is not valid...","error_code":"INVALID_KEY"}  ✓ endpoint live
```

**Action:** Subscribe to at least **$59/mo tier** before pipeline Phase 1 build; store key in `.env` as `THE_ODDS_API_KEY`.

---

## 4. Bet splits — the hardest gap

| Source | API? | Finding |
|--------|------|---------|
| **Action Network** | No public developer API | Product-only; splits behind paywall |
| **OddsJam** | Partial | Strong on odds movement / arbitrage; **not** primary splits source |
| **VSiN** | No self-serve API | Public splits pages (DraftKings-sourced, ~5 min refresh) — scrape possible but brittle |
| **Sportradar US Odds** | Enterprise | May include handle/ticket splits — sales quote |
| **SportsDataIO betting package** | Possible | Ask explicitly for bet % / money % in trial |

**Recommendation:** During SportsDataIO free trial, request **NFL betting bundle with public betting splits**. If unavailable, budget **Sportradar US Odds** quote or build a **VSiN ingest job** (Apify or custom) labeled **"Unverified splits"** until licensed feed confirmed.

**Apify search for "bet splits":** No credible NFL bet-splits actor found (results were unrelated scrapers).

---

## 5. Apify evaluation

**Account:** `buildngrowsv` · plan **FREE** ($5/mo usage credits) · token stored in repo `.env` (gitignored).

### Verdict: supplement, not substitute

| Use Apify for | Do NOT use Apify for |
|---------------|---------------------|
| Cross-check DraftKings props vs The Odds API | Primary alt-ladder CDF input |
| Multi-book odds backup (`harvest/sportsbook-odds-scraper`) | Bet splits (no reliable actor) |
| Injury redundancy (ESPN/CBS/Yahoo scrape) | PFF participation / route data |
| Dev/staging when paid API keys unavailable | Production-only dependency |
| Optional nflverse release index | Replacing direct GitHub downloads |

### Actors tested (2026-05-23)

| Actor | Test | Result |
|-------|------|--------|
| `parseforge/nflverse-data-scraper` | Run with `dataset:pbp, season:2024` | **SUCCEEDED** (6.8s) — returned GitHub download URL for `play_by_play_2024.qs` |
| `zen-studio/draftkings-odds` | HTTP `/leagues/88808?market=...` | API **live**; `game_lines` & `player_props` → **0 events** off-season; `market=all` → **187 events** (May 2026) — use `all` or re-test in-season for prop-specific pulls |
| `hgservices/apify-actor-espn` | Run with `sport:nfl, type:scoreboard` | **SUCCEEDED** — returned game data (verify input schema maps to NFL in-season) |
| Apify `/v2/users/me` | Auth | **OK** — user id matches saved token |
| Apify Store search `nfl` | 17 actors | See table below |

### Recommended Apify actors (in addition)

| Actor | Purpose | Pricing model | Priority |
|-------|---------|---------------|----------|
| `zen-studio/draftkings-odds` | DraftKings lines + props HTTP API; validate Odds API | Pay-per-event / passes | **High** (in-season) |
| `harvest/sportsbook-odds-scraper` | FanDuel, DK, BetMGM, Caesars multi-book | **$49/mo flat** + 24h trial | **Medium** — redundancy |
| `scionic_dev/nfl-dfs-intelligence-monitor` | ESPN/CBS/Yahoo injury scrape + change detection | Pay-per-event | **Medium** — injury backup |
| `parseforge/nflverse-data-scraper` | Release index → download URLs | Pay-per-result-item | **Low** — direct GitHub is free |
| `hgservices/apify-actor-espn` | ESPN scores/schedules | Pay-per-event | **Low** — public ESPN API already works |

### Apify cost note

Free tier (**$5/mo credits**, 625 CU/mo) is enough for **smoke tests only**. Production pipeline should budget **Apify Starter ($49/mo)** or actor-specific subscriptions (e.g. harvest $49/mo) **on top of** The Odds API + SportsDataIO.

---

## 6. Free / public endpoint smoke tests

| Endpoint | Result |
|----------|--------|
| `api.sleeper.app/v1/players/nfl` | **OK** — 12,188 players |
| `site.api.espn.com/.../nfl/scoreboard` | **OK** — 16 events |
| `site.api.espn.com/.../nfl/news` | **OK** — headlines returned |
| `site.api.espn.com/.../teams/17/roster` | **OK** — 92 players |
| `sports.core.api.espn.com/.../weeks/1/events` | **OK** — 16 events |
| `api.the-odds-api.com/v4/sports` | **Live** — needs valid key |
| `api.openweathermap.org/...` | **Live** — needs valid key |
| nflverse GitHub releases | Reachable via Apify index; some raw metadata URLs 404 (use release tag URLs from scraper output) |

---

## 7. Recommended sourcing plan

### Phase 0 — Sign up & keys (this week)

1. **The Odds API** — paid subscription → `THE_ODDS_API_KEY`
2. **SportsDataIO** — NFL free trial → evaluate injuries + **ask for bet splits in betting tier**
3. **OpenWeatherMap** — free tier → `OPENWEATHERMAP_API_KEY`
4. **Apify** — upgrade from FREE before production actor schedules
5. **PFF** — contact sales for commercial participation API quote
6. **FTN Data** — personal subscription for DVOA CSV

### Phase 1 — Primary ingest (production)

```
The Odds API ──────────► props + alt ladders + line moves (PRIMARY)
SportsDataIO ──────────► injuries + depth + (splits if bundled)
nflverse GitHub ───────► play-by-play + actuals (direct download, no Apify required)
OpenWeatherMap ────────► forecasts
PFF API ───────────────► participation (when contract signed)
FTN CSV ───────────────► weekly DVOA load
Beat RSS ──────────────► news context
```

### Phase 1b — Apify supplement layer (parallel)

```
zen-studio/draftkings-odds ──► cross-validate props; flag Odds API drift
harvest/sportsbook-odds ─────► multi-book backup
scionic injury monitor ──────► injury redundancy vs SportsDataIO
```

Store Apify outputs in same Neon ingest tables with `source_provider` column for reconciliation.

### Phase 2 — Resolve splits if still open

Priority order:

1. SportsDataIO betting package (if splits included)
2. Sportradar US Odds enterprise quote
3. VSiN page ingest via scheduled Apify actor (interim, label unverified)
4. Manual Action Network export (not acceptable long-term)

---

## 8. Updated cost estimate

| Category | Before research | After research |
|----------|-----------------|----------------|
| Core APIs (Odds, SDIO, weather, FTN) | ~$150–300/mo | ~$150–350/mo |
| Bet splits (if separate) | included | +$50–200/mo or enterprise |
| PFF commercial | $100–200/mo | **$400–4,000+/mo** (quote-dependent) |
| Apify supplement | not budgeted | **+$49–100/mo** |
| Sportradar (optional live) | $50–150/mo | unchanged |
| **Realistic total** | $300–700/mo | **$500–1,200/mo** (+ PFF annual contract) |

---

## 9. Scripts & re-testing

Re-run smoke tests:

```bash
# From repo root — requires .env with APIFY_API_TOKEN
source .env
curl -s -H "Authorization: Bearer $APIFY_API_TOKEN" https://api.apify.com/v2/users/me | head
curl -s "https://api.sleeper.app/v1/players/nfl" | python3 -c "import sys,json; print(len(json.load(sys.stdin)))"
curl -s "https://site.api.espn.com/apis/site/v2/sports/football/nfl/scoreboard" | python3 -c "import sys,json; print(len(json.load(sys.stdin).get('events',[])))"
```

In-season re-test (Sep–Feb):

- `zen-studio/draftkings-odds` NFL league `88808` with `market=player_props` — expect non-zero events
- The Odds API alt markets on live slates
- `harvest/sportsbook-odds-scraper` trial for multi-book coverage

---

## 10. Related docs

- Operational feed map: [data-sources.md](./data-sources.md)
- Vendor decisions: [decisions-and-risks.md §2](./decisions-and-risks.md)
- Ingestion architecture: [architecture-plan.md](./architecture-plan.md)
