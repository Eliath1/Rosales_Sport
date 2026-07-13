# Coach Roster AI Capture - Mobile App Assessment (2026-07)

> **Audience:** Project owner, deciding whether to fund this feature for real.
> **Status:** Assessment only. No ADR yet, no committed timeline - this document exists to make a go/no-go decision possible, not to announce a decision. It deepens [coach-roster-mobile-roadmap.md](./coach-roster-mobile-roadmap.md) with the technical feasibility, cost, and timeline detail needed to actually fund a phase.
> **Scope of the ask:** a coach photographs a handwritten roster/order from a training session, an AI agent extracts the order (players, numbers, sizes, items), summarizes it for the coach to review, and the coach approves before it becomes a real quote - on a mobile app.
> **Answer up front:** technically straightforward, cheap to reach a usable version, expensive only if you skip straight to a native app before demand proves it. Read section 8 for the one-paragraph recommendation.

## 1. What "this same infra" actually buys you here

The reason this feature is cheaper than a typical "build a mobile app" ask: **the mobile app does not need its own backend.** Per [01-module-map.md](./01-module-map.md), the target architecture already has a modular REST API (`Customers`, `Catalog`, `Orders`, `Quotes`, `Notifications`) sitting behind the Next.js app. A mobile app - whichever framework you pick - is just one more client calling that same API, the same way the storefront and admin CRM do. You are not building a second system; you are building a second front door onto the one you already have.

Two pieces of schema already exist for this exact feature, per [wave-zero-quote-crm.md](./wave-zero-quote-crm.md):

- `QuoteLineItemCustomization.roster` is already typed as `JSON [{ name, number }]` - a coach's extracted roster maps directly into a field that already exists.
- `OrderService.create()` already supports guest orders (no account required) - the same guest pattern this feature needs for coaches.

Nothing below requires a schema redesign. It requires a new capture surface (mobile, or installable web) and one new AI step in front of the existing quote/order pipeline.

## 2. Technical feasibility

### 2.1 AI extraction pipeline

```
Coach's phone camera
      |
      v
Mobile app (capture + basic quality check: blur, glare, crop)
      |
      v  HTTPS, same auth pattern as guest checkout
Existing Next.js API  ->  POST /api/ai/roster-extract
      |
      v
Netlify AI Gateway (same integration point already planned for the chatbot,
per model-routing.md - no new vendor relationship needed)
      |
      v
Vision model call, strict JSON schema output:
  { team, product_hint, lines: [{ name, number, size, notes, confidence }] }
      |
      v
Confidence-scored draft returned to the app
      |
      v
Coach reviews/edits every line on-device  <-- mandatory human step, never skipped
      |
      v
Coach taps "Confirmar" -> POST /api/leads/bulk (existing endpoint)
      |
      v
Lands in the CRM as a normal bulk/equipo lead, same as today's WhatsApp-to-manual-entry flow
```

This is the same shape as the read-only tool-use pattern already accepted in [ADR-009-ai-chatbot.md](./decisions/ADR-009-ai-chatbot.md): **AI drafts, a human confirms, nothing is created automatically.** No new governance principle is needed - this feature inherits the existing one.

**Model choice.** Handwriting extraction from photographed paper is one of the harder OCR problems in production AI today - worse lighting, worse handwriting variance, and no scanner-flat page compared to typed documents. Current (2026-07) benchmarking of frontier vision models on messy real-world handwritten forms shows:

| Model tier | Fit for this use case | Approx. cost per image | Notes |
|---|---|---|---|
| Gemini 3.1 Flash | Default extraction pass | ~$0.001-0.003 USD | Best cost/accuracy tradeoff for high-volume, noisy handwriting; matches the model family already used for image generation in [rs-mockup-image-generation](../../.cursor/skills/rs-mockup-image-generation/SKILL.md) |
| Gemini 3.1 Pro | Escalation tier (low-confidence lines, poor photo quality) | ~$0.005-0.01 USD | Strongest published OCR fidelity on noisy/handwritten scans of any current frontier model |
| GPT-5.x / Claude Sonnet 4.x | Fallback if Gemini is unavailable, or A/B check during pilot | ~$0.01-0.02 USD | Comparable accuracy, higher cost; keep as a secondary provider, not primary |

Published 2026 benchmarks on a deliberately hard real-world handwritten-form dataset show frontier models landing around **85% field accuracy** (weighted F1 ~90%) on structured fields (numbers, discrete values), with free-text fields (names, notes) carrying a meaningfully higher error rate - exactly where coach handwriting will be roughest. Two conclusions follow directly:

