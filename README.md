# NovaPredict

AI-powered fantasy football decision platform — complete Vegas prop distributions, line-move intelligence, season budget tracking, counterfactual analysis, and weekly accountability.

**Hosted on Cloudflare Workers + Neon.** Local build → Worker upload (GenFlick deploy pattern). ML deferred to Phase ML.

## Documentation

**Start here:** [documentation/plan.md](documentation/plan.md)

| Plan | Purpose |
|------|---------|
| [plan.md](documentation/plan.md) | Executive overview |
| [deploy-plan.md](documentation/deploy-plan.md) | Local build + Cloudflare Worker upload |
| [data-sources.md](documentation/data-sources.md) | Live data providers & pull schedule |
| [data-source-research.md](documentation/data-source-research.md) | API vs Apify research & endpoint tests |
| [architecture-plan.md](documentation/architecture-plan.md) | System design |
| [build-roadmap.md](documentation/build-roadmap.md) | Build phases |
| [hosting-and-operations-plan.md](documentation/hosting-and-operations-plan.md) | Cloudflare + Neon ops |
| [product-growth-and-launch-plan.md](documentation/product-growth-and-launch-plan.md) | GTM |
| [decisions-and-risks.md](documentation/decisions-and-risks.md) | Gates & risks |

## Infrastructure

| Component | Technology |
|-----------|------------|
| Web app | Cloudflare Worker (OpenNext, local deploy) — `app/` |
| Database | Neon Postgres (`novapredict` project) |
| Pipeline | Python ingest + future computation — `pipeline/` |
| Deploy | `npm run deploy:cf:full` (web) |

## Pipeline (parallel track)

The Python ingestion layer lives in [`pipeline/`](pipeline/README.md) — separate from the Next.js app the other agent is deploying.

```bash
./scripts/setup-neon-env.sh dev      # non-interactive Neon DATABASE_URL
./scripts/ingest-smoke-tests.sh      # live API checks (6 endpoints)
./scripts/run-pipeline-weekly-ingest.sh  # full ingest → normalize → compute (real PPR baselines)
```

Neon branches: `dev` (local), `staging`, `main` (production).

## Starter Docs

Source specifications — formulas, UI mockups, Claude prompts, estimates:

```
Starter Docs/00_DocumentLibrary.md   ← index
Starter Docs/03.1_MasterSpec_v1.md   ← product spec (full backlog)
Starter Docs/Designs/                ← UI prototypes
```

## Status

Planning phase — no application code yet. Resolve brand/domain and provision Cloudflare + Neon before Phase 0 ([decisions-and-risks.md](documentation/decisions-and-risks.md)).
