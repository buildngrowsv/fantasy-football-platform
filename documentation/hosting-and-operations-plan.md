# Hosting & Operations Plan (Production)

**Purpose:** Production infrastructure, scheduling, monitoring, security, and runbooks for the complete NovaPredict platform.  
**Stack:** **Cloudflare** (Pages, Workers, R2, Queues, Cron, Hyperdrive, WAF) + **Neon Postgres** + n8n + Expo.

Starter Docs originally specified AWS Lambda + RDS. **This plan replaces that with Cloudflare + Neon** while preserving the same logical architecture (scheduled pipeline, Postgres, object storage, edge API, review queues).

---

## 1. Platform overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         CLOUDFLARE (edge)                                │
├─────────────────────────────────────────────────────────────────────────┤
│  Pages (Next.js)  │  Workers (API)  │  Cron Triggers  │  Queues         │
│  R2 (objects)     │  Hyperdrive ──────────────▶ Neon Postgres           │
│  WAF · DNS · SSL  │  Workers Secrets · Analytics · Logpush              │
└───────────────────────────────┬─────────────────────────────────────────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        ▼                       ▼                       ▼
  Neon Postgres            R2 buckets              n8n · Claude · ConvertKit
  (branches)               (models, parquet)       Expo Push · Sentry · Airtable
        ▲
        │
  Python pipeline containers (Cloudflare Workers Containers)
  triggered by Cron → Queue → container worker