1. **The review step is not a formality - it is the feature's actual accuracy control.** Budget UI/UX effort accordingly (confidence highlighting per line, not just a flat "looks good?" button). A misread jersey number that isn't caught becomes a wrong, already-printed order - the same risk this roadmap already calls out.
2. **Do not promise "just take a photo, done."** The honest pitch to a coach is "take a photo, we'll draft it, you fix the two or three things we got wrong, then submit" - faster than retyping, not zero-touch.

This slots into the existing model-routing tiers ([../ai/model-routing.md](../ai/model-routing.md)) as a new **T2-equivalent** capability: capable model, structured JSON output, human-in-the-loop, same cost-control levers (daily budget alert, max output tokens, fallback chain) already defined there.

### 2.2 Mobile framework decision

| Option | Recommendation | Why |
|---|---|---|
| **React Native via Expo** | **Recommended for Phase 3** | Shares TypeScript and (with care) Zod validation schemas with the existing `app/` Next.js codebase - one language across the whole stack, which matters most for a solo AI-assisted developer. Expo's EAS Build produces iOS binaries from the cloud without owning a Mac. Over-the-air (OTA) JS updates mean most bug fixes and copy changes ship without an App Store review cycle - directly reduces the "ongoing maintenance beyond Cursor" cost called out in the roadmap. |
| Flutter | Not recommended | Comparable cost and timeline to React Native per 2026 market data, but introduces a second language (Dart) with zero code or type sharing with the rest of this TypeScript stack. No advantage here to offset that. |
| Native (Swift + Kotlin) | Not recommended before Phase 3 demand is proven | 2-3x the cost and calendar time of a cross-platform build for no capability this feature needs (no heavy graphics, no low-level camera tuning beyond what Expo's camera module already exposes). |
| Progressive Web App (PWA) | **Recommended for Phase 2**, before any app-store commitment | Zero app-store fees, zero review cycles, one deploy target (same Netlify app), installable "app icon" experience. This is already the roadmap's Phase 2 - this assessment confirms it's the right call, not just the cheap one. |

**Bottom line:** the roadmap's existing phased sequence (web upload -> AI-assisted web -> installable PWA -> native) is the technically correct order, not just the financially conservative one. Each phase is a strict superset of the previous phase's backend work - nothing gets rebuilt going from Phase 1 to Phase 3, only the client shell changes.

### 2.3 Auth: resolve the roadmap's open question

Recommendation: **coaches do not need accounts at any phase through Phase 2.** Treat roster submission the same way guest checkout already works (per [01-module-map.md](./01-module-map.md), `OrderService.create()` is guest-safe by design) - a coach gets a shareable link or a lightweight code (e.g., tied to a team/season the sales rep already set up), submits a roster against it, no password, no login screen. This avoids standing up a third auth surface alongside the existing two-instance rule (staff `/admin/*`, customer `/mi-cuenta/*`) until there's real evidence coaches want a persistent account across seasons - which is exactly the Phase 3 trigger the roadmap already defines ("same coaches/teams return season after season and explicitly ask for an app").

### 2.4 Privacy (LFPDPPP) - one consideration the roadmap doesn't flag yet

Team rosters commonly include **minors' personal data** (youth league players' names and jersey numbers). This changes the compliance posture slightly from the rest of the CRM, which per [ADR-010-data-privacy.md](./decisions/ADR-010-data-privacy.md) already treats standard customer PII carefully:

- Disclose AI processing of uploaded photos in the aviso de privacidad before this ships publicly, matching the existing rule for the chatbot in [ADR-009](./decisions/ADR-009-ai-chatbot.md).
- **Do not retain the raw photo indefinitely.** Once the coach confirms the extracted roster, the source image has done its job - delete or auto-expire the original photo (e.g., 30-90 days) and keep only the structured `roster` JSON, which is the pattern the CRM already uses for other data per ADR-010's retention jobs.
- The vision model call sends the photo to a third-party subprocessor (whichever AI Gateway provider is active) - this needs the same subprocessor disclosure already required for Neon/Resend/Cloudflare in ADR-010, just extended to cover the AI provider.
- No new lawful-basis category is needed - "processing a roster the coach voluntarily photographed and submitted to get a quote" is the same pre-contractual basis already mapped for quote delivery in ADR-010.

None of this blocks Phase 1 (a plain upload with staff transcription has no AI processing to disclose). It becomes a real gate starting at Phase 1's AI extraction and stays relevant through every later phase.

