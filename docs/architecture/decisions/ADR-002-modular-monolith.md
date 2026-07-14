# ADR-002: Modular Monolith Architecture

| Field | Value |
|-------|-------|
| **Status** | Accepted, amended by ADR-014 |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

> **Amendment (2026-07, [ADR-014](./ADR-014-monorepo-two-apps.md)):** the modules below still apply - module boundaries and the cross-module rules are unchanged - but "one deployable Next.js application" is no longer accurate for the CRM vs public storefront split. There are now two deployable Next.js apps (`apps/web`, `apps/admin`) in one npm-workspaces monorepo, sharing one Neon database through `packages/db` and shared business logic through `packages/shared`. Read ADR-014 alongside this ADR; it doesn't reverse the modular-monolith decision, it draws the deployment boundary at the `admin` vs public/customer-facing line instead of at "everything in one process."

## Context

Wave Zero is a small team (1-3 developers) building quote CRM + future commerce. We must choose between microservices, a classic layered monolith, or a **modular monolith**.

## Decision

Build a **modular monolith**: one deployable Next.js application with explicit module boundaries (`customers`, `catalog`, `quotes`, etc.) and no direct cross-module database access.

## Rationale

| Factor | Modular monolith wins because |
|--------|-------------------------------|
| Team size | No ops overhead for 5+ services |
| Wave Zero scope | Quotes + catalog fit one transaction boundary |
| Future split | Clean module APIs allow extraction later (e.g., payments worker) |
| Netlify model | Single site + serverless functions map to one repo |

Microservices would add network latency, distributed tracing, and deployment complexity before we have product-market fit.

## Module Rules

1. Each module owns its tables/schema namespace.
2. Cross-module calls go through application services or domain events.
3. Shared `/shared` kernel limited to primitives (Money, Email, Locale).

See [../01-module-map.md](../01-module-map.md).

## Alternatives Considered

| Option | When it would make sense |
|--------|--------------------------|
| Microservices | >10 engineers, independent scaling proof for catalog vs checkout |
| Unstructured monolith | Never - becomes unmaintainable by Wave Two |
| Backend-for-frontend only | Extra layer without benefit at current scale |

## Consequences

**Positive:** Simple deploy, refactor-friendly internal boundaries, easy local dev.

**Negative:** Entire app scales together; must enforce module discipline in code review.

**Mitigation:** ESLint import boundaries (e.g., `eslint-plugin-boundaries`) in CI.

## Related

- ADR-001 (Next.js stack)
- ADR-008 (build vs buy - monolith supports gradual buy-in of SaaS)
- ADR-014 (monorepo split into `apps/web` + `apps/admin` - amends the deployment topology, not the module rules)
