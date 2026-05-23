# NovaPredict — Master Build Plan (Production)

**Status:** Planning · April 2026  
**Audience:** Founders, developers, operators, investors  
**Goal:** Ship a **complete, production-grade** fantasy football decision platform — full deterministic engine, product surfaces, and accountability — **before** the ML training phase. Machine learning (XGBoost, PyMC, automated retraining) is a **separate post-launch phase**.

### Scope boundary: now vs later

| In this build (Phases 0–8) | Deferred to Phase ML (later) |
|----------------------------|------------------------------|
| 10-phase deterministic pipeline + Monte Carlo simulation | XGBoost / scikit-learn model training |
| Rule-based secret sauce layers + historical signal library | PyMC Bayesian ML layer |
| Rule-based rolling update (Phase 9 blend formula) | Automated weight adjustment from error memory |
| Error tagging, accountability, calibration **tracking & display** | Seasonal retrain jobs + model versioning in R2 |
| Admin config for signal weights | Feature importance pipelines + auto-tuning |
| Claude API for **narrative copy** (not projections) | ML-driven projection overrides |

**Monte Carlo and the Phase 9 Bayesian blend formula are not ML training** — they stay in the current build.

---

## 1. What we are building

NovaPredict is a **full-stack AI-powered fantasy football platform** for serious players (top 10–15% of the market). It is not an MVP, a prototype, or a rankings wrapper.

### Core promise

> Reverse-engineer the Vegas prop market into complete PPR probability distributions, classify every line move, layer nine proprietary intelligence systems on top, prove accuracy every Tuesday, and let users compete against the model on the same data.

### Complete capability matrix (all required at launch)

| Domain | Full production scope |
|--------|----------------------|
| **Projection engine** | 10-phase deterministic pipeline: game lines → team envelope → props → vig removal → CDF/PCHIP → classifier → Monte Carlo (100K) → internal model → blend → post-game accountability |
| **Line Move Classifier** | All six move types + Unknown; timing amplifier; composite sharp money formula; UI labels on every card |
| **Secret sauce layers** | All nine layers in [00.1_SecretSauce_Formula.md](../Starter%20Docs/00.1_SecretSauce_Formula.md) — rule-based implementation with config-driven weights |
| **Season Points Budget** | Full dynamic budget system with all flags, revision triggers, and budget exhaustion warnings |
| **Three core outputs** | Preseason rankings · Weekly performance rankings · Start/Sit engine with fragility scores |
| **Vegas Mode** | Cross-book consensus, prop intelligence, implied stat back-calculation, game environment tiers |
| **Counterfactual engine** | Full What-If scenario trees — weather, teammate status, game script, stacked variables |
| **Accountability engine** | Error tagging, wrong-for-right-reason logging, calibration bucket tracking & display, blind spot log |
| **Data layer** | Master Spec Sections 4A–4L: volume, advanced metrics, matchup, environment, injuries, game script, historical/archetype, role/snap, news NLP, referee, player-specific weather |
| **League scoring** | PPR, Half-PPR, Standard, TE Premium, SuperFlex, Best Ball, custom bonuses — live recalculation |
| **Player card UI** | All 13 sections per [Stickiness spec](../Starter%20Docs/02.3_Stickiness_Engagement_Social.md) including Outcome Summary share card |
| **Challenge the Model** | Pick Slate · Score Card · Season leaderboard · Override reason analytics |
| **Accountability** | Weekly report with failure modes, calibration tiers, AI narrative, public archive |
| **Historical Intelligence** | Query UI + 15-year signal library applied to every projection |
| **League import** | Sleeper, ESPN, Yahoo — personalized start/sit for user's roster |
| **Trade & waiver tools** | Trade analyzer · Waiver ranker with role-change prioritization |
| **Surfaces** | React Native iOS/Android · Next.js web (marketing + subscriber) · Admin review queue |
| **Content AI** | Full Claude prompt library — profiles, signal summaries, accountability, query translation |
| **Notifications** | Expo push (priority alerts, inactive sweeps, projection changes) · ConvertKit email sequences |

Reference: [03.1_MasterSpec_v1.md](../Starter%20Docs/03.1_MasterSpec_v1.md)

### What we are NOT building (this phase)

- Sportsbook or bet placement
- DFS lineup optimizer (adjacent, out of scope)
- Daily fantasy contest integration
- **ML model training, retraining, or automated weight learning** — see Phase ML in [build-roadmap.md](./build-roadmap.md)

---

## 2. Product surfaces (all launch together)