## 3. Cost assessment

### 3.1 One-time build cost, by phase (updates the roadmap's figures with the detail above)

| Phase | What ships | Dev-days (AI-assisted pace, same velocity as the rest of this repo) | Market-equivalent (MXN) | Realistic AI-assisted price if scoped as client add-on (MXN) |
|---|---|---|---|---|
| 0 - Photo upload, human transcription | Upload field on `/quote/bulk`, staff-visible thumbnail | 1-2 | $8,000-18,000 | Bundled into Wave One/Two, not priced separately |
| 1 - AI-assisted extraction (web) | Vision call, confidence-scored review/edit UI, `roster` mapping | 15-21 | $60,000-135,000 | $8,000-20,000 |
| 2 - Installable PWA | Manifest, offline capture queue, push notifications | +3-5 | $15,000-35,000 | $3,000-8,000 |
| 3 - Native app (Expo/React Native, iOS + Android) | Native camera, offline-first drafts, saved team templates, app-store presence | +25-45 | $150,000-350,000+ | $30,000-70,000 |
| **All three phases, sequential** | Full vision from photo to native app | **44-73 dev-days** | **$225,000-518,000+** | **$41,000-98,000** |

These figures are unchanged from the roadmap - this assessment validates them against the added technical detail above rather than re-deriving new numbers, since the roadmap's estimates already hold up under closer inspection.

### 3.2 Recurring cost, by phase and usage tier

| Item | Phase 0-1 (web, low volume) | Phase 2 (PWA) | Phase 3 (native, both stores) |
|---|---|---|---|
| AI vision calls (Gemini Flash primary, Pro escalation) | ~$0.001-0.01 USD/photo -> at a few hundred rosters/month, **$18-160 MXN/mo** | Same per-photo cost; volume may grow with easier capture | Same per-photo cost; volume may grow further |
| Apple Developer Program | N/A | N/A | $99 USD/año (~$1,782 MXN/año, ~$149 MXN/mo amortized) |
| Google Play Console | N/A | N/A | $25 USD one-time |
| Expo EAS Build | N/A | Free tier likely sufficient at this volume | Free tier or pay-per-build likely sufficient for a solo dev; team plan ($99 USD/mo) only needed if build volume or team size grows |
| Image storage (Netlify Blobs or R2, short-retention per section 2.4) | Negligible - photos deleted after confirmation | Negligible | Negligible |
| Push notification delivery | N/A | Free at this volume (web push) | Free at this volume (Expo push service) |
| **Incremental infra total vs. the CRM's existing baseline** | **~$18-160 MXN/mo** | **~$18-160 MXN/mo** | **~$170-310 MXN/mo** |

This sits inside the same order of magnitude as the AI budget already planned for the chatbot in [infrastructure-cost-tiers.md](../hosting/infrastructure-cost-tiers.md) - it does not create a new cost category, it adds a small amount to one that already exists in the plan.

### 3.3 What it costs if you skip the phased path and go straight to a native app

Worth stating plainly since the request was framed as "develop this same infra for a mobile app," which could mean either the phased path above or a single native build now. Going straight to Phase 3 without Phases 0-2:

