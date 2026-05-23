# Build Roadmap (Production)

**Purpose:** Complete build sequence for the full NovaPredict platform — every module from the Master Spec and Dev Stack, with no deferred features.  
**Estimate:** 630–820 traditional hours · ~200–280 Claude-assisted core + ~120–150 integration/QA (per [03.4_DevelopmentEstimates-3.md](../Starter%20Docs/03.4_DevelopmentEstimates-3.md))

---

## 1. Team model

Full production scope requires parallel workstreams:

| Role | Responsibility |
|------|----------------|
| **Lead backend engineer** | Pipeline, computation, API, accountability |
| **Mobile engineer** | React Native app, Expo, App Store |
| **Web engineer** | Next.js full site, admin, SEO |
| **Founder / product** | UX review, copy, accuracy oversight, GTM |
| **Part-time DevOps** | Cloudflare, Neon, Wrangler, n8n, CI/CD, security audit coordination |

Solo developer possible over **7–9 months at 30 hrs/week**. Two-person dev team targets **4–5 months** with parallel tracks.

---

## 2. Phase overview

```
Phase 0   Foundation          6 wks   Cloudflare + Neon, repo, schema, CI/CD
Phase 1   Data ingestion      8 wks   All Master Spec §4 feeds
Phase 2   Computation engine  10 wks  10-phase pipeline + secret sauce + counterfactual
Phase 3   Accountability      4 wks   Post-game tagging, calibration, config weights
Phase 4   API & content       6 wks   REST API, Claude gen, n8n queues
Phase 5   Web platform        8 wks   Next.js on Cloudflare Worker (OpenNext, local deploy)
Phase 6   Mobile app          8 wks   React Native + store submission
Phase 7   Engagement & tools  6 wks   Challenge, league import, trade/waiver
Phase 8   Hardening & launch  6 wks   QA, security, accuracy run, go-live
Phase ML  Adaptive learning   TBD     XGBoost, PyMC, auto-retrain — post-launch
─────────────────────────────────────────────────────────────────
Total     ~58 person-weeks pre-ML (sequential solo) → ~24–32 wks with 2 devs
```

Phases 5+6 can run in parallel after Phase 4 API is stable. Phase 7 depends on Phase 4+5/6.

---

## 3. Phase 0 — Foundation (weeks 1–6)

### Deliverables

- [ ] Brand, domain, trademark resolved
- [ ] Monorepo: `apps/mobile`, `apps/web`, `pipeline/`, `packages/shared-types`
- [ ] Cloudflare account: Workers, Pages, R2, Queues, Hyperdrive configured
- [ ] Neon project: `dev`, `staging`, `main` branches provisioned
- [ ] R2 buckets (or env prefixes): data, models, content, reports
- [ ] Wrangler `wrangler.toml` — Workers, Cron, Queue, Container bindings
- [ ] Hyperdrive configs pointing at Neon branch pooler URLs
- [ ] `app/scripts/deploy-cloudflare-locally.sh` (GenFlick pattern) + smoke test script
- [ ] CI/CD: local deploy only; optional GitHub Actions `workflow_dispatch` for tests
- [ ] n8n workspace: NovaPredict workflows namespace
- [ ] Full DB schema migration v1 (all tables from architecture-plan §12)
- [ ] Seed data: teams, scoring profile templates, config tables
- [ ] Sentry projects (web, mobile, pipeline)
- [ ] Airtable error log base wired

### Hours: 80–120

---

## 4. Phase 1 — Data ingestion (weeks 7–14)

Implement **every** Master Spec §4 input. No "Phase 2 data sources."

### Sprint 1.1 — Core feeds (weeks 7–8)

| Module | Hours (trad / CC) | Source |
|--------|-------------------|--------|
| Odds API — events, game lines, all prop markets | 16–20 / 3–4 | Dev Stack Prompt 1 |
| Alt ladder ingestion (all rungs) | 8–12 / 1–2 | Dev Stack |
| Opening line tracking + deduplication | 6–8 / 1–2 | Dev Stack |
| Suspension detection → PRIORITY ALERT | 6–8 / 1–2 | Dev Stack |
| Stale book + rate limiting + retry | 8–12 / 2 | Dev Stack |
| nflfastR / nflverse parquet → DB | 12–16 / 3–4 | Dev Stack |
| Pipeline error logging → Airtable | 4–5 / 1–2 | Dev Stack |

