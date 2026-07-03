# Module Map - Modular Monolith

> **Pattern:** Single deployable application with clear internal module boundaries.  
> **Stack reference:** ADR-001, ADR-002

## Overview

The Baseball Store CRM is organized as a **modular monolith**: one codebase, one deployment, but modules communicate through defined interfaces - not direct database access across boundaries.

```
┌─────────────────────────────────────────────────────────────┐
│                     Presentation Layer                       │
│  ┌──────────────────┐    ┌──────────────────────────────┐ │
│  │ Storefront (B2C) │    │ Admin CRM (B2B/internal)       │ │
│  │ /catalog, /quote │    │ /customers, /quotes, /reports│ │
│  └────────┬─────────┘    └──────────────┬───────────────┘ │
└───────────┼─────────────────────────────┼───────────────────┘
            │                             │
            ▼                             ▼
┌─────────────────────────────────────────────────────────────┐
│                      API / Application Layer                 │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────┐   │
│  │ Customers│ │ Catalog  │ │  Quotes  │ │ Notifications│   │
│  │  Module  │ │  Module  │ │  Module  │ │    Module    │   │
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └──────┬───────┘   │
│       │            │            │              │            │
│  ┌────┴─────┐ ┌────┴─────┐ ┌───┴──────┐ ┌─────┴──────┐     │
│  │ Payments │ │  Auth    │ │ Privacy  │ │  (future)  │     │
│  │ (stub)   │ │  Module  │ │  Module  │ │  AI Assist │     │
│  └──────────┘ └──────────┘ └──────────┘ └────────────┘     │
└─────────────────────────────┬───────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Infrastructure Layer                      │
│  Database (Neon) · Email (Resend) · Payment adapters · Cache │
└─────────────────────────────────────────────────────────────┘
```

## Module Responsibilities

### Customers Module

| Responsibility | Examples |
|----------------|----------|
| CRUD for leads and accounts | Fan registrado, mayoreo LMP |
| Contact preferences | Email, WhatsApp opt-in |
| ARCO request linkage | Privacy module integration |
| Activity timeline | Quote sent, email opened |

**Public API surface:** `CustomerService.create()`, `CustomerService.findByEmail()`, events: `customer.created`

### Catalog Module

| Responsibility | Examples |
|----------------|----------|
| Products & variants | Jersey local, gorra 59FIFTY, talla M/L/XL |
| Categories & collections | Jerseys MLB, Selección Mexicana, Gorras |
| Pricing tiers | Público, mayoreo 12+, equipo |
| Media references | Image URLs, not blob storage in DB |

**Does NOT:** Handle cart/checkout (Payments module, later wave).

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

### Auth Module

| Responsibility | Examples |
|----------------|----------|
| Staff login | Email + password, session cookies |
| Role-based access | admin, sales, read-only |
| API key auth (future) | Webhook verification |

### Privacy Module

| Responsibility | Examples |
|----------------|----------|
| Consent records | Marketing, analytics cookies |
| Data export / deletion | ARCO fulfillment hooks |
| Retention enforcement | Scheduled anonymization jobs |

### Payments Module (stub -> full)

| Wave | Capability |
|------|------------|
| Zero | Interface + mock adapter for dev |
| One | Mercado Pago or Stripe MX checkout |
| Two | Refunds, partial captures, wholesale invoicing |

See [payment-provider-abstraction.md](./payment-provider-abstraction.md).

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
