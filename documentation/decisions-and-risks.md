# Decisions & Risks (Production)

**Purpose:** Blocking decisions, production readiness gates, and risk register for the **complete** platform build.  
**Standard:** No launch with open P0 decisions or unchecked production gates.

---

## 1. Brand and domain (BLOCKING)

### Problem

Starter Docs use **NovaPredict**, **Gridiron AI**, and **Gridiron Dynasty**. `gridironai.com` is occupied — flagged CRITICAL in viability analysis.

### Required before any build or marketing

- [ ] Final brand name selected
- [ ] `.com` domain registered
- [ ] USPTO trademark search clear
- [ ] App Store / Google Play developer names aligned
- [ ] Social handles secured
- [ ] Design slug typo fixed (`novapredect` → final brand)
- [ ] All docs, app strings, and R2 bucket prefixes use one name

**This remains the first blocking item.**

---

## 2. Open technical decisions

| ID | Decision | Options | Production recommendation | Status |
|----|----------|---------|---------------------------|--------|
| T1 | Primary API delivery | Cloudflare Workers vs Pages Functions for `/api` | **Dedicated Workers** on `api.domain.com` with Hyperdrive | Open |
| T2 | Neon branch strategy | Single project 3 branches vs separate projects | **One project:** `dev` / `staging` / `main` | Recommended |
| T3 | Hyperdrive vs direct Neon | — | **Hyperdrive** for Workers/Pages; direct pooled URL for Python containers | Recommended |
| T4 | Deploy model | Cloudflare Pages git vs local Worker upload | **Local build + `deploy:cf:full`** (GenFlick pattern) | Recommended |
| T5 | Pipeline container memory | Single 4GB container vs partitioned queue jobs | Partition by job type; scale `pipeline-compute` to max | Open |
| T6 | Signal weight changes at launch | Admin UI vs config file in repo | **Admin UI** publishing versioned configs to Neon + R2 | Recommended |
| T7 | Injury feed | Rotowire vs SportsDataIO | **SportsDataIO NFL** primary; Rotowire fallback; Apify injury monitor for cross-check only | Recommended |
| T8 | ESPN league import | Official API vs third-party | Legal review required; Sleeper API verified free | Open |
| T9 | n8n hosting | Self-hosted vs Cloud | Self-hosted if Atomic Design instance available | Open |
| T10 | ORM | Drizzle vs Prisma | Drizzle (lighter, good Neon/Hyperdrive support) | Open |
| T11 | PFF API tier | Personal vs commercial | **Commercial** — quote required ($5k+/yr typical); nflverse fallback with badge if delayed | Open |
| T12 | Bet splits provider | Action Network vs OddsJam vs Sportradar vs SDIO | **SportsDataIO betting bundle first**; no public Action Network API; Apify not viable for splits | Open — highest data risk |
| T13 | Apify role | Replace APIs vs supplement | **Supplement only** — odds/injury redundancy; never primary for alt ladders or splits | Recommended |

**None of these are shortcuts to skip — they are vendor selections for full-spec features.**

---

## 3. Open product decisions

| ID | Decision | Production recommendation | Status |
|----|----------|---------------------------|--------|
| P1 | Founding price lock count | 1,000 subscribers at $40/yr forever | Open |
| P2 | Free tier card limit | 3 full player cards/week + full accountability archive | Recommended |
| P3 | Challenge minimum picks | 5 per week per spec | Locked by spec |
| P4 | Counterfactual variable set | Full Master Spec §8 list at launch | Recommended |
| P5 | Dynasty mode | Launch vs Year 2 | Year 2 — but schema supports it day one | Open |
| P6 | Best Ball scoring profile | Launch | **Yes** — league scoring engine includes it | Recommended |

---

## 4. Production readiness gates

Paid subscriptions **cannot open** until every gate passes.

### Engineering gates

