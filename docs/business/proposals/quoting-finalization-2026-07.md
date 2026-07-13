# Quoting Finalization - Plataforma RS (internal working doc)

> **Audience:** You (RS platform owner/developer), not the client. This is the internal math behind [propuesta-comercial-rs-2026-07.html](./propuesta-comercial-rs-2026-07.html) - use it to sanity-check numbers before you confirm anything with him.
> **Date:** 2026-07-09
> **Sources:** [infrastructure-cost-tiers.md](../../hosting/infrastructure-cost-tiers.md), [development-cost-phases.md](../development-cost-phases.md), [client-pricing-models.md](../client-pricing-models.md), [mexico-pricing-reference.md](../mexico-pricing-reference.md), [hybrid-mvap-paths.md](../hybrid-mvap-paths.md), [03-staged-delivery-roadmap.md](../../architecture/03-staged-delivery-roadmap.md), and the repo itself.
> **FX assumption:** 18 MXN/USD unless noted. Verify the live rate before quoting anything to him - a few pesos of drift changes every MXN figure below.
> **Update 2026-07-09:** domains purchased - `rosalessport.com` and `rosalessport.com.mx`, via Neubox, $510.05 MXN combined for year 1, ~$200 MXN/year renewal after that. The domain-cost placeholders below are now real numbers, not estimates - see 1.2 for the exact math and one open question to confirm.
> **Update 2026-07-09 (2):** confirmed you're running Cursor Pro+ ($60/mo, ~$1,080 MXN/mo), used across other client/monetization projects too, not just RS. See 1.6 for why that means the Cursor cost should stay off his invoice entirely rather than being quoted as an RS-specific number.
> **Update 2026-07-09 (3):** three decisions locked in - (a) the maintenance retainer (3.3) is offered upfront, not held back; (b) `rosalessport.com` is canonical, `rosalessport.com.mx` redirects to it; (c) Netlify's pricing model changed to a credit-based system in 2026 (verified this update) - the "build minutes" framing used earlier in this doc and in [infrastructure-cost-tiers.md](../../hosting/infrastructure-cost-tiers.md) is stale. Corrected throughout below and in the new Section 5 business case.

## How to read this document

Five sections, in the order you asked for:

1. Infrastructure - what it actually costs, monthly, to keep the whole thing alive.
2. The real value built - what exists in the repo today, honestly assessed.
3. Breakdown of your service charge - what the $45,000 MXN ask is actually made of.
4. Public price vs. the three proposals already on the table for him.
5. The complete business case - launch cost, exactly when each vendor forces a paid plan, maintenance cost once you're there, and capabilities enabled (market cost vs. included).
6. Messaging note - why the "market vs. investment" paragraph on page 3 of the proposal was reworded, and what to say if he ever asks why the price is so far under market.

---

## 1. Infrastructure: real monthly cost to keep this alive

Two different costs get blended together in casual conversation and shouldn't be:

- **Infrastructure** - hosting, database, CDN, email delivery, domain. This is what "keeps the site up."
- **Tooling** - the AI-assisted dev subscription (Cursor) you personally pay to keep building and fixing the thing. This isn't infrastructure; it's your labor cost, and it only exists if you (or whoever inherits this codebase) keep using Cursor to maintain it.

Both matter for "what does this cost to keep alive," so both are below, kept separate per the [infra-cost-worksheet](../../../.cursor/skills/infra-cost-worksheet/SKILL.md) rule.

### 1.1 Infrastructure - today (actual, right now)

Domains are purchased (see below); nothing else is deployed yet. `app/` never deployed, `demo/` never pushed to Netlify (per [03-staged-delivery-roadmap.md](../../architecture/03-staged-delivery-roadmap.md), the remaining step of "what to do right now" is "deploy demo").

| Item | Status | Cost |
|---|---|---|
| Netlify | Not deployed | $0 |
| Neon | Not provisioned | $0 |
| Cloudflare | Not provisioned | $0 |
| Resend | Not provisioned | $0 |
| Domain - `rosalessport.com` + `rosalessport.com.mx` | **Purchased 2026-07-09, Neubox** | $510.05 MXN one-time (year 1, both domains) |
| **Real spend today** | - | **$0/mo recurring** (domain is a sunk annual cost, amortized below) |

