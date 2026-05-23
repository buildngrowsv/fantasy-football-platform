# NovaPredict Python Pipeline

Batch ingestion, normalization, computation, and accountability for NovaPredict.

## Quick start

```bash
./scripts/setup-neon-env.sh dev
./scripts/ingest-smoke-tests.sh           # live API checks
./scripts/run-pipeline-tests.sh           # vig/CDF/MC unit tests
./scripts/run-pipeline-weekly-ingest.sh     # full pipeline (~3 min)
```

## Pipeline stages (orchestrator)

| Stage | What it does |
|-------|--------------|
| **Ingest** | ESPN (Apify Browser), Sleeper, nflverse, Apify DK + Harvest odds |
| **Scaffold ingest** | Odds API, OpenWeatherMap, SportsDataIO — skip until keys set |
| **Normalize** | `players`, matchups, weekly actuals |
| **Compute** | Trailing PPR projections (real nflverse data) |
| **MC enhance** | 10K bootstrap on empirical weekly PPR |
| **Accountability** | Historical backtest (2024 weeks 5–18) |

## Computation engine (no API keys needed)

| Module | Spec |
|--------|------|
| `computation/vig/` | American odds → no-vig probabilities, consensus, confidence |
| `computation/cdf/` | PCHIP/linear CDF fit, percentile extraction, empirical CDF |
| `computation/monte_carlo/` | Correlated MC + bootstrap from real weekly actuals |

Run tests: `./scripts/run-pipeline-tests.sh`

## Data honesty

| Field | Source today | After API keys |
|-------|--------------|----------------|
| `vegas_ppr` | Trailing nflverse PPR avg | Odds API prop CDF |
| `nova_ppr` | MC bootstrap median | Full 10-phase blend |
| `move_type` | `Empirical MC (10K bootstrap)` | Line Move Classifier |
| `accountability_calls` | Real 2024 backtest | Live weekly scoring |

## Admin API

Next.js app exposes pipeline health at **`GET /api/pipeline/status`** (ingest runs, table counts, pending keys).

## Pending API keys (jobs skip cleanly)

| Key | Job activated |
|-----|---------------|
| `THE_ODDS_API_KEY` | Vegas prop + alt ladder ingest |
| `SPORTSDATAIO_API_KEY` | Injuries + bet splits evaluation |
| `OPENWEATHERMAP_API_KEY` | Stadium forecasts |
| `PFF_API_KEY` | Snap/route participation |

`APIFY_API_TOKEN` — Apify Browser (ESPN via Playwright) + DraftKings + Harvest multi-book odds. See `documentation/apify-browser-setup.md`.

## Neon

Project: **novapredict** · Branches: `dev`, `staging`, `main`
