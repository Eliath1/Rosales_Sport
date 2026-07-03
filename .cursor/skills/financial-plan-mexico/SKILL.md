---
name: financial-plan-mexico
description: >-
  Applies Mexico financial planning rules for quotes including MXN, IVA, margins,
  and invoicing assumptions. Use when pricing quotes, planning revenue, or
  aligning product specs with finance constraints.
---

# Financial Plan (Mexico)

## Instructions

1. All customer-facing amounts in MXN unless spec defines USD for B2B export edge cases.
2. Apply IVA per financial plan doc - document exempt categories if any.
3. Quote totals: subtotal -> discounts -> IVA -> grand total; round consistently (banker's or half-up - pick one project-wide).
4. Separate operational COGS assumptions from quote UI - finance doc owns margin targets.
5. Payment collection is incremental wave - quotes may not imply checkout in Wave 0.

## Key Workflows

### Quote financial validation

```
- [ ] Line prices match catalog or approved override
- [ ] Discount caps enforced for role
- [ ] IVA calculation matches financial plan tables
- [ ] Totals reconcile with PDF/email template
```

### Planning inputs

- Average order value targets by segment (team vs retail)
- Quote-to-cash timeline assumptions
- Link to mexico-payments-incremental for later waves

## Reference Docs

- [docs/product/financial-plan-mexico.md](../../../docs/product/financial-plan-mexico.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/domain/reference-site-newera-mx.md](../../../docs/domain/reference-site-newera-mx.md)
- [docs/product/payments-incremental.md](../../../docs/product/payments-incremental.md)
- [docs/domain/customer-segments-mx.md](../../../docs/domain/customer-segments-mx.md)
