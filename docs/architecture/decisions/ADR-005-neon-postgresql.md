# ADR-005: Neon PostgreSQL

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

## Context

The CRM needs a relational database for customers, quotes, catalog, and audit logs. Serverless Netlify functions require **connection pooling** to avoid exhausting PostgreSQL connections.

## Decision

Use **Neon** (serverless PostgreSQL) as the primary data store, with connection pooling enabled (Neon pooler or Prisma Accelerate if needed).

## Rationale

| Requirement | Neon fit |
|-------------|----------|
| PostgreSQL compatibility | Full SQL, JSON columns for metadata |
| Serverless-friendly | Built-in pooler, scale-to-zero on free tier |
| Branching | DB branches per preview env (optional, Pro) |
| Mexico latency | Choose `aws-us-east-1`; acceptable for admin CRM |
| Cost | Free tier for dev; ~$19/mo launch tier |

## Schema Strategy

- Migrations via Drizzle Kit or Prisma Migrate
- Module table prefixes optional (`quotes.quotes` vs shared `public`)
- Row-level security deferred until multi-tenant (not Wave Zero)

## Alternatives Considered

| Option | Notes |
|--------|-------|
| Supabase Postgres | Good but bundles auth we build ourselves |
| PlanetScale | MySQL; team prefers Postgres JSON & extensions |
| Self-hosted Postgres | Ops burden on small team |
| SQLite | No concurrent admin users at scale |

## Consequences

**Positive:** Managed backups, TLS, pooling, familiar SQL for reports.

**Negative:** Cold start on free tier; plan upgrade before launch traffic.

**Action:** Store `DATABASE_URL` with `?sslmode=require`; never commit credentials.

## Related

- [../../data/schema-design-guide.md](../../data/schema-design-guide.md)
- ADR-001, ADR-003
