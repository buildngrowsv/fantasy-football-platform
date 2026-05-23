# Product, Growth & Launch Plan (Production)

**Purpose:** Go-to-market for the **complete** NovaPredict platform — launch only when every feature in [plan.md](./plan.md) is production-ready.  
**Philosophy:** Sell a finished product to serious players. Prove accuracy on the full engine, not a demo.

---

## 1. Positioning

### One sentence

NovaPredict is the only fantasy platform that reads the Vegas prop market as a full probability distribution, tells you whether to trust every line move, tracks every player's season as a point budget, and proves its accuracy every Tuesday — while letting you compete against the model on the same data.

### Target user

Top 10–15% of fantasy managers — already pay for 4for4, DraftSharks, or FantasyPros premium; understand YPRR, DVOA, and implied totals; want **probability, not opinions**.

### Complete value proposition at launch

Every marketing claim maps to a **shipped feature**:

| Claim | Feature |
|-------|---------|
| "Probability, not predictions" | Boom/bust %, full distribution histogram |
| "We know why the line moved" | Line Move Type Classifier on every card |
| "Season as a portfolio" | Season Points Budget system |
| "Stop guessing. Run the what-if." | Counterfactual scenario engine |
| "Prove it" | Weekly Accountability Report + calibration display |
| "Beat us — if you can" | Challenge the Model |
| "Your league, your scoring" | League import + live scoring recalc |
| "See the whole breakdown" | Fantasy point decomposition table |

Reference: Master Spec §14, [01.1_BusinessOverview](../Starter%20Docs/01.1_BusinessOverview_PositioningUpdate.md)

---

## 2. Pre-launch validation (full engine required)

Validation runs on the **automated production pipeline in staging** — not spreadsheets, not partial features.

### Phase A — Methodology (weeks 1–2 of validation)

- Post Vegas CDF methodology on r/fantasyfootball and r/DynastyFF
- Include classifier concept (sharp vs public moves)
- No product URL — measure genuine interest in the approach

**Success:** Community treats methodology as novel; comments ask technical questions

### Phase B — Staging accuracy (weeks 3–5)

- Run full pipeline in staging against live NFL weeks
- Publish on standalone accuracy site (or `/accountability/preview`):
  - Start/sit calls for top 50 decisions/week
  - Boom/bust hit rates
  - Classifier accuracy retrospective (did sharp moves outperform public moves?)
- Compare head-to-head vs FantasyPros consensus

**Success:** ≥72% start/sit over 3 consecutive weeks; classifier signal quality demonstrable

### Phase C — Beta (weeks 6–8)

- Invite 100–200 email list members to full app (iOS TestFlight + Android internal + web)
- All features live: Challenge, counterfactual, league import, push alerts
- Collect NPS, crash reports, UX friction on player card depth

**Success:** NPS ≥40; crash-free >99%; beta users cite accountability + classifier as top value

### Launch gate

Open paid subscriptions only after Phase A + B + C complete. **No "launch now, finish later."**

---

## 3. Pricing (production tiers)

| Tier | Price | Includes |
|------|-------|----------|
| **Free** | $0 | Public accountability archive · Expert Comparison Board · 3 full player cards/week · methodology content |
| **Pro** | **$40/year** (founding) | Everything: full slate, all cards, start/sit, counterfactual, Challenge, league import, trade/waiver, push alerts, historical intelligence |
| **Pro** (post–Season 1) | **$79–89/year** | Same — new subscribers only |
| **Founding lock** | $40/yr forever | First 1,000 subscribers — reward early trust |

Annual billing only at launch (smooths seasonality). Monthly option at $9.99/mo when NBA adds in Year 2.

Multi-sport bundle (NFL + NBA): $129/yr when NBA ships.

---

## 4. Launch sequence (finished product)

### T-minus 8 weeks

- Brand + domain live
- Marketing site with live staging accuracy embed
- Podcast outreach (5–10 mid-tier shows) — demo **full app**, not slides
- SEO player pages indexing from staging data
- Email list ≥2,000

