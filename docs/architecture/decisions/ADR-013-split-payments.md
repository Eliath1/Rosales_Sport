# ADR-013: Split/Deposit Payments & Commission Tracking

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead, client stakeholder |

## Context

This extends [ADR-006](./ADR-006-payment-abstraction.md) (accepted: `PaymentProvider` interface, Mercado Pago primary, Stripe optional, mock adapter shipped in Wave Zero). ADR-006 defined *how* to talk to a payment provider; it did not define the owner's actual payment terms. The owner needs two things ADR-006 does not cover:

1. Small orders (fewer than 6 pieces) pay 100% upfront. Larger orders (6+ pieces, which is also the configurator's minimum order size - see [variant-bank-spec.md](../../specs/variant-bank-spec.md)) pay a 50% deposit at checkout and the remaining 50% when the order is ready to ship.
2. The owner needs to know the processor's actual commission percentage per payment so pricing can be adjusted - today there is no visibility into what Mercado Pago/Stripe actually charge per transaction.

## Decision

1. **`Order.paymentPlan`** is computed at checkout from total quantity: `full` for orders under 6 pieces, `deposit_50` for 6+. This mirrors the configurator's existing 6-unit minimum (`builder.v2.error.min_order`), so the same threshold is used store-wide, not a second unrelated number.
2. **`Payment.kind`** (`full` | `deposit` | `balance`) records which leg of the plan a given payment covers. A `deposit_50` order gets one `deposit` payment at checkout; the `balance` payment is requested (checkout link emailed) when staff flips `Order.status` to `ready_to_ship`.
3. **Commission capture:** `Payment.feeCents` stores the processor's actual fee for that payment, read from the webhook payload when the provider exposes it (Mercado Pago does, per-payment, in the payment resource). If a provider does not expose fee data in the webhook, `feeCents` stays null and the admin report shows "fee unknown" rather than a wrong number.
4. **Admin commission report** (new, small): effective commission % = `sum(feeCents) / sum(amountCents)` over a trailing period, broken out by provider. This is a report, not a bookkeeping system - it answers "what % am I actually paying" so the owner can adjust list prices, nothing more.
5. Real Mercado Pago adapter (`MercadoPagoAdapter` from ADR-006's interface) ships in this phase; Stripe stays optional/later per the existing ADR-006 routing rule (B2C -> Mercado Pago, wholesale -> manual transfer).

## Rationale

- Splitting payment logic (this ADR) from provider abstraction (ADR-006) keeps each decision record focused: ADR-006 is "how do we talk to any provider," this one is "what are our actual business terms."
- Tying the deposit threshold to the same 6-piece number already used for the order minimum avoids two different "what counts as a big order" definitions across checkout and the configurator.
- Reading fees from webhook payloads (rather than a separate reconciliation import) keeps commission visibility real-time and avoids a manual monthly spreadsheet step.

## Data model (delta on top of ADR-006's minimal `payments`/`payment_events` shape)

```prisma
enum PaymentPlan { full deposit_50 }
enum PaymentKind { full deposit balance }
enum PaymentStatus { pending succeeded failed refunded }

model Order {
  // ...
  paymentPlan   PaymentPlan
  depositCents  Int @default(0)
  balanceCents  Int @default(0)
  readyToShipAt DateTime?
  payments      Payment[]
}

model Payment {
  id                String        @id @default(uuid())
  orderId           String
  kind              PaymentKind
  provider          String        // "mercadopago" | "stripe" | "mock"
  providerPaymentId String?
  amountCents       Int
  feeCents          Int?          // null = provider did not expose fee data
  status            PaymentStatus @default(pending)
  capturedAt        DateTime?
}
```

## Consequences

| Area | Change |
|------|--------|
| Checkout | Computes `paymentPlan` from cart quantity; under-6 creates one `full` `Payment`, 6+ creates one `deposit` `Payment` for 50% |
| Order lifecycle | New transition: staff marks `ready_to_ship` -> system emails a balance-payment link -> customer pays -> `balance` `Payment` created -> order can move to `shipped` |
| Admin | New commission report (effective % per provider, trailing period); `/admin/orders` shows payment plan and paid/outstanding amounts per order |
| Webhooks | `POST /api/webhooks/payments/:provider` (per ADR-006) now also persists `feeCents` when present in the payload |

**Positive:** owner gets real fee visibility without building accounting software; deposit/balance flow matches how the business already quotes and invoices larger orders.

**Negative:** two-payment orders add a manual trigger point (staff must remember to flip `ready_to_ship` to unlock the balance request) - flagged as a candidate for an automated production-status hook in a later stage, not solved here.

**Compliance:** payment data handling follows `security-baseline.mdc` - no raw card data stored; `SavedPaymentMethod.providerCustomerId` (ADR-012 territory) is a tokenized reference only.

## Alternatives considered

| Option | Rejected because |
|--------|-------------------|
| Full amount always upfront | Does not match how the owner already sells larger team orders (deposit is the existing informal practice) |
| Manual monthly fee reconciliation spreadsheet | Delays pricing feedback by weeks; webhook-based capture is near-real-time for the same effort once the webhook handler exists anyway |
| Percentage-based deposit configurable per order (not fixed 50%) | Adds UI/config complexity with no current business need; revisit only if the owner asks for a different split |

## Related

- [ADR-006-payment-abstraction.md](./ADR-006-payment-abstraction.md)
- [ADR-012-customer-accounts.md](./ADR-012-customer-accounts.md)
- [../payment-provider-abstraction.md](../payment-provider-abstraction.md)
- [../../business/payment-methods-roadmap.md](../../business/payment-methods-roadmap.md)
- [../../business/mexico-pricing-reference.md](../../business/mexico-pricing-reference.md)
