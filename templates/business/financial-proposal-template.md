# Financial Proposal - Baseball Store CRM

| Field | Value |
|-------|-------|
| **Client** | [Store legal name] |
| **Prepared by** | [Agency / consultant] |
| **Date** | YYYY-MM-DD |
| **Valid until** | YYYY-MM-DD |
| **Currency** | MXN (primary) / USD |

---

## Executive Summary

Brief description of proposed engagement: Wave Zero quote CRM through [optional Wave One storefront].

**Recommended path:** [CRM-First / Hybrid - see hybrid-mvap-paths.md]

---

## Scope of Work

### Phase 0: Discovery (optional)

| Deliverable | Duration | Fee |
|-------------|----------|-----|
| Requirements workshop | 2 days | $______ MXN |
| Architecture summary | | Included |
| Data migration assessment | | Included |

*Discovery fee credited ___% toward build if contract signed within 30 days.*

### Wave Zero: Quote CRM MVP

| Workstream | Hours (est.) | Rate | Subtotal |
|------------|--------------|------|----------|
| Customer & catalog modules | | $ | |
| Quote builder + PDF | | $ | |
| Email integration (Resend) | | $ | |
| Admin auth & roles | | $ | |
| Privacy baseline (templates + UI) | | $ | |
| Deploy (Netlify + Cloudflare + Neon) | | $ | |
| QA & UAT support | | $ | |
| Training (2 sessions) | | $ | |
| **Wave Zero subtotal** | | | **$______ MXN** |

### Wave One: Storefront + Payments (optional)

| Workstream | Hours (est.) | Subtotal |
|------------|--------------|----------|
| Public catalog UX | | |
| Cart & checkout | | |
| Mercado Pago integration | | |
| Order management | | |
| **Wave One subtotal** | | **$______ MXN** |

---

## Infrastructure & Third-Party (client-paid, estimated)

| Service | Monthly (MXN est.) | Notes |
|---------|-------------------|-------|
| Netlify | $0 - $350 | |
| Neon | $0 - $350 | |
| Cloudflare | $0 - $360 | |
| Resend | $0 - $360 | |
| Domain .mx | ~$60/mo amortized | |
| Payment processing | % of GMV | ~3.5% Mercado Pago |

Reference: docs/hosting/infrastructure-cost-tiers.md

---

## Payment Schedule

| Milestone | % | Amount | Trigger |
|-----------|---|--------|---------|
| Contract signature | 30% | $ | |
| Wave Zero UAT pass | 40% | $ | |
| Wave One launch (if contracted) | 30% | $ | |

---

## Ongoing Support (optional retainer)

| Tier | Hours/mo | Monthly fee |
|------|----------|-------------|
| Basic | 8h | $______ MXN |
| Standard | 16h | $______ MXN |

Includes: security patches, minor bug fixes, dependency updates.

Excludes: new features (change order).

---

## Assumptions

1. Client provides product catalog (SKU, prices, images) within ___ days of kickoff
2. Legal review of aviso de privacidad by client's counsel
3. One round of revisions per milestone included
4. Mercado Pago merchant account approved by client

## Exclusions

- CFDI / SAT electronic invoicing
- POS hardware integration
- Custom mobile native apps
- Paid advertising / SEO campaigns

---

## Timeline

| Milestone | Target date |
|-----------|-------------|
| Kickoff | |
| Wave Zero beta | |
| Wave Zero go-live | |
| Wave One go-live (if applicable) | |

---

## Acceptance

Authorized signature indicates agreement to scope and fees listed above.

**Client:** _________________________ Date: _______

**Provider:** _________________________ Date: _______

---

## Appendix

- docs/business/development-cost-phases.md
- docs/architecture/wave-zero-quote-crm.md