### T-minus 4 weeks

- App Store + Google Play approved (production track)
- Stripe live mode tested end-to-end
- Founding member pre-registration ($40 lock)
- Press kit: accuracy data, classifier explainer, sample Outcome Summary cards

### Launch week

- Reddit launch post: accuracy track record + Challenge the Model invite
- Podcast episodes synchronized
- Founding 1,000 pricing live
- All channels drive to **native app download + web** — both fully functional

### Week 1 in-season

- Founder on-call for accuracy questions (Reddit, Twitter)
- Tuesday accountability email — first impression for 100% of subscribers
- Monitor Challenge the Model engagement — target 40% of subs make ≥5 picks

---

## 5. Acquisition channels

| Channel | Tactic | Full-product angle |
|---------|--------|-------------------|
| **Reddit** | Accuracy threads, classifier examples, Challenge leaderboard screenshots | Outcome Summary share cards |
| **Podcasts** | Guest spots with live counterfactual demo | "Run the what-if on your RB if WR1 is out" |
| **SEO** | Programmatic player/week pages with real distributions | Index boom%, not just projections |
| **Challenge UGC** | Users post "34–18 vs NovaPredict" records | Built-in share from Score Card |
| **Expert Comparison Board** | Public page vs FantasyPros/4for4 on same decisions | Free tier traffic driver |
| **YouTube** | Weekly accountability recap video | Tuesday content ritual |
| **Twitter/X** | Sharp steam alerts on notable moves | Push alert screenshots |

**Diversification rule:** No channel >30% of new subs by Month 6.

**Email list:** Capture on every free touchpoint — primary owned channel.

---

## 6. Retention architecture (all live at launch)

### Primary loops

| Loop | Mechanism | Cadence |
|------|-----------|---------|
| **Accountability** | Email + push when report publishes | Weekly (Tuesday) |
| **Challenge the Model** | Pick Slate locks → Score Card → leaderboard | Weekly |
| **Season budget alerts** | "Player X 22% ahead of pace — regression flag" | When triggered |
| **Sharp steam push** | Watchlist player gets classifier alert | Real-time Sunday |
| **Inactive PRIORITY_ALERT** | Push within minutes of inactive report | Sunday |
| **League-personalized start/sit** | "Your FLEX: Player A vs B — 71% confidence start A" | Wed + Sun refresh |
| **Counterfactual** | Saved scenarios on watchlist players | User-driven |

### Five-tab mobile engagement

Per Stickiness doc — full navigation at launch:

1. **Home** — slate overview, budget alerts, Vegas movers, role changes
2. **Rankings** — weekly + preseason, all positions, scoring toggle
3. **Challenge** — Pick Slate + Score Card + leaderboard
4. **My League** — imported roster, personalized decisions, waiver/trade
5. **Account** — subscription, scoring defaults, notifications, accuracy history

### Anti-churn

- Annual lock reduces seasonal cancel impulse
- Challenge history + leaderboard = switching cost
- League import personalization = embedded in workflow
- Users who beat the model **stay** — they need the data (per Challenge spec)

---

## 7. Content & SEO (production scope)

### Required pages at launch

| Route | Content |
|-------|---------|
| `/` | Live accuracy, methodology, founding pricing |
| `/players/[slug]` | ISR player profile — distribution, signals, SEO |
| `/accountability/[season]/[week]` | Full report |
| `/expert-comparison` | NovaPredict vs consensus tracker |
| `/historical-intelligence` | Query interface + example signals |
| `/methodology` | Public-safe explainer (no proprietary weights) |
| `/challenge` | Public leaderboard teaser → subscribe |

### Content calendar (in-season)

| Day | Asset |
|-----|-------|
| Tue | Accountability email + Reddit recap + YouTube |
| Wed | 3 player deep dives (classifier stories) |
| Thu | Counterfactual spotlight ("what if WR1 sits?") |
| Fri | Practice report impact cards |
| Sat | Public-action warnings for primetime |
| Sun | Watchlist alert summary (push, not email blast) |
| Mon | "Pre-accountability" teaser |

