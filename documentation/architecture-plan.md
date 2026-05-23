# Architecture Plan (Production)

**Purpose:** Complete technical architecture for the full NovaPredict platform — every engine, feed, service, and integration specified in the Master Spec and Starter Docs.  
**Standard:** Production-grade from the first commit. No provisional architectures to replace later.

---

## 1. Design principles

1. **Spec is the backlog.** [03.1_MasterSpec_v1.md](../Starter%20Docs/03.1_MasterSpec_v1.md) defines required behavior. Missing inputs get sourced; missing UI gets built.
2. **Deterministic core, AI at the narrative edge.** All numeric projections flow through the Python computation engine. Claude API generates user-facing prose only (profiles, summaries, verdicts, accountability narrative, historical query responses).
3. **Batch pipeline + targeted refresh.** Scheduled jobs handle weekly cycles; Sunday/inactives jobs run at higher frequency. No user-facing projection served from stale unpublished runs.
4. **Full audit trail.** Every projection stores input snapshots, intermediate CDF points, classifier decisions, blend weights, and version hashes for reproducibility and accountability.
5. **Position-specific intelligence.** QB, RB, WR, TE pipelines for error tagging and projections are isolated — a QB miss never corrupts RB config. ML retraining (later phase) inherits this separation.
6. **Fail closed on pipeline errors.** If latest `projection_run` failed, subscribers see last good publish with banner — never silently serve partial or corrupt data.

---

## 2. System context

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           EXTERNAL DATA FEEDS                            │
├─────────────────────────────────────────────────────────────────────────┤
│ The Odds API │ PFF API │ nflverse/nflfastR │ NFL Next Gen Stats        │
│ Sportradar/Stats Perform │ FTN Data │ OpenWeatherMap │ Rotowire/injury   │
│ Action Network (bet splits) │ Beat reporter RSS │ NFL officiating crews │
│ Sleeper API │ ESPN/Yahoo (league import) │ DraftKings public splits    │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ CLOUDFLARE: Cron Triggers → Queues → Workers Containers (Python 3.11+)  │
│ weekly_data_pull │ computation_engine │ practice_update │ sunday_refresh │
│ inactives_sweep │ post_game │ content_generation │ calibrate          │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌──────────────────────┐    ┌──────────────────────┐    ┌───────────────┐
│ Neon Postgres        │◀──▶│ Cloudflare R2        │    │ Workers       │
│ (branch per env)     │    │ (models, parquet)    │    │ Secrets       │
└──────────┬───────────┘    └──────────────────────┘    └───────────────┘
           │                         Hyperdrive pool
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ n8n: review queues · email triggers · error escalation · publish hooks   │
└───────────────────────────────────┬─────────────────────────────────────┘
                                    ▼
┌──────────────────────┐  ┌──────────────────────┐  ┌─────────────────────┐
│ Cloudflare Workers   │  │ Claude API (Sonnet)  │  │ ConvertKit + Expo   │
│ REST API + webhooks  │  │ full prompt library  │  │ Push                │
└──────────┬───────────┘  └──────────────────────┘  └─────────────────────┘
           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│ OpenNext Worker (Next.js) │ React Native app │ Admin │ Public SEO       │
