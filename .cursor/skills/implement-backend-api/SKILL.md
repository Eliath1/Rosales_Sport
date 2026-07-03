---
name: implement-backend-api
description: >-
  Implements Next.js Route Handlers and server actions for CRM, quotes, and
  catalog APIs with Prisma persistence. Use when adding or changing backend
  endpoints, webhooks, or server-side business logic.
---

# Implement Backend API

## Instructions

1. Follow OpenAPI contracts in `docs/api/` - implement before diverging; update contract if spec changes.
2. Validate all inputs with shared Zod schemas; return consistent error shapes.
3. Use Prisma transactions for multi-entity writes (quotes + line items + audit).
4. Never expose PII in logs; respect LFPDPPP retention and purpose limits.
5. Design for Netlify serverless: idempotent handlers, connection pooling via Prisma Data Proxy if configured.

## Key Workflows

### New endpoint

```
- [ ] Add path to OpenAPI contract
- [ ] Create route handler under app/api/
- [ ] Shared schema in lib/validators
- [ ] Prisma service layer (no raw SQL unless justified)
- [ ] AuthZ check (role + resource ownership)
- [ ] Integration test or contract test
```

### Wave 0 priorities

- Quote CRUD and status transitions
- Custom request intake
- Email trigger hooks (defer full CRM automation to wave-zero-email-crm skill)

## Reference Docs

- [docs/api/contracts/README.md](../../../docs/api/contracts/README.md)
- [docs/api/openapi-conventions.md](../../../docs/api/openapi-conventions.md)
- [docs/prisma/schema-conventions.md](../../../docs/prisma/schema-conventions.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/legal/lfpdppp-compliance.md](../../../docs/legal/lfpdppp-compliance.md)
