# System Context - Mexico Baseball Store CRM

> **Audience:** Developers, stakeholders, and anyone new to the project.  
> **Last updated:** 2026-07  
> **Status:** Wave Zero (quote + CRM foundation)

## What We Are Building

A **customer relationship and commerce platform** for a Mexico-based baseball apparel retailer. The store sells jerseys, caps, and team merchandise to fans across Mexico, with future support for online checkout, in-store pickup, and wholesale (liga / equipo) accounts.

This document describes the **system boundary**: what is inside our software, what is outside, and how they connect.

## Business Context

| Stakeholder | Primary need |
|-------------|--------------|
| Store owner / ops | Track leads, quotes, orders, inventory visibility |
| Sales staff | Fast quote creation, customer history, follow-ups |
| Customers (B2C) | Browse catalog, request quotes, pay securely (later waves) |
| Wholesale clients (B2B) | Volume pricing, credit terms, dedicated rep |
| Compliance (Mexico) | LFPDPPP privacy, ARCO rights, clear consent |

## System Context Diagram

```
                    ┌─────────────────────────────────────────┐
                    │         External Actors                  │
                    └─────────────────────────────────────────┘
         ┌──────────────┐  ┌──────────────┐  ┌──────────────┐
         │   Customers  │  │ Sales Staff  │  │ Store Owner  │
         │  (web/mobile)│  │  (admin UI)  │  │  (dashboard) │
         └──────┬───────┘  └──────┬───────┘  └──────┬───────┘
                │                 │                 │
                └─────────────────┼─────────────────┘
                                  │ HTTPS
                                  ▼
         ┌────────────────────────────────────────────────────┐
         │              Cloudflare (edge)                      │
         │   WAF · DDoS · TLS · Bot management · CDN cache    │
         └────────────────────────┬───────────────────────────┘
                                  │
                                  ▼
         ┌────────────────────────────────────────────────────┐
         │         Baseball Store CRM (our system)             │
         │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐ │
         │  │  Storefront │  │  Admin CRM  │  │  REST API   │ │
         │  │  (Next.js)  │  │  (Next.js)  │  │  (modular)  │ │
         │  └─────────────┘  └─────────────┘  └─────────────┘ │
         │                      │                              │
         │                      ▼                              │
         │              Neon PostgreSQL                        │
         └────────────────────────┬───────────────────────────┘
                                  │
         ┌────────────────────────┼───────────────────────────┐
         │    External Services   │                           │
         ▼                        ▼                           ▼
  ┌─────────────┐        ┌─────────────┐            ┌─────────────┐
  │   Resend    │        │  Payment    │            │  AI Chat    │
  │   (email)   │        │  Provider   │            │  (future)   │
  │             │        │  (Stripe /  │            │             │
  │             │        │  Mercado Pago)│           │             │
  └─────────────┘        └─────────────┘            └─────────────┘
```

## In Scope (Wave Zero)

- **Public storefront** - home, collections, product detail (read-only; quote CTAs)
- **Inbound quote forms** - retail and bulk/equipo leads into CRM
- Customer and lead records
- Product catalog (jerseys, gorras, accesorios)
- Quote creation and PDF/email delivery
- Basic admin authentication
- Privacy notices and consent capture hooks (full LFPDPPP in Wave 0.2)

## Out of Scope (Later Waves)

- Full e-commerce checkout
- Real-time inventory sync with POS
- Mobile native apps
- AI chatbot (planned - see `ai-chatbot-roadmap.md`)

## Key Quality Attributes

1. **Simplicity first** - Modular monolith, not microservices (see ADR-002).
2. **Mexico-ready** - MXN pricing, Spanish UI, LFPDPPP compliance.
3. **Cost-conscious hosting** - Netlify + Neon free/low tiers for MVP (ADR-003, ADR-005).
4. **Payment flexibility** - Abstract provider layer for Stripe vs Mercado Pago (ADR-006).

## Related Documents

- [02-website-architecture-plan.md](./02-website-architecture-plan.md) - **Master website plan (start here)**
- [01-module-map.md](./01-module-map.md) - Internal module boundaries
- [wave-zero-quote-crm.md](./wave-zero-quote-crm.md) - First delivery scope
- [decisions/](./decisions/) - Architecture Decision Records
