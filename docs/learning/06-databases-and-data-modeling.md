# Databases and Data Modeling

> **Learning series:** Doc 06 of 07

## What Is a Database?

A **database** is organized storage for business facts: customers, products, quotes. Our project uses **PostgreSQL** (relational) hosted on **Neon**.

Think of Excel workbooks with strict rules:

- Column types enforced (email is text, price is number)
- Relationships linked (each quote row points to one customer)
- Many users at once without corrupting the file

## Tables = Spreadsheets with Relationships

```
customers          quotes              quote_line_items
─────────────      ─────────────       ──────────────────
id                 id                  id
name               customer_id    ─── quote_id
email              status              product_variant_id
phone              total_cents         quantity
                   valid_until         unit_price_cents
```

One customer -> many quotes -> many line items.

## Why Relational for a Store?

| Need | SQL fit |
|------|---------|
| Quote totals | SUM line items reliably |
| "All quotes for Liga X" | JOIN customer + quote |
| Reports by team sold | GROUP BY product.team |
| Refunds linked to payment | Foreign keys |

NoSQL (MongoDB) shines for unstructured logs - less ideal for money + line items.

## Keys

| Type | Purpose |
|------|---------|
| **Primary key (`id`)** | Unique row identifier (UUID) |
| **Foreign key** | Points to another table's id |
| **Unique index** | e.g., one email per customer |

## Money: Never Use Decimals

Floating point: `0.1 + 0.2 = 0.30000000000000004`

**Store cents as integers:**

```
$1,299.00 MXN -> 129900 cents
```

Display with formatting; math stays exact.

## Status Fields vs Delete

For quotes, use **status** (`draft`, `sent`, `accepted`) instead of deleting rows - history matters for sales follow-up and tax retention.

ARCO cancellation may anonymize rather than hard-delete orders.

## Migrations

When schema changes (add `wholesale_price`), write a **migration** script applied to all environments:

```
dev -> preview -> production
```

Never edit production tables by hand without a migration file.

## ORM Layer

**Drizzle** or **Prisma** maps TypeScript objects ↔ SQL tables so developers write:

```typescript
await db.insert(quotes).values({ customerId, totalCents: 129900 });
```

instead of raw SQL strings everywhere.

## Sample Query (Conceptual)

"Open quotes over $10,000 MXN for wholesale customers":

```sql
SELECT q.id, c.name, q.total_cents
FROM quotes q
JOIN customers c ON c.id = q.customer_id
WHERE q.status = 'sent'
  AND c.customer_type = 'wholesale'
  AND q.total_cents > 1000000;
```

## Backups & Neon

Neon provides automated backups on paid tiers. Test restore once before launch.

## Full Schema Guide

[../data/schema-design-guide.md](../data/schema-design-guide.md)

## Next Reads

- [07-privacy-and-your-data.md](./07-privacy-and-your-data.md)
- [../legal/data-inventory.md](../legal/data-inventory.md)