- [ ] All Master Spec §4 data feeds ingesting in staging
- [ ] Full 10-phase pipeline green for 2 consecutive live NFL weeks on staging
- [ ] Hyperdrive connected and pool stable under load test
- [ ] All Cron Triggers + Queues + Container Workers succeeded without DLQ backlog
- [ ] R2 versioning enabled on models prefix
- [ ] All 9 secret sauce layers producing auditable breakdowns
- [ ] Line Move Classifier live with bet splits data
- [ ] Counterfactual engine <3s response at p95
- [ ] Challenge the Model — lock, score, leaderboard verified
- [ ] League import: Sleeper + ESPN + Yahoo functional
- [ ] Trade analyzer + waiver ranker live
- [ ] React Native app approved on App Store + Google Play
- [ ] Next.js all routes on **Cloudflare Worker** (OpenNext, local deploy) deployed
- [ ] n8n review queue operational for all AI content
- [ ] Load test: 2,000 concurrent API reads via Cloudflare passed
- [ ] Pen test remediated
- [ ] Disaster recovery drill completed

### Accuracy gates

- [ ] 3-week staging accuracy run published
- [ ] Start/sit ≥72% over validation window OR documented exception with founder sign-off
- [ ] Calibration buckets populated and displayed

### Legal gates

- [ ] Terms of Service live
- [ ] Privacy Policy live
- [ ] Analytics / not-gambling disclaimer live
- [ ] Odds API + PFF + Sportradar ToS compliance verified
- [ ] Stripe live mode configured

### Operational gates

- [ ] On-call rotation assigned through NFL Week 5
- [ ] Runbook in `ops/RUNBOOK.md` complete
- [ ] Status page live
- [ ] Airtable + Sentry alerting tested

---

## 5. Risk register (production)

| # | Risk | L | I | Mitigation |
|---|------|---|---|------------|
| R1 | Core thesis false — prop CDF doesn't beat consensus | M | H | 3-week public validation on full engine before launch; Tier 2 fallback with honest badges |
| R2 | Timeline extends past NFL draft window | H | H | Parallel dev tracks; 2-person team; **do not cut scope** — extend calendar or add team |
| R3 | Data feed cost exceeds revenue at low sub count | M | H | Full stack costs $500–900/mo; delay launch until funding/subs cover OR negotiate annual feed contracts |
| R4 | PFF / Sportradar / splits APIs unavailable or priced out | M | H | Identify alternatives early Phase 1; classifier degraded mode unacceptable for launch — resolve vendor before Phase 2 |
| R5 | Classifier wrong on primetime public moves | M | M | Golden test suite; Sunday manual audit Week 1–3; public suppression UI explains non-adjustment |
| R6 | App Store rejection | M | M | Follow gambling-adjacent guidelines; fantasy analytics framing; buffer 2 weeks resubmit |
| R7 | ESPN import ToS violation | M | H | Legal review before Phase 7; Sleeper-first if ESPN blocked |
| R8 | Solo dev burnout / unavailable in-season | H | H | Paid retainer backup; comprehensive runbooks; frozen week CI regression |
| R9 | Claude API cost spike | L | M | Prompt caching; batch generation; cost caps; template fallbacks for non-critical copy |
| R10 | Seasonal revenue cliff | M | M | Annual billing; NBA Year 2; off-season draft rankings product |
| R11 | Reddit policy change | L | M | Email list primary; diversify channels |
| R12 | Competitor copies methodology | M | M | Speed + accountability brand + Challenge community moat |
| R13 | Security breach | L | H | Pen test, WAF, secrets manager, minimal PII |
| R14 | Hyperdrive pool exhaustion under Sunday load | M | H | Load test at 2K concurrent; Neon autoscale; cache hot player cards at edge |
| R15 | ML retrain introduces regression | — | — | *Deferred to Phase ML* |
| R16 | Workers Container timeout on Monte Carlo | M | H | Partition compute queue; scale container memory; vectorized numpy |
| R17 | Manual weight tuning misses optimal blend | M | M | Blind spot log + weekly review; Phase ML automates after Season 1 |

---

## 6. Kill conditions