└─────────────────────────────────────────────────────────────────────────┘
```

Hosting detail: [hosting-and-operations-plan.md](./hosting-and-operations-plan.md). Starter Docs AWS diagram maps 1:1 to Cloudflare + Neon (see hosting plan §14).

---

## 3. Five engine layers (Master Spec §2)

| Layer | Responsibility | Production modules |
|-------|----------------|-------------------|
| **1 — Data ingestion** | Real-time + scheduled feeds; normalization; dedupe; suspension detection | `weekly_data_pull`, `practice_report_update`, `news_ingestion`, `weather_pull` |
| **2 — Role & opportunity** | Snap, routes, targets, RZ, situational splits; role change detection | `role_change_detector`, `inheritance_model`, `snap_intelligence` |
| **3 — Projection engine** | Deterministic weekly model; floor/median/ceiling/boom/bust/fragility | `computation_engine` (Phases 1–9), rule-based rolling update |
| **4 — Season budget** | Preseason pool; weekly pace; all flags and revision triggers | `season_budget_tracker` (full spec §5) |
| **5 — Decision engine** | Start/sit, rankings, counterfactuals, prediction tracking | `start_sit_engine`, `counterfactual_engine`, `rankings_generator` |

---

## 4. Complete data layer (Master Spec §4)

Every subsection is a required ingestion + storage + computation integration.

### 4A — Player performance & volume
Fantasy PPG, projected vs actual delta, target/snap share trends, air yards, RZ usage, opportunity share, boom/bust rates, explosive play rate, YAC/YBC, broken tackles, TD equity, TD debt score.

**Sources:** nflverse, PFF, internal aggregates.

### 4B — Advanced position metrics
- **WR:** YPRR, air yards, aDOT, separation (NGS), route participation, slot/outside, motion
- **RB:** carries, targets, goal-line share, 3rd-down role, 2-minute usage, YBC/YAC, committee flag
- **TE:** route participation, inline/split, seam rate, RZ share, first-read rate
- **QB:** air yards thrown, time to throw, accuracy by depth, PROE, deep ball rate, scramble rate

**Sources:** PFF API, NFL Next Gen Stats, nflverse.

### 4C — Matchup & defense
DVOA vs position, yards/TDs allowed, slot/outside splits, CB shadow (PFF), safety help, blitz/pressure, DL vs OL, missing defensive personnel, defensive trajectory, play-family expectations, **archetype vs defense modeling** (slot vs zone, boundary vs shadow, etc.).

**Sources:** FTN Data (DVOA), PFF, internal archetype matrix.

### 4D — Game environment
Vegas total/spread, implied team total, pace, PROE, home/away, dome/outdoor, turf/grass, timezone travel, divisional tendencies, short week/bye/post-bye coaching shifts, opponent fatigue model.

**Sources:** Odds API, nflverse, historical coaching database.

### 4E — Vegas mode (deep)
See §7 below — not a separate optional module.

### 4F — Injuries & roster
Designation + trend, Wed/Thu/Fri practice, QB/OL health, teammate impact, role inheritance, inactive risk, beat reporter weighting.

**Sources:** Rotowire API (or equivalent paid feed), official NFL injury reports.

### 4G — Game script modeling
Underdog/favorite scripts, blowout risk, garbage time beneficiaries, RZ by script, comeback script, situational run/pass, opponent-adjusted tendencies.

**Sources:** Derived from 4D + historical play-by-play.

### 4H — Historical & archetype
Vs opponent history, similar game scripts, player-specific weather history, age curves, prior ADP finish, contract year, post-bye shifts, similar player model, offensive momentum.

**Sources:** nflverse historical, internal signal library.

### 4I — Role & snap intelligence
Snap trends by situation, route participation, point concentration index, offense archetype (Star-Dependent/Balanced/Matchup/Committee), archetype shift detection, first-read rate, 2-minute vs full-game role.

**Sources:** PFF, NGS, internal detectors.

### 4J — News & information layer
Credibility scoring (official > coach > beat > national > depth chart > pattern), sentiment velocity, narrative shift detection, overreaction filter, late-week uncertainty adjustment.

**Sources:** RSS beat feeds + NLP pipeline (Claude or dedicated NLP for classification).

### 4K — Referee & officiating
Crew assignment, penalty rate, PI frequency, holding rate, high-PI/low-flag crew flags affecting projections.

**Sources:** NFL officiating assignments (NFLweather.com or manual weekly entry + historical database).

### 4L — Weather (player-specific)
Wind/rain/snow/cold thresholds; **player-specific profiles** by route type — not generic position penalties.

**Sources:** OpenWeatherMap + historical player-weather performance matrix.

---

## 5. Ten-phase computation pipeline

Full specification: [03.6_DevPartnership.md](../Starter%20Docs/03.6_DevPartnership.md), [03.2_AIRunbook_10A9_v2.md](../Starter%20Docs/03.2_AIRunbook_10A9_v2.md)

| Phase | Module | Production requirements |
|-------|--------|------------------------|
| 1 | Game lines | All books; Pinnacle 2×; opening vs current; steam/reverse line detection |
| 2 | Team envelope | Implied pass/rush/RZ; spread-to-script matrix; environment tiers (47+/43–46/<43) |
| 3 | Prop ingestion | Primary + full alt ladders + combo + TD + longest reception; suspension = PRIORITY ALERT |
| 4 | Vig removal | Two-sided primary; one-sided alt; book-tier formulas; cross-book median |
| 5 | CDF construction | Monotonic validation; PCHIP (scipy); P10–P90; boom/bust extraction |
| 6 | Adjustments + classifier | Full six-type classifier + timing amplifier + juice composite formula |
| 7 | Monte Carlo | 100K scenarios; Cholesky correlated yards/rec/TD; league scoring applied |
| 8 | Internal model | Role data + all secret sauce layers (§6) |
| 9 | Final blend | Market confidence weighted blend + line move shift + **rule-based rolling update** (L4 FPPG weight — not ML) |
| 10 | Post-game | Actuals, error tags, budget update, calibration buckets, blind spot log |

Each phase: **unit tests with golden numeric fixtures**, integration test on frozen NFL week snapshot in CI.

---

## 6. All proprietary layers (full implementation)

From [00.1_SecretSauce_Formula.md](../Starter%20Docs/00.1_SecretSauce_Formula.md) — no simplified subsets.

| Layer | Production deliverable |
|-------|---------------------|
| 01 Vegas CDF | Full alt ladder → PCHIP → MC pipeline |
| 02 Line Move Classifier | Six types + Unknown; all weights; UI labels; confidence adj |
| 03 Vegas implied stat distribution | Back-calculate carries, targets, RZ, yards by player |
| 04 Season Points Budget | All flags, fluke detector, sustained signals, revision triggers, exhaustion warning |
| 05 Earned vs Gifted | Five categories; 3× regression; last 3 weeks on card |
| 06 Role change detection | All detection signals; target/carry inheritance by route type; 48–72h edge |
| 07 Historical signal library | Full library in DB; every signal adjusts full distribution; query UI |
| 08 DNA volatility | S+ through X; SD multipliers applied to distribution width |
| 09 Projection fragility | Failure mode tags (TD-dependent, coverage-dependent, etc.) on every projection |
| 10 Confidence calibration | Track 60/70/80/90% tiers; display historical accuracy at launch; ML auto-adjust in Phase ML |
| 11 Error memory | Wrong-for-right-reason logging; blind spot log at launch; automated weight adjustment in Phase ML |
| 12 Counterfactual engine | Full scenario tree (Master Spec §8) |

---

## 7. Vegas Mode (Master Spec §7)

Production requirements:

- Cross-book prop consensus: median, high, low, fastest mover, stale book, disagreement score
- Prop line movement tracking; sharp prop money detection
- Prop suspension = injury signal with alert pipeline
- Model vs market divergence review queue
- Implied carries, targets, RZ trips, passing yards by player
- Spread-to-game-script matrix (all tiers)
- Game total environment tiers with position-specific elevation/suppression
- **Move type labels** on all player cards (Stickiness §4)

---

## 8. Three core outputs (Master Spec §6)

### 6A — Preseason rankings
All inputs from Master Spec §6A: ADP consensus, scarcity, depth chart, camp reports, preseason usage, transactions, scheme fit, contract year, age curve, injury history, draft capital, college metrics, combine, OL rank, team volume projections, schedule strength, similar player model.

### 6B — Weekly performance rankings
Live recalculation Tue–Sun incorporating all data layers, role changes, budget status, weather, referee, late-week uncertainty.

### 6C — Start/Sit engine
Full output per player: recommendation, confidence, floor/median/ceiling, boom/bust, fragility + failure mode, budget status, TD debt, reasoning, variance flag, historical calibration signal.

**Decision framework:** All factors from Master Spec §6C (floor, ceiling, matchup, volume stability, TD equity, game environment, Vegas alignment, budget regression, archetype vs defense).

---

## 9. Counterfactual scenario engine (Master Spec §8)

Production UI + backend:

- Weather scenarios (all tiers + clears + dome baseline)
- Teammate status scenarios (WR1 in/out, QB downgrade, RB inactive, etc.)
- Game script overrides
- Stacked variables with individual + combined delta display
- Live-updating floor/median/ceiling/boom/bust
- Side-by-side player comparison under identical scenarios
- Tagline in product: **"Stop guessing. Run the what-if."**

Backend: recomputes Phase 8–9 with scenario overrides without re-ingesting props (cached base distributions).

---

## 10. Challenge the Model (full feature)

Per [02.2_ChallengeTheModel.md](../Starter%20Docs/02.2_ChallengeTheModel.md):

| Sub-feature | Requirements |
|-------------|--------------|
| **Pick Slate** | Agree / Override (numeric + reason) / Skip; lock 90 min pre-kickoff; min 5 picks; Start/Sit mode; "Agree with all" |
| **Score Card** | Start/sit accuracy + projection MAE; user vs model delta; weekly + season record |
| **Leaderboard** | Season standings; category breakdown; community pillars |
| **Analytics backend** | Override reason aggregation for model blind-spot detection |

---

## 11. Accountability & error memory (Master Spec §11) — launch scope

Production system **without ML retraining**:

- Weekly tracking: projected vs actual, start/sit outcome, calibration buckets, budget accuracy
- Error tagging: all failure modes (TD variance, volume miss, role miss, injury, coverage, blowout, weather, market disagreement, coaching, news credibility)
- Wrong-for-right-reason logging with usage data
- **Blind spot log** — surfaces signal gaps; feeds Phase ML backlog
- **Calibration display** — rolling accuracy at 60/70/80/90% tiers; publish weekly
- **Config-driven weights** — signal coefficients and blend ratios in versioned admin config (Neon + R2); human-reviewed changes only

### Deferred to Phase ML (Master Spec §11 ML portions)

- Automated weight adjustment by error type
- Position-specific ML retraining
- Seasonal full-year retrain (XGBoost + PyMC)
- `model_versions`, `training_runs`, joblib artifacts in R2

---

## 12. Database schema (complete)

Implement full schema from [03.5_DevStackAndClaudeCodePrompts.md](../Starter%20Docs/03.5_DevStackAndClaudeCodePrompts.md) § Database Schema, expanded for:

### Core entities (~40+ tables)

**Ingestion:** seasons, weeks, games, teams, players, game_lines, player_props, prop_history, prop_suspensions, weather_forecasts, injury_reports, practice_reports, news_items, referee_crews

**Computation:** projection_runs, player_projections, projection_components, distribution_summaries, line_move_classifications, market_confidence, cdf_snapshots

**Intelligence:** season_budgets, budget_events, role_change_events, earned_gifted_scores, dna_grades, fragility_scores, historical_signals, signal_applications, archetype_matchups, **signal_weight_configs** (versioned)

**ML (Phase ML — schema stub only at launch):** model_versions, model_artifacts, training_runs, feature_importance_logs — tables created empty, populated post-launch

**Accountability:** prediction_outcomes, failure_tags, calibration_buckets, weekly_accountability_reports, expert_comparisons

**Challenge the Model:** user_picks, pick_locks, weekly_scores, season_leaderboard, override_reasons_agg

**League import:** user_leagues, roster_players, league_scoring_profiles

**Product:** users, subscriptions, watchlists, notification_preferences, notification_log, content_drafts, content_published

**Audit:** pipeline_errors, admin_actions, classifier_overrides

All foreign keys enforced. Migrations versioned. Read replicas considered at 5K+ subscribers.

---

## 13. API design (production)

### Public/subscriber API (versioned `/api/v1/`)

```
GET  /weeks/current
GET  /weeks/{season}/{week}/rankings?position=&scoring=
GET  /players/{id}/card?week=&scoring=
GET  /players/{id}/counterfactual  POST body: scenario variables
GET  /compare?players=&week=&scoring=
GET  /preseason/rankings?scoring=
GET  /accountability/{season}/{week}
GET  /accountability/latest
GET  /historical-intelligence/query  POST body: natural language → structured query
GET  /challenge/slate?week=
POST /challenge/picks
GET  /challenge/scores?week=
GET  /challenge/leaderboard?season=
GET  /leagues/import/{platform}  OAuth flows
GET  /leagues/{id}/start-sit
GET  /trade/analyze  POST body: trade proposal
GET  /waiver/rankings?week=
```

- JWT auth (subscriber tier enforcement)
- Rate limiting by tier
- CDN cache for public SEO pages; no cache for personalized league data
- OpenAPI spec published for internal consumers

### Admin API

```
POST /admin/pipeline/trigger
GET  /admin/pipeline/runs/{id}
POST /admin/content/approve/{id}
POST /admin/config/signal-weights  (versioned, audited — launch weight management)
POST /admin/classifier/override  (audited)
GET  /admin/errors
GET  /admin/users/{id}
```

---

## 14. Application architecture

### React Native app (primary)

Per Dev Stack § App — Native:

- Expo managed workflow 0.73+
- Five-tab navigation (Home, Rankings, Challenge, My League, Account)
- WebView for SEO-heavy content pages (Google indexes traffic)
- Full player card — all 13 sections native-rendered
- Push via Expo Notifications (APNs + FCM)
- Offline cache of user's watchlist cards for gameday

### Next.js on Cloudflare Worker (local build + upload)

Deployed via **OpenNext** — build locally, upload with `opennextjs-cloudflare deploy`. **Not Vercel. Not Cloudflare Pages git builds.** See [deploy-plan.md](./deploy-plan.md).

- `/` homepage with live accuracy numbers
- `/players`, `/players/[id]` ISR player profiles
- `/accountability/[season]/[week]`
- `/historical-intelligence`
- `/expert-comparison` (public)
- `/dashboard`, `/counterfactual`, `/challenge`, `/league`, `/trade`, `/waiver`
- `/admin/*` protected via Cloudflare Access + app auth
- Auth middleware; free vs subscriber gating
- Full SEO: meta, structured data, canonical URLs
- Google Analytics + Cloudflare Web Analytics
- Server data access via **Hyperdrive** → Neon

### Content generation (Claude API)

Full [03.3_ClaudePromptLibrary.md](../Starter%20Docs/03.3_ClaudePromptLibrary.md):

- Player profile generation (~300/week)
- Vegas signal summary (2–3 sentences per card)
- Outcome Summary verdict
- Accountability report narrative
- Historical query translation + response
- Prompt versioning + cost logging per run

Human review via **n8n queue** before publish — not optional.

---

## 15. League scoring engine (Master Spec §3)

Live recalculation for every output:

- PPR, Half-PPR, Standard, TE Premium (1.5), SuperFlex, Best Ball weighting
- Custom: passing TD 4/6, yard increments, bonus thresholds, INT/fumble penalties, return yards, 2PT value
- Trade analyzer and waiver ranker respect user's imported league settings

---

## 16. League import & personalization (Master Spec §15 Phase 4)

Production integrations:

| Platform | Scope |
|----------|-------|
| **Sleeper** | OAuth; roster; scoring settings; weekly opponent |
| **ESPN** | League import via supported API/scraper with ToS compliance |
| **Yahoo** | OAuth league import |

Features enabled by import:

- Personalized start/sit for user's roster slots
- Waiver wire ranker scoped to user's league
- Trade analyzer with season budget context
- Push alerts for user's roster players only

---

## 17. Trade analyzer & waiver ranker

**Trade analyzer:** Season budget trajectory, role change outlook, fragility comparison, ROS strength — Master Spec Phase 4.

**Waiver ranker:** Role change prioritization, opportunity inheritance, budget bounce candidates — updated Tuesday post-pull.

---

## 18. Phase ML — adaptive learning (deferred)

**Not in the current build.** Scheduled after launch once Season 1 accountability data exists.

| Component | Technology (when built) |
|-----------|-------------------------|
| Offline training | scikit-learn, XGBoost, PyMC |
| Serialization | joblib → R2 `data/models/` |
| Runtime load | Python container Workers; warm on Sunday |
| ML Bayesian layer | Replaces/augments rule-based rolling update — position-specific QB/RB/WR/TE |
| Retrain schedule | Monday post-game queue + full seasonal job Feb–Jul |
| Automated weights | Error memory drives weight adjustment (Master Spec §11) |

**Current build uses instead:** rule-based Phase 9 blend, historical signal library coefficients, admin config for weights, calibration tracking without auto-adjust.

---

## 19. Security (production)

- **Cloudflare Workers/Pages Secrets** for all API keys
- **Neon:** SSL required, branch isolation, PITR enabled
- Least-privilege Wrangler deploy tokens per environment
- **Cloudflare WAF** + **Cloudflare Access** on admin/staging
- OWASP top 10 audit before launch
- MFA on admin via Cloudflare Access (Google Workspace / Okta)
- PCI: Stripe only — no card data touches our servers
- Audit log in Neon for classifier overrides and admin actions
- HMAC validation on pipeline container invocations

---

## 20. Testing strategy (complete)

| Layer | Coverage |
|-------|----------|
| Computation phases 1–10 | Golden fixtures per phase; regression on frozen weeks |
| Classifier | Labeled scenario suite (100+ cases) |
| Secret sauce layers | Unit tests per layer with documented expected deltas |
| Counterfactual | Scenario stack combinatorics |
| Challenge the Model | Lock timing, scoring math, inactive void rules |
| API | Contract tests against OpenAPI |
| Web | Playwright E2E — all subscriber flows |
| Mobile | Detox or Maestro — player card, push, pick slate |
| Load | 2,000 concurrent users; Sunday spike simulation |
| Chaos | Odds API failure, Neon PITR restore drill, Queue DLQ recovery |

**CI:** Every PR runs golden week regression. Main branch deploys to staging. Production requires manual promote + checklist.

---

## 21. Multi-sport architecture (built-in, NFL first)

Schema includes `sport` dimension from day one. NFL ships complete. Architecture supports adding stat category maps for NBA/MLB/NHL without schema redesign — per viability analysis Phase 2–6.

Do not launch multi-sport until NFL season proves accuracy targets — but **do not** build NFL-only hacks that require re-architecture later.

---

## 22. Starter Doc stack — mapped to Cloudflare + Neon

| Starter Doc choice | Production adoption |
|--------------------|---------------------|
| AWS Lambda | **Cloudflare Workers + Workers Containers** (Python pipeline) |
| EventBridge cron | **Cloudflare Cron Triggers** |
| RDS PostgreSQL 15 | **Neon Postgres** (dev/staging/main branches) |
| S3 | **Cloudflare R2** |
| Secrets Manager | **Workers/Pages Secrets** |
| API Gateway + WAF | **Workers custom domain + Cloudflare WAF** |
| Vercel / Pages git deploy | **Local OpenNext → Worker upload** |
| Lambda ↔ RDS pooling | **Cloudflare Hyperdrive** → Neon |
| n8n orchestration | **Yes — review queues + email** |
| Airtable error logging | **Yes — plus Sentry** |
| React Native + Expo | **Yes — primary mobile** |
| ConvertKit | **Yes — email automation** |
| Claude API Sonnet | **Yes — full prompt library** |
| Python 3.11+ computation | **Yes — container Workers** |
| The Odds API | **Yes — upgrade tier at scale** |

See [hosting-and-operations-plan.md](./hosting-and-operations-plan.md) for full Cloudflare + Neon configuration.
