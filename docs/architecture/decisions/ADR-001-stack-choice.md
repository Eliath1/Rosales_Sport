# ADR-001: Application Stack Choice

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead, client stakeholder |

## Context

We need a stack for a Mexico baseball store CRM that supports:

- Bilingual admin and future storefront (Spanish primary)
- Fast iteration for Wave Zero (quote CRM)
- Hireable talent in Mexico/LATAM
- Deployment on Netlify with serverless-friendly patterns

## Decision

Adopt **TypeScript + Next.js (App Router) + PostgreSQL (Neon)** as the primary stack.

| Layer | Choice |
|-------|--------|
| Language | TypeScript |
| Framework | Next.js 14+ (App Router) |
| UI | React + Tailwind CSS |
| ORM | Drizzle or Prisma (TBD at scaffold) |
| Database | PostgreSQL on Neon |
| Email | Resend |
| Hosting | Netlify |
| Edge security | Cloudflare |

## Rationale

1. **Full-stack in one repo** - API routes and admin UI share types; fewer deployment units for Wave Zero.
2. **TypeScript** - Catches pricing/currency bugs at compile time; strong ecosystem for payment SDKs.
3. **Next.js on Netlify** - Official adapter, good DX, fits modular monolith (ADR-002).
4. **PostgreSQL** - Relational data (quotes, line items, customers) maps naturally; Neon serverless fits Netlify.

## Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| PHP + Laravel | Client team unfamiliar; slower frontend iteration for modern admin UX |
| Separate React SPA + Express | Two deploys, CORS, duplicated auth for MVP scope |
| Supabase as primary backend | Vendor lock-in on auth/realtime we don't need in Wave Zero |
| MongoDB | Quote line items and reporting easier in SQL |

## Consequences

**Positive:** Single codebase, strong typing, large hiring pool, Netlify CI/CD.

**Negative:** Serverless cold starts on heavy PDF generation - may need background job or edge limits tuning.

**Follow-ups:** Pin Next.js and Node LTS versions in repo; document local dev in README.

## Related

- ADR-002 (modular monolith within this stack)
- ADR-003 (Netlify hosting)
- ADR-005 (Neon PostgreSQL)
