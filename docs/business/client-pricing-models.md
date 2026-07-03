# Client Pricing Models

> **Purpose:** How to structure commercial proposals for the baseball store CRM engagement.

## Model 1: Fixed Phase Price (recommended)

**Best for:** Defined waves (Zero, One) with clear acceptance criteria.

| Pros | Cons |
|------|------|
| Predictable for client | Scope creep needs change orders |
| Easy to approve internally | Underestimate risk on agency |

**Structure:**

```
Phase 0 Discovery     $X  (1 week, credited toward build if proceed)
Wave Zero Fixed       $Y  (quote CRM)
Wave One Fixed        $Z  (storefront + payments)
Optional retainer     $W/mo
```

## Model 2: Time & Materials (T&M)

**Best for:** Evolving requirements, client has product owner embedded.

| Rate card | MXN/hour |
|-----------|----------|
| Senior dev | $600 - $900 |
| Mid dev | $400 - $600 |
| PM (optional) | $350 - $550 |

Cap with **not-to-exceed (NTE)** per sprint: e.g., 80 hours max / 2 weeks.

## Model 3: Hybrid MVAP

**Minimum Viable Admin Product** first - internal CRM only - then revenue-share or milestone bonus on Wave One GMV.

See [hybrid-mvap-paths.md](./hybrid-mvap-paths.md).

## Model 4: Build + License

Client pays build fee; agency retains platform IP, client gets license.

- Lower upfront for client
- Agency can productize for other MX sports retailers
- Clarify data ownership (client owns customer data)

## What's Included vs Add-On

| Included in standard build | Add-on |
|----------------------------|--------|
| Wave scope features | CFDI / SAT invoicing |
| 30-day warranty bugfix | 24/7 support |
| Deploy to Netlify | On-prem hosting |
| 2h staff training | Ongoing content entry |
| Privacy templates | Full legal retainer |

## Sample Line Items (Proposal)

1. Technical discovery & architecture - 40h
2. Wave Zero CRM implementation - 200h
3. Infrastructure setup - 16h
4. QA & UAT support - 24h
5. Documentation & handoff - 16h

Use [../../templates/business/financial-proposal-template.md](../../templates/business/financial-proposal-template.md).

## Comparison to SaaS

| | Custom CRM (ours) | Shopify + apps |
|--|-------------------|----------------|
| Upfront | Higher | Lower |
| Monthly | Infra ~$1-2k MXN | $550+ MXN + % txn |
| Fit for mayoreo quotes | Excellent | Requires app glue |
| Ownership | Client (if contracted) | Rented |

## Red Flags in Negotiation

- "Same as Amazon but $5k" - reset scope to Wave Zero only
- No content ready (SKUs, prices) - add data migration line item
- Legal not budgeted - require review before public launch

## Related

- [development-cost-phases.md](./development-cost-phases.md)
- [build-vs-buy-matrix.md](./build-vs-buy-matrix.md)