### Sprint 1.2 — Advanced feeds (weeks 9–10)

| Module | Hours | Source |
|--------|-------|--------|
| PFF API integration (grades, snaps, routes, coverage) | 20–28 | Master Spec §4B, §4C |
| FTN Data / DVOA load | 4–6 / 1–2 | Dev Stack |
| NFL Next Gen Stats ingestion | 16–24 | Master Spec §4B |
| Sportradar or Stats Perform play-by-play | 16–24 | Master Spec §15 |
| Rotowire / injury + practice reports | 12–16 | Master Spec §4F |
| OpenWeatherMap + forecast tracking | 8–12 | Master Spec §4L |
| Action Network / bet splits (classifier input) | 12–16 | AIRunbook |
| Referee crew weekly assignment load | 6–8 | Master Spec §4K |
| Beat reporter RSS + news ingestion | 12–16 | Master Spec §4J |
| News credibility + sentiment pipeline | 16–24 | Master Spec §4J |

### Sprint 1.3 — Scheduling + n8n (weeks 11–14)

| Job | Schedule |
|-----|----------|
| `weekly_data_pull` | Tue 6:00 AM ET |
| `practice_report_update` | Fri 6:00 AM ET |
| `news_sentiment_refresh` | Wed–Sat every 6 hrs |
| `weather_forecast_update` | Wed 6 AM + Sat 6 AM |
| `sunday_projection_refresh` | Sun 7:00 AM ET |
| `inactives_sweep` | Sun 11:30 AM + every 15 min until kickoffs |
| `post_game_processing` | Mon 8:00 AM ET |
| `content_generation` | Mon 10:00 AM ET (after post-game) |

n8n workflows: error escalation, webhook receivers, ConvertKit triggers.

### Phase 1 exit criteria

- All feeds writing to staging DB for a live NFL week
- Zero silent failures — all errors in Airtable + Sentry
- Raw prop history queryable for opening vs current

### Phase 1 hours: 180–250

---

## 5. Phase 2 — Computation engine (weeks 15–24)

Every function specified in Dev Stack Prompts 2–8 and Secret Sauce doc.

### Sprint 2.1 — Core math (weeks 15–17)

| Module | Trad / CC hrs |
|--------|---------------|
| Vig removal (5 functions) | 12–16 / 1–2 |
| CDF + PCHIP fitting | 16–22 / 2–3 |
| Percentile extraction (inverse CDF) | 6–8 / 1 |
| Monte Carlo 100K + Cholesky | 20–28 / 2–3 |
| Correlated sampling validation | 10–14 / 1–2 |
| Distribution stat extraction | 4–6 / 1 |
| Market/internal blend | 6–8 / 1–2 |

### Sprint 2.2 — Classifier + Vegas (weeks 18–19)

| Module | Trad / CC hrs |
|--------|---------------|
| Line Move Type Classifier (6 types + Unknown) | 16–24 / 2–4 |
| Timing amplifier + juice composite formula | 8–12 / 1–2 |
| Cross-book consensus engine | 8–12 / 1–2 |
| Implied stat back-calculation | 16–24 / 2–4 |
| Game script matrix + environment tiers | 12–16 / 2–3 |
| Prop divergence review queue | 6–8 / 1–2 |

### Sprint 2.3 — Secret sauce layers (weeks 20–22)

| Layer | Trad / CC hrs |
|-------|---------------|
| Season Points Budget (full spec) | 20–28 / 3–4 |
| Earned vs Gifted classifier | 12–16 / 2–3 |
| Role change detection + inheritance | 20–28 / 3–4 |
| Historical signal library (apply all signals) | 24–32 / 4–6 |
| DNA volatility grading | 12–16 / 2–3 |
| Projection fragility scoring | 12–16 / 2–3 |
| Confidence calibration engine | 12–16 / 2–3 |
| Archetype vs defense matcher | 16–24 / 3–4 |
| Player-specific weather profiles | 12–16 / 2–3 |
| Referee adjustment module | 8–12 / 1–2 |
| News overreaction filter | 12–16 / 2–3 |

