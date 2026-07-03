# Hybrid MVAP Paths - Minimum Viable Admin Product

> **MVAP:** Ship internal value first (quote CRM), then expand to public **MVAP** storefront variants.

## Path A: CRM-First (**locked - current plan**)

> **No Odoo, Shopify, or ERP sidecars during Wave 0-1.** One custom stack; deliver quote CRM value before platform shopping.

```
Wave Zero: Admin CRM only
    ↓ validate sales adoption
Wave One: Public catalog + checkout
    ↓ validate online GMV
Wave Two: B2B portal + automation
```

**Best for:** Store already sells in physical location + WhatsApp; online is additive.

| Milestone | Success signal |
|-----------|----------------|
| Zero live | 80% quotes in system |
| One live | 10% revenue online in 90 days |
| Two live | 1+ liga account self-serves quote |

## Path B: Storefront-First (riskier)

```
Shopify or quick storefront
    ↓
Custom CRM integration later
```

**Risk:** Double data entry, quote workflow still manual.

**Only if:** Client has hard deadline for online season opener (LMB opening day).

## Path C: Parallel Thin Slices

```
Sprint 1: CRM quotes + PDF
Sprint 2: Public catalog (no pay)
Sprint 3: Payments
```

**Best for:** Demo-driven sales to investors or league partners.

## Path D: Wholesale-Only Portal

```
Skip B2C initially
B2B login -> tier catalog -> quote request
```

**Best for:** Majority revenue from equipos; retail is walk-in only.

## Decision Tree

```
¿El 50%+ de ingresos es mayoreo/ligas?
├── Sí -> Path D or A with B2B priority
└── No -> Path A

¿Fecha límite < 8 semanas para venta en línea?
├── Sí -> Path B (buy storefront) + plan CRM integration
└── No -> Path A

¿Presupuesto < $80k MXN total?
└── Wave Zero only (Path A stop gate)
```

## Stop Gates (kill / pivot criteria)

| Gate | Continue if... | Pivot if... |
|------|--------------|-----------|
| After Wave Zero | Sales uses weekly | Still on spreadsheets after 60 days |
| After Wave One | >5 online orders/week | Zero orders after 90 days marketing |
| After AI Phase 1 | >25% deflection | Hallucination complaints >5% |

## Funding Alignment

| Client budget | Recommended path |
|---------------|------------------|
| < $100k MXN | Wave Zero only (A) |
| $100-300k MXN | A through Wave One MVP |
| $300k+ MXN | A full + Wave Two B2B |

## Related

- [development-cost-phases.md](./development-cost-phases.md)
- [client-pricing-models.md](./client-pricing-models.md)
- [../architecture/wave-zero-quote-crm.md](../architecture/wave-zero-quote-crm.md)
