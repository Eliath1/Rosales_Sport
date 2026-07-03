# ADR-006: Payment Provider Abstraction

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead, client stakeholder |

## Context

Mexico baseball retail customers expect tarjeta de crédito/débito, OXXO, SPEI, and Mercado Pago. International fans may prefer Stripe. Coupling checkout to one provider increases switching cost and blocks gradual rollout.

## Decision

Implement a **PaymentProvider interface** with pluggable adapters (Mock, Mercado Pago, Stripe MX). Wave Zero ships Mock only; Wave One enables real adapters via config.

## Rationale

- **Mercado Pago** - Strong Mexico coverage (OXXO, MSI, wallet)
- **Stripe** - Strong developer UX, international cards
- **Abstraction** - Single order flow, provider-specific webhooks isolated

See [../payment-provider-abstraction.md](../payment-provider-abstraction.md).

## Default Routing (Wave One)

| Segment | Provider |
|---------|----------|
| B2C storefront MX | Mercado Pago |
| International card | Stripe (optional) |
| Wholesale / factura | Bank transfer (manual, no adapter) |

## Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| Mercado Pago only | Loses Stripe DX and some intl cards |
| Stripe only | Weak OXXO; higher friction for cash-preferring MX buyers |
| Direct bank API | No unified checkout UX |

## Consequences

**Positive:** A/B test providers; sandbox testing with Mock.

**Negative:** Must maintain two webhook handlers and reconciliation reports.

**Compliance:** PCI scope minimized via hosted checkout (redirect or embedded fields from provider).

## Related

- [../../business/payment-methods-roadmap.md](../../business/payment-methods-roadmap.md)
- ADR-008 (build vs buy for payment SDK)