| Surface | Stack | Scope |
|---------|-------|-------|
| **Native mobile app** | React Native 0.73+ · Expo managed workflow | Primary gameday experience; five-tab nav; push notifications; full player cards |
| **Web app** | Next.js 14+ App Router · TypeScript · Tailwind | Subscriber dashboard, player DB, counterfactual engine, league import UI |
| **Marketing site** | Next.js on **Cloudflare Worker** (OpenNext, local deploy) | SEO player pages, methodology, Expert Comparison Board |
| **Admin console** | Next.js protected routes + n8n review queue | Pipeline control, content approval, classifier override audit, user support |
| **Orchestration** | n8n (self-hosted or Cloud) | Human review workflows, email triggers, webhook routing, error escalation |

UI reference: [Starter Docs/Designs/](../Starter%20Docs/Designs/) — implement every component; HTML mockups are wireframe fidelity, not final polish.

---

## 3. Production launch definition

Paid subscriptions open only when **every item** below is complete and verified in staging against live NFL data.

### Computation & data

- [ ] Full 10-phase pipeline runs on schedule without manual intervention
- [ ] All Master Spec data inputs ingested (see architecture-plan.md §4)
- [ ] Line Move Type Classifier with betting splits integration
- [ ] Monte Carlo at 100K scenarios with Cholesky-correlated sampling
- [ ] All nine secret sauce layers active in blend
- [ ] Tier 2 internal model for players without prop ladders — with honest Market Confidence scoring
- [ ] Post-game error tagging, wrong-for-right-reason logging, and blind spot log
- [ ] Calibration buckets computed and displayed weekly (tracking only — no ML auto-adjust)
- [ ] Signal weights managed via **admin config** (versioned JSON in Neon + R2), not ML retrain

**Explicitly not required before launch (Phase ML):**

- [ ] ~~XGBoost/scikit-learn models trained and loaded from R2~~
- [ ] ~~PyMC Bayesian ML layer~~
- [ ] ~~Automated weight adjustment from error memory~~
- [ ] ~~Seasonal retraining job~~

### Product features

- [ ] Preseason rankings engine
- [ ] Weekly performance rankings (live update Fri–Sun)
- [ ] Start/Sit engine with confidence, fragility, decomposition, variance warnings
- [ ] Counterfactual scenario engine with stacked variables
- [ ] Challenge the Model — Pick Slate, Score Card, leaderboard
- [ ] League import (Sleeper + ESPN + Yahoo)
- [ ] Trade analyzer + waiver wire ranker
- [ ] Historical Intelligence Engine query UI
- [ ] Expert Comparison Board (public)
- [ ] Full player card (13 sections + TD toggle + share Outcome Summary)
- [ ] All league scoring format toggles

### Surfaces & ops

- [ ] React Native app — iOS App Store + Google Play approved
- [ ] Next.js web — all routes from Dev Stack Prompt 9
- [ ] Stripe subscriptions + customer portal
- [ ] ConvertKit automation sequences
- [ ] Expo push notifications for all alert types
- [ ] n8n review queue for AI content
- [ ] Sentry + Airtable error pipeline (per Starter Dev Stack)
- [ ] Load test: 2,000 concurrent users on player card API
- [ ] Security audit passed (OWASP top 10, secrets, auth, SQL)

### Trust & legal

- [ ] 3+ weeks public accuracy run on full engine (not manual spreadsheet)
- [ ] Terms of Service · Privacy Policy · analytics disclaimer
- [ ] Brand/domain/trademark resolved

---

## 4. Architecture summary

```
┌──────────────────────────────────────────────────────────────────┐
│ DATA SOURCES (all feeds — see architecture-plan.md)              │
│ Odds API · PFF · nflverse · NGS · Sportradar · weather · news   │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE: Cron Triggers → Queues → Python Container Workers      │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ Neon Postgres · Cloudflare R2 · Workers Secrets · Hyperdrive       │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ n8n orchestration · Claude API content · ConvertKit · Expo push  │
└────────────────────────────┬─────────────────────────────────────┘
                             ▼
┌──────────────────────────────────────────────────────────────────┐
│ OpenNext Worker (Next.js) · React Native · Workers API             │
└──────────────────────────────────────────────────────────────────┘
```

Detail: [architecture-plan.md](./architecture-plan.md)

---

## 5. Build timeline (realistic)

Full production scope: **630–820 traditional dev hours** or **~200–280 hours** Claude-assisted core + **~120–150 hours** integration, device testing, App Store, and load testing that cannot be automated.

| Team pace | Calendar to production-ready |
|-----------|-------------------------------|
| Solo dev, 30 hrs/week | **6–8 months** |
| Solo dev, 40 hrs/week | **5–6 months** |
| 2-person team (dev + founder), 50 hrs/week combined | **3.5–4 months** |

### Recommended phase structure

