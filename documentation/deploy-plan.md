# Deploy Plan — Local Build, Cloudflare Worker Upload

**Purpose:** How we build and ship the platform to Cloudflare — modeled on [GenFlick `deploy-cloudflare-locally.sh`](../../UserRoot/Github/genflix-movie-generator-prod/app/scripts/deploy-cloudflare-locally.sh).  
**Principle:** Build on the developer machine (or agent shell), upload artifacts with Wrangler. **No Vercel. No Cloudflare Pages git-connected builds. No auto-deploy on every push.**

---

## 1. Why local deploy

| Approach | We use? | Reason |
|----------|---------|--------|
| Vercel auto-deploy | **No** | Cost/noise; GenFlick migrated off for billing + failed build rate |
| Cloudflare Pages "connect repo" | **No** | Builds run in CF/GitHub instead of locally — same quota/cost issues |
| GitHub Actions deploy on push | **No** (default) | Optional manual `workflow_dispatch` for CI only |
| **Local build + `wrangler deploy` / `opennextjs-cloudflare deploy`** | **Yes** | Operator/agent controls when production changes; failures debuggable in one log file |

Production changes are **intentional**: run `npm run deploy:cf:full` after review, not on every merge.

---

## 2. What gets deployed (Worker topology)

All runtime code lands on **Cloudflare Workers** (and **Workers Containers** for Python). Custom domains attach in the Cloudflare dashboard or via `wrangler.jsonc` routes.

| Unit | Directory (planned) | Deploy command |
|------|---------------------|----------------|
| **Web app** (Next.js SSR/ISR + App Router API routes) | `app/` | `npm run build:cf` → `npm run deploy:cf` |
| **API Worker** (optional split if not in OpenNext bundle) | `workers/api/` | `npx wrangler deploy --config workers/api/wrangler.jsonc` |
| **Pipeline orchestrator** (Cron → Queues) | `workers/pipeline-orchestrator/` | `npx wrangler deploy` |
| **Notification dispatcher** | `workers/notification-dispatcher/` | `npx wrangler deploy` |
| **Python pipeline containers** | `workers/pipeline-containers/` | `npx wrangler deploy` (container bindings) |

The main user-facing site is **one OpenNext Worker** (same pattern as GenFlick). Auxiliary Workers deploy in the same script after the app Worker succeeds.

---

## 3. Environments

| Env | Wrangler config | Neon branch | Origin URL |
|-----|-----------------|-------------|------------|
| **staging** | `app/wrangler.staging.jsonc` | `staging` | `https://staging.<domain>` |
| **production** | `app/wrangler.jsonc` | `main` | `https://<domain>` |

Bindings (R2, Queues, Hyperdrive, secrets) are **isolated per env** — separate bucket prefixes or buckets, separate Hyperdrive configs pointing at the matching Neon branch.

---

## 4. Deploy script (GenFlick pattern)

Create `app/scripts/deploy-cloudflare-locally.sh` following GenFlick's structure:

### Steps (production full deploy)

| Step | Action |
|------|--------|
| 1 | `wrangler whoami` — confirm logged-in CF account |
| 2 | `npm ci --legacy-peer-deps` (skip with `--skip-install`) |
| 3 | `npm run typecheck` / `tsc --noEmit` (skip with `--skip-typecheck`) |
| 4 | `npm test` — unit tests (skip with `--skip-tests`) |
| 5 | `npm run build:cf` — OpenNext build → `.open-next/` (skip with `--skip-build`) |
| 6 | `npm run deploy:cf` — `opennextjs-cloudflare deploy` uploads Worker bundle |
| 7 | Deploy auxiliary Workers (orchestrator, notifications, pipeline containers) |
| 8 | `./scripts/smoke-test-after-deploy.sh https://<domain>` (skip with `--skip-smoke`) |

### npm scripts (add to `app/package.json`)

```json
{
  "scripts": {
    "prebuild:cf": "node scripts/generate-env-production-from-wrangler-vars.mjs",
    "build:cf": "opennextjs-cloudflare build",
    "deploy:cf": "opennextjs-cloudflare deploy",
    "deploy:cf:full": "bash scripts/deploy-cloudflare-locally.sh",
    "deploy:cf:full:fast": "bash scripts/deploy-cloudflare-locally.sh --skip-install --skip-tests",
    "deploy:staging": "bash scripts/deploy-cloudflare-locally.sh --env=staging",
    "deploy:staging:fast": "bash scripts/deploy-cloudflare-locally.sh --env=staging --skip-install --skip-tests"
  }
}
```

