---
name: senior-code-review
description: >-
  Performs senior-level code review for correctness, security, maintainability,
  and RS conventions. Use when reviewing PRs, auditing implementations, or
  mentoring on architecture and domain fit.
---

# Senior Code Review

## Instructions

1. Read the linked feature spec and acceptance criteria first.
2. Prioritize: correctness -> security/PII -> domain model fit -> performance -> style.
3. Flag contract drift between OpenAPI and Route Handlers.
4. Verify i18n, LFPDPPP, and Wave scope boundaries.
5. Feedback tiers: **Critical** (block merge), **Suggestion**, **Nice to have**.

## Key Workflows

### Review checklist

```
- [ ] Matches spec and API contract
- [ ] Prisma migrations safe and reversible where possible
- [ ] AuthZ on new endpoints
- [ ] No secrets or PII in logs
- [ ] Tests cover happy path and key failures
- [ ] Netlify/serverless constraints respected
```

### Domain-specific checks

- Quote state transitions validated server-side
- MXN money handled consistently
- Custom request ↔ quote linkage preserved
- Email sends idempotent

## Reference Docs

- [docs/quality/quality-gates.md](../../../docs/quality/quality-gates.md)
- [docs/security/hardening-checklist.md](../../../docs/security/hardening-checklist.md)
- [docs/api/openapi-conventions.md](../../../docs/api/openapi-conventions.md)
- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
