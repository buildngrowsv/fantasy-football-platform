# NovaPredict Python Pipeline

Batch ingestion, normalization, and baseline computation for NovaPredict. Runs locally and in **Cloudflare Workers Containers** per [documentation/architecture-plan.md](../documentation/architecture-plan.md).

## What lives here

| Path | Purpose |
|------|---------|
| `ingest/` | Pull live data from ESPN, Sleeper, nflverse, The Odds API |
| `normalize/` | Promote raw snapshots → core + app tables (`players`, matchups, actuals) |
| `compute/` | Derive `player_projections` from **real** trailing PPR stats |
| `lib/` | Shared env, DB, crosswalk helpers |
| `sql/` | Idempotent SQL migrations |
| `RunNovaPredictWeeklyIngestOrchestrator.py` | Full weekly chain entrypoint |

## Quick start

```bash
./scripts/setup-neon-env.sh dev
./scripts/ingest-smoke-tests.sh              # live API checks
./scripts/run-pipeline-weekly-ingest.sh      # full ingest → normalize → compute
```

## Data honesty

| Column | Source today | Future (paid feeds) |
|--------|--------------|---------------------|
| `vegas_ppr` | Trailing 4-week nflverse `fantasy_points_ppr` avg | The Odds API prop-implied CDF |
| `nova_ppr` | Trailing avg + small trend adjustment from same real data | Full 10-phase blend engine |
| `move_type` | `"Trailing PPR baseline"` | Line Move Classifier labels |

No mock or hash-randomized projections in this pipeline path.

## Ingest jobs

| Job | Source | Output |
|-----|--------|--------|
| `FetchEspnNflScoreboardIngestJob` | ESPN public API | `raw_espn_scoreboard_events` |
| `FetchEspnNflNewsHeadlinesIngestJob` | ESPN public API | `raw_espn_news_articles` |
| `FetchSleeperNflPlayerCatalogIngestJob` | Sleeper API | `raw_sleeper_player_catalog_snapshots` |
| `FetchNflverseWeeklyPlayerStatsIngestJob` | nflverse GitHub | `raw_nflverse_weekly_player_stats` |
| `FetchNflverseGamesScheduleIngestJob` | nflverse GitHub | `raw_nflverse_games` |
| `FetchTheOddsApiNflEventsIngestJob` | The Odds API (optional) | `raw_the_odds_api_events` |

## Normalize + compute

| Step | Output table |
|------|--------------|
| `NormalizeSleeperCatalogIntoPlayersTable` | `players` |
| `NormalizeEspnScoreboardIntoWeeklyMatchupsTable` | `weekly_team_matchups`, `nfl_games` |
| `NormalizeNflverseWeeklyStatsIntoPlayerWeeklyActualsTable` | `player_weekly_actuals` |
| `ComputeWeeklyProjectionsFromRealWeeklyStatsJob` | `player_projections` |

The Next.js app in `app/` reads `players` and `player_projections` directly.

## Neon branches

| Branch | Use |
|--------|-----|
| `dev` | Local pipeline (default) |
| `staging` | Pre-production Worker |
| `main` | Production |

Project: **novapredict** (`patient-sunset-77985570`)

## Next steps

- The Odds API prop + alt ladder ingest (requires `THE_ODDS_API_KEY`)
- Vig removal + CDF + Monte Carlo computation engine (Phase 2)
- Cloudflare Cron → Workers Container binding

See [documentation/build-roadmap.md](../documentation/build-roadmap.md).
