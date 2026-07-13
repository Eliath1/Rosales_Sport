# Coach Roster Capture - Mobile App Roadmap (long-term, not currently scoped)

> **Status:** Long-term idea. No ADR yet, no committed timeline, not in Wave Zero/One/Two scope.
> **Trigger for revisiting:** a real demand signal (see "Demand trigger" below), not a fixed date.
> **Origin:** coaches commonly scribble team rosters (names, numbers, sizes) on paper and photograph them to send to sales via WhatsApp today - this roadmap turns that existing behavior into a product instead of working around it.
> **Deep-dive assessment:** [coach-roster-ai-capture-assessment-2026-07.md](./coach-roster-ai-capture-assessment-2026-07.md) - technical feasibility (AI model choice, mobile framework, architecture), full cost breakdown, timeline, and risk register for this exact idea, written when the owner asked for a real go/no-go assessment.

## Vision

A coach opens a small mobile app (or installable web app), photographs the paper roster they already wrote by hand, and gets back a pre-filled roster (name, number, size per player) ready to review and submit as a quote - no retyping, no WhatsApp back-and-forth, no manual transcription by staff.

**This does not replace human review.** A misread jersey number or size turns into a wrong, already-printed order. Every extraction gets confirmed by a human (coach or staff) before it becomes a real quote line item - see [ADR-009-ai-chatbot.md](./decisions/ADR-009-ai-chatbot.md)'s existing principle: "AI assists sales and support - it does not replace human judgment," which applies here too.

## Why this is realistic, not speculative

- `wave-zero-quote-crm.md` already defines `QuoteLineItemCustomization.roster` as `JSON [{ name, number }]` - the data shape this feature needs already exists in the schema. This is additive, not a redesign.
- The AI extraction piece reuses the same model-routing and AI Gateway pattern already planned for the chatbot ([../ai/model-routing.md](../ai/model-routing.md)) - a vision-capable model call with structured JSON output, not a new architecture.
- "Mobile app" is explicitly listed as out of scope for Wave Zero in `wave-zero-quote-crm.md` - this roadmap is where that deferred item lives until it's ready to be scoped for real.

## Phased rollout (cheap enabler first, invest only when demand shows)

Same philosophy as the rest of this project: don't build the expensive version until the cheap version proves people want it.

### Phase 0 - Photo upload, human transcription (no AI)

Add a "subir foto del roster" field to the existing `/quote/bulk` web form. Coach uploads the photo; staff reads it and types the roster into the CRM manually, same as today except the photo replaces a WhatsApp message.

| | |
|---|---|
| What ships | File upload field, storage, staff-visible thumbnail in the quote/lead |
| Effort | 1-2 dev-days |
| Cost | Trivial - fits as a stretch item inside Wave One or Two, not worth pricing separately |
| Purpose | Validates that coaches will actually use a structured upload instead of WhatsApp, before spending anything on AI |

### Phase 1 - AI-assisted extraction (still web, no app)

Vision model reads the photo, returns a structured draft (team/product context, roster lines: name, number, size, decoration notes), and a human reviews/corrects it before it becomes a real quote. Still just a responsive web flow - no app store involved.

| | |
|---|---|
| What ships | Upload UI with quality check, AI Gateway vision call with JSON schema output, confidence-scored review/edit UI, mapping into `QuoteLineItemCustomization.roster` |
| Effort | ~15-21 dev-days (discovery/prompt design, upload UI, backend + AI call, review UI, schema mapping, testing on real handwriting samples, privacy handling) |
| One-time build cost | Market-equivalent ~$60,000-135,000 MXN; realistic AI-assisted price if scoped as an add-on, ~$8,000-20,000 MXN |
| Ongoing AI cost | Cents per photo (~$0.01-0.03 USD/image) - at a few hundred rosters/month, roughly **$18-160 MXN/mo**, same order of magnitude as the AI budget already planned for the chatbot in [../hosting/infrastructure-cost-tiers.md](../hosting/infrastructure-cost-tiers.md) |
| Risk | Handwriting quality varies a lot in practice - this is why the review step in the effort breakdown is the biggest line item, not the AI call itself |