### Sprint 2.4 — Outputs (weeks 23–24)

| Module | Trad / CC hrs |
|--------|---------------|
| Rule-based rolling update (Phase 9 blend — L4 FPPG weight) | 8–12 / 1–2 |
| Preseason rankings generator | 24–32 / 4–6 |
| Weekly rankings generator | 16–24 / 3–4 |
| Start/Sit decision engine | 20–28 / 3–4 |
| League scoring recalculation layer | 12–16 / 2–3 |
| Tier 2 internal model (thin prop fallback) | 16–24 / 3–4 |
| Counterfactual scenario engine (backend) | 32–48 / 6–10 |

### Phase 2 exit criteria

- Golden week regression: full pipeline output matches fixtures within tolerance
- All secret sauce layers produce auditable JSON breakdown on player card
- Counterfactual API returns updated distribution in <3s

### Phase 2 hours: 350–480

---

## 6. Phase 3 — Accountability & calibration (weeks 25–28)

No ML training in this phase — observability, reporting, and config-driven tuning only.

| Module | Trad / CC hrs | Section |
|--------|---------------|---------|
| Post-game error tagging (all failure modes) | 12–16 / 2–3 | Master Spec §11 |
| Wrong-for-right-reason logger | 8–12 / 1–2 | Master Spec §11 |
| Blind spot log + admin review UI | 8–12 / 2 | Master Spec §11 |
| Calibration bucket updater + display API | 8–12 / 1–2 | Master Spec §9F |
| Weekly accountability report generator | 12–16 / 2–3 | Stickiness + Dev Stack |
| Signal weight config system (versioned admin) | 12–16 / 2–4 | Replaces ML retrain at launch |
| Expert Comparison Board data pipeline | 8–12 / 2–3 | Dev Estimates §7 |
| `pipeline-postgame` container (no ML deps) | 8–12 / 2–3 | Hosting plan |

### Phase 3 exit criteria

- Monday post-game job tags all misses with failure modes
- Calibration buckets populate and render on player cards + accountability report
- Admin can publish new signal weight config version without code deploy
- Blind spot log entries visible in admin for Phase ML planning

### Phase 3 hours: 70–100

---

## 7. Phase ML — Adaptive learning (post-launch, not in current timeline)

Build after Season 1 accountability data exists. Full Master Spec §11 ML + §15 ML stack.

| Module | Trad / CC hrs (est.) |
|--------|----------------------|
| XGBoost feature pipeline | 16–24 / 3–4 |
| Position-specific model training | 24–32 / 4–6 |
| R2 joblib serialize/load | 8–12 / 1–2 |
| PyMC Bayesian ML layer | 20–28 / 4–6 |
| Automated weight adjustment from error memory | 16–24 / 3–4 |
| Seasonal retrain job (Feb–Jul) | 16–24 / 3–4 |
| `pipeline-ml-retrain` container + queue | 8–12 / 2–3 |
| Shadow-week promote/rollback tooling | 8–12 / 2–3 |

**Phase ML hours: ~120–180** · Trigger: ≥1 full season of tagged outcomes in Neon.

---

## 8. Phase 4 — API & content (weeks 29–34)

| Module | Trad / CC hrs |
|--------|---------------|
| REST API (Cloudflare Workers + Hyperdrive) | 40–56 / 10–15 |
| Auth (JWT, refresh, subscriber tiers) | 12–16 / 3–4 |
| Player profile generation container + Claude | 10–14 / 2–3 |
| Vegas signal summary generator | 6–8 / 1–2 |
| Accountability report narrative generator | 8–10 / 2–3 |
| Historical query translation + response | 8–12 / 2–3 |
| Outcome Summary verdict generator | 6–8 / 1–2 |
| Prompt versioning + API cost logging | 4–6 / 1–2 |
| n8n human review queue (profiles + reports) | 16–24 / 8–12 |
| Expert Comparison Board data feed | 8–12 / 2–3 |
| Notification dispatcher (Expo + ConvertKit) | 20–28 / 6–8 |

