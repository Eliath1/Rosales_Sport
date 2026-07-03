# ADR-008: Build vs Buy Strategy

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead, client stakeholder |

## Context

The client could adopt Shopify, WooCommerce, or a vertical SaaS instead of custom CRM. Custom build is justified only where Mexico-specific workflows (cotizaciones mayoreo, LFPDPPP, hybrid quote-to-order) outperform generic platforms.

## Decision

**Build** the quote CRM and core catalog on our stack; **buy** commodity services (hosting, email, payments, DB). Re-evaluate full platform buy at each wave gate.

## Build (custom)

| Capability | Why build |
|------------|-----------|
| Quote workflow | Wholesale discounts, PDF branding, status pipeline |
| Customer types | Retail vs equipo vs liga pricing tiers |
| Mexico privacy | ARCO flows integrated with our data model |
| Admin UX | Spanish-first, minimal training for sales staff |

## Buy (integrate)

| Capability | Vendor |
|------------|--------|
| Hosting | Netlify |
| Database | Neon |
| Email | Resend |
| Payments | Mercado Pago / Stripe |
| Edge security | Cloudflare |
| AI (Phase 1+) | LLM API provider |

## Defer / Hybrid

| Capability | Approach |
|------------|----------|
| Full storefront | Build on Next.js; parity checklist vs reference sites |
| Inventory POS | Integrate later via CSV or API; don't build POS in Wave Zero |
| Accounting | Export to CONTPAQi / factura.com; no in-app SAT invoicing in MVP |
| **Odoo / ERP platforms** | **Out of plan until Wave 2 gate.** Value-first delivery on custom stack; no parallel CRM/ERP during Wave 0-1 |
| Shopify / HubSpot / Zoho | Out of plan for Wave 0-1; re-evaluate only at documented wave gates |

## Wave Gates for Re-evaluating Buy

| Gate | Question |
|------|----------|
| Wave Zero complete | Is quote CRM saving >5 hrs/week? If no, pivot process not platform |
| Wave One | Would Shopify + quote app be cheaper than maintenance? |
| Wave Two | Is custom checkout ROI positive vs Mercado Pago shop? |

See [../../business/build-vs-buy-matrix.md](../../business/build-vs-buy-matrix.md).

## Consequences

**Positive:** Fit-for-purpose cotización flow; no Shopify transaction fees on B2B quotes.

**Negative:** We own maintenance, security patches, and feature backlog.

**Mitigation:** Modular monolith + SaaS for non-differentiating layers.

## Related

- ADR-002, ADR-006, ADR-007
- [../../business/hybrid-mvap-paths.md](../../business/hybrid-mvap-paths.md)
