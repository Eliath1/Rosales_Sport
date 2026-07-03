# Build vs Buy Matrix - Baseball Store CRM

> **Decision framework:** Score each capability; green = buy SaaS, yellow = hybrid, red = build custom.  
> **Current stance (2026-07):** Value first, fast - **Odoo, Shopify, and CRM SaaS are out of scope** until Wave 2+ gate. Ship custom Wave 0-1 on our stack.

## Scoring Legend

| Score | Meaning |
|-------|---------|
| **Build** | Core differentiator or Mexico-specific |
| **Hybrid** | Buy foundation, customize integration |
| **Buy** | Commodity, no competitive advantage |

Mark cells with `x` (primary) or `o` (secondary).

## Matrix

| Capability | Build | Buy | Hybrid | Recommendation | Notes |
|------------|-------|-----|--------|----------------|-------|
| Quote / cotización workflow | x | | | **Build** | Mayoreo tiers, PDF brand |
| Product catalog | x | | | **Build** | Licensed SKU nuances |
| Customer CRM | x | | | **Build** | B2B + B2C types |
| Public storefront | x | | o | **Build** (Next.js) | Shopify alternative |
| Shopping cart | x | | | **Build** | Tight quote->order link |
| Payments | | | x | **Hybrid** | MP/Stripe SDK |
| Email delivery | | x | | **Buy** | Resend |
| Database | | x | | **Buy** | Neon |
| Hosting | | x | | **Buy** | Netlify |
| CDN/WAF | | x | | **Buy** | Cloudflare |
| Auth (staff) | x | | o | **Build** | Simple roles MVP |
| Auth (customer SSO) | | | o | **Hybrid** | Magic link; OAuth later |
| PDF generation | x | | o | **Build** | Quote templates |
| Analytics | | x | | **Buy** | Plausible/GA with consent |
| AI chatbot | | | x | **Hybrid** | LLM API + our RAG |
| Inventory POS sync | | | x | **Hybrid** | CSV first, API later |
| CFDI invoicing | | x | | **Buy** | factura.com, etc. |
| Shipping labels | | x | | **Buy** | Estafeta API partner |
| Privacy / ARCO | x | | | **Build** | LFPDPPP process ownership |

## Platform Comparisons

### Shopify

| Fit | Detail |
|-----|--------|
| Pro | Fast B2C, payments, themes |
| Con | Custom quote pipeline, B2B liga pricing |
| Verdict | **Buy** if client prioritizes speed over mayoreo CRM |

### WooCommerce + WordPress

| Fit | Detail |
|-----|--------|
| Pro | Cheap hosting, many plugins |
| Con | Security maintenance, performance tuning |
| Verdict | **Hybrid** - common in MX small retail but not our stack |

### HubSpot / Zoho CRM

| Fit | Detail |
|-----|--------|
| Pro | Sales pipeline, email |
| Con | No native jersey catalog, MX payment UX |
| Verdict | **Buy** for sales-only if no commerce - overlaps Wave Zero |

### Custom (this project)

| Fit | Detail |
|-----|--------|
| Pro | End-to-end quote -> order -> MX payments |
| Con | Higher upfront dev cost |
| Verdict | **Build** per ADR-008 |

### Odoo (deferred - not in current plan)

| Fit | Detail |
|-----|--------|
| Pro | ERP, inventory, MX accounting (Enterprise) |
| Con | Integration tax with custom storefront; slower Wave 0; extra infra |
| Verdict | **Deferred** until Wave 2 gate - do not evaluate during Wave 0-1 |

## When to Revisit

| Trigger | Action |
|---------|--------|
| Wave Zero late | Cut scope, not platform - **never** pivot to Odoo mid-Wave 0 |
| Client buys physical POS with API | Hybrid inventory (CSV/API first; Odoo only if gate passes) |
| GMV > $500k MXN/mo | Evaluate Shopify headless for catalog only |
| Wave 2 + inventory/accounting pain proven | Re-evaluate Odoo as **back-office only**, not storefront replacement |

## Assessment Template

Use [../../templates/business/build-vs-buy-assessment-template.md](../../templates/business/build-vs-buy-assessment-template.md) per new feature.

## Related

- [../architecture/decisions/ADR-008-build-vs-buy.md](../architecture/decisions/ADR-008-build-vs-buy.md)
- [hybrid-mvap-paths.md](./hybrid-mvap-paths.md)