All AI copy through n8n review before publish.

---

## 8. Trust & transparency

### Published free (always)

- Weekly start/sit accuracy %
- Calibration by confidence tier
- Classifier performance stats (sharp vs public move outcomes)
- Methodology overview
- Expert Comparison Board

### Proprietary (never public)

- Classifier weights, blend ratios, signal coefficients, MC correlation structure

Reference: [00.1_SecretSauce_Formula.md](../Starter%20Docs/00.1_SecretSauce_Formula.md) disclosure key

### Accuracy commitment

- Target: **≥72% start/sit** season average
- Publish every week including bad weeks
- Tag every miss with failure mode — builds more trust than hiding

---

## 9. Social & viral mechanics (launch features)

### Outcome Summary share card

Per Stickiness spec — bottom of every player card:

- Screenshot-optimized layout
- Model certainty badge, boom/bust strip, verdict text
- One-tap share to Twitter/Instagram/Reddit
- Watermark + link back to player page

**Primary organic acquisition surface inside the app.**

### Challenge the Model social

- Weekly "I beat NovaPredict" posts encouraged
- Public leaderboard embed for Reddit comments
- Season-end trophy badges in app

---

## 10. Customer success (production)

| Channel | SLA |
|---------|-----|
| Email support | 24h weekdays; 12h Sun–Mon in-season |
| In-app help | Contextual tooltips on classifier labels, boom%, budget |
| FAQ | Full glossary: fragility, earned/gifted, move types, calibration |
| Status page | Linked in app when pipeline degraded |

### Issue playbook

| Issue | Response |
|-------|----------|
| Projection dispute | Link to decomposition + classifier label + accountability tag |
| Missing player | Explain Tier 2 + market confidence; show internal model badge |
| League import fail | Platform-specific troubleshooting; manual fallback form |
| Classifier disagreement | Acknowledge; log for pipeline review; never defensive |

---

## 11. Metrics (production launch targets)

### Month 1

| Metric | Target |
|--------|--------|
| Paid subscribers | 200+ |
| Free email list | 3,000+ |
| Start/sit accuracy (published) | ≥70% |
| Accountability open rate | ≥45% |
| Challenge participation | ≥40% of subs |
| App Store rating | ≥4.5 |
| Outcome Summary shares / week | 500+ |

### Month 4 (mid-season)

| Metric | Target |
|--------|--------|
| Paid subscribers | 800+ |
| Start/sit accuracy | ≥72% |
| 30-day retention | ≥90% |
| CAC payback | <2 months |
| League import connected | ≥50% of subs |

### Year 1 exit

| Metric | Target |
|--------|--------|
| Paid subscribers | 2,500+ ($100K ARR at $40 blended) |
| Multi-touch attribution | 3+ channels each >15% |
| NPS | ≥50 |

---

## 12. Multi-sport GTM (post-NFL proof)

NFL launches complete first. NBA GTM begins only after:

- One full NFL season accountability published
- Pipeline architecture proven
- Price increase to $79 executed or planned

NBA adds daily engagement Oct–Jun, fixes seasonality per [02.1_ViabilityAnalysis](../Starter%20Docs/02.1_ViabilityAnalysis_Final.md) §07.

---

## 13. Launch anti-patterns

- Launching before App Store approval
- Opening payments before 3-week staging accuracy run
- Marketing Master Spec features not yet in app
- Free tier so generous nobody converts (3 cards/week is enough to taste, not enough to live)
- Hiding bad accuracy weeks
- Spam Reddit before methodology credibility established
- Monthly pricing at launch (invites Feb–Jul cancel wave)

---

## 14. North star

**Subscribers who complete Challenge the Model picks every week, read the Tuesday accountability email, and import their league** — that cohort has the highest LTV and generates the most organic shares.

Build GTM to push users into all three behaviors in Week 1.
