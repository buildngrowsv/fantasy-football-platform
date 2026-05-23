# NovaPredict Document Library & Usage Guide

**April 2026 · Confidential**

This guide maps every NovaPredict document, explains what it contains, and tells you when to reach for it. Documents are grouped by purpose. Each entry gives you the filename, a plain-language description of the content, and a specific note on how to actually use it.

---

## Group 1 — Start Here: What NovaPredict Is

If you are new to the project, or need to brief someone, these two documents cover the full picture and the condensed version.

| Document | File | What's Inside | When to Use It |
|----------|------|---------------|----------------|
| Business Overview + Positioning Update | [01.1_BusinessOverview_PositioningUpdate.md](01.1_BusinessOverview_PositioningUpdate.md) | The primary narrative document. Explains the core product claim, the Vegas signal methodology, the Line Move Type Classifier, the six reasons a prop line moves, and the competitive moat. The most recent version updates the positioning language to reflect the classifier addition. | Read this first. Share with anyone who needs to understand what NovaPredict is and why it wins. Also the source document for pitch deck copy and investor language. |
| Overview — Abridged (Founder Briefing) | [01.2_Overview_Abridged.md](01.2_Overview_Abridged.md) | A single-page condensed version covering market size, the core distinction vs. DraftSharks, the five-step methodology, the six proprietary layers, pricing strategy, and the break-even math. Formatted as a one-page founder briefing. | Use when you need to brief a partner, investor, or developer quickly. The right document to send before a call. Not a substitute for the full overview. |

---

## Group 2 — Business Case & Viability

Financial modeling, unit economics, subscriber math, and the structured challenge to the business case.

| Document | File | What's Inside | When to Use It |
|----------|------|---------------|----------------|
| Viability Analysis — Final | [02.1_ViabilityAnalysis_Final.md](02.1_ViabilityAnalysis_Final.md) | The financial case. Covers market size (41M players, $10.4B revenue), cost structure ($183–$369/month hard costs), break-even math (83 subscribers), LTV vs CAC analysis, $100K ARR milestone, and the path from $40 launch pricing to $79–$89 after the accuracy track record is built. | Use when making pricing or investment decisions. Reference the break-even and ARR tables when discussing funding or bootstrap milestones. The final version has corrected subscriber math — use this, not any earlier draft. |
| Challenge the Model | [02.2_ChallengeTheModel.md](02.2_ChallengeTheModel.md) | A structured devil's-advocate analysis of the business. Challenges the accuracy target (72%+), the market size assumption, the competitive moat, the pricing, and the development timeline. Written to surface the hardest objections before anyone else raises them. | Read before any investor conversation or partnership discussion. Use it to prepare answers to the toughest questions. Also useful when stress-testing a decision — if the challenge doc doesn't shake it, the assumption is probably solid. |
| Stickiness, Engagement & Social Strategy | [02.3_Stickiness_Engagement_Social.md](02.3_Stickiness_Engagement_Social.md) | Covers the retention mechanics — why users stay subscribed, the accountability loop (weekly accuracy reports), the Challenge the Model feature for users, and the social/community strategy for organic growth. | Use when designing the user-facing product experience, planning content marketing, or building the week-to-week engagement loop. Reference when writing onboarding copy or designing the accuracy report format. |

---

## Group 3 — The Model & AI Engine

How NovaPredict actually works under the hood — the AI methodology, the runbook, and the Claude prompt library.

