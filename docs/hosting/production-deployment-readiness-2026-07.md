# Production Deployment Readiness - 2026-07-13

> Companion to [Initial Production Deployment plan](../../.cursor/plans/initial_production_deployment_dc2d2745.plan.md) (Track 0 and part of Track B). Tracks what's actually done vs. still manual, so nothing gets assumed twice.
>
> **Update (later in 2026-07):** this log describes the repo as it was on 2026-07-13, when everything below still lived in a single `app/` directory. `app/` has since been split into a monorepo (`apps/web`, `apps/admin`, `packages/db`, `packages/shared`) per [ADR-014](../architecture/decisions/ADR-014-monorepo-two-apps.md) - see [monorepo-netlify-setup.md](./monorepo-netlify-setup.md) for the current deployment checklist. Paths like `app/prisma/seed.ts` below are historical; the equivalent file today is `packages/db/prisma/seed.ts`, and it now also seeds the custom-decoration product catalog.

## What's done (this session, 2026-07-13)

| Item | Status |
|---|---|
| Local repo committed on top of existing history | Done - commit `34c043b`, 486 files, includes `app/`, the completed Stage D demo, and all architecture/legal/business docs |
| `.gitignore` hardened | Done - added `.playwright-mcp/` (browser-automation debug snapshots) and `rosales-sport-repo-*.zip` so neither gets committed by accident |
| Full-repo zip snapshot | Done - `rosales-sport-repo-2026-07-13.zip` at repo root (~176 MB, gitignored, not committed). Manual-upload fallback if pushing via git isn't available from your machine either. |
| `app/prisma/seed.ts` default-password blocker | Fixed - no longer writes a fixed `changeme123` hash. Each run generates a random password per staff account and prints it once to the console, only for accounts it actually creates (re-running against existing accounts leaves their password untouched and prints nothing). See `security-checklist.md`'s "No default admin credentials in production" item. |
| Neon schema migration | Done - ran `prisma migrate deploy` against the live **Rosales Sport** project (`divine-rice-21173127`, `neondb`) using the project's **direct** (non-pooled) connection string. All 4 existing migrations applied (`wave_zero_init`, `p1_orders_variants_testimonials`, `p2_payments`, `p3_customer_accounts`). Verified via `get_database_tables`: `customers`, `products`, `product_variants`, `quotes`, `quote_line_items`, `orders`, `order_line_items`, `payments`, `payment_events`, `testimonials`, `leads`, `users`, `saved_payment_methods`, plus `quote_line_item_customizations`/`order_line_item_customizations` all now exist in `public`. (`neon_auth.*` tables are Neon's own managed-auth feature, unrelated to this app - leave them alone.) |

## What's explicitly NOT done (by your instruction - Netlify untouched)

- No Netlify site created or connected.
- No git push executed from this session (SSH wasn't available in this shell either - same blocker found earlier). **You push or upload manually** - either `git push` (force, since you confirmed the remote's placeholder README/zip commits can be overridden) from a machine with your real GitHub credentials, or upload the zip above as a fallback.
- No Resend account created (needs your dashboard signup).
- No Cloudflare site/DNS changes (needs your dashboard access; no DNS-management MCP tool exists in this workspace).
- No seed data run against the live Neon project yet - only the schema migration ran. Seeding (sample products/customers/staff accounts) is a separate, explicit step - run `npm run db:seed` equivalent from `app/` only when you're ready to create the actual staff logins, since it will print their one-time generated passwords to your terminal.

## Env vars to paste into Netlify once the site exists (never commit these)

| Var | Value / source | Notes |
|---|---|---|
| `DATABASE_URL` | Neon "Rosales Sport" project, **pooled** connection string (has `-pooler` in the hostname) | Use the pooled string for the running app (serverless-friendly). Migrations use the direct string instead - see above; you don't need to run migrations again unless new ones are added. |
| `AUTH_SECRET` | Generate fresh: `openssl rand -base64 32` | Do not reuse the local-dev value. |
| `AUTH_URL` | `https://admin.rosalessport.com` (or your chosen domain/subdomain for staff) | Matches whatever domain the CRM ends up on - confirm against Track C of the deployment plan once the monorepo split lands. |
| `NEXT_PUBLIC_SITE_URL` | `https://rosalessport.com` | Public site URL. |
| `RESEND_API_KEY` | From Resend dashboard, once that account exists | Blocked on the manual Resend signup above. |
| `EMAIL_FROM` | e.g. `cotizaciones@rosalessport.com` | Requires the domain to be verified in Resend (SPF/DKIM/DMARC) first, or emails will be accepted but not delivered. |
| `PAYMENT_PROVIDER` | `mock` | Leave as `mock` until a security-reviewer sign-off happens for real Mercado Pago credentials, per `app/.env.example`. |

## Next manual steps (in order)

1. Push (force) or upload the zip to `github.com/Eliath1/Rosales_Sport` `main`, overwriting the current README/zip-only history.
2. Verify on github.com that `main` now shows the real `demo/`, `app/`, `docs/` tree.
3. Connect Netlify to that GitHub repo when ready (your call, not done here).
4. Run the seed script against Neon when you want real staff logins created, and save the printed one-time passwords somewhere safe (a password manager, not a repo file).
5. Continue the rest of [Initial Production Deployment](../../.cursor/plans/initial_production_deployment_dc2d2745.plan.md) Track B (Resend, Cloudflare) and Track C (gated on the Monorepo Split plan) when you're ready.

## Related

- [Initial Production Deployment plan](../../.cursor/plans/initial_production_deployment_dc2d2745.plan.md)
- [demo-dns-netlify-setup.md](./demo-dns-netlify-setup.md)
- [security-checklist.md](../security/security-checklist.md)
