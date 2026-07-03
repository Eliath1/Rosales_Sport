---
name: baseball-store-domain
description: >-
  Applies baseball retail domain knowledge for Mexico including leagues,
  customization, and B2B team orders. Use when modeling features, naming
  entities, or clarifying business rules for the CRM.
---

# Baseball Store Domain

## Instructions

1. Use canonical terms from the glossary - avoid ambiguous synonyms in code and UI.
2. Distinguish: retail walk-in, team/league bulk, custom embroidery, and quote-only SKUs.
3. Pricing may be list, tier, or quote-override - never assume single price source.
4. Seasonality and tournament cycles affect inventory and quote urgency in Mexico.
5. Reference New Era MX patterns for MVP parity where documented.

## Key Workflows

### Domain modeling session

```
- [ ] Identify actor (customer, sales rep, ops)
- [ ] Map noun to glossary entry
- [ ] Define lifecycle states and who transitions them
- [ ] Note MX-specific rules (IVA, invoicing, delivery regions)
- [ ] Update glossary if new term is stable
```

### Common entities

| Term | Meaning |
|------|---------|
| Quote | Priced offer before order commitment |
| Custom request | Non-catalog or personalization inquiry |
| Variant | SKU + size + color combination |
| Lead | CRM record from intake or email |

## Reference Docs

- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
- [docs/domain/customer-segments-mx.md](../../../docs/domain/customer-segments-mx.md)
- [docs/product/mvp-newera-mx-reference.md](../../../docs/product/mvp-newera-mx-reference.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
