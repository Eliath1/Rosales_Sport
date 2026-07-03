---
name: payments-integration-mexico
description: Implements OXXO, SPEI, cards, and refunds via Conekta/Stripe with Mexico compliance and minimal PCI scope.
---

**Recommended model:** Sonnet thinking (Opus for PCI-sensitive reviews)

## Workflow

1. **Choose methods** - Cards, OXXO cash, SPEI transfer; match customer segments and cart size.
2. **Tokenization only** - Use provider Elements/hosted fields; never store PAN or CVV in Prisma or logs.
3. **Implement checkout** - Create payment intent, handle async confirmation (OXXO voucher expiry).
4. **Webhooks** - Verify signatures; update order status; handle partial refunds and chargebacks.
5. **PCI checkpoint** - Escalate to Opus security-reviewer for any change touching card data flow or SAQ scope.
