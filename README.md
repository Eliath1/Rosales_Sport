# Baseball Store CRM - Agentic Toolkit

Local-first Cursor agentic operating system for building secure, bilingual (EN/ES) baseball-store CRM and e-commerce solutions for the **Mexico market**.

**Phase 1:** Toolkit only - skills, rules, agents, docs, and templates. No runnable application yet.

## What this repo does

Equips you (and Cursor agents) to:

- Design architecture and APIs for a modular monolith (Next.js + Prisma + PostgreSQL)
- Build Wave 0 MVP: New Era MX-style storefront, quote forms, admin email, internal CRM
- Plan incremental payments (Mercado Pago, PayPal, OXXO, 7-Eleven, Soriana)
- Comply with Mexico data privacy (LFPDPPP)
- Estimate costs and client pricing in MXN
- Validate quality before deploy (Netlify + Cloudflare)

## Quick start

1. Open this folder in **Cursor**
2. Use **Claude Sonnet** as your default model (see [docs/ai/model-routing.md](docs/ai/model-routing.md))
3. Read [AGENTS.md](AGENTS.md) for the agent pipeline
4. Ask naturally, e.g.:
  - *"Design the quote module using solution-architect"*
  - *"Draft aviso de privacidad for quote forms"*
  - *"What should our jerseys collection page look like vs New Era MX?"*

## Repository layout

```
RS/
  demo/         # Stage D static preview (deploy now)
  docs/         # Architecture, legal, business, learning guides
  templates/    # ADRs, legal drafts, feature specs, proposals
  netlify.toml  # Publishes demo/ until Next app exists
  AGENTS.md     # Orchestration pipeline
```

## Target stack (Phase 2 app)

| Layer | Choice |
|-------|--------|
| Hosting | Netlify |
| Security/CDN | Cloudflare |
| App | Next.js 15 + TypeScript |
| Database | PostgreSQL (Neon/Supabase) |
| ORM | Prisma |
| Email | Resend |
| i18n | next-intl (ES default, EN) |
| Payments | Mercado Pago + PayPal (incremental waves) |

## Incremental waves

| Wave | Focus |
|------|--------|
| **D** | Static demo on Netlify (client validation) |
| 0 | Storefront + quotes + email + CRM |
| 0.2 | Privacy notice, terms, cookies, ARCO |
| 1-3 | Payments (cards, OXXO, PayPal, Soriana) |
| 5 | AI chatbot (long-run) |

## Website architecture (planning)

**Master plan:** [docs/architecture/02-website-architecture-plan.md](docs/architecture/02-website-architecture-plan.md)

**All stages (D through 5):** [docs/architecture/03-staged-delivery-roadmap.md](docs/architecture/03-staged-delivery-roadmap.md)

**Static demo (NOW):** Browse locally with `npx serve demo`, then deploy per [docs/hosting/demo-dns-netlify-setup.md](docs/hosting/demo-dns-netlify-setup.md)

Delivery stance: value first, fast - custom monolith only; Odoo/ERP deferred until a later wave gate.

## Learning path

1. [What is a CRM?](docs/learning/01-what-is-a-crm.md)
2. [REST APIs](docs/learning/02-rest-apis-explained.md)
3. [i18n basics](docs/learning/03-i18n-basics.md)
4. [Hosting costs](docs/learning/04-hosting-costs-explained.md)
5. [Frontend vs backend](docs/learning/05-frontend-vs-backend.md)
6. [Databases](docs/learning/06-databases-and-data-modeling.md)
7. [Privacy (LFPDPPP)](docs/learning/07-privacy-and-your-data.md)

## MVP reference

Functional UX parity with [New Era Cap México - Jerseys](https://www.newera.mx/collections/jerseys). Mirror **patterns only** - never copy branding or copyrighted assets.

## Legal note

Legal templates in `templates/legal/` are **drafts for a Mexican lawyer to review** before publishing.

## GitHub

Local-first. Connect to GitHub when ready (Phase 2).
