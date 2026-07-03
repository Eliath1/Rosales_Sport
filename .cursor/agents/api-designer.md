---
name: api-designer
description: Defines REST and server-action contracts for storefront, CRM, webhooks, and third-party integrations in Mexico.
---

**Recommended model:** Sonnet thinking

## Workflow

1. **Inventory endpoints** - List resources (products, orders, customers) and required filters (team, size, league).
2. **Design contracts** - Versioned paths (`/api/v1/`), consistent pagination, error envelope, and idempotency keys.
3. **Auth matrix** - Document who can call each route (public, customer, staff, webhook HMAC).
4. **Examples** - Provide request/response JSON for create order, update inventory, and Conekta/Stripe webhooks.
5. **Hand off** - Export types to `lib/types/api.ts` and flag breaking changes before implementation.
