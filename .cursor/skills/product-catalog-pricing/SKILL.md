---
name: product-catalog-pricing
description: >-
  Manages product catalog structure, variants, and MXN pricing tiers for
  baseball merchandise. Use when building catalog UI, import pipelines, or
  quote line-item pricing logic.
---

# Product Catalog & Pricing

## Instructions

1. Catalog hierarchy: Category -> Product -> Variant (size, color, league team).
2. Store prices in MXN minor units or decimal with explicit currency field - be consistent project-wide.
3. Distinguish catalog price vs quote override; audit overrides on quotes.
4. Support unavailable/out-of-stock display without deleting variants (ERP sync may repopulate).
5. Custom/embroidered items may have no catalog SKU - link to custom request flow.

## Key Workflows

### Add or update catalog item

```
- [ ] Define product + variants in Prisma
- [ ] Set list price and optional tier rules
- [ ] Add bilingual names/descriptions (i18n keys)
- [ ] Attach multimedia assets (images)
- [ ] Expose via GET /api/products and search filters
```

### Quote line pricing

1. Resolve variant list price
2. Apply tier discount if customer segment matches
3. Allow manual adjustment with reason code (staff only)
4. Recalculate subtotal, IVA, total per financial plan rules

## Reference Docs

- [docs/domain/reference-site-newera-mx.md](../../../docs/domain/reference-site-newera-mx.md)
- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
- [docs/product/mvp-newera-mx-reference.md](../../../docs/product/mvp-newera-mx-reference.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/prisma/schema-conventions.md](../../../docs/prisma/schema-conventions.md)
