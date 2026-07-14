# apps/web - Rosales Sport storefront

Public storefront and customer accounts (`/mi-cuenta/*`). Deploys to
`rosalessport.com`. See [ADR-014](../../docs/architecture/decisions/ADR-014-monorepo-two-apps.md)
for why this is a separate app from `apps/admin`.

## Run locally

```bash
npm install
npm run dev -w apps/web
```

Needs `DATABASE_URL` in `.env` (same Neon project as `apps/admin`, see
`packages/db`). Copy `.env.example` to `.env` and fill in real values for
anything beyond local dev.

## Structure

- `src/app/**` - storefront pages, `/mi-cuenta/*`, checkout, mock payment flow
- `src/lib/customerAuth*.ts` - customer NextAuth instance (own session cookie)
- Business logic lives in `@rs/shared`, the Prisma client in `@rs/db`
