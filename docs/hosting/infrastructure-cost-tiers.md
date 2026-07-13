# Infrastructure Cost Tiers - Mexico Baseball CRM

> **Currency:** USD for vendor pricing (typical billing); revenue in MXN.  
> **Exchange note:** Plan budgets in MXN for client using ~$17-20 MXN/USD (verify current rate).
> **Current actual spend (2026-07): $0/mo.** Only the Stage D static demo is deployed (Netlify Free, drag-and-drop zip, no build minutes beyond the free allowance). Neon, Cloudflare, and Resend are not provisioned at all yet - the "MVP / Wave Zero" tier and the "Scenario: Wave Zero Only" table below (~$3/mo) describe the cost **once Stage 0 (`app/`) is actually deployed**, not today's spend, which is lower still (no domain-amortized cost has been committed either).

## Tier Overview

| Tier | Phase | Monthly USD (est.) | Monthly MXN (est. @18) |
|------|-------|--------------------|-------------------------|
| **Dev** | Local + preview | $0-5 | $0-90 |
| **MVP** | Wave Zero internal | $0-25 | $0-450 |
| **Launch** | Wave One storefront | $50-120 | $900-2,160 |
| **Growth** | Steady e-commerce | $150-400 | $2,700-7,200 |
| **Scale** | High traffic / AI | $500+ | $9,000+ |

*Estimates exclude payment processing fees (% of GMV) and development labor.*

## Line Item Breakdown

### Netlify

| Plan | Price | Fits |
|------|-------|------|
| Free | $0 | Dev previews, demo |
| Personal Pro | ~$19/mo | Small team, more build minutes |
| Business | ~$99/mo | SLA, role-based access |

**Wave Zero:** Free often sufficient. **Launch:** Pro if build minutes exceed free tier.

### Neon PostgreSQL

| Plan | Price | Fits |
|------|-------|------|
| Free | $0 | Dev, tiny staging |
| Launch | ~$19/mo | Production MVP |
| Scale | ~$69+/mo | More storage, compute |

Storage grows with customer/quote history - monitor after year 1.

### Cloudflare

| Plan | Price | Fits |
|------|-------|------|
| Free | $0 | DNS, basic DDoS, SSL |
| Pro | ~$20/mo | WAF, better rules at launch |
| Business | ~$200/mo | Advanced bot management (usually overkill early) |

**Recommendation:** Free for Wave Zero; Pro at public launch.

### Resend

| Volume | Price |
|--------|-------|
| 3k emails/mo | Free |
| 50k emails/mo | ~$20/mo |

Quote-heavy B2B may stay under free tier initially.

### Payment Processing (variable)

Not infrastructure - but budget for client:

| Provider | Typical MX |
|----------|------------|
| Mercado Pago | ~3.5% + fixed per txn (verify current) |
| Stripe MX | ~3.6% + fixed |

OXXO may have different fee structure.

### AI (future)

| Usage | Est. monthly |
|-------|--------------|
| Phase 1 FAQ (low traffic) | $5-30 |
| Phase 2 with tools | $50-200 |

Use model routing to control - see [../ai/model-routing.md](../ai/model-routing.md).

### Domain

`.mx` domain ~$20-40 USD/year via registrar.

## Scenario: Wave Zero Only (target, once `app/` is deployed - not current spend)

| Item | Cost |
|------|------|
| Netlify Free | $0 |
| Neon Free | $0 |
| Cloudflare Free | $0 |
| Resend Free | $0 |
| Domain (amortized) | ~$3/mo |
| **Total** | **~$3/mo** |

## Scenario: Public Launch (moderate traffic)

| Item | Cost |
|------|------|
| Netlify Pro | $19 |
| Neon Launch | $19 |
| Cloudflare Pro | $20 |
| Resend | $0-20 |
| Domain | $3 |
| **Total** | **~$61-81/mo** |

~**$1,100-1,450 MXN/mo** - often less than a single part-time retail shift.

## Cost Optimization Tips

1. Use Neon scale-to-zero on dev branches; delete stale preview DBs
2. Cache static jersey images at Cloudflare
3. Batch quote reminder emails (one cron vs per-minute)
4. Start AI on cheapest model tier with caching
5. Review Netlify function invocations if PDF endpoint abused

## When to Upgrade

| Signal | Action |
|--------|--------|
| Neon CPU alerts | Upgrade Launch -> Scale |
| CF bot traffic on checkout | Cloudflare Pro + Turnstile |
| Build queue delays | Netlify Pro |
| Email bounces spike | Dedicated IP (Resend higher tier) - rare early |

## Related

- [../learning/04-hosting-costs-explained.md](../learning/04-hosting-costs-explained.md)
- [../business/development-cost-phases.md](../business/development-cost-phases.md)