### 1.2 Domain cost - the real number (both amortized views)

You bought both `rosalessport.com` and `rosalessport.com.mx` together for **$510.05 MXN for year 1**, with **~$200 MXN/year renewal** after that. Buying both is the right call - `.com` for general/international credibility, `.com.mx` for local trust signal - and Netlify/Cloudflare can point both at the same site with one set as canonical and the other redirecting, at no extra hosting cost.

| Period | Combined cost | Monthly amortized |
|---|---|---|
| Year 1 (both domains) | $510.05 MXN | **~$42.50 MXN/mo** |
| Year 2+ (renewal) | ~$200-400 MXN/año* | **~$17-33 MXN/mo** |

\* *Open question: is the ~$200 MXN renewal figure per domain (→ $400 MXN/año combined) or already combined for both? Confirm against the actual Neubox renewal invoice when it arrives - it changes the Year 2+ column by about 16 MXN/mo either way, small enough not to block anything, but worth locking down before you quote a multi-year number to him.*

Use **$42.50 MXN/mo (year 1)** as the number to plug into the tables below now that it's a real, paid cost instead of an estimate.

### 1.3 Infrastructure - Stage D demo live (first real step)

If you just push `demo/` to Netlify - domain is already bought, so this is just the deploy step:

| Line item | Tier | USD/mo | MXN/mo (@18) | Demand trigger to upgrade |
|---|---|---|---|---|
| Netlify | Free (300 credits/mo, see 5.2) | $0 | $0 | Unlikely - a static demo with occasional redeploys stays well under 300 credits/mo |
| Domain (both, amortized, year 1) | Neubox, real invoice | ~$2.36 | ~$42.50 | N/A, fixed annual cost |
| **Infra maintenance total** | | **~$2.36** | **~$42.50** | - |

### 1.4 Infrastructure - Wave Zero CRM live (internal use, `app/` deployed)

Once the real CRM (`app/`) is deployed with Neon + Resend for the sales team to use internally:

| Line item | Tier | USD/mo | MXN/mo (@18) | Demand trigger to upgrade |
|---|---|---|---|---|
| Netlify | Free (300 credits/mo) | $0 | $0 | Compute/API usage burns credits faster than static hosting - see 5.2 |
| Neon | Free (100 CU-hrs + 0.5GB storage/mo) | $0 | $0 | 0.5GB storage cap is the realistic long-run trigger as quote/customer history grows |
| Cloudflare | Free | $0 | $0 | Bot traffic on checkout (Wave One, not yet) |
| Resend | Free (100/day, 3k/mo) | $0 | $0 | 100 emails/day cap - more likely to hit this than the monthly 3k cap |
| Domain (both, amortized, year 1) | Same as above | ~$2.36 | ~$42.50 | - |
| **Infra maintenance total** | | **~$2.36** | **~$42.50** | - |

This is the number that matters for "how much does it cost to just have the CRM running for your sales team." It's close to free because every vendor's free tier covers this volume. Full trigger detail in Section 5.2.

### 1.5 Infrastructure - public launch / growth (once there's real online traffic and sales)

| Line item | Tier | USD/mo | MXN/mo (@18) | Demand trigger to upgrade |
|---|---|---|---|---|
| Netlify Pro | Pro (3,000 credits/mo) | $20 | $360 | Free tier's 300 credits/mo exceeded - see 5.2 |
| Neon Launch | Launch, pay-as-you-go | ~$19 | ~$342 | Free tier's 0.5GB storage or 100 CU-hrs exceeded |
| Cloudflare Pro | Pro | $20 | $360 | Real traffic, WAF/bot rules needed |
| Resend Pro | Pro (50k/mo, no daily cap) | $20-35 | $360-630 | Free tier's 100/day or 3k/mo cap exceeded |
| Domain (both, amortized, year 1) | Neubox, real invoice | ~$2.36 | ~$42.50 | - |
| **Infra maintenance total** | | **~$81.36-96.36** | **~$1,465-1,735** | - |

Not included above, because they're not infrastructure: payment-processing fees (~3.5% + fixed per transaction on Mercado Pago/Stripe MX) scale with sales, not with keeping the lights on.

