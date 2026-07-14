# Module Map - Modular Monolith

> **Pattern:** Clear internal module boundaries, shared through workspace packages.  
> **Stack reference:** ADR-001, ADR-002, ADR-014

> **Amendment (2026-07, [ADR-014](./decisions/ADR-014-monorepo-two-apps.md)):** "one deployment" below now means **one codebase, two deployable Next.js apps** (`apps/web` public/customer-facing, `apps/admin` staff CRM), sharing one database and one set of module services through `packages/db` and `packages/shared`. The module boundaries and cross-module rules are unchanged - only the physical deployment boundary moved, drawn along the `admin` vs public/customer-facing line.

## Overview

The Baseball Store CRM is organized as a **modular monolith**: one codebase, modules communicate through defined interfaces - not direct database access across boundaries. Since ADR-014, that one codebase deploys as two apps (storefront + CRM) instead of one, but module ownership of tables and services is identical either way.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────────┐  ┌──────────────┐  ┌────────────────┐ │
│  │ Storefront (B2C) │  │ /mi-cuenta   │  │ Admin CRM       │ │
│  │ /catalog, /quote │  │ (customer)   │  │ (B2B/internal)  │ │
│  └────────┬─────────┘  └──────┬───────┘  └───────┬─────────┘ │
└───────────┼───────────────────┼──────────────────┼───────────┘
            │                   │                  │
            ▼                   ▼                  ▼