### Flags (same as GenFlick)

`--skip-install` · `--skip-typecheck` · `--skip-tests` · `--skip-build` · `--skip-smoke` · `--dry-run` · `--env=staging|prod` · `--target=preview` · `--triage-last-failure`

### Logging

- Full log: `app/tmp/deploy-cloudflare-local-<timestamp>.log`
- Stable path: `app/tmp/deploy-cloudflare-local-latest.log`
- On failure: print `AGENT_TRIAGE_BEGIN` block with failing step, exit code, last 80 lines

### Hyperdrive deploy placeholder

Export `CLOUDFLARE_HYPERDRIVE_LOCAL_CONNECTION_STRING_<BINDING>` from `app/.env.local` `DATABASE_URL` during deploy (GenFlick pattern — wrangler's `getPlatformProxy` requires it even though upload doesn't connect to DB).

---

## 5. What runs in CI vs locally

| Task | Where |
|------|-------|
| Unit tests, typecheck, golden pipeline tests | **Local** before deploy, or optional GitHub Actions `workflow_dispatch` |
| OpenNext build | **Local only** |
| Worker upload | **Local only** (`deploy:cf`) |
| DB migrations | **Local** (`drizzle-kit migrate`) against Neon branch, then deploy |
| Expo mobile builds | **EAS** (separate from CF Worker deploy) |

No GitHub Action pushes to Cloudflare on merge by default.

---

## 6. First-time Cloudflare setup

One-time (per env), run from repo:

1. `wrangler login`
2. Create Neon branches + connection strings
3. Create Hyperdrive configs → bind in `wrangler.jsonc`
4. Create R2 buckets, Queues, Cron triggers (bootstrap script: `scripts/cloudflare-bootstrap.sh`)
5. Upload secrets: `wrangler secret bulk` or dashboard
6. Attach custom domain to production Worker in CF dashboard

Reference: GenFlick `scripts/cloudflare-bootstrap.sh` and `app/wrangler.jsonc`.

---

## 7. Pipeline container deploy

Python containers deploy **separately** from the OpenNext app (GenFlick deploys ffmpeg sidecar the same way):

```bash
cd workers/pipeline-containers
npx wrangler deploy --env production
```

Included as step 7 in `deploy-cloudflare-locally.sh`. If a container deploy fails, log warning but don't roll back the web Worker unless the failure breaks scheduled jobs.

---

## 8. Rollback

| Layer | Rollback |
|-------|----------|
| Web Worker | Cloudflare dashboard → Workers → Versions → rollback, or `wrangler rollback` |
| Auxiliary Workers | Redeploy previous git tag via deploy script |
| Neon | PITR restore branch (see hosting plan) |
| Signal config | Revert admin config version in Neon |

---

## 9. Related files (to create in Phase 0)

```
app/
├── wrangler.jsonc
├── wrangler.staging.jsonc
├── open-next.config.ts
├── scripts/
│   ├── deploy-cloudflare-locally.sh    ← canonical deploy (copy GenFlick pattern)
│   ├── smoke-test-after-deploy.sh
│   └── generate-env-production-from-wrangler-vars.mjs
└── tmp/                                 ← deploy logs (gitignored)
workers/
├── pipeline-orchestrator/wrangler.jsonc
├── notification-dispatcher/wrangler.jsonc
└── pipeline-containers/wrangler.jsonc
scripts/
└── cloudflare-bootstrap.sh              ← one-time R2/Queue/Cron setup
```

---

## 10. Starter Doc mapping

| Old plan language | This plan |
|-------------------|-----------|
| Vercel hosting | **Removed** |
| Cloudflare Pages git deploy | **Removed** |
| Cloudflare Pages (OpenNext) | **OpenNext → single Worker upload** |
| "Pages + Workers" | **Workers only** (OpenNext bundle is a Worker) |

Hosting detail: [hosting-and-operations-plan.md](./hosting-and-operations-plan.md)
