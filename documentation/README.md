# NovaPredict — Planning Documentation

These documents define how to build, host, and launch the **complete production platform** — full deterministic engine, all product surfaces, and accountability — hosted on **Cloudflare Workers + Neon**.

**Deploy:** Local build → upload to Cloudflare Worker (GenFlick pattern). **No Vercel. No Cloudflare Pages git builds.**

**ML training** (XGBoost, PyMC, automated retraining) is deferred to **Phase ML** after launch.

## Start here

| Document | Read when you need… |
|----------|---------------------|
| [plan.md](./plan.md) | Executive overview — scope, timeline, launch criteria |
| [deploy-plan.md](./deploy-plan.md) | **Local build + Cloudflare Worker upload** (modeled on GenFlick) |
| [data-sources.md](./data-sources.md) | **Where live NFL data comes from** — providers, schedule, cost |
| [data-source-research.md](./data-source-research.md) | API vs Apify research, smoke tests, sourcing plan |
| [architecture-plan.md](./architecture-plan.md) | System design, pipeline, APIs |
| [build-roadmap.md](./build-roadmap.md) | Phases 0–8 (current) + Phase ML (later) |
| [hosting-and-operations-plan.md](./hosting-and-operations-plan.md) | Cloudflare + Neon infrastructure |
| [product-growth-and-launch-plan.md](./product-growth-and-launch-plan.md) | Launch strategy |
| [decisions-and-risks.md](./decisions-and-risks.md) | Production gates, risks |

## Hosting stack

| Layer | Service |
|-------|---------|
| Web | Cloudflare **Worker** (OpenNext — local build + upload) |
| API | Cloudflare Workers + Hyperdrive |
| Database | Neon Postgres |
| Pipeline | Cron → Queues → Python Container Workers |
| Storage | Cloudflare R2 |
| Deploy | `npm run deploy:cf:full` (see [deploy-plan.md](./deploy-plan.md)) |

## Scope: now vs later

| Current build (launch) | Phase ML (post-launch) |
|------------------------|--------------------------|
| 10-phase deterministic pipeline + Monte Carlo | XGBoost / scikit-learn training |
| Rule-based secret sauce + admin config weights | PyMC Bayesian ML layer |
| Error tagging + calibration display | Automated weight learning |

## Naming note

Resolve brand/domain before public work. See [decisions-and-risks.md](./decisions-and-risks.md#1-brand-and-domain-blocking).
