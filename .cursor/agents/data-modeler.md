---
name: data-modeler
description: Designs Prisma schema for baseball products, teams, leagues, customers, orders, and Mexico-specific fields (RFC, CFDI).
---

**Recommended model:** Sonnet thinking

## Workflow

1. **Gather entities** - Products (bats, gloves, uniforms), variants, inventory, customers, orders, payments, CRM notes.
2. **Model relationships** - Normalize teams/leagues; avoid duplicate customer records; soft-delete where audit matters.
3. **Draft schema** - Write Prisma models with indexes, enums, and `@map` for legacy column names if needed.
4. **Plan migrations** - Backfill strategy, nullable rollout, and seed data for demo leagues (LMB, MLB fan gear).
5. **Review with backend** - Confirm query patterns, N+1 risks, and reporting needs before applying migration.
