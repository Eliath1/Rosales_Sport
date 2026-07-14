# apps/admin - Rosales Sport staff CRM

Staff-only CRM: customers, quotes, orders, payments, testimonials, catalog
management. Deploys to `admin.rosalessport.com`, never on the public
storefront domain. See [ADR-014](../../docs/architecture/decisions/ADR-014-monorepo-two-apps.md).

## Run locally

```bash
npm install
npm run dev -w apps/admin
```

Needs `DATABASE_URL` in `.env` (same Neon project as `apps/web`, see
`packages/db`). Copy `.env.example` to `.env` and fill in real values for
anything beyond local dev.

## Structure

- `src/app/**` - dashboard, customers, quotes, orders, payments, products,
  testimonials (no `/admin` URL prefix - the whole app is the CRM)
- `src/lib/auth*.ts` - staff NextAuth instance (own session cookie)
- Business logic lives in `@rs/shared`, the Prisma client in `@rs/db`