| Phase | Duration | Delivers |
|-------|----------|----------|
| **0 — Foundation** | 6 weeks | Brand, repo, **Cloudflare + Neon** infra, DB schema, CI/CD, data contracts |
| **1 — Data & ingestion** | 8 weeks | All feeds, raw storage, opening line tracking, n8n skeleton |
| **2 — Computation engine** | 10 weeks | Full pipeline, secret sauce, counterfactual backend |
| **3 — Accountability** | 4 weeks | Post-game tagging, calibration tracking, config weight system |
| **4 — API & content** | 6 weeks | REST API, Claude copy gen, n8n queues |
| **5 — Web platform** | 8 weeks | Next.js full site — all pages, auth, SEO, counterfactual UI |
| **6 — Mobile app** | 8 weeks | React Native full app, push, App Store submission |
| **7 — Engagement features** | 6 weeks | Challenge the Model, league import, trade/waiver tools |
| **8 — Hardening & launch** | 6 weeks | Load test, security audit, public accuracy run, soft launch |
| **ML — Adaptive learning** | Post-launch | XGBoost, PyMC, automated retrain — after Season 1 data |

**Total pre-ML build: ~58 person-weeks** (solo ~6–8 months · 2 devs ~3.5–4 months). Phase ML follows after launch.

Detail: [build-roadmap.md](./build-roadmap.md)

---

## 6. Hosting summary (Cloudflare + Neon)

| Layer | Production choice |
|-------|-------------------|
| Web app + marketing | **Cloudflare Worker** (OpenNext — local `build:cf` + `deploy:cf`) |
| API + webhooks | **Cloudflare Workers** (Hyperdrive → Neon) |
| Scheduled pipeline | **Cron Triggers → Queues → Workers Containers** (Python 3.11) |
| Database | **Neon Postgres** (branches: dev / staging / main) |
| Connection pooling | **Cloudflare Hyperdrive** + Neon pooler |
| Object storage | **Cloudflare R2** (parquet, models, content JSON) |
| Secrets | **Workers/Pages Secrets** |
| Orchestration | n8n (existing Atomic Design instance) |
| Mobile | Expo EAS Build + Expo Push |
| Email | ConvertKit REST API |
| Errors | Airtable webhook + Sentry |
| Edge security | Cloudflare WAF + Access (admin/staging) |
| Signal config | Versioned weight configs in Neon + R2 (`data/signal-library/`) |

**Production monthly cost at launch:** ~$450–900/mo (Neon $19–69+, Cloudflare Workers/Containers $30–120, Odds API $59–119, PFF/data feeds $200–400, ConvertKit $50, Claude API $50–150, monitoring $30).

Detail: [hosting-and-operations-plan.md](./hosting-and-operations-plan.md) · Deploy: [deploy-plan.md](./deploy-plan.md) · Data: [data-sources.md](./data-sources.md) · Research: [data-source-research.md](./data-source-research.md)

---

## 7. Go-to-market (finished product)

Launch when the platform is **complete**, not when a subset works.

- **Pre-launch:** 3+ weeks public accuracy on full automated pipeline
- **Pricing:** $40/yr founding tier → $79–89 after Season 1 accountability proof
- **Primary channels:** Reddit methodology + accuracy posts, podcasts, SEO player pages, Challenge the Model social sharing (Outcome Summary cards)
- **Retention at launch:** Accountability email · Challenge the Model · push alerts · season budget hooks · league-personalized start/sit

Detail: [product-growth-and-launch-plan.md](./product-growth-and-launch-plan.md)

---

## 8. Success metrics (production launch)

| Gate | Standard |
|------|----------|
| Pipeline coverage | Projections for 100% of fantasy-relevant skill players; Tier 2 flagged, never silent |
| Classifier | Move type on every line move; Public/Hype moves show suppression explanation |
| Start/sit accuracy | ≥72% over first 4 published weeks |
| App stability | 99.5% uptime Sun 7AM–4PM ET |
| Mobile | App Store + Play Store live; crash-free sessions >99% |
| p95 latency | Player card <1.5s API; counterfactual recalc <3s |
| Challenge the Model | Pick lock, scoring, leaderboard functional Week 1 of subscriber access |

---

## 9. Document map

```
documentation/
├── plan.md                          ← you are here
├── architecture-plan.md             ← complete system design
├── build-roadmap.md                 ← every module, no defer list
├── hosting-and-operations-plan.md   ← Cloudflare + Neon ops
├── deploy-plan.md                   ← local build + Worker upload (GenFlick pattern)
├── data-sources.md                  ← live data providers & schedule
├── data-source-research.md          ← API vs Apify evaluation & smoke tests
├── product-growth-and-launch-plan.md← launch when complete
└── decisions-and-risks.md           ← production gates & risks
```

**Next step:** Resolve brand/domain, then begin Phase 0 foundation per [build-roadmap.md](./build-roadmap.md).
