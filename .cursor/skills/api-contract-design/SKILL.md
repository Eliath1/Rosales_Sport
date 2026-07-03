---
name: api-contract-design
description: >-
  Designs OpenAPI contracts and request/response schemas for CRM and store
  APIs before implementation. Use when defining new endpoints, versioning
  APIs, or coordinating frontend-backend work.
---

# API Contract Design

## Instructions

1. Contract-first: write OpenAPI YAML/JSON before Route Handlers.
2. Use shared component schemas for pagination, errors, Money (MXN), and localized strings.
3. Version breaking changes; prefer additive fields for incremental waves.
4. Document auth schemes (session cookie, API key for webhooks).
5. Align path names with Next.js route structure under `app/api/`.

## Key Workflows

### New resource contract

```
- [ ] Resource name and CRUD operations
- [ ] Request/response schemas with examples
- [ ] Error codes (400, 401, 403, 404, 409, 422)
- [ ] Idempotency keys for quote creation (if applicable)
- [ ] Review with implement-frontend-nextjs and implement-backend-api
```

### Quote API essentials (Wave 0)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/quotes` | Create draft quote |
| GET | `/api/quotes/{id}` | Fetch with line items |
| PATCH | `/api/quotes/{id}/status` | Workflow transition |

## Reference Docs

- [docs/api/contracts/README.md](../../../docs/api/contracts/README.md)
- [docs/api/openapi-conventions.md](../../../docs/api/openapi-conventions.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/architecture/system-overview.md](../../../docs/architecture/system-overview.md)
