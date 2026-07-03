# ADR-002: Modular Monolith Architecture

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

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