**Correction from the previous draft of this section:** Netlify replaced its old "build minutes" model with a credit-based system in 2026 (300 credits/mo free, $20/mo for 3,000 on Pro). The headline Pro price is still ~$20/mo either way, so this doesn't change any total by more than a couple of dollars, but the trigger mechanism is different - see 5.2 for the real numbers instead of "build minutes exceeded."

### 1.6 Tooling - the dev-assist subscription (separate line, your cost, not infra)

This is the one number in the client-facing proposal that's currently wrong and worth fixing before you send anything else out. The proposal quotes **$600 MXN/mo** for "Cursor." The actual public pricing (verified July 2026) is:

| Cursor plan | USD/mo | MXN/mo (@18) | Fits |
|---|---|---|---|
| Pro | $20 | ~$360 | Solo maintenance, light agent use |
| Pro+ | $60 | ~$1,080 | Heavy agent/subagent use |

**Confirmed: you're running Pro+ (~$1,080 MXN/mo)**, and not just for RS - you're using it across other client/monetization projects too. That changes how this number should be handled:

- **Full plan cost:** $1,080 MXN/mo, paid once, regardless of how many client projects you run on it.
- **RS's fair share:** since RS isn't the only thing this subscription supports, don't charge him the full $1,080 MXN/mo as "his" infra/tooling cost. Split it across your active paying projects instead. As a rule of thumb: **$1,080 / (number of active client projects this month)**. At 2 concurrent clients that's ~$540 MXN/mo attributable to RS; at 4, ~$270 MXN/mo. Recompute monthly as your client count changes - don't hardcode a split into the contract.
- **What to actually tell him:** either (a) leave the Cursor cost out of his number entirely and treat it as your own business overhead, covered by your service margin, or (b) if you want a maintenance retainer that includes it (Section 3.3), fold in only RS's allocated share, not the full $1,080 MXN.

Recommendation: go with (a). It's simpler, it's honest (the tool serves your whole business, not just him), and it avoids a conversation about your other clients. Drop the Cursor line from the client-facing proposal's infra table rather than trying to explain a shared-cost allocation to him.

### 1.7 Grand total - "what does it cost to keep everything alive"

| Phase | Infra (MXN/mo) | Tooling, full cost (MXN/mo) | Tooling, RS-allocated share (MXN/mo, at 2-4 active clients) |
|---|---|---|---|
| Today (domains bought, nothing else live) | ~$42.50 | $1,080 | ~$270-540 |
| Demo public | ~$42.50 | $1,080 | ~$270-540 |
| Wave Zero CRM live (internal) | ~$42.50 | $1,080 | ~$270-540 |
| Public launch / growth | ~$1,465-1,735 | $1,080 | ~$270-540 |

The honest headline for him: **infrastructure alone is effectively free until there's real public traffic** - about **$42.50 MXN/mo**, which is entirely the two domains you already bought (year 1; drops slightly to ~$17-33 MXN/mo on renewal, see 1.2). Even at growth-stage traffic it tops out around **$1,465-1,735 MXN/mo**. That's the number to put in front of him, labeled clearly as infra-only. The Cursor Pro+ subscription is real money out of your pocket every month, but it's a shared business tool across multiple clients, not an RS-specific cost - keep it off his invoice (see 1.6) and treat it as overhead absorbed by your service margin (Section 3). Full launch-cost-to-maintenance walkthrough in Section 5.

---

## 2. The real value built

What's actually in the repo right now, not what's aspirational. Cross-checked against [03-staged-delivery-roadmap.md](../../architecture/03-staged-delivery-roadmap.md), which is deliberately blunt about what's real vs. scaffolded.

### 2.1 Inventory