┌─────────────────────────────────────────────────────────────┐
│                      API / Application Layer                 │
│ ┌─────────┐┌─────────┐┌────────┐┌────────┐┌───────────────┐ │
│ │Customers││ Catalog ││ Orders ││ Quotes ││ Notifications │ │
│ │ Module  ││ Module  ││ Module ││ Module ││    Module     │ │
│ └────┬────┘└────┬────┘└───┬────┘└───┬────┘└──────┬────────┘ │
│      │          │         │         │            │           │
│ ┌────┴────┐┌────┴────┐┌───┴────┐┌───┴────┐┌──────┴──────┐   │
│ │Payments ││CustomerA││ Staff  ││Privacy ││  (future)   │   │
│ │(stub->  ││uth (new)││ Auth   ││ Module ││  AI Assist  │   │
│ │ full)   ││         ││        ││        ││             │   │
│ └─────────┘└─────────┘└────────┘└────────┘└─────────────┘   │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  Database (Neon) · Email (Resend) · Payment adapters · Cache │
└─────────────────────────────────────────────────────────────┘
```

## Module rollout sequencing (2026-07 owner priorities)

The owner's stated priority order is (1) getting new customers, (2) payment management, (3) user registration and login. Module work below follows that order, not a generic "commerce then accounts" default:

| Priority | Modules touched |
|----------|------------------|
| 1 - Getting new customers | Catalog (gender + swatches), Orders (guest checkout), Notifications (basic new-order email) |
| 2 - Payment management | Payments (real Mercado Pago, deposit split, commission capture), Notifications (rich PDF/Excel) |
| 3 - Registration and login | Auth (customer instance), Customers (distributor flag, saved payment methods) |

## Module Responsibilities

### Customers Module

| Responsibility | Examples |
|----------------|----------|
| CRUD for leads and accounts | Fan registrado, mayoreo LMP |
| Contact preferences | Email, WhatsApp opt-in |
| ARCO request linkage | Privacy module integration |
| Activity timeline | Quote sent, email opened |
| **Guest vs registered accounts** | `passwordHash = null` = guest (checkout without registering); set = registered customer |
| **Distributor flag** | `isDistributor` gates `/mi-cuenta/*` saved payment methods, independent of `customerType` |

**Public API surface:** `CustomerService.create()`, `CustomerService.findByEmail()`, events: `customer.created`

**Target design note (2026-07, [ADR-012](./decisions/ADR-012-customer-accounts.md)):** customer-facing auth is a **second, separate NextAuth instance** scoped to `/mi-cuenta/*`, distinct from staff auth below. Guest checkout never requires this module's auth layer - it only needs a `Customer` row, same pattern leads/quotes already use.

### Catalog Module

| Responsibility | Examples |
|----------------|----------|
| Products & variants | Jersey local, gorra 59FIFTY, talla M/L/XL |
| Categories & collections | Jerseys MLB, Selección Mexicana, Gorras |
| Pricing tiers | Público, mayoreo 12+, equipo |
| Media references | Image URLs, not blob storage in DB |
| **Gender + swatch variants** | `ProductVariant.gender` (dama/caballero/unisex), `swatchImageUrl` reusing the configurator's curated variant-bank photos so one base jersey PDP shows a color-swatch strip instead of one page per color |

**Does NOT:** Handle cart/checkout (Orders + Payments modules, below).

### Orders Module (new, Priority 1)

| Responsibility | Examples |
|----------------|----------|
| Order creation | Guest or logged-in checkout; no account required to create an `Order` |
| Line items | `OrderLineItem` mirrors `QuoteLineItem` shape (variant + qty + customization JSON) so accepted quotes convert cleanly |
| Status workflow | `pending_payment -> deposit_paid -> in_production -> ready_to_ship -> awaiting_final_payment -> shipped -> delivered` |
| Order tracking | Feeds `/mi-cuenta/pedidos` for logged-in customers; guests get email status updates |

**Public API surface:** `OrderService.create()` (guest-safe), events: `order.created`, `order.ready_to_ship`, `order.shipped`

### Quotes Module

| Responsibility | Examples |
|----------------|----------|
| Quote header & line items | 20 jerseys + bordado nombre |
| Status workflow | draft -> sent -> accepted -> expired |
| PDF generation | Branded cotización PDF |
| Expiration & reminders | 15-day default validity |

**Wave Zero centerpiece** - see [wave-zero-quote-crm.md](./wave-zero-quote-crm.md).

### Notifications Module

| Responsibility | Examples |
|----------------|----------|
| Transactional email | Quote delivery, password reset |
| Template rendering | Spanish copy, MXN formatting |
| Delivery tracking | Resend webhooks, bounce handling |
| **Order notifications (new)** | Priority 1: plain email to `sales@rosalessport.com` on order create. Priority 2: same email upgraded to PDF+Excel attachment with payment/commission detail, plus customer-facing status emails |

### Auth Module (two independent instances, now two independent apps)

| Responsibility | Examples |
|----------------|----------|
| Staff login | Email + password, session cookies, lives entirely in `apps/admin` (no `/admin/*` prefix needed - the whole app is staff-only, on `admin.rosalessport.com`) |
| Role-based access | admin, sales, read-only |
| API key auth (future) | Webhook verification |
| **Customer login (Priority 3, done)** | Separate NextAuth instance, separate session cookie, scoped `/mi-cuenta/*`, lives entirely in `apps/web` on `rosalessport.com`; optional for retail, required for the distributor dashboard - see [ADR-012](./decisions/ADR-012-customer-accounts.md) |

**Rule:** staff and customer auth never share a session, cookie, or role table - a bug in one cannot escalate into the other. **Since [ADR-014](./decisions/ADR-014-monorepo-two-apps.md), this is enforced at the deployment level too:** staff auth code physically doesn't exist in the `apps/web` bundle, and vice versa - there is no `/admin/*` route for a storefront bug to accidentally expose.

### Privacy Module

| Responsibility | Examples |
|----------------|----------|
| Consent records | Marketing, analytics cookies |
| Data export / deletion | ARCO fulfillment hooks |
| Retention enforcement | Scheduled anonymization jobs |

### Payments Module (stub -> full)

> **Status (2026-07):** interface, mock adapter, and split payment plan are implemented in `app/src/lib/payments/` and `paymentService.ts` - see [03-staged-delivery-roadmap.md](./03-staged-delivery-roadmap.md) Priority 2 for the detailed build status. `MercadoPagoAdapter` is code-complete but not verified against real sandbox credentials. Public API surface below is the actual function names, not a rename target.

| Wave | Capability | Status |
|------|------------|--------|
| Zero | Interface + mock adapter for dev | Done |
| One (Priority 2) | Mercado Pago live; **split payment plan** (full under 6 pieces, 50% deposit + balance for 6+, per [ADR-013](./decisions/ADR-013-split-payments.md)); commission `feeCents` capture from webhooks | Done except real Mercado Pago sandbox verification |
| Two | Refunds, partial captures, wholesale invoicing, saved payment methods for distributors ([ADR-012](./decisions/ADR-012-customer-accounts.md)) | Not started |

**Public API surface:** `orderService.createGuestOrder()` (computes plan + creates the first `Payment` leg), `paymentService.requestBalancePayment()`, `paymentService.getCommissionReport()`, webhook: `POST /api/webhooks/payments/:provider`

See [payment-provider-abstraction.md](./payment-provider-abstraction.md) for the provider-agnostic interface (ADR-006) and [ADR-013](./decisions/ADR-013-split-payments.md) for the business terms (deposit split, commission visibility) layered on top of it.

## Cross-Module Rules

1. **No cross-module SQL** - Module A never queries Module B's tables directly.
2. **Shared kernel minimal** - Only `Money`, `Email`, `Locale`, `Result` types in `/shared`.
3. **Events over callbacks** - Prefer domain events for side effects (e.g., `quote.sent` -> email).
4. **Feature flags per wave** - `PAYMENTS_ENABLED=false` until Wave One.

## Folder Convention (suggested)

```
src/
  modules/
    customers/
      domain/       # entities, value objects
      application/  # use cases, services
      infrastructure/ # repos, external adapters
      api/          # route handlers
    catalog/
    quotes/
    ...
  shared/
```

## When to Split a Module

Extract a new module when **two** of these are true:

- Distinct team ownership
- Independent release cadence needed
- >500 LOC of unrelated logic in one folder
- Clear bounded context mismatch (e.g., payroll vs quotes)

Until then, keep the monolith.
