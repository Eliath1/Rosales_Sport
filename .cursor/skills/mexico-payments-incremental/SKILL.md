---
name: mexico-payments-incremental
description: >-
  Plans and implements incremental payment integration for Mexico (SPEI, cards,
  OXXO) post-MVP. Use when scoping payment waves, provider selection, or
  connecting accepted quotes to collection flows.
---

# Mexico Payments (Incremental)

## Instructions

1. Payments are post-Wave 0 - confirm wave and build-vs-buy before coding.
2. Start with quote acceptance -> payment link; no full cart checkout until catalog wave matures.
3. Support Mexican methods per payments doc: cards, SPEI, cash reference (OXXO) as phased.
4. PCI scope minimization: prefer hosted checkout or provider SDK - no raw card storage.
5. Reconcile payments to Quote/Order entities with webhook idempotency.

## Key Workflows

### Payment wave planning

```
- [ ] Provider shortlist (Stripe MX, Conekta, Mercado Pago, etc.)
- [ ] MVP method: usually card + SPEI
- [ ] Webhook handlers and reconciliation job
- [ ] Refund/chargeback process documented
- [ ] Financial plan tax receipt (CFDI) integration note
```

### Implementation slice

1. Generate payment intent from accepted quote
2. Redirect to provider checkout
3. Webhook updates payment status
4. CRM activity + email confirmation

## Reference Docs

- [docs/product/payments-incremental.md](../../../docs/product/payments-incremental.md)
- [docs/product/financial-plan-mexico.md](../../../docs/product/financial-plan-mexico.md)
- [docs/product/build-vs-buy-mvap.md](../../../docs/product/build-vs-buy-mvap.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/legal/mexico-privacy-framework.md](../../../docs/legal/mexico-privacy-framework.md)