| Component | What it is | Real status |
|---|---|---|
| Stage D static demo | 43 HTML pages: home, jersey/pants collections, PDPs, retail + bulk quote forms, 4-step uniform configurator wizard, aviso de privacidad + terminos (LFPDPPP-aligned), admin CRM mock (dashboard, quotes, orders, customers, design inbox) | Built and working locally. **Not deployed yet** - no domain, no live Netlify site. |
| AI-generated image bank | 81 images under `demo/assets` (mockup bases/masks/shadows + variant-bank colorways for the classic-button jersey and pants-classic templates, front+back) plus 38 catalog images under `demo/images` - about 119 production images total | Complete. Replaces a professional photography session for the two garment templates currently in scope. |
| Bilingual i18n | es-MX default + en, key-based copy in `demo/js/messages.js` | Complete for Stage D. |
| CRM foundation (`app/`) | Next.js 15 + Prisma + NextAuth scaffold; DB schema for customers, products, quotes, leads; service layer (`customerService`, `quoteService`, `productService`, `leadService`); ~10 admin/API routes; a quote PDF generator | Real code exists, but it's a **foundation, not a finished product**: `quotePdf.ts` has no caller yet, `resend` is installed but never imported, and it has **never been deployed** (no `netlify.toml` target for `app/`). Treat this as roughly the schema + scaffolding layer of Wave Zero, not a working CRM yet. |
| Configurator-order link | Uniform designer wizard exists as a demo-only, client-side experience | Explicitly **not** wired to the database or to real orders. This is a known, intentional gap (see [ADR-011](../../architecture/decisions/ADR-011-configurator-first.md) - Stage 0 code predates this ADR). |
| Legal baseline | Aviso de privacidad, terminos y condiciones, ARCO procedure docs drafted | Drafted, **not lawyer-reviewed**. Flag this before public launch - LFPDPPP compliance needs a licensed abogado sign-off, not just an AI-drafted template. |
| Architecture governance | 13 ADRs, 70+ docs (architecture, security, privacy, domain modeling, staged roadmap), 20 subagents + 34 skills encoding delivery process | Complete and unusually thorough for this project size - this is what makes the codebase maintainable by someone other than you. |

### 2.2 What this replaces, in market terms

Per the market-comparison already in the client-facing proposal (page 3), using standard Mexico dev-agency rates:

| Workstream | Time equivalent | Market value (MXN) |
|---|---|---|
| Demo site + configurator + image bank (replaces a photo shoot) | 6-8 weeks | $130,000 - $200,000 |
| CRM foundation (catalog, admin, PDF, email, schema) | 4-5 weeks | $95,000 - $220,000 |
| **Total market value** | **10-13 weeks** | **$225,000 - $420,000** |

Sanity-checked against [development-cost-phases.md](../development-cost-phases.md): Wave Zero alone is quoted at $80,000-180,000 MXN in that reference table, and the image/demo workstream lines up with the $130k-200k figure above. The two sources agree, which is good - it means the market-value number in the client proposal isn't cherry-picked.

### 2.3 Time actually spent

The entire repo history is one continuous stretch of work: first commit **2026-07-02**, today is **2026-07-09** - **about one week**. That week (AI-assisted) produced the inventory in 2.1, which the market table above prices at 10-13 weeks of traditional agency time. That compression is the entire basis for charging 11-20% of market value instead of market rate - it's real, not a marketing line, but it's also **not infinitely repeatable**: the remaining wiring work (below) still takes real calendar days regardless of how fast the first week went, because it depends on him providing real catalog data, testing with his team, and DNS propagation - things AI assistance doesn't compress.

### 2.4 What's honestly still missing before this is sellable to end customers

- Database not connected (schema exists, not wired to a live Neon instance)
- Real catalog/pricing data not loaded
- Email sending not wired (Resend installed, unused)
- PDF quote generator not wired to any route
- No deployment target configured for `app/`
- Configurator not connected to orders (intentionally deferred)
- Legal pages need lawyer review before public launch
- Commission/fee tracking (`Payment.feeCents`) does not exist yet - relevant if he picks a revenue-share proposal, see Section 4

Per the proposal's own timeline, this is **4-7 days of work**, not weeks. Keep that framing - it's accurate and it's a strong close.

---

## 3. Breakdown of your service charge

