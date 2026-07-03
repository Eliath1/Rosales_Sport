---
name: define-architecture
description: >-
  Defines system architecture, boundaries, and deployment topology for the
  Mexico baseball store CRM. Use when designing new modules, reviewing tech
  decisions, or planning Wave 0 through incremental feature waves.
---

# Define Architecture

## Instructions

1. Read existing architecture docs before proposing changes.
2. Align with stack: Next.js App Router, Prisma, Netlify (app), Cloudflare (CDN/DNS/WAF).
3. Document decisions as ADRs when trade-offs affect multiple teams or waves.
4. Keep Wave 0 scope minimal: quote, email, CRM - defer ERP sync and payments until later waves.

## Key Workflows

### New module design

```
- [ ] Identify domain boundary (CRM, catalog, quotes, inventory)
- [ ] Map to API routes and Prisma models
- [ ] Define auth/session boundary (staff vs customer)
- [ ] Note Netlify serverless constraints (cold starts, timeouts)
- [ ] Update system overview and deployment topology docs
```

### Architecture review checklist

- Separation of concerns: UI, API, data, integrations
- Mexico-specific concerns: Spanish default, MXN, LFPDPPP data flows
- Incremental delivery: each wave shippable without blocking the next
- Observability: logging, error boundaries, analytics hooks

## Reference Docs

- [docs/architecture/03-staged-delivery-roadmap.md](../../../docs/architecture/03-staged-delivery-roadmap.md) - **All stages D through 5**
- [docs/architecture/02-website-architecture-plan.md](../../../docs/architecture/02-website-architecture-plan.md) - **Master website plan**
- [docs/architecture/00-system-context.md](../../../docs/architecture/00-system-context.md)
- [docs/architecture/01-module-map.md](../../../docs/architecture/01-module-map.md)
- [docs/hosting/netlify-cloudflare-guide.md](../../../docs/hosting/netlify-cloudflare-guide.md)
- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