### Phase 4 exit criteria

- Mobile and web can consume all API endpoints
- Content flows: generate → n8n review → approve → publish
- Tuesday accountability email sends automatically

### Phase 4 hours: 130–180

---

## 9. Phase 5 — Web platform (weeks 29–36, parallel with Phase 6)

Per Dev Estimates §7 — **all deliverables**:

| Module | Trad / CC hrs |
|--------|---------------|
| Next.js 14 setup (App Router, TS, Tailwind) | 3–4 / 1 |
| Homepage with live accuracy numbers | 8–10 / 2–3 |
| Player database `/players`, `/players/[id]` | 12–16 / 3–5 |
| Weekly accountability pages | 10–14 / 3–4 |
| Historical Intelligence Engine pages | 10–14 / 3–4 |
| Expert Comparison Board (public) | 6–8 / 2–3 |
| Counterfactual UI | 24–32 / 6–10 |
| Authentication + middleware | 8–12 / 2–3 |
| Free vs subscriber gating | 6–8 / 2–3 |
| Preseason + weekly rankings views | 16–24 / 4–6 |
| Start/sit comparison UI | 12–16 / 3–4 |
| League import UI | 16–24 / 4–6 |
| Trade analyzer + waiver UI | 16–24 / 4–6 |
| Admin console | 20–28 / 5–8 |
| SEO (meta, structured data, canonical) | 8–10 / 2–3 |
| Analytics integration | 3–4 / 1 |
| OpenNext Worker + Wrangler local deploy | 6–8 / 4–6 |

### Player card web implementation

All 13 sections per Stickiness doc — pixel-faithful to Designs/ HTML, production-polished:

1. Header Block · 2. Fantasy Point Breakdown · 3. Expected Volume · 4. Probability Distribution · 5. Safety Profile · 6. Signal Flags · Fold divider · 7. Weekly Signal Conditioning · 8. Active Signal Breakdown · 9. Usage and Role · 10. Historical Signal Record · 11. Game Variables · 12. Vegas Signal · 13. Outcome Summary

### Phase 5 hours: 180–260

---

## 10. Phase 6 — Mobile app (weeks 29–36, parallel with Phase 5)

Per Dev Estimates §6 — **full React Native app**:

| Module | Trad / CC hrs |
|--------|---------------|
| Expo project setup + navigation (5 tabs) | 8–12 / 2–3 |
| Auth flow + secure token storage | 8–12 / 2–3 |
| Home dashboard | 12–16 / 3–4 |
| Player card (all 13 sections native) | 32–48 / 10–15 |
| Weekly rankings + filters | 12–16 / 3–4 |
| Start/sit comparison | 10–14 / 3–4 |
| Challenge the Model — Pick Slate | 16–24 / 4–6 |
| Challenge — Score Card + leaderboard | 12–16 / 3–4 |
| My League (import + personalized sit/start) | 16–24 / 4–6 |
| Counterfactual scenario UI | 20–28 / 5–8 |
| Push notification handling | 8–12 / 2–3 |
| WebView for SEO content pages | 4–6 / 1–2 |
| Offline watchlist cache | 8–12 / 2–3 |
| App Store + Google Play submission | 6–8 / 6–8 |
| iOS + Android device testing | 8–12 / 8–12 |

### Phase 6 exit criteria

- TestFlight + Play internal testing complete
- App Store and Google Play approved
- Crash-free sessions >99% in beta

### Phase 6 hours: 180–260

---

## 11. Phase 7 — Engagement & tools (weeks 37–42)

| Module | Trad / CC hrs |
|--------|---------------|
| Challenge the Model — backend scoring + lock rules | 16–24 / 4–6 |
| Override reason analytics dashboard (admin) | 8–12 / 2–3 |
| Sleeper league import | 16–24 / 4–6 |
| ESPN league import | 16–24 / 4–6 |
| Yahoo league import | 12–16 / 3–4 |
| Personalized start/sit engine | 12–16 / 3–4 |
| Trade analyzer | 16–24 / 4–6 |
| Waiver wire ranker | 12–16 / 3–4 |
| Watchlist + custom alerts | 8–12 / 2–3 |
| Social share — Outcome Summary card export | 6–8 / 2–3 |
| ConvertKit automation sequences (onboarding, win-back) | 8–12 / 4–6 |

