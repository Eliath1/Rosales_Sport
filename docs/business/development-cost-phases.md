# Development Cost Phases

> **Audience:** Client stakeholders scoping budget for the baseball store CRM project.

## Summary Table

| Phase | Scope | Duration (est.) | Cost range (MXN) | Cost range (USD) |
|-------|-------|-----------------|------------------|------------------|
| **Wave Zero** | Quote CRM, catalog, admin auth, privacy baseline | 4-8 weeks | $80,000 - $180,000 | $4,500 - $10,000 |
| **Wave One** | Storefront, checkout, Mercado Pago, orders | 6-10 weeks | $120,000 - $250,000 | $6,500 - $14,000 |
| **Wave Two** | Wholesale portal, reporting, ARCO automation | 4-8 weeks | $80,000 - $160,000 | $4,500 - $9,000 |
| **Wave Three** | AI chat Phase 1-2, advanced analytics | 4-6 weeks | $60,000 - $120,000 | $3,500 - $7,000 |

*Assumes 1 mid-level full-stack developer primary; ranges widen with agency overhead, design, QA, and legal.*

## Wave Zero Breakdown

| Workstream | Effort | Notes |
|------------|--------|-------|
| Discovery & schema | 3-5 days | Customers, products, quotes |
| Admin UI (CRM) | 10-15 days | Quote builder is critical path |
| PDF + email | 3-5 days | Resend + template |
| Auth & roles | 2-4 days | |
| Privacy pages + consent | 2-3 days | Templates + lawyer review external |
| Deploy + CF + Neon | 2-3 days | |
| QA & training | 3-5 days | Sales staff onboarding |
| **Total** | **25-40 dev-days** | |

## Wave One Breakdown

| Workstream | Effort |
|------------|--------|
| Storefront catalog UX | 8-12 days |
| Cart & checkout | 10-15 days |
| Payment adapter (MP) | 5-8 days |
| Webhooks & order state | 4-6 days |
| SEO + performance | 3-5 days |
| Security hardening | 3-5 days |
| **Total** | **33-51 dev-days** |

## Non-Development Costs

| Item | MXN (est.) |
|------|------------|
| Aviso de privacidad legal review | $15,000 - $40,000 |
| Logo/brand (if needed) | $20,000 - $80,000 |
| Product photography | Variable |
| Licensed product inventory (COGS) | Client existing |

## Ongoing Maintenance (post-launch)

| Item | MXN/month |
|------|-----------|
| Infra | $0 - $2,500 |
| Maintenance retainer (8h/mo) | $12,000 - $25,000 |
| Monitoring & patches | Included in retainer |

## ROI Hooks for Client Conversation

| Pain today | Wave Zero benefit |
|------------|-------------------|
| 20 min manual quote | -> 5 min in CRM |
| Lost WhatsApp leads | -> Customer record + follow-up list |
| Pricing errors on mayoreo | -> Tier prices in catalog |

Break-even: if CRM saves **10 hours/month** at $200 MXN/hour loaded labor -> $2,000/mo -> Wave Zero pays back in ~3-7 years on software alone; faster if errors prevented or wholesale deals closed.

## Payment Terms (typical agency)

- 30% kickoff
- 40% Wave Zero acceptance
- 30% Wave One launch (if contracted)

See [client-pricing-models.md](./client-pricing-models.md).

## Related

- [hybrid-mvap-paths.md](./hybrid-mvap-paths.md)
- [../architecture/wave-zero-quote-crm.md](../architecture/wave-zero-quote-crm.md)
- [../hosting/infrastructure-cost-tiers.md](../hosting/infrastructure-cost-tiers.md)