| Document | File | What's Inside | When to Use It |
|----------|------|---------------|----------------|
| Master Specification v1 | [03.1_MasterSpec_v1.md](03.1_MasterSpec_v1.md) | The complete product specification. Defines all inputs (prop types, sportsbooks, data sources), all outputs (floor, median, ceiling, boom%, bust%, confidence score), the six proprietary layers in detail, and the data pipeline architecture. The authoritative technical reference. | The source of truth for what the product does. Reference when there is any ambiguity about how a feature should work or what data it uses. Developers should read this before writing any model or pipeline code. |
| AI Runbook — Section 10A.9 v2 | [03.2_AIRunbook_10A9_v2.md](03.2_AIRunbook_10A9_v2.md) | The operational runbook for the Line Move Type Classifier specifically. Documents the six classifier categories (Sharp Steam, Injury/Depth Chart, Weather, Public/Square Money, Book Balancing, Hype/Sentiment), the signal weights applied to each, and how the classifier output surfaces in the user interface. | Use when building or modifying the Line Move Type Classifier. Also the reference document when writing UI copy for the player card move-type labels. Directly updates the methodology described in the Business Overview positioning. |
| Claude Prompt Library | [03.3_ClaudePromptLibrary.md](03.3_ClaudePromptLibrary.md) | The full library of Claude API prompts used inside the NovaPredict engine. Each prompt is documented with its purpose, the input format it expects, and the output format it produces. Covers projection generation, move-type classification, accuracy reporting, and user-facing explanation generation. | Use when writing new prompts or modifying existing ones. The reference document for anyone integrating Claude API calls into the pipeline. Cross-reference with the Master Spec to ensure prompts align with documented methodology. |

---

## Group 4 — Development & Build

Everything a developer needs: the tech stack, time estimates, Claude Code workflow, and the partnership briefing.

| Document | File | What's Inside | When to Use It |
|----------|------|---------------|----------------|
| Development Estimates | [03.4_DevelopmentEstimates-3.md](03.4_DevelopmentEstimates-3.md) | Time and cost estimates for building each major component of NovaPredict. Covers 10 modules with traditional vs. Claude Code time comparisons, grand total summary, and calendar timeline translation. Shows the efficiency argument for using Claude Code throughout development. | Use when scoping the build, setting a development timeline, or briefing a developer on expected effort. The Claude Code column is the realistic estimate for development done in this stack. |
| Dev Stack & Claude Code Prompts | [03.5_DevStackAndClaudeCodePrompts.md](03.5_DevStackAndClaudeCodePrompts.md) | The full technical stack definition (languages, frameworks, APIs, infrastructure) and the Claude Code prompt sequences for each major build phase. Documents the actual prompts used to generate production code via Claude Code. | Hands-on developer reference. Use during active development to replicate the Claude Code workflow. Also the reference document for onboarding a new developer to the project. |
| Development Partnership Brief | [03.6_DevPartnership.md](03.6_DevPartnership.md) | The briefing document for a development partner or contractor. Explains the product, the build scope, the Claude Code approach, the expected collaboration model, and the milestone structure. Written to be shared externally with a developer being brought onto the project. | Send to any developer you are evaluating as a build partner. Contains everything they need to assess the project and respond with a quote or proposal. Do not send the Master Spec or Runbook until after an NDA is signed. |

---

## Also Available

| Document | File | What's Inside |
|----------|------|---------------|
| Secret Sauce Formula | [00.1_SecretSauce_Formula.md](00.1_SecretSauce_Formula.md) | Core proprietary formula and methodology reference. |
| Design Mockups | [Designs/](Designs/) | HTML prototypes for key UI screens (home, pick slate, player card, accountability report, marketing overview). |

---

## Quick Reference — Which Document to Reach For

| Situation | Document to Open |
|-----------|------------------|
| Briefing a new person on the project | Overview Abridged → then Business Overview if they want depth |
| Investor or partner conversation | Business Overview + Viability Analysis + Challenge the Model |
| Developer scoping the build | Development Estimates + Dev Stack + Master Spec |
| Bringing in a contractor | Dev Partnership Brief (send first, before anything else) |
| Modifying the classifier logic | AI Runbook 10A.9 v2 + Master Spec |
| Writing or updating AI prompts | Claude Prompt Library + AI Runbook |
| Designing the user retention loop | Stickiness & Engagement |
| Stress-testing a business assumption | Challenge the Model |
| Pricing or fundraising decision | Viability Analysis Final |

---

*NovaPredict · Document Library · April 2026 · Confidential*
