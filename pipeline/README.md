# NovaPredict Python Pipeline

Batch ingestion and (future) computation engine for NovaPredict. Runs locally and in **Cloudflare Workers Containers** per [documentation/architecture-plan.md](../documentation/architecture-plan.md).

## What lives here

| Path | Purpose |
|------|---------|
| `ingest/` | One ingest job per file — pulls live data, writes raw rows + audit trail |
| `lib/` | Shared env loading and Neon connection helpers |
| `sql/` | Idempotent SQL migrations for ingestion tables |
| `ApplyNovaPredictIngestionSqlMigrations.py` | Applies `sql/*.sql` to `DATABASE_URL` |

## Quick start

```bash
# 1. Write DATABASE_URL to .env (non-interactive Neon)
./scripts/setup-neon-env.sh dev

# 2. Live API smoke tests (no DB writes)
./scripts/ingest-smoke-tests.sh

# 3. Migrate + run free-tier ingest jobs
./scripts/run-pipeline-ingest-smoke-test.sh
```

## Ingest jobs (Phase 1 — free feeds)

| Job | Source | Table |
|-----|--------|-------|
| `FetchEspnNflScoreboardIngestJob` | ESPN public API | `raw_espn_scoreboard_events` |
| `FetchEspnNflNewsHeadlinesIngestJob` | ESPN public API | `raw_espn_news_articles` |
| `FetchSleeperNflPlayerCatalogIngestJob` | Sleeper API | `raw_sleeper_player_catalog_snapshots` |

Every job writes an `ingest_runs` audit row (`running` → `success` / `failed`).

## Neon branches

| Branch | Use |
|--------|-----|
| `dev` | Local pipeline development (default for scripts) |
| `staging` | Pre-production Worker deploy |
| `main` | Production |

Project: **novapredict** (`patient-sunset-77985570`) · Org: `org-flat-fire-88103782`

## Next pipeline work (not in `app/`)

- The Odds API prop + alt ladder ingest (requires `THE_ODDS_API_KEY`)
- nflverse parquet → Neon normalization
- Python computation engine (Phases 1–9)
- Workers Container cron entrypoints in `workers/pipeline-orchestrator/`

See [documentation/build-roadmap.md](../documentation/build-roadmap.md) Phase 1–2.