```

---

## 2. Environment topology (Neon branches)

| Environment | Neon branch | Cloudflare | Purpose |
|-------------|-------------|------------|---------|
| **dev** | `dev` | Staging Worker preview | Local + feature branches |
| **staging** | `staging` | Staging Pages project + staging Workers | Full pipeline against live APIs |
| **production** | `main` | Production Pages + Workers | Subscribers |

**Rules:**

- One Neon project, **branch per environment** — schema migrations run on dev → staging → main
- Staging runs identical Worker + container code as production
- Promotion: staging green for 1 full NFL week → merge to main + production deploy
- Never connect local dev directly to production Neon branch
- Use Neon **point-in-time restore** before destructive migrations

### Neon configuration (production)

| Setting | Launch | Scale trigger |
|---------|--------|---------------|
| Plan | Scale (or Launch with autoscaling) | — |
| Compute | 1–2 CU autoscale | Increase at 2K+ concurrent API reads |
| Connection pooling | Neon pooler + **Cloudflare Hyperdrive** | Required for Workers |
| Backups | PITR enabled (7–30 day window per plan) | — |
| Read replica | No at launch | Neon read replica at 5K subs if needed |
| Region | US East (closest to NFL data ops ET) | — |

**Driver choices:**

- Next.js server routes: `@neondatabase/serverless` or Prisma/Drizzle with pooled connection string
- Cloudflare Workers: **Hyperdrive** binding → Neon (pooled, low latency from edge)
- Python pipeline containers: direct Neon pooled URL (`?sslmode=require`)

---

## 3. Cloudflare services (complete)

### 3.1 Web app — OpenNext Worker (local build, upload deploy)

**Not Cloudflare Pages git builds. Not Vercel.** Modeled on GenFlick: build locally, upload with Wrangler.

| Component | Config |
|-----------|--------|
| Framework | Next.js App Router via **OpenNext Cloudflare** (`@opennextjs/cloudflare`) |
| Build | **Local:** `npm run build:cf` → `.open-next/` artifact |
| Deploy | **Local:** `npm run deploy:cf` → `opennextjs-cloudflare deploy` uploads Worker |
| Canonical path | `npm run deploy:cf:full` → `app/scripts/deploy-cloudflare-locally.sh` |
| Config | `app/wrangler.jsonc` (prod) · `app/wrangler.staging.jsonc` (staging) |
| Custom domain | Attached to Worker in Cloudflare dashboard |
| Analytics | Cloudflare Web Analytics + GA4 |

Full deploy workflow: [deploy-plan.md](./deploy-plan.md)

**Routes in the OpenNext Worker:**

- Marketing, subscriber app, admin, public SEO player pages, accountability archive, Expert Comparison Board, Historical Intelligence, counterfactual UI, Challenge UI, league import UI.

### 3.2 Cloudflare Workers — API & webhooks

| Worker | Role |
|--------|------|
| `api` | Public/subscriber REST API (`/api/v1/*`) |
| `admin-api` | Pipeline triggers, content approve, classifier override (MFA) |
| `stripe-webhook` | Subscription lifecycle |
| `pipeline-orchestrator` | Cron entrypoint; validates schedule; enqueues jobs |
| `notification-dispatcher` | Expo push + ConvertKit batch sends |

Workers bind to: **Hyperdrive** (Neon), **R2**, **Queues**, **Secrets**.

Rate limiting: Cloudflare Rate Limiting rules on `/api/v1/*`.

### 3.3 Cloudflare Cron Triggers

All schedules **US/Eastern** — document DST offset in runbook (`cron` uses UTC).

| Job | Schedule (ET) | Entry Worker |
|-----|---------------|--------------|
| `weekly_data_pull` | Tue 6:00 AM | `pipeline-orchestrator` |
| `practice_report_update` | Fri 6:00 AM | `pipeline-orchestrator` |
| `news_sentiment_refresh` | Wed–Sat every 6 hrs | `pipeline-orchestrator` |
| `weather_forecast_update` | Wed + Sat 6:00 AM | `pipeline-orchestrator` |
| `sunday_projection_refresh` | Sun 7:00 AM | `pipeline-orchestrator` |
| `inactives_sweep` | Sun 11:30 AM, then every 15 min | `pipeline-orchestrator` |
| `post_game_processing` | Mon 8:00 AM | `pipeline-orchestrator` |
| `content_generation` | Mon 10:00 AM | `pipeline-orchestrator` |
| `accountability_report` | Mon 10:30 AM | `pipeline-orchestrator` |
| `calibration_update` | Mon 11:00 AM | `pipeline-orchestrator` |

Cron Worker **does not run heavy compute** — it pushes messages to Queues.

### 3.4 Cloudflare Queues — job chaining

```
weekly_data_pull          → queue:pipeline → Python container: ingest
ingest_complete           → queue:compute  → Python container: computation_engine
compute_complete          → queue:content  → Python container: content_generation
compute_complete          → queue:notify   → Worker: notification-dispatcher (if deltas)
post_game_complete        → queue:accountability → Python container: post_game + calibration
content_complete          → webhook → n8n review queue
accountability_complete   → webhook → n8n → ConvertKit
```

Each message carries: `run_id`, `season`, `week`, `job_name`, `attempt`, `idempotency_key`.

Failed messages → **Queue dead-letter** → Airtable + Sentry alert.

### 3.5 Python pipeline — Cloudflare Workers Containers

The computation engine (numpy, scipy, pandas, 15-min runs) **cannot run in standard JS Workers**. Deploy as **Cloudflare Workers Containers** (Docker):

| Container | Memory | Timeout | Image |
|-----------|--------|---------|-------|
| `pipeline-ingest` | 512 MB–1 GB | 15 min | Python 3.11 + ingestion deps |
| `pipeline-compute` | 2–4 GB | 15 min | Python 3.11 + scipy/numpy/pandas (**no xgboost/sklearn**) |
| `pipeline-postgame` | 1–2 GB | 10 min | Python 3.11 — error tagging + calibration only |
| `pipeline-content` | 512 MB | 10 min | Python 3.11 + Anthropic SDK |

**Phase ML (later):** add `pipeline-ml-retrain` container with scikit-learn, XGBoost, PyMC, joblib.

- Queue consumer Workers invoke container bindings
- Containers read/write **Neon** via pooled URL and **R2** via S3-compatible API (`@aws-sdk/client-s3` pointed at R2 endpoint)
- Golden week regression runs **locally** (or optional GitHub Actions `workflow_dispatch`) against Neon `dev` branch + R2 dev

**If container memory limits block Monte Carlo at 100K:** scale `pipeline-compute` memory to platform max or split by position partition across parallel queue messages — still on Cloudflare, no AWS fallback.

### 3.6 Cloudflare R2 — object storage

S3-compatible. One bucket per environment (or prefix isolation):

| Prefix | Contents |
|--------|----------|
| `data/nflfastR/` | Parquet by season |
| `data/signal-library/` | Pre-computed signal coefficients + **versioned admin config** |
| `data/models/` | *Reserved for Phase ML* — joblib artifacts (empty at launch) |
| `data/snapshots/` | Frozen week regression fixtures |
| `content/profiles/` | Generated player profile JSON |
| `content/reports/` | Accountability report JSON + HTML |
| `logs/pipeline/` | Optional raw run logs (90-day lifecycle rule) |

- Enable **object versioning** on `data/models/`
- Lifecycle rules: expire `logs/pipeline/` after 90 days
- Public access: **none** — signed URLs or Worker-mediated reads only
- CORS: allow Pages origin for admin downloads only

### 3.7 Cloudflare Hyperdrive

Hyperdrive config per environment pointing at Neon pooled connection string.

**Bindings:**

- `api` Worker → Hyperdrive → Neon (read-heavy player cards, rankings)
- `admin-api` Worker → Hyperdrive → Neon
- Pages server functions → Hyperdrive binding (via OpenNext worker wrapper)

Benefits: connection pooling at edge, reduced Neon connection churn from Workers/Pages, lower latency for subscriber API reads on Sunday.

### 3.8 Secrets — Cloudflare Workers Secrets + Pages env

Stored as encrypted Worker/Pages secrets (not in repo):

- `ODDS_API_KEY`
- `PFF_API_KEY`
- `SPORTRADAR_KEY`
- `ROTOWIRE_KEY`
- `ACTION_NETWORK_KEY`
- `ANTHROPIC_API_KEY`
- `CONVERTKIT_API_KEY`
- `EXPO_ACCESS_TOKEN`
- `NEON_DATABASE_URL` (direct, for containers only — Workers use Hyperdrive)
- `R2_ACCESS_KEY_ID` / `R2_SECRET_ACCESS_KEY`
- `STRIPE_SECRET_KEY` / `STRIPE_WEBHOOK_SECRET`
- `JWT_SIGNING_KEY`
- `N8N_WEBHOOK_SECRET`
- `PIPELINE_HMAC_SECRET` (cron → container auth)

Rotation: quarterly; document in runbook.

### 3.9 Cloudflare WAF & DNS

- WAF managed ruleset on apex domain
- Custom rules: rate limit `/api/v1/*`, block known bad ASNs on admin routes
- Bot Fight Mode on marketing pages (not on authenticated API)
- DNS: apex + `www` + `staging` + `status` + `api` (if separate subdomain)
- SSL: Full (strict)
- **Cloudflare Access** on `/admin/*` and staging environment (Google Workspace MFA)

---

## 4. n8n orchestration (required)

Self-hosted or n8n Cloud — unchanged from product spec.

| Workflow | Trigger | Actions |
|----------|---------|---------|
| `content_review_queue` | HTTPS webhook from `pipeline-content` container | Notify → human approve → write Neon → ConvertKit |
| `accountability_publish` | Webhook post-report | Review → publish Neon → email subs |
| `pipeline_failure_escalation` | Webhook from Queue DLQ handler | Sentry + SMS/on-call |
| `classifier_override_audit` | Admin API webhook | Log Neon audit table + notify pipeline owner |
| `onboarding_sequence` | Stripe webhook via Worker | ConvertKit tags |
| `sunday_alert_batch` | Worker `notification-dispatcher` | Throttled Expo push |

n8n writes to Neon via pooled connection or authenticated admin API — not direct production access from n8n unless IP-allowlisted through Cloudflare Access service token.

---

## 5. Mobile — Expo EAS (unchanged)

| Component | Config |
|-----------|--------|
| API base URL | `https://api.domain.com/v1` (Cloudflare Worker custom domain) |
| Build | EAS Build — iOS + Android |
| Push | Expo → APNs + FCM |
| Secrets | `API_URL`, `SENTRY_DSN` in EAS Secrets |

App Store + Google Play submission in Phase 6.

---

## 6. Third-party services

| Service | Purpose |
|---------|---------|
| The Odds API | Props + lines |
| PFF API | Snaps, grades, coverage |
| Sportradar / Stats Perform | Play-by-play, actuals |
| Rotowire | Injuries, practice |
| Action Network | Bet splits (classifier) |
| Anthropic Claude | Content generation |
| ConvertKit | Email |
| Stripe | Subscriptions |
| Sentry | Errors (Workers, Pages, containers, mobile) |
| Airtable | Pipeline error log (per Starter Dev Stack) |
| Better Stack / Cloudflare notifications | Uptime |

---

## 7. Monitoring & alerting

### Sentry

- Pages/Next.js, Workers, Python containers, React Native
- Release = git SHA; environment = neon branch name

### Cloudflare observability

- Workers Analytics: errors, CPU time, queue depth
- R2 metrics: storage, Class A/B ops
- Logpush → R2 or external SIEM (optional at launch, recommended at scale)
- **Health check Worker** at `/health` polled every 1 min

### Custom metrics (write to Neon `ops_metrics` table)

- `players_projected`, `pipeline_duration_sec`, `queue_lag_sec`, `classifier_public_move_count`

### Alert routing

| Severity | Condition | Response |
|----------|-----------|----------|
| **P0** | Tue/Sun pipeline queue stalled >30 min | Page on-call |
| **P0** | Neon unreachable from Hyperdrive | Page immediately |
| **P1** | Monday post-game container failed | Fix before accountability |
| **P1** | API 5xx rate >1% for 5 min | Investigate Workers |
| **P2** | Single feed degraded | App banner + Tier 2 fallback |
| **P3** | Elevated p95 latency | Next business day |

Public status page: `status.domain.com` (Better Stack or Cloudflare-status template).

---

## 8. Production cost model (Cloudflare + Neon)

### At launch (full data stack)

| Item | Monthly (est.) |
|------|----------------|
| Neon Scale (autoscale, PITR) | $19–69+ |
| Cloudflare Workers Paid | $5 base + usage |
| OpenNext Worker (web) | Included in Workers deploy |
| Workers Containers (pipeline) | $25–100 (compute minutes) |
| R2 storage + ops | $5–20 |
| Hyperdrive | Included with Workers |
| The Odds API | $59–119 |
| PFF + Sportradar + splits + Rotowire | $200–400 |
| ConvertKit | $50 |
| Claude API | $50–150 |
| Sentry | $26 |
| Expo EAS | $0–99 |
| n8n | $0–50 |
| **Total** | **~$450–900/mo** |

Comparable to AWS plan — slightly lower on DB/R2 at small scale; pipeline container compute replaces Lambda.

Break-even: **~150–270 subscribers @ $40/yr** depending on feed contracts.

---

## 9. CI/CD and deploy pipeline

**Deploys are local, not cloud-built.** See [deploy-plan.md](./deploy-plan.md).

### CI (optional — manual GitHub Actions only)

```
workflow_dispatch (operator-triggered):
  ├── pipeline/ pytest + golden week (Neon dev + R2 dev)
  ├── app/ tsc --noEmit + npm test
  └── apps/mobile/ tests
  (does NOT deploy to Cloudflare)
```

PRs: run tests locally before merge. No auto-deploy on push.

### Deploy (local — canonical)

```bash
cd app && npm run deploy:cf:full              # production
cd app && npm run deploy:staging              # staging sister Worker
cd app && npm run deploy:cf:full:fast         # skip install + tests (iteration)
```

Script steps: wrangler whoami → npm ci → typecheck → tests → build:cf → deploy:cf → auxiliary Workers → smoke test.

Logs: `app/tmp/deploy-cloudflare-local-latest.log`

### Production promote checklist

- [ ] Tests green locally
- [ ] Neon migrations applied staging → main
- [ ] `npm run deploy:staging` verified on staging URL
- [ ] `npm run deploy:cf:full` to production
- [ ] Smoke test passed
- [ ] EAS mobile release (separate from Worker deploy)

**Wrangler** (`app/wrangler.jsonc`, `workers/*/wrangler.jsonc`) defines bindings: Hyperdrive, R2, Queues, Cron, Containers, secrets.

Database migrations: **Drizzle Kit** or **Prisma migrate** in CI against Neon `dev` → apply to `staging` → `main`.

No destructive migrations Sun–Mon ET during NFL season.

---

## 10. Security & compliance

- Cloudflare WAF + Access on admin/staging
- Neon: SSL required, IP allowlist optional for direct container access
- R2: no public buckets; presigned URLs via Worker
- OWASP top 10 audit before launch
- Stripe Checkout / Customer Portal only (no raw card data)
- Account export + delete endpoints
- Audit log in Neon for classifier overrides and admin actions
- `PIPELINE_HMAC_SECRET` validates cron-triggered container invocations

---

## 11. Disaster recovery

| Scenario | RPO | RTO | Procedure |
|----------|-----|-----|-----------|
| Neon branch corruption | PITR window | 1 hr | Restore branch from PITR; repoint Hyperdrive |
| Bad model/config deploy | Versioned R2 config + Neon audit | 30 min | Roll back signal weight config version |
| Wrong projections published | 0 | 1 hr | Set `publish=false` in Neon; re-queue compute |
| Cloudflare region issue | — | 2 hr | Cloudflare auto-failover; monitor status.cloudflare.com |
| Queue backlog | 0 | 2 hr | Scale container concurrency; drain DLQ after fix |
| Odds API outage | Cached raw in Neon/R2 | 4 hr | Banner in app; Tier 2 fallback |

**Quarterly:** Neon PITR restore drill to `dev` branch; golden week regression on restored data.

---

## 12. In-season on-call runbook

### Tuesday 6:00 AM ET — weekly pull

1. Confirm Cron Trigger fired (`wrangler tail` or Cloudflare dashboard)
2. Monitor Queue depth → `pipeline-ingest` → `pipeline-compute` completion
3. Check Airtable + Sentry for DLQ messages
4. Validate `players_projected` count in Neon (~350 skill players)
5. n8n content queue → approve AI profiles
6. Set `publish=true` on `projection_runs` row

### Sunday 7:00 AM — gameday refresh

1. Confirm `sunday_projection_refresh` queue processed
2. Spot-check classifier labels on primetime slate via API
3. Monitor Worker p95 via Cloudflare Analytics

### Sunday 11:30 AM — inactives

1. `inactives_sweep` Cron every 15 min until last kickoff
2. `notification-dispatcher` PRIORITY_ALERT for watchlist users
3. Void Challenge picks for inactive players in Neon

### Monday — post-game

1. `post_game_processing` container complete by 8 AM ET
2. `calibration_update` queue drained
3. Accountability approved in n8n by 10 AM
4. ConvertKit send by 11 AM ET

Full runbook: `ops/RUNBOOK.md` — linked from admin panel.

---

## 13. Production readiness checklist

- [ ] Neon `main` branch with PITR tested restore to `dev`
- [ ] Hyperdrive connected and pool stable under load test
- [ ] All Cron Triggers + Queues + Containers succeeded for 2 consecutive NFL weeks on staging
- [ ] R2 versioning enabled on models prefix
- [ ] n8n review workflows writing to Neon via admin API
- [ ] Cloudflare Access on `/admin` + staging
- [ ] WAF rate limits active on public API
- [ ] Sentry + Airtable alerting tested with fault injection
- [ ] Wrangler production deploy documented
- [ ] App Store + Play Store approved
- [ ] Load test: 2,000 concurrent API reads via Cloudflare passed
- [ ] 3-week public accuracy run on full Cloudflare pipeline complete

---

## 14. Starter Doc AWS mapping → Cloudflare + Neon

| Starter Doc (AWS) | Cloudflare + Neon equivalent |
|-------------------|------------------------------|
| AWS Lambda | Cloudflare Workers + **Workers Containers** (Python) |
| EventBridge cron | **Cloudflare Cron Triggers** |
| RDS PostgreSQL 15 | **Neon Postgres** (branches per env) |
| S3 | **Cloudflare R2** |
| Secrets Manager | **Workers/Pages Secrets** |
| API Gateway + WAF | **Workers custom domains + Cloudflare WAF** |
| Vercel (web) | **Local OpenNext → Worker upload** ([deploy-plan.md](./deploy-plan.md)) |
| Lambda ↔ RDS pooling | **Hyperdrive** → Neon |

Logical architecture unchanged — only the cloud provider changed.