| Condition | Threshold | Action |
|-----------|-----------|--------|
| Validation failure | <65% start/sit over 3 weeks on full engine | Halt launch; investigate thesis |
| Funding vs data costs | Cannot cover $500+/mo feeds for 6 months pre-revenue | Secure funding or negotiate feeds before Phase 1 |
| Brand unresolved | 30 days before marketing spend | Stop marketing; do not launch under wrong name |
| Critical security finding | Unpatched at launch | Delay launch |
| Pipeline reliability | <95% weekly success first month | Pause acquisition spend; fix ops |

**Scope reduction is not a listed mitigation.** Extend timeline or add resources instead.

---

## 7. Legal & compliance (production)

### Product classification

- Fantasy sports **analytics and decision support**
- Not a sportsbook; no bet placement; no guaranteed outcomes
- ToS: user responsible for league decisions; past accuracy ≠ future results

### Data licensing (verify before Phase 1 contracts)

| Feed | Requirement |
|------|-------------|
| The Odds API | Derived product redistribution allowed |
| PFF | Commercial use tier |
| Sportradar/Stats Perform | Display + derivative analytics rights |
| nflverse | Open source attribution |
| Sleeper API | OAuth app approval |
| Beat reporter RSS | Fair use / aggregation review |

### User data

- Email, Stripe customer ID, league roster (imported), Challenge picks, watchlists
- Account deletion + export endpoints required
- No sale of user data

### App Store

- Age rating appropriate for sports analytics
- No real-money gambling mechanics
- Subscription clearly described with restore purchases

---

## 8. Starter Doc corrections (production plan)

| Previous MVP plan said | Production plan says |
|------------------------|----------------------|
| Web-first, defer mobile | React Native + web **both at launch** |
| Defer Challenge the Model | **Launch feature** |
| Defer counterfactual | **Launch feature** |
| Defer league import | **Launch feature** |
| Simplified budget | **Full Master Spec §5** |
| Manual ML weight tuning | **Admin config versioning** (Phase ML adds automation) |
| Railway/Supabase/AWS simplify | **Cloudflare + Neon per hosting plan** |
| 140–200 hr estimate | **360–525+ hr Claude-assisted; 900–1200 traditional** |
| Launch at 80% pipeline coverage | **100% skill players; Tier 2 flagged honestly** |
| Simple admin UI | **n8n review queue + full admin console** |

---

## 9. Dependency checklist (before Phase 1)

- [ ] The Odds API Medium+ tier account
- [ ] PFF commercial API access confirmed
- [ ] Sportradar or Stats Perform contract
- [ ] Rotowire or equivalent injury API
- [ ] Action Network or bet splits provider
- [ ] Cloudflare account: Workers Paid, Pages, R2, Queues, Hyperdrive, Access
- [ ] Neon project + branches (`dev`, `staging`, `main`) with PITR
- [ ] Wrangler production + staging environments configured
- [ ] R2 buckets provisioned with lifecycle rules
- [ ] n8n instance access
- [ ] Anthropic API with spend limit
- [ ] ConvertKit account + domain auth
- [ ] Stripe account verified
- [ ] Apple Developer + Google Play Console accounts
- [ ] Expo EAS project
- [ ] Sentry organization
- [ ] Airtable error base

---

## 10. Decision log

Record closed decisions here:

```markdown
### DEC-000: [Title]
- **Date:**
- **Decision:**
- **Rationale:**
- **Owner:**
```

---

## 11. Questions for founders

1. Budget for $500–900/mo data + infra during 6-month build before revenue?
2. Two-person dev team available, or solo with extended timeline (7–9 months)?
3. Equity/revenue share model for lead developer documented?
4. Public founder face for accuracy accountability on Reddit/podcasts?
5. ESPN import worth legal risk, or Sleeper-only at launch with ESPN Week 2?
6. Accept launch in September if full quality requires it, vs August partial? **Production plan prefers later complete launch over earlier incomplete launch.**

---

## 12. Pre-code gate

**Do not write production application code until:**

1. Brand/domain closed (§1)
2. Data vendor contracts signed or pricing confirmed (§9)
3. Team capacity matches timeline in [build-roadmap.md](./build-roadmap.md)
4. Founder commits to full-scope launch criteria (§4) — no scope cuts under pressure

**Do not open Stripe live mode until all §4 gates pass.**
