# Live Data Sources

**Purpose:** Where NovaPredict pulls **live** NFL data for ingestion, computation, and product features.  
**Research:** See [data-source-research.md](./data-source-research.md) for API vs Apify evaluation and smoke-test results (2026-05-23).  
**Schedule:** Most feeds run on the weekly pipeline cron (Tue–Mon ET). Some refresh more often (Sun inactives, news, line moves).

---

## 1. Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    PRIMARY (OFFICIAL APIs)                       │
├─────────────────────────────────────────────────────────────────┤
│ VEGAS / MARKET     │ The Odds API (PRIMARY)                       │
│ BET SPLITS         │ SportsDataIO betting bundle OR Sportradar    │
│                    │ (Action Network has no public API)           │
│ INJURIES / DEPTH   │ SportsDataIO NFL (PRIMARY) · Rotowire alt    │
│ WEATHER            │ OpenWeatherMap                               │
│ NFL STATS          │ nflverse (direct GitHub) · PFF commercial    │
│ ADVANCED / DVOA    │ FTN Data (CSV)                               │
│ POST-GAME ACTUALS  │ nflverse · optional Sportradar/SportsDataIO  │
│ NEWS               │ Beat reporter RSS + ESPN public APIs         │
│ OFFICIATING        │ NFL officiating assignments (weekly load)    │
│ LEAGUE IMPORT      │ Sleeper · ESPN · Yahoo (user OAuth)          │
└─────────────────────────────────────────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              APIFY SUPPLEMENT (redundancy — not primary)           │
├─────────────────────────────────────────────────────────────────┤
│ zen-studio/draftkings-odds    │ validate props vs The Odds API   │
│ harvest/sportsbook-odds       │ multi-book backup ($49/mo)       │
│ scionic/nfl-dfs-intelligence  │ ESPN/CBS/Yahoo injury cross-check│
└─────────────────────────────────────────────────────────────────┘
                              ▼
              Python ingest containers → Neon + R2
                              ▼
              Computation engine → projections → app
