---
name: data-modeling-prisma
description: >-
  Designs and migrates Prisma schemas for baseball store entities, quotes,
  CRM, and inventory sync. Use when adding models, relations, indexes, or
  database migrations.
---

# Data Modeling (Prisma)

## Instructions

1. Follow schema conventions: naming, IDs, timestamps, soft-delete where required.
2. Model domain terms from glossary - `Quote`, `CustomRequest`, `ProductVariant`, `Customer`, `Lead`.
3. Use enums for workflow states; document transitions in feature docs.
4. Add indexes for list/filter queries (status, createdAt, customerId).
5. Plan migrations incrementally; never break Wave 0 production data without backfill strategy.

## Key Workflows

### Schema change

```
- [ ] Update prisma/schema.prisma
- [ ] Run prisma migrate dev with descriptive name
- [ ] Update seed data if Wave 0 fixtures exist
- [ ] Regenerate client; fix TypeScript usages
- [ ] Document entity in feature spec and API contract
```

### Cross-cutting fields

- `createdAt`, `updatedAt` on all entities
- Audit fields for quote status changes
- Optional `externalErpId` for future inventory sync
- Locale-neutral storage; i18n for display labels only

## Reference Docs

- [docs/prisma/schema-conventions.md](../../../docs/prisma/schema-conventions.md)
- [docs/domain/baseball-store-glossary.md](../../../docs/domain/baseball-store-glossary.md)
- [docs/domain/reference-site-newera-mx.md](../../../docs/domain/reference-site-newera-mx.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/data/schema-design-guide.md](../../../docs/data/schema-design-guide.md)
