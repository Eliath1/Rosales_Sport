# ADR-012: Customer Accounts & Guest Checkout

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead, client stakeholder |

## Context

Three customer stories drive this decision: (1) a first-time or occasional buyer wants to purchase without creating an account, (2) a logged-in customer wants to track order status, and (3) frequent distributor customers want a registered account with saved payment methods tied to their orders. The owner's stated priority order is *getting new customers* first, *payment management* second, and *registration/login* third - so the checkout path must work fully without an account before any account-gated feature is built.

The existing [Customer](../../../app/prisma/schema.prisma) model already supports rows with no password (used today for quote/lead capture). Staff auth already exists in [app/src/lib/auth.ts](../../../app/src/lib/auth.ts), scoped to `/admin/*`. There is no customer-facing auth today.

## Decision

1. **Guest checkout is the default path and ships first.** Placing an `Order` never requires a `Customer` account - a guest fills contact info inline (same UX pattern as today's quote/lead forms) and a `Customer` row is created or matched by email with `passwordHash = null`.
2. **A second, separate NextAuth instance** (`app/src/lib/customerAuth.ts`) handles customer login, distinct from staff auth. Different session cookie, different scope (`/mi-cuenta/*`), no shared role system with staff `UserRole`.
3. **Registration is optional for retail customers, required for the distributor dashboard.** A guest can later "claim" their order history by registering with the same email (post-MVP nicety, not required for launch).
4. **`Customer.isDistributor`** is a convenience boolean (in addition to the existing `customerType` enum) that gates the distributor-only UI: saved payment methods and any future wholesale-specific views.
5. Order tracking (`/mi-cuenta/pedidos`) is **login-gated only** - guests get status updates by email instead, they do not get a token-based tracking link in this phase (that pattern exists for `DesignRequest` approval today and could be reused later if needed, but is out of scope here).

## Rationale

- Guest checkout removes the single biggest friction point for a new visitor buying for the first time, which matches the owner's #1 stated priority (getting new customers).
- Keeping staff and customer auth fully separate avoids accidentally widening the staff role/permission surface (`security-baseline.mdc`: staff CRM routes require server-side role checks) and keeps the blast radius of a customer-auth bug away from admin access.
- Reusing the no-password `Customer` pattern that `Lead`/`Quote` already use avoids a second "anonymous contact" concept in the schema.

## Consequences

| Area | Change |
|------|--------|
| Schema | `Customer.passwordHash` (nullable), `Customer.emailVerifiedAt`, `Customer.isDistributor`; new `Order`, `OrderLineItem` models reference `Customer` but never require a session to create |
| Auth | Two independent NextAuth configs in the same Next.js app; middleware matcher scoped per config (`/admin/*` vs `/mi-cuenta/*`) |
| Checkout | `/checkout` renders the same form whether or not a customer session exists; logged-in users get fields pre-filled and skip contact re-entry |
| Distributor UI | `/mi-cuenta/*` routes and `SavedPaymentMethod` model are gated behind `isDistributor`, not just "has an account" |
| Order tracking | Guests: email only. Registered customers: `/mi-cuenta/pedidos` list + detail/timeline |

**Positive:** new customers can buy immediately; registration/login work (Priority 3) can be built without blocking or reworking checkout.

**Negative:** two auth systems to maintain instead of one merged role model; guest orders that are never claimed leave orphaned `Customer` rows with no login (acceptable - same shape as today's lead/quote guests).

**Compliance:** guest and registered customer data both fall under LFPDPPP (`data-privacy-mexico.mdc`) - collect the minimum fields needed for fulfillment, marketing consent stays opt-in and separate from checkout completion.

## Alternatives considered

| Option | Rejected because |
|--------|-------------------|
| Require an account to check out | Directly conflicts with Priority 1 (getting new customers); adds friction New Era MX and other reference sites avoid |
| Single merged auth (staff + customer, role-gated) | Widens the attack surface for admin routes; couples two very different session lifetimes (staff sessions are long-lived internal tooling, customer sessions are public-facing) |
| Token-based guest order tracking (like `DesignRequest` approval links) | Useful, but not required by the current stories; logged as a possible future enhancement rather than scope now |

## Related

- [../uniform-configurator.md](../uniform-configurator.md) - existing `DesignRequest` approval-token pattern, considered and deferred as a guest-tracking option
- [ADR-013-split-payments.md](./ADR-013-split-payments.md) - `Order`/`Payment` shape this ADR's `Order` model feeds
- [../../domain/user-journeys.md](../../domain/user-journeys.md) - guest checkout and distributor order-tracking journeys
- [../../../.cursor/rules/data-privacy-mexico.mdc](../../../.cursor/rules/data-privacy-mexico.mdc)
