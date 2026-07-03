# Schema Design Guide - PostgreSQL (Neon)

> **ORM:** Drizzle or Prisma (choose at scaffold)  
> **Convention:** snake_case table/column names in DB; camelCase in TypeScript via ORM mapping

## Design Principles

1. **Normalize quotes and orders** - Line items in child tables, never JSON blobs for core commerce
2. **Money as integers** - Store `amount_cents BIGINT` + `currency CHAR(3)` default `'MXN'`
3. **Soft delete sparingly** - Prefer status flags; hard delete for ARCO cancellation on non-retained records
4. **Timestamps everywhere** - `created_at`, `updated_at TIMESTAMPTZ DEFAULT now()`
5. **UUID primary keys** - `gen_random_uuid()` for public-facing IDs (no sequential leak)

## Core Entities (Wave Zero)

### customers

```sql
CREATE TABLE customers (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  customer_type TEXT NOT NULL DEFAULT 'retail'
                CHECK (customer_type IN ('retail', 'wholesale', 'equipo')),
  notes         TEXT,
  marketing_consent BOOLEAN NOT NULL DEFAULT false,
  consent_at    TIMESTAMPTZ,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX customers_email_lower_idx ON customers (lower(email));
```

### products & product_variants

```sql
CREATE TABLE products (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku                 TEXT NOT NULL UNIQUE,
  name                TEXT NOT NULL,
  team                TEXT,
  league              TEXT,
  category            TEXT NOT NULL,  -- jersey, gorra, accesorio
  description         TEXT,
  base_price_cents    BIGINT NOT NULL,
  wholesale_price_cents BIGINT,
  active              BOOLEAN NOT NULL DEFAULT true,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE product_variants (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id  UUID NOT NULL REFERENCES products(id),
  size        TEXT NOT NULL,
  color       TEXT,
  stock_hint  INT,  -- manual until POS integration
  UNIQUE (product_id, size, color)
);
```

### quotes

```sql
CREATE TABLE quotes (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id     UUID NOT NULL REFERENCES customers(id),
  status          TEXT NOT NULL DEFAULT 'draft'
                  CHECK (status IN ('draft','sent','accepted','expired','rejected')),
  valid_until     DATE NOT NULL,
  subtotal_cents  BIGINT NOT NULL DEFAULT 0,
  discount_cents  BIGINT NOT NULL DEFAULT 0,
  total_cents     BIGINT NOT NULL DEFAULT 0,
  notes           TEXT,
  sent_at         TIMESTAMPTZ,
  created_by      UUID REFERENCES users(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE quote_line_items (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quote_id            UUID NOT NULL REFERENCES quotes(id) ON DELETE CASCADE,
  product_variant_id  UUID NOT NULL REFERENCES product_variants(id),
  quantity            INT NOT NULL CHECK (quantity > 0),
  unit_price_cents    BIGINT NOT NULL,
  line_total_cents    BIGINT NOT NULL
);
```

### users (staff)

```sql
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role          TEXT NOT NULL DEFAULT 'sales'
                CHECK (role IN ('admin', 'sales', 'readonly')),
  active        BOOLEAN NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Wave One Additions

### orders & payments

```sql
CREATE TABLE orders (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id  UUID NOT NULL REFERENCES customers(id),
  quote_id     UUID REFERENCES quotes(id),
  status       TEXT NOT NULL,
  total_cents  BIGINT NOT NULL,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE payments (
  id                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id             UUID NOT NULL REFERENCES orders(id),
  provider               TEXT NOT NULL,
  provider_payment_id  TEXT,
  amount_cents         BIGINT NOT NULL,
  currency             CHAR(3) NOT NULL DEFAULT 'MXN',
  status               TEXT NOT NULL,
  method               TEXT,
  created_at           TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

## Privacy Tables

```sql
CREATE TABLE consents (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id),
  purpose     TEXT NOT NULL,  -- marketing, analytics, ai_chat
  granted     BOOLEAN NOT NULL,
  ip_address  INET,
  user_agent  TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE arco_requests (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id      TEXT NOT NULL UNIQUE,
  request_type   TEXT NOT NULL,
  requester_email TEXT NOT NULL,
  status         TEXT NOT NULL DEFAULT 'open',
  received_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at         TIMESTAMPTZ NOT NULL,
  closed_at      TIMESTAMPTZ
);
```

## Indexing Guidelines

| Query pattern | Index |
|---------------|-------|
| Quotes by customer | `quotes(customer_id)` |
| Quotes by status + date | `quotes(status, created_at DESC)` |
| Product search by team | `products(team) WHERE active` |
| Payment webhook lookup | `payments(provider, provider_payment_id)` UNIQUE |

## Migration Rules

1. One migration per logical change
2. Never edit applied migrations - add new one
3. Seed dev data separately (`/seeds/dev.sql`)
4. Review destructive migrations in PR

## Anti-Patterns

| Don't | Do instead |
|-------|------------|
| `FLOAT` for prices | `BIGINT` cents |
| Store PDF binary in DB | S3/Netlify blob or generate on fly |
| Eager load all quotes | Paginate `LIMIT 50` |
| PII in `application_logs` | Log IDs only |

## Related

- [../architecture/decisions/ADR-005-neon-postgresql.md](../architecture/decisions/ADR-005-neon-postgresql.md)
- [../legal/data-inventory.md](../legal/data-inventory.md)
