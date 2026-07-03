# API Design Standards

> **Base URL:** `https://crm.mitiendabeisbol.mx/api` (production)  
> **Format:** JSON request/response bodies; UTF-8; `Content-Type: application/json`

## Conventions

### URLs

- **Plural nouns:** `/api/customers`, `/api/quotes`
- **Nested resources sparingly:** `/api/quotes/:id/line-items` OK; avoid depth > 2
- **Actions as sub-resources:** `POST /api/quotes/:id/send` (not `/sendQuote`)
- **Versioning:** Prefix when breaking changes needed: `/api/v1/...` (introduce at Wave One)

### HTTP Methods

| Method | Use |
|--------|-----|
| GET | Read; idempotent |
| POST | Create or non-idempotent action |
| PATCH | Partial update |
| PUT | Full replace (rare) |
| DELETE | Remove (soft delete preferred for customers) |

### Status Codes

| Code | When |
|------|------|
| 200 | Success with body |
| 201 | Created |
| 204 | Success no body |
| 400 | Validation error |
| 401 | Not authenticated |
| 403 | Authenticated but forbidden |
| 404 | Resource not found |
| 409 | Conflict (duplicate email) |
| 422 | Semantic error (quote already sent) |
| 429 | Rate limited |
| 500 | Server error (generic message) |

## Response Envelope

**Success:**

```json
{
  "data": { "id": "uuid", "name": "Juan Pérez" },
  "meta": { "requestId": "req_abc123" }
}
```

**List with pagination:**

```json
{
  "data": [ ... ],
  "meta": {
    "page": 1,
    "pageSize": 50,
    "total": 234,
    "requestId": "req_abc123"
  }
}
```

**Error:**

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "El email no es válido",
    "details": [
      { "field": "email", "message": "formato inválido" }
    ]
  },
  "meta": { "requestId": "req_abc123" }
}
```

User-facing messages in **Spanish**; `code` in English SCREAMING_SNAKE for clients/logs.

## Money Fields

Always return:

```json
{
  "total": {
    "amountCents": 129900,
    "currency": "MXN",
    "formatted": "$1,299.00 MXN"
  }
}
```

Never use floats in JSON.

## Dates

ISO 8601 with timezone: `"2026-07-02T15:30:00-06:00"`

Date-only fields: `"2026-07-15"` for `valid_until`

## Authentication

| Context | Method |
|---------|--------|
| Staff admin API | Session cookie `HttpOnly` |
| Webhooks | Provider signature header |
| Public catalog (W1) | None for read; rate limit |
| Future mobile | Bearer JWT |

## Idempotency

For `POST` payment and send operations:

```
Idempotency-Key: <uuid client-generated>
```

Server stores key 24h; replay returns same response.

## Filtering & Sorting

```
GET /api/quotes?status=sent&sort=-created_at&page=2&pageSize=25
```

| Param | Example |
|-------|---------|
| `status` | Enum match |
| `q` | Full-text search (customers) |
| `sort` | `-created_at` desc |

## OpenAPI

Maintain spec from template: [../../templates/api/openapi-template.yaml](../../templates/api/openapi-template.yaml)

Generate types for frontend where possible.

## Security

- Validate all inputs server-side
- Never expose `password_hash`, internal notes in public endpoints
- Rate limit unauthenticated routes
- CORS: allow storefront origin only

## Module Ownership

| Prefix | Module |
|--------|--------|
| `/api/customers` | customers |
| `/api/products` | catalog |
| `/api/quotes` | quotes |
| `/api/auth` | auth |
| `/api/webhooks/payments` | payments |

## Related

- [../data/schema-design-guide.md](../data/schema-design-guide.md)
- [../architecture/01-module-map.md](../architecture/01-module-map.md)