```

**Principle:** Official licensed APIs feed the projection engine. Apify scrapers **supplement and cross-validate** — they do not replace The Odds API, bet splits, or PFF.

---

## 2. Primary feeds (computation pipeline)

These drive projections. Without them, the engine cannot run at full fidelity.

### The Odds API — **core (PRIMARY)**

| What | Details |
|------|---------|
| **Provides** | Game lines, player props, **alternate prop markets** (`player_pass_yds_alternate`, etc.), multi-book, line history |
| **Used in** | Phases 1, 3, 4, 6, 7 — entire Vegas CDF methodology |
| **Cost** | $59/mo+ (paid tier required for props + alternates) |
| **Pull schedule** | Tue 6 AM (full week), Sun 7 AM (refresh), q6h line-move deltas |
| **Docs** | [the-odds-api.com](https://the-odds-api.com) |
| **Env** | `THE_ODDS_API_KEY` |
| **Verified** | Endpoint live; alternate market keys documented in V4 API |

This is the **single most important feed**. Do not replace with Apify scrapers in production.

### Bet splits — **classifier required (GAP)**

| What | Details |
|------|---------|
| **Provides** | Bet % vs money % splits, public/sharp divergence |
| **Used in** | Line Move Type Classifier (Phase 6) |
| **Primary path** | **SportsDataIO NFL betting package** — confirm splits in free trial |
| **Fallback path** | Sportradar US Odds enterprise · VSiN ingest (interim, label "Unverified") |
| **Not viable** | Action Network (no public API) · Apify (no credible splits actor found) |

Without splits data, classifier degrades — not acceptable for launch per [decisions-and-risks.md](./decisions-and-risks.md).

### SportsDataIO NFL — **injuries + depth (PRIMARY)**

| What | Details |
|------|---------|
| **Provides** | Injury status, practice participation, depth charts, optional betting/props |
| **Used in** | Master Spec §4F, classifier injury correlation, inactive risk |
| **Pull schedule** | Fri 6 AM + Sun inactives sweep |
| **Env** | `SPORTSDATAIO_API_KEY` |
| **Alternative** | Rotowire API if SDIO trial unsatisfactory |

### OpenWeatherMap — game weather

| What | Details |
|------|---------|
| **Provides** | Wind, rain, snow, temp forecasts per stadium |
| **Used in** | Master Spec §4L, counterfactual engine |
| **Pull schedule** | Wed + Sat 6 AM |
| **Env** | `OPENWEATHERMAP_API_KEY` |

---

## 3. NFL performance & advanced stats

### nflverse / nflfastR — **free, foundational (direct download)**

| What | Details |
|------|---------|
| **Provides** | Play-by-play, weekly stats, historical back to 1999, **post-game actuals** |
| **Used in** | Phase 10 actuals, historical signal library, boom/bust validation |
| **Cost** | $0 — download from [nflverse-data releases](https://github.com/nflverse/nflverse-data/releases) |
| **Apify optional** | `parseforge/nflverse-data-scraper` indexes releases; direct GitHub preferred for production |

### PFF API — **commercial, required for full spec**

| What | Details |
|------|---------|
| **Provides** | Snap counts, route participation, grades, coverage/shadow data |
| **Used in** | Master Spec §4B, §4C, §4I |
| **Cost** | **Sales quote only** — expect $5k–50k+/yr for commercial redistribution |
| **Env** | `PFF_API_KEY` |
| **Fallback at launch** | nflverse snap counts where available + reduced confidence badge |

### FTN Data — DVOA

| What | Details |
|------|---------|
| **Provides** | DVOA vs position |
| **Cost** | ~$70/yr personal CSV |
| **Pull schedule** | Weekly manual/scheduled download → Neon |

### Sportradar or SportsDataIO — post-game actuals (pick one)

| What | Details |
|------|---------|
| **Provides** | Box scores, play-by-play verification |
| **Used in** | Monday actuals, optional live Sunday refresh |
| **Note** | nflverse alone may suffice if 12–24h delay acceptable |

---

## 4. Apify supplement layer (Apify Browser + HTTP actors)

**Token:** `APIFY_API_TOKEN` in `.env` (gitignored). Account on **Starter** plan (2026-05-23).

**Setup guide:** [apify-browser-setup.md](./apify-browser-setup.md)

| Actor | Role | When to run |
|-------|------|-------------|
| `apify/playwright-scraper` | **Apify Browser** — ESPN scoreboard + news JSON via managed Chromium | Every ESPN ingest (default when token set) |
| `zen-studio/draftkings-odds` | Cross-validate DK props vs The Odds API | Tue + Sun during NFL season |
| `harvest/sportsbook-odds-scraper` | Multi-book odds backup ($49/mo optional) | Weekly + line-move alerts |
| `scionic_dev/nfl-dfs-intelligence-monitor` | Injury redundancy (ESPN/CBS/Yahoo) | Wed–Sun — **authorized in Console** |
| `parseforge/nflverse-data-scraper` | Optional release index | Pre-season bulk load only |

Set `APIFY_BROWSER_ENABLED=false` to force direct httpx for ESPN during local debugging.

All Apify rows land in Neon with `source_provider = 'apify_*'` for reconciliation against primary APIs.

---

## 5. News & context feeds

### Beat reporter RSS + ESPN public APIs

| What | Details |
|------|---------|
| **Provides** | Practice notes, headlines, scores |
| **Used in** | Master Spec §4J narrative/sentiment |
| **Verified** | ESPN scoreboard, news, roster endpoints live (2026-05-23) |

### NFL officiating crews

Weekly crew assignments → Master Spec §4K. Source: NFLweather.com or manual CSV until automated.

---

## 6. User-facing integrations (not pipeline ingestion)

| Source | Purpose | Auth |
|--------|---------|------|
| **Sleeper API** | League import | Public REST (verified: 12k+ players) |
| **ESPN** | League import | OAuth / API (legal review required) |
| **Yahoo Fantasy** | League import | OAuth |
| **Stripe** | Subscriptions | Webhooks |
| **ConvertKit** | Email | REST |
| **Expo Push** | Mobile alerts | Expo API |
| **Anthropic Claude** | Narrative copy only | API key |

---

## 7. Pull schedule summary

| Job (ET) | Feeds touched |
|----------|---------------|
| **Tue 6 AM** | The Odds API (full props + alternates), nflverse, PFF, FTN, referees |
| **Wed–Sat q6h** | News RSS, Odds API line deltas, optional Apify DK cross-check |
| **Wed + Sat 6 AM** | OpenWeatherMap |
| **Fri 6 AM** | SportsDataIO/Rotowire practice + injuries; Apify injury monitor |
| **Sun 7 AM** | Odds API refresh, classifier re-run, publish |
| **Sun 11:30+** | Inactives, PRIORITY_ALERT push |
| **Mon 8 AM** | nflverse actuals, post-game error tagging |

---

## 8. Cost summary (data only)

| Feed | Est. monthly |
|------|--------------|
| The Odds API | $59–119 |
| SportsDataIO NFL (+ betting if splits) | $100–400 |
| Bet splits (if separate from SDIO) | $50–200 |
| PFF (commercial) | $400–4,000+ (annual contract amortized) |
| Apify supplement | $49–100 |
| Sportradar (optional) | $50–150 |
| Rotowire (if not SDIO) | $30–100 |
| OpenWeatherMap | $0–40 |
| FTN Data | ~$6 |
| nflverse / ESPN / Sleeper | $0 |
| Claude (copy) | $50–150 |
| **Realistic subtotal** | **$500–1,200/mo** (+ PFF annual) |

---

## 9. Fallback behavior

| Condition | Behavior |
|-----------|----------|
| No alt ladder for player | Tier 2 internal model + Market Confidence ≤ 40 + UI badge |
| Odds API down | Serve last pull + Apify DK backup if fresh + banner |
| No bet splits | Classifier timing + news only; label "Unverified" — **block launch** unless founder sign-off |
| PFF unavailable | nflverse snaps + reduced confidence badge |
| Apify actor fails | Primary API data still serves; log reconciliation gap |

---

## 10. Environment variables

Copy `.env.example` → `.env`. Never commit `.env`.

| Variable | Provider |
|----------|----------|
| `THE_ODDS_API_KEY` | The Odds API |
| `SPORTSDATAIO_API_KEY` | SportsDataIO |
| `OPENWEATHERMAP_API_KEY` | OpenWeatherMap |
| `PFF_API_KEY` | PFF (when contracted) |
| `APIFY_API_TOKEN` | Apify supplement layer |
| `APIFY_USER_ID` | Apify account reference |

---

## 11. Related docs

- Research & smoke tests: [data-source-research.md](./data-source-research.md)
- Ingestion architecture: [architecture-plan.md §4](./architecture-plan.md)
- Vendor decisions: [decisions-and-risks.md §2](./decisions-and-risks.md)