### Phase 7 exit criteria

- User imports Sleeper league → sees personalized start/sit
- Challenge picks lock correctly; scoring matches spec
- Trade analyzer returns budget-aware recommendation

### Phase 7 hours: 130–190

---

## 12. Phase 8 — Hardening & launch (weeks 43–48)

| Task | Hours |
|------|-------|
| Integration testing (full system) | 20–28 |
| Load testing (2,000 concurrent) | 6–8 |
| Security audit (OWASP + pen test) | 16–24 (external) |
| Mobile device matrix testing | 8–12 |
| Documentation (README, deployment guide, runbooks) | 6–8 / 1–2 |
| Public accuracy run — 3 weeks full pipeline | 3 weeks calendar |
| Soft launch to email list | — |
| Production promote + monitoring | 8–10 |
| Week 1 live on-call | — |

### Production launch gate

All items in [plan.md](./plan.md) §3 checked off. No exceptions.

### Phase 8 hours: 80–120 + 3-week accuracy calendar

---

## 13. Grand total hour summary (pre-ML)

| Section | Traditional | Claude-assisted | Scope |
|---------|-------------|-----------------|-------|
| 0 Foundation | 80–120 | 40–60 | Full |
| 1 Database (in 0) | 25–35 | 7–11 | All tables (+ ML stubs) |
| 2 Data ingestion | 120–180 | 25–40 | All §4 feeds |
| 3 Computation | 350–480 | 55–80 | All phases + sauce + counterfactual |
| 4 Accountability | 70–100 | 15–25 | Tagging, calibration, config weights |
| 5 n8n | 33–46 | 16–24 | Full workflows |
| 6 React Native | 103–142 | 33–49 | Complete app |
| 7 Next.js | 180–260 | 55–85 | All routes |
| 8 Content gen | 40–56 | 9–15 | Full library |
| 9 Notifications | 38–52 | 11–16 | Push + email |
| 10 Engagement | 130–190 | 35–55 | Challenge + import + tools |
| 11 Testing & launch | 80–120 | 60–90 | Full QA |
| **PRE-ML TOTAL** | **~780–1,020** | **~310–450** | **No ML training** |
| Phase ML (later) | ~120–180 | ~25–40 | XGBoost, PyMC, auto-retrain |

---

## 14. Claude Code workflow

Per [03.4_DevelopmentEstimates-3.md](../Starter%20Docs/03.4_DevelopmentEstimates-3.md):

1. Paste Dev Stack engineering prompt into Claude Code session
2. Review generated module + tests (15–30 min)
3. Run pytest / Jest — fix edge cases
4. Integrate into Container Worker or Cloudflare Worker — **human step, not skippable**
5. Commit with prompt version in message

Claude accelerates boilerplate — it does **not** replace architecture decisions, feed contract debugging, App Store submission, or production on-call.

---

## 15. Definition of done (every module)

1. Matches Master Spec or Starter Doc requirement traceable by section reference
2. Unit + integration tests passing in CI
3. Logged in runbook with owner and rollback procedure
4. Reviewed on staging against live or frozen NFL week data
5. No hardcoded secrets; no TODO placeholders in production paths

**Platform is done when a paying subscriber can use every feature listed in [plan.md](./plan.md) §1 on iOS, Android, and web — with Tuesday accountability proving the engine.**

---

## 16. Scope boundaries

**In current build:** Full product — pipeline, surfaces, Challenge, league import, counterfactual, accountability, config-driven weights.

**Deferred to Phase ML:** XGBoost, scikit-learn training, PyMC, automated retrain, joblib model artifacts, ML-driven weight learning.

If timeline pressure appears, **add team or extend calendar** — do not cut product features. ML was intentionally deferred; do not substitute by dropping Challenge, league import, or counterfactual.
