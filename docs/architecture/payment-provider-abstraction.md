# Payment Provider Abstraction

> **Decision record:** [ADR-006-payment-abstraction.md](./decisions/ADR-006-payment-abstraction.md)  
> **Business context:** Mexico customers expect tarjeta, OXXO, SPEI, and increasingly Mercado Pago wallets.

## Problem

Payment providers differ in:

- API shapes (Stripe PaymentIntent vs Mercado Pago Preference)
- Supported methods (OXXO cash vouchers are Mercado Pago-native)
- Webhook payloads and signature schemes
- Settlement currency and fee structures

Hard-coding one provider makes switching costly and blocks A/B rollout by customer segment.

## Design Goals

1. **One checkout flow** in our UI regardless of backend provider
2. **Swap providers** via configuration, not refactor
3. **Test without network** using a mock adapter
4. **Audit trail** - every payment attempt logged with provider reference ID

## Core Interface

```typescript
// Conceptual - language-agnostic shape

interface PaymentProvider {
  name: 'stripe' | 'mercadopago' | 'mock';

  createCheckoutSession(input: CheckoutInput): Promise<CheckoutSession>;
  capturePayment(paymentId: string): Promise<PaymentResult>;
  refundPayment(input: RefundInput): Promise<RefundResult>;
  verifyWebhook(headers: Headers, body: string): WebhookEvent;
}

interface CheckoutInput {
  orderId: string;
  amount: Money;           // { currency: 'MXN', cents: 129900 }
  customer: CustomerRef;
  lineItems: LineItem[];
  allowedMethods?: PaymentMethod[];  // card, oxxo, spei, wallet
  metadata: Record<string, string>;
}

interface CheckoutSession {
  sessionId: string;
  redirectUrl?: string;    // hosted checkout page
  clientSecret?: string;   // embedded UI (Stripe)
  expiresAt: Date;
}
```

## Adapter Implementations

| Adapter | When to use | MX methods |
|---------|-------------|------------|
| `MockPaymentProvider` | Local dev, CI, demos | All simulated |
| `StripeMxAdapter` | International cards, Apple Pay | Card, some SPEI |
| `MercadoPagoAdapter` | Mexico-first, OXXO, MSI | Card, OXXO, SPEI, wallet |

## Routing Strategy (Wave One+)

```
Customer checkout request
        │
        ▼
┌───────────────────┐
│ PaymentRouter     │
│ (config-driven)   │
└─────────┬─────────┘
          │
    ┌─────┴─────┐
    ▼           ▼
 Stripe      Mercado Pago
 (B2B/intl)  (B2C default)
```

**Default rule (proposed):** B2C storefront -> Mercado Pago; wholesale invoiced orders -> manual bank transfer (no adapter) until Wave Two.

## Domain Events

| Event | Trigger | Downstream |
|-------|---------|------------|
| `payment.initiated` | Session created | Analytics, cart lock |
| `payment.succeeded` | Webhook confirmed | Order fulfillment, email |
| `payment.failed` | Webhook or timeout | Retry prompt, inventory release |
| `payment.refunded` | Admin or API | Credit note, customer notify |

## Webhook Handling

All webhooks land at **`POST /api/webhooks/payments/:provider`**.

1. Verify signature (provider-specific)
2. Idempotency key = provider event ID
3. Map to internal `PaymentStatus` enum
4. Emit domain event
5. Return 200 quickly; heavy work async

## Data Model (minimal)

```
payments
  id, order_id, provider, provider_payment_id
  amount_cents, currency, status, method
  created_at, captured_at, metadata_json

payment_events  (audit log)
  id, payment_id, event_type, payload_json, received_at
```

## Error Handling

| Scenario | User message (ES) | Internal action |
|----------|-------------------|-----------------|
| Card declined | "Tu banco rechazó el pago. Intenta otro método." | Log + retry allowed |
| OXXO expired | "El voucher expiró. Genera uno nuevo." | Release inventory after TTL |
| Webhook duplicate | (none) | Idempotent skip |
| Provider outage | "Pagos temporalmente no disponibles." | Alert ops, queue retry |

## Testing Checklist

- [ ] Mock provider completes happy path
- [ ] Each real adapter has sandbox E2E test
- [ ] Webhook replay does not double-charge
- [ ] Amount mismatch rejected
- [ ] MXN rounding (no float math)

## Related

- [../business/payment-methods-roadmap.md](../business/payment-methods-roadmap.md)
- [../templates/feature/payment-rollout-template.md](../../templates/feature/payment-rollout-template.md)