This decomposes the $45,000 MXN ask (Proposal 1's headline number) into what it's actually paying for, so you can defend it in a negotiation.

### 3.1 What the $45,000 MXN buys him

| Workstream | Market-rate equivalent | Status | In the $45k? |
|---|---|---|---|
| Demo, configurator, image bank | $130,000 - $200,000 | Done | Yes (sunk cost, already delivered) |
| CRM foundation | $95,000 - $220,000 | Done (foundation only, see 2.1) | Yes (sunk cost, already delivered) |
| DB wiring + go-live | Part of the 4-7 remaining days | Pending | Yes |
| Catalog load + real pricing | Part of the 4-7 remaining days | Pending | Yes |
| Team training | Part of the 4-7 remaining days | Pending | Yes |
| **Full IP transfer, no revenue share** | - | - | **Yes - this is what separates Proposal 1 from 2 and 3** |

$45,000 MXN is roughly **11-20% of the $225,000-420,000 MXN market-value range**. That's the number to lead with - it's true and it's a strong anchor.

### 3.2 The pricing floor (internal only - don't share this reasoning with him)

Don't frame this to him as an hourly rate - the AI-assisted compression makes any hourly framing look either absurdly cheap (undermining your value) or absurdly expensive (if you tried to bill hours honestly for "supervising an agent"). The market-comparison framing in 3.1 is the right one to use externally.

Internally, use this to set a floor: **$25,000-30,000 MXN is the minimum for a full IP transfer with no ongoing entanglement.** Below that, you're not being compensated for the architecture/governance layer (Section 2.1's last row) that makes this maintainable, and you're setting a bad precedent for the next client. $45,000 MXN gives you room to negotiate down to Proposal 2's $25,000 MXN without going under that floor, since Proposal 2 adds a 4% revenue share that partially compensates for the lower upfront.

### 3.3 Ongoing maintenance retainer (separate from infra, separate from the build)

Not currently priced anywhere in the proposal beyond the 30-day warranty. Two references exist:

- **Agency benchmark** ([development-cost-phases.md](../development-cost-phases.md)): $12,000-25,000 MXN/mo for an 8h/mo retainer. This assumes traditional hourly maintenance and is almost certainly too high for what you'll actually need to do post-launch given the AI-assisted velocity you've already demonstrated.
- **Recommended retainer, sized to reality**: **$3,000-6,000 MXN/mo** for roughly 4-6 hours/month of small fixes and monitoring, starting after the 30-day free warranty ends. Anything beyond that scope (new features, new modules) bills separately at the senior dev rate ($600-1,000 MXN/hr per [mexico-pricing-reference.md](../mexico-pricing-reference.md)), with a not-to-exceed cap agreed per request.

Your Cursor Pro+ subscription (Section 1.6) is already covered by this margin - $3,000-6,000 MXN/mo comfortably absorbs RS's ~$270-540 MXN allocated share without you needing to itemize it separately or explain that the tool also runs other clients' work.

**Decision locked in: offered upfront**, not held back. Present it alongside the three proposals rather than waiting for him to ask after the 30-day warranty ends. Practically, that means: state the $3,000-6,000 MXN/mo range as an optional add-on at the same time you present Proposals 1-3, framed as "the 30 days after launch are free either way; after that, here's what ongoing support costs if you want it" - not bundled into the upfront price, and not a condition of any of the three proposals.

---

## 4. Public price vs. the three proposals for him

### 4.1 What "public price" should mean

Two different numbers both deserve the label "public price," and mixing them up will hurt you:

- **Market-comparable price** - what an agency would charge for the same scope: $225,000-420,000 MXN. This is context, not something you'd actually charge; it's the anchor that makes your real number look like the deal it is.
- **Your actual public asking price** - what you'd quote a brand-new prospect with no relationship, no founding-customer discount, cold. This should sit meaningfully above what he's getting, both to protect his deal and because a stranger carries more delivery risk and less goodwill than an existing relationship.