- One-time cost: **$150,000-350,000+ MXN market-equivalent, ~$30,000-70,000 MXN AI-assisted** - same number as the Phase 3 row above, but now you're paying it without ever validating that coaches will actually use a structured capture flow instead of WhatsApp.
- You still need the Phase 1 AI extraction work either way (it's the same backend code) - skipping straight to native does not skip that cost, it just adds native wrapping on top of it immediately instead of after demand is proven.
- Recurring cost from day one includes the Apple/Google fees above, which the phased path defers until there's evidence they're worth paying.

**This is the one real risk in "just build the app": paying native-app cost and ongoing OS-compatibility maintenance before knowing if coaches will use it at all.** The phased path costs the same total money only if you end up building all three phases anyway - it costs meaningfully less if Phase 1 or 2 turns out to be enough, which per the roadmap's own demand-trigger table is a real possible outcome, not a formality.

## 4. Timeline

Dev-days above already reflect this project's demonstrated AI-assisted pace (per [quoting-finalization-2026-07.md](../business/proposals/quoting-finalization-2026-07.md), one calendar week of work here has produced what a traditional agency would price at 10-13 weeks). Two realistic calendar paces follow from that observed velocity, not from a generic estimate:

| Pace | Basis | Phase 1 (15-21 dev-days) | Phase 2 (+3-5) | Phase 3 (+25-45) | All three, sequential |
|---|---|---|---|---|---|
| Full-time, focused | Matches this repo's actual first-week pace | ~3-4 calendar weeks | ~1 calendar week | ~5-9 calendar weeks | **~9-14 calendar weeks** |
| Part-time (nights/weekends alongside other client work) | More realistic if this isn't the only active project | ~6-8 calendar weeks | ~2 calendar weeks | ~10-18 calendar weeks | **~18-28 calendar weeks** |

Sequencing matters more than total time: **Phase 0 must ship and show real signal before Phase 1 is worth starting**, per the roadmap's own demand-trigger table (section "Demand trigger" in [coach-roster-mobile-roadmap.md](./coach-roster-mobile-roadmap.md)). Do not pre-build Phase 2 or 3 code while waiting for that signal - the phased dev-day estimates above assume each phase starts only once its trigger fires, not that all three run back-to-back on a fixed calendar regardless of adoption.

## 5. Risk register

| Risk | Likelihood | Impact | Mitigation |
|---|---|---|---|
| Handwriting quality too variable for useful extraction (rushed sideline notes, poor lighting, crossed-out numbers) | Medium-High | Medium | Confidence-scored review UI is mandatory, not optional; measure real accuracy on a pilot batch of real coach photos before committing to Phase 2 |
| Coaches keep using WhatsApp anyway, ignoring the structured flow | Medium | High (wasted Phase 1+ spend) | This is exactly what Phase 0's demand trigger is designed to catch cheaply - do not skip it |
| Wrong jersey number/size reaches production before a human catches it | Low if review UI is respected | High (reprint cost, customer trust) | Human confirmation is a hard gate in the architecture (section 2.1), not a UI suggestion; log every AI draft vs. final confirmed value to monitor real-world accuracy over time |
| Minors' data handled without adequate disclosure/retention limits | Low if section 2.4 is implemented at Phase 1 | High (LFPDPPP exposure) | Build photo auto-expiry and aviso de privacidad disclosure into Phase 1's scope, not as a later patch |
| App store review delays or rejection (Phase 3 only) | Medium | Low-Medium (delay, not blocker) | Expo/EAS reduces but does not eliminate this; budget 1-2 weeks of review buffer into any Phase 3 timeline, and use OTA updates for anything that doesn't require a native rebuild |
| AI vendor pricing or availability changes | Low | Low | Same mitigation already planned for the chatbot - AI Gateway abstraction keeps provider swap a config change, not a rewrite |

## 6. Recommendation

**Do not fund Phase 3 (native app) now.** Fund Phase 0 first - it is 1-2 dev-days, effectively free to price, and it is the only step that tells you honestly whether this problem is worth solving at all. Everything in this document, including the AI model choice and framework recommendation, is ready to execute the moment Phase 0's signal justifies Phase 1 - nothing here needs to be re-researched later, so the "assessment" cost is paid once, now, and the phased spend only happens if the evidence supports it. This is the same stop-gate discipline already applied to every other feature in this project (per [hybrid-mvap-paths.md](../business/hybrid-mvap-paths.md)), and there's no reason to treat this feature as an exception just because it involves a mobile app and AI in the same sentence.

If the owner wants to skip the demand-gating and commit to a full mobile build now regardless of signal, section 3.3 has the honest cost of that choice - it is a legitimate decision to make deliberately, just not the default one.

## Related

- [coach-roster-mobile-roadmap.md](./coach-roster-mobile-roadmap.md) - the phased roadmap this assessment deepens
- [01-module-map.md](./01-module-map.md) - existing API/module boundaries this feature reuses
- [wave-zero-quote-crm.md](./wave-zero-quote-crm.md) - existing `roster` schema shape
- [decisions/ADR-009-ai-chatbot.md](./decisions/ADR-009-ai-chatbot.md) - human-in-the-loop principle this inherits
- [decisions/ADR-010-data-privacy.md](./decisions/ADR-010-data-privacy.md) - privacy baseline this extends for minors' data
- [../ai/model-routing.md](../ai/model-routing.md) - model tier pattern this plugs into
- [../hosting/infrastructure-cost-tiers.md](../hosting/infrastructure-cost-tiers.md) - where the incremental AI cost sits
- [../business/hybrid-mvap-paths.md](../business/hybrid-mvap-paths.md) - stop-gate philosophy applied in section 6
- [03-staged-delivery-roadmap.md](./03-staged-delivery-roadmap.md) - where this idea sits relative to numbered stages
