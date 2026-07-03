---
name: build-vs-buy-mvap
description: >-
  Evaluates build-vs-buy decisions for MVAP (minimum viable achievable product)
  components such as CRM, email, payments, and chat. Use when choosing vendors,
  scoping Wave 0, or documenting technical debt trade-offs.
---

# Build vs Buy (MVAP)

## Instructions

1. MVAP = smallest shippable slice that validates Mexico market fit - not full platform.
2. Score options: time-to-Wave-0, cost, LFPDPPP compliance, Spanish support, lock-in.
3. Default bias: buy commodity (email delivery, payments, CDN); build differentiated (quote workflow, catalog UX).
4. Document decision in ADR with revisit trigger (volume, cost, feature gap).
5. Align with mvp-newera-mx-reference priorities.

## Key Workflows

### Decision matrix

| Component | Build | Buy | MVAP recommendation |
|-----------|-------|-----|---------------------|
| Transactional email | | | Usually buy |
| CRM core | | | Lightweight build Wave 0 |
| Payments | | | Buy provider |
| AI chatbot | | | Buy/incremental |
| ERP sync | | | Buy/integration partner |

### ADR template usage

```
- [ ] Problem and constraints
- [ ] Options considered
- [ ] Decision and rationale
- [ ] Consequences and revisit date
```

## Reference Docs

- [docs/product/build-vs-buy-mvap.md](../../../docs/product/build-vs-buy-mvap.md)
- [docs/product/mvp-newera-mx-reference.md](../../../docs/product/mvp-newera-mx-reference.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/product/payments-incremental.md](../../../docs/product/payments-incremental.md)
- [docs/architecture/ai-chatbot-roadmap.md](../../../docs/architecture/ai-chatbot-roadmap.md)
