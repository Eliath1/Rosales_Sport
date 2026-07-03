---
name: inventory-erp-sync
description: >-
  Designs incremental ERP inventory synchronization for product availability
  and SKU mapping. Use when integrating external ERP, webhooks, or stock
  display - not for Wave 0 unless explicitly scoped.
---

# Inventory ERP Sync

## Instructions

1. Post-Wave 0 feature - confirm wave assignment before implementation.
2. ERP is source of truth for on-hand quantity; local cache with TTL and sync timestamps.
3. Map ERP SKU ↔ Prisma ProductVariant via stable `externalErpId`.
4. Handle sync conflicts: ERP wins for quantity; log discrepancies for ops review.
5. Never delete variants on zero stock - mark unavailable.

## Key Workflows

### Sync pipeline

```
- [ ] Scheduled job or webhook receiver
- [ ] Upsert variants and quantities
- [ ] Dead-letter queue for failed rows
- [ ] Admin dashboard: last sync, error count
- [ ] Catalog UI reads cached availability
```

### Initial backfill

1. Export ERP catalog slice (baseball categories)
2. Match or create variants
3. Validate sample SKUs manually before full sync

## Reference Docs

- [docs/data/schema-design-guide.md](../../../docs/data/schema-design-guide.md)
- [docs/domain/reference-site-newera-mx.md](../../../docs/domain/reference-site-newera-mx.md)
- [docs/prisma/schema-conventions.md](../../../docs/prisma/schema-conventions.md)
- [docs/architecture/system-overview.md](../../../docs/architecture/system-overview.md)