### Phase 2 - Installable coach app (PWA, not native)

Wrap the Phase 1 flow as an installable Progressive Web App: add-to-home-screen icon, offline-friendly camera capture, push notification when a submitted roster's quote is ready. Still one codebase, no app store submission.

| | |
|---|---|
| What ships | PWA manifest, offline capture queue, push notifications for quote status |
| Effort | +3-5 dev-days on top of Phase 1 |
| Cost | Market-equivalent ~$15,000-35,000 MXN; AI-assisted add-on ~$3,000-8,000 MXN |
| Why before native | Coaches get an "app icon" experience without you taking on app store review cycles, iOS/Android parity, or the associated recurring fees below |

### Phase 3 - Native app (React Native / Expo, iOS + Android)

Only worth this if Phase 1-2 show real repeat usage across multiple teams/seasons - a full native build brings real ongoing cost, not just build cost.

| | |
|---|---|
| What ships | Native camera integration, offline-first roster drafts, saved team/season templates, push notifications, app store presence |
| Effort | +25-45 dev-days on top of Phase 1-2 (native build, app store submission for both platforms, device testing) |
| One-time build cost | Market-equivalent ~$150,000-350,000+ MXN; AI-assisted add-on realistically ~$30,000-70,000 MXN |
| **New recurring costs this phase introduces** | Apple Developer Program ~$99 USD/año (~$1,782 MXN/año, ~$149 MXN/mo amortized); Google Play one-time $25 USD; ongoing OS-version compatibility maintenance beyond the Cursor/tooling cost already tracked elsewhere |

## Demand trigger (don't build ahead of this)

Per the stop-gate philosophy in [../business/hybrid-mvap-paths.md](../business/hybrid-mvap-paths.md), advance a phase only when the evidence shows up, not on a calendar:

| Signal | Action |
|---|---|
| Coaches keep sending roster photos over WhatsApp instead of using the web form, after Phase 0 ships | Justifies Phase 1 (AI extraction) |
| Staff spend measurable time each week transcribing photos manually, after Phase 1 ships | Justifies Phase 2 (installable PWA) |
| The same coaches/teams return season after season and explicitly ask for "an app," after Phase 2 ships | Justifies Phase 3 (native) |
| No repeat usage after 60-90 days at any phase | Stop, don't advance to the next phase |

## Non-goals (any phase)

- Auto-creating a quote or order without a human confirming the extracted roster
- Payment collection inside the app (routes back to the existing checkout/payment flow)
- Replacing the web storefront - this is a capture tool for one specific workflow (equipo/liga rosters), not a second storefront

## Open questions

- [ ] Does the coach or RS staff do the review/correction step - i.e., does the coach see the AI's draft before it reaches sales, or does it land in an internal review queue first?
- [ ] Is this coach-facing (external users, needs its own lightweight auth) or staff-facing only (photo comes in via WhatsApp/email today, staff uploads it on the coach's behalf)? Changes the auth model significantly - see the two-instance auth rule in [01-module-map.md](./01-module-map.md).
- [ ] Team/season roster templates (Phase 3) - worth designing the data model for reuse across seasons even if Phase 3 never ships, since it touches the same `roster` JSON shape.

## Related

- [coach-roster-ai-capture-assessment-2026-07.md](./coach-roster-ai-capture-assessment-2026-07.md) - full technical feasibility, cost, and timeline assessment
- [wave-zero-quote-crm.md](./wave-zero-quote-crm.md) - existing `QuoteLineItemCustomization.roster` schema this reuses
- [ai-chatbot-roadmap.md](./ai-chatbot-roadmap.md) - sibling long-term AI roadmap, same phased/demand-gated pattern
- [../ai/model-routing.md](../ai/model-routing.md) - model tiers and cost controls this would plug into
- [../business/hybrid-mvap-paths.md](../business/hybrid-mvap-paths.md) - stop-gate philosophy applied above
- [03-staged-delivery-roadmap.md](./03-staged-delivery-roadmap.md) - where this sits relative to the numbered stages
