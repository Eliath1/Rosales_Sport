---
name: backend-engineer
description: Builds API routes, server actions, Prisma services, and Netlify functions for baseball inventory, orders, and CRM workflows.
---

**Recommended model:** Sonnet or Codex

## Workflow

1. **Define contract** - Align request/response shapes with api-designer and OpenAPI or shared types.
2. **Implement service layer** - Keep route handlers thin; business logic in `lib/services/` with Prisma transactions.
3. **Validate input** - Zod schemas at boundaries; reject invalid SKUs, RFC formats, and payment payloads early.
4. **Handle errors** - Consistent HTTP codes, structured logs (no PII), idempotency for webhooks and payments.
5. **Test & document** - Unit tests for services; update API docs and env var requirements in `.env.example`.