**Recommendation: set your public asking price at $65,000-85,000 MXN flat** for an equivalent build (roughly 20% of market value, still a steep AI-assisted discount, but noticeably above the $45,000 MXN he's being offered). Same installment structure (10-12 payments) applies. If a future prospect wants a build that reuses this codebase as a template for another MX sports retailer (see [client-pricing-models.md](../client-pricing-models.md) Model 4 - "Build + License"), you can actually go *lower* than that for the second and third client, since the architecture/governance layer is already paid for - but don't advertise that; price each deal on its own merits.

### 4.2 The three proposals already on the table for him

Reproduced from the client-facing proposal for side-by-side comparison:

| Criterio | Public price (reference) | Proposal 1 | Proposal 2 | Proposal 3 |
|---|---|---|---|---|
| Upfront | $65,000-85,000 | $45,000 | $25,000 | $15,000 |
| Payments | 10-12 | 10-12 ($3,750-4,500 ea.) | 8 ($3,125 ea.) | 5 ($3,000 ea.) |
| Revenue share | None | None | 4% / 18 months | 6% / 24 months |
| Buyback option | N/A | N/A | N/A | Yes, after 12 months, 12x avg monthly commission |
| Your long-term entanglement | N/A | Low | Medium | High |
| Infra + tooling | N/A | Separate, at cost | Separate, at cost | Separate, at cost |
| Maintenance retainer (optional, offered upfront) | N/A | $3,000-6,000/mo | $3,000-6,000/mo | $3,000-6,000/mo |

### 4.3 Which one to actually lead with

**Lead with Proposal 1.** Reasoning, based on the real numbers above:

1. Infra cost is nearly free (Section 1.7) and remaining work is small (4-7 days, Section 2.4) - the deal doesn't need a revenue share to make sense for you. A flat $45,000 MXN against a $25,000-30,000 MXN floor gives you real margin without ongoing entanglement.
2. Proposals 2 and 3 require something that **doesn't exist in the codebase yet**: commission/fee tracking on accepted quotes. Per the module map, `Payment.feeCents` capture is a Priority 2 target, not built. If he picks Proposal 2 or 3, you need to either scope and price that tracking work separately, or you'll be manually reconciling "cotizaciones aceptadas generadas por el sitio" by hand every month - a real ongoing cost that isn't priced into either revenue-share proposal today.
3. Use Proposal 3 as the anchor that makes Proposal 1 look like the easy choice, and Proposal 2 as the real fallback if he pushes back hard on the $45,000 upfront number. Don't volunteer Proposal 3 first; present all three but let the framing (as in the client-facing doc) guide him toward 1.
4. If he does pick 2 or 3, add the commission-tracking build to scope before agreeing to terms - don't discover that gap after you've signed.

### 4.4 Before you send anything to him

- [ ] Verify the current MXN/USD FX rate - every infra and tooling number above shifts with it.
- [x] ~~Fix the $600 MXN/mo Cursor figure~~ - resolved: you're on Pro+ ($1,080 MXN/mo full cost), but it's shared across other client projects, so drop the Cursor line from the client-facing proposal entirely (Section 1.6) rather than quoting him any version of it.
- [x] ~~Decide now, before the conversation, whether you're holding back the maintenance retainer~~ - resolved: **offering it upfront**, alongside the three proposals (Section 3.3).
- [x] ~~Get an actual `.mx` registrar quote for the domain~~ - done: `rosalessport.com` + `rosalessport.com.mx` bought via Neubox, $510.05 MXN year 1, ~$200 MXN/year renewal (confirm whether that renewal figure is per domain or combined, see 1.2).
- [ ] If he leans toward Proposal 2 or 3, price the commission-tracking build (Section 4.3, point 2) before agreeing to terms.
- [x] ~~Decide which domain is canonical~~ - resolved: **`rosalessport.com` is canonical**, `rosalessport.com.mx` redirects to it.
- [x] ~~Update the client-facing proposal's infra section (page 6)~~ - done, see the updated HTML: real domain figure, Cursor line dropped, corrected Netlify Pro trigger language, retainer added to all three proposal cards and the comparison table, version bumped to v1.2.
- [ ] **Regenerate `propuesta-comercial-rs-2026-07.pdf` from the updated HTML** - the PDF still reflects v1.1 with the old $600-1,050 MXN/mes figure and no retainer mention. Don't send the old PDF to him.

---

## 5. The complete business case: launch cost, when Pro kicks in, maintenance, and what's included

This section answers four questions in order: what does it cost to launch, exactly when does each vendor force a paid plan, what does maintenance cost once you're on those paid plans, and what capabilities is he actually getting for the $45,000 MXN ask.

### 5.1 What it costs to launch (today, real numbers)

| | |
|---|---|
| One-time cost already paid | $510.05 MXN (both domains, year 1) |
| Recurring cost to go live | ~$42.50 MXN/mo (domain amortization only) |
| Everything else (Netlify, Neon, Cloudflare, Resend) | $0 - free tiers cover Stage D demo and Wave Zero CRM launch entirely |
| **Total to launch both the demo and the internal CRM** | **$510.05 MXN one-time, ~$42.50 MXN/mo after that** |

Nothing else needs to be paid for to go live. The remaining 4-7 days of work (Section 2.4) is dev time, not infrastructure spend.

### 5.2 The exact point each vendor forces a paid ("Pro") plan

Real 2026 vendor limits (verified this update), not the generic language used in earlier drafts of this document:

| Vendor | Free tier limit | What happens when exceeded | Paid tier + price | Realistic trigger for RS |
|---|---|---|---|---|
| **Netlify** | 300 credits/mo (2026 credit system: 15 credits/deploy, 20 credits/GB bandwidth, 10 credits/GB-hour compute, 2 credits/10k requests) | Site pauses until next billing cycle - no silent overage charge, but the site goes down | Pro, $20/mo (~$360 MXN), 3,000 credits/mo | Static demo: unlikely for a long time. CRM (`app/`) with real API/compute traffic: watch this once daily active sales-team usage starts, compute credits burn faster than static hosting |
| **Neon** | 100 CU-hours/project/mo, 0.5GB storage/project, 5GB egress/mo, scale-to-zero after 5 min idle (idle time is free) | Storage cap: writes fail until you delete data or upgrade. CU-hour cap: compute suspends until next cycle | Launch, pay-as-you-go (~$0.106/CU-hour, $0.35/GB-month storage), effective ~$19 USD/mo (~$342 MXN) for moderate use | **The 0.5GB storage cap is the real one to watch**, not compute - a growing customer/quote history (especially with any attached files) will hit 0.5GB well before 100 CU-hours becomes a problem for an internal tool used by a small sales team |
| **Resend** | 100 emails/day, 3,000/mo (whichever hits first) | 429 error - emails queue or fail to send | Pro, $20-35/mo (~$360-630 MXN), 50k-100k/mo, no daily cap | **The 100/day cap is the realistic trigger**, not the monthly one - a single busy day sending bulk equipo quotes could hit it before the monthly total does |
| **Cloudflare** | DNS/CDN/SSL always free; no WAF managed rules, no bot management | Nothing breaks - just no protection against bots/scrapers/card-testing | Pro, $20/mo (~$360 MXN) | Only matters once real public traffic exists, and specifically once Wave One payment checkout goes live - not needed for Stage D demo or internal Wave Zero CRM |

**In plain terms:** nothing here forces a paid plan during launch or during internal Wave Zero CRM use. The first realistic trigger is Neon's 0.5GB storage cap as quote history accumulates over time (months, not days), and the second is Resend's 100/day cap if a bulk campaign goes out. Both are cheap to fix ($342 and $360-630 MXN/mo respectively) and neither requires upgrading anything else alongside it - upgrade vendor by vendor, not as a bundle.

### 5.3 Maintenance cost once running on paid tiers

| Scenario | Infra (MXN/mo) | Optional retainer (offered upfront, Section 3.3) | Total if he takes the retainer |
|---|---|---|---|
| Launch (today's reality) | ~$42.50 | Free for first 30 days, then $3,000-6,000/mo if he opts in | ~$42.50 (first 30 days) |
| Wave Zero CRM, one vendor upgraded (e.g. Neon Launch only) | ~$384.50 | $3,000-6,000/mo | ~$3,384.50-6,384.50 |
| Full public launch / growth, all vendors on Pro | ~$1,465-1,735 | $3,000-6,000/mo | ~$4,465-7,735 |

Your own overhead (Cursor Pro+, RS's allocated ~$270-540 MXN share) stays off every one of these totals - it's absorbed by your margin on the retainer and the build fee, not billed to him separately (Section 1.6).

### 5.4 Capabilities enabled: market cost vs. what's included in the $45,000 MXN ask

The full ledger - every capability, its market-agency cost, and whether it's in scope for the $45,000 MXN price:

| Capability | Market cost equivalent (MXN) | Included in the $45,000 ask? |
|---|---|---|
| Static storefront + catalog (43 bilingual pages) | $60,000-90,000 | Yes |
| AI-generated image bank (~119 images, replaces a photo shoot) | $40,000-70,000 | Yes |
| Uniform configurator (demo-scope wizard) | $30,000-40,000 | Yes |
| CRM foundation (schema, services, admin/API routes, PDF generator) | $95,000-150,000 | Yes (foundation only - wiring below is the remaining 4-7 days) |
| DB connection + go-live wiring | Included in the 4-7 remaining days | Yes |
| Catalog/pricing data load | Included in the 4-7 remaining days | Yes |
| Staff training | Included in the 4-7 remaining days | Yes |
| Legal baseline drafts (aviso, terminos, ARCO procedure) | $15,000-40,000 (lawyer review still needed, billed separately by the lawyer, not by you) | Yes, drafts only |
| Architecture/governance docs (13 ADRs, 70+ docs, 20 subagents, 34 skills) | Rarely billed by agencies at all - this is what makes AI-assisted maintenance possible after handoff | Yes, and it's the reason your ongoing retainer can be priced so far under the agency benchmark (3.3) |
| **Subtotal - what's actually included** | **~$240,000-390,000** | - |
| Online payments / checkout (Wave One) | $60,000-100,000 | **No** - future wave |
| Commission/fee tracking (`Payment.feeCents`) | $15,000-30,000 | **No** - only needed if he picks Proposal 2 or 3 (Section 4.3) |
| Coach roster capture, AI extraction (Phase 1) | $60,000-135,000 | **No** - long-term idea, see [coach-roster-mobile-roadmap.md](../../architecture/coach-roster-mobile-roadmap.md) |
| Native mobile app (Phase 3 of the same idea) | $150,000-350,000+ | **No** - long-term idea, same doc |

The included subtotal (~$240,000-390,000 MXN) is consistent with the $225,000-420,000 MXN market-value range used everywhere else in this document and in the client-facing proposal - it isn't a separately cherry-picked number, it's the same inventory counted a different way.

### 5.5 The one-paragraph version, if you only say one thing to him

Launch costs $510.05 MXN, already paid, plus about $42.50 MXN/mo after that - nothing else needs to be paid to go live. Infra only becomes a real monthly number (~$1,465-1,735 MXN/mo) once there's enough traffic and email volume to outgrow free tiers, and that happens vendor by vendor, not all at once. Against that, $45,000 MXN buys roughly $240,000-390,000 MXN of market-equivalent work, already built or 4-7 days from done. Ongoing support beyond the 30-day warranty is available from day one at $3,000-6,000 MXN/mo, offered now rather than held back.

---

## 6. Messaging note: why the market-vs-investment paragraph changed

**Context you should remember, not put in the client-facing doc:** the price is well under market partly because of the relationship, not purely a professional calculation. That's fine to know privately, but it's the wrong thing to lean on publicly - "cheap because it's a favor" undersells the platform itself and gives him (or anyone he shows this to) a reason to discount the work rather than the price.

The original wording of that paragraph said the discount existed because AI tools "reduced build time from 10-13 weeks to much less." That's technically true but risks the opposite problem: someone unfamiliar with AI-assisted development reads it as "the AI did the work, not a skilled person," and devalues the judgment behind the architecture, the domain-specific business rules, and the governance docs (13 ADRs, 34 skills) that AI alone doesn't produce.

**The fix (applied to the HTML):** reframe around two professional reasons that stand on their own regardless of the relationship:

1. Direct relationship with the builder, no agency layers (no PM markup, no multiple billable resources, no subcontracting margin) - true of any direct-hire arrangement, family or not.
2. A developer with judgment uses AI tooling to execute faster; the tool accelerates execution, the decisions (what to build, how to secure it, how to make it scale) are still human expertise.

**If he ever asks directly why the price is so low:** lean on reason 1 and 2 above, plus the Section 5.4 ledger (~$240,000-390,000 MXN of market-equivalent work included). Don't volunteer the family connection as the explanation - it's true, but it's not the argument that holds up if he ever refers this work to someone else, or if you want to reuse this proposal as a template for a different client later.

---

## Related

- [propuesta-comercial-rs-2026-07.html](./propuesta-comercial-rs-2026-07.html) - the client-facing document this supports
- [infrastructure-cost-tiers.md](../../hosting/infrastructure-cost-tiers.md)
- [development-cost-phases.md](../development-cost-phases.md)
- [client-pricing-models.md](../client-pricing-models.md)
- [hybrid-mvap-paths.md](../hybrid-mvap-paths.md)
- [coach-roster-mobile-roadmap.md](../../architecture/coach-roster-mobile-roadmap.md)
