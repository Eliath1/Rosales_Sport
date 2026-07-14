# Monorepo Netlify Setup - Two Sites for `apps/web` + `apps/admin`

> **Companion to:** [ADR-014](../architecture/decisions/ADR-014-monorepo-two-apps.md) (why two apps), [demo-dns-netlify-setup.md](./demo-dns-netlify-setup.md) (how the Stage D demo is hosted today, unaffected by this doc), [netlify-cloudflare-guide.md](./netlify-cloudflare-guide.md) (Cloudflare/WAF layer on top of either site).
>
> **Status (2026-07):** manual setup steps below have **not** been run yet. This is the checklist to follow once you're ready to cut Stage 0 over from the demo. No DNS-management MCP tool exists in this workspace - the DNS steps are manual, at your registrar/Cloudflare dashboard.

---

## Why two sites, not one

Per ADR-014, `apps/web` (public storefront) and `apps/admin` (staff CRM) are two separate Next.js apps in one monorepo. They must be **two separate Netlify sites**, not one site with two contexts, because:

- Each site needs its own custom domain (`rosalessport.com` vs `admin.rosalessport.com`).
- Each site needs its own env vars, especially `AUTH_SECRET` (never share this value between the two apps).
- A build failure or outage on one site must never affect the other.

---

## What you need before starting

| Item | Status |
|------|--------|
| Domain `rosalessport.com` purchased, DNS pointed at Netlify | Done |
| Existing Netlify site (`rosalessport` project, currently serving `demo/` via Netlify Drop) | Done - this becomes Site 1 below |
| Repo pushed to GitHub (`Eliath1/Rosales_Sport`) | Your call - see [production-deployment-readiness-2026-07.md](./production-deployment-readiness-2026-07.md) |
| Neon "Rosales Sport" project (shared DB for both apps) | Done |
| Resend account + verified sending domain | Not done - blocks real quote/order emails on both apps |

---

## Site 1 - `apps/web` (public storefront, `rosalessport.com`)

The existing `rosalessport` Netlify project (currently a Netlify Drop deploy of `demo/`) becomes this site **once you're ready to cut over from the demo** - not before. Until then, keep the demo live and either:

- Test `apps/web` on Netlify's own `*.netlify.app` subdomain from a **new**, throwaway Netlify site first (recommended - zero risk to the live demo), or
- Wait until the demo is fully approved and do the cutover directly.

### Steps (when ready to cut over)

1. In Netlify, open the `rosalessport` project -> **Project configuration** -> **Build & deploy**.
2. Connect to GitHub if not already (Git-based deploys, not Netlify Drop) - repo `Eliath1/Rosales_Sport`, branch `main`.
3. Set:

   | Setting | Value |
   |---------|-------|
   | Base directory | `apps/web` |
   | Build command | *(leave as configured in `apps/web/netlify.toml`: `npm run build`)* |
   | Publish directory | `.next` |

   Netlify auto-detects the npm workspaces root `package.json` and installs dependencies from the repo root before running the build from `apps/web`, per the Next.js runtime's monorepo support.
4. Confirm `apps/web/netlify.toml` is being picked up (Netlify reads the `netlify.toml` inside the base directory when one is set).
5. Add environment variables (Site 1 -> **Project configuration** -> **Environment variables**):

   | Var | Value / source |
   |-----|-----------------|
   | `DATABASE_URL` | Neon "Rosales Sport" **pooled** connection string |
   | `AUTH_SECRET` | Fresh value: `openssl rand -base64 32` - do not reuse the value from Site 2 |
   | `AUTH_URL` | `https://rosalessport.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://rosalessport.com` |
   | `NEXT_PUBLIC_ADMIN_URL` | `https://admin.rosalessport.com` (used for the staff-login link in the site header) |
   | `RESEND_API_KEY` | From Resend dashboard |
   | `EMAIL_FROM` | e.g. `cotizaciones@rosalessport.com` |
   | `PAYMENT_PROVIDER` | `mock` until a security-reviewer sign-off on real Mercado Pago credentials |
   | `R2_*` | Cloudflare R2 credentials, if product images are already in R2 |
6. Deploy. Verify `/`, `/products/[slug]`, `/quote`, `/mi-cuenta/login` all render, and `/api/health` returns 200.
7. Domain stays `rosalessport.com` - no DNS change needed, since the domain already points at this Netlify site.

---

## Site 2 - `apps/admin` (staff CRM, `admin.rosalessport.com`)

This is a **brand-new** Netlify site - do not reuse Site 1's project.

### Steps

1. In Netlify, **Add new site** -> **Import an existing project** -> connect GitHub -> same repo `Eliath1/Rosales_Sport`, branch `main`.
2. Set:

   | Setting | Value |
   |---------|-------|
   | Base directory | `apps/admin` |
   | Build command | *(leave as configured in `apps/admin/netlify.toml`: `npm run build`)* |
   | Publish directory | `.next` |
3. Deploy once to get the default `random-name.netlify.app` URL - use this to smoke-test before wiring the custom domain.
4. Add environment variables:

   | Var | Value / source |
   |-----|-----------------|
   | `DATABASE_URL` | Same Neon **pooled** connection string as Site 1 (same database, shared schema) |
   | `AUTH_SECRET` | Fresh value: `openssl rand -base64 32` - a **different** value from Site 1's `AUTH_SECRET` |
   | `AUTH_URL` | `https://admin.rosalessport.com` |
   | `NEXT_PUBLIC_SITE_URL` | `https://rosalessport.com` (used for links back to the public site, if any) |
   | `RESEND_API_KEY` | Same Resend account/key as Site 1 |
   | `EMAIL_FROM` | Same as Site 1 |
5. Site -> **Domain management** -> **Add a domain** -> enter `admin.rosalessport.com`.
6. Netlify shows the DNS record to add (typically a CNAME to this site's `*.netlify.app` hostname, since `admin` is a subdomain, not the apex).

### DNS steps (manual - at your DNS provider, likely Cloudflare given ADR-004)

| Type | Name | Value | Proxy (if Cloudflare) |
|------|------|-------|------------------------|
| CNAME | `admin` | `<site-2-name>.netlify.app` (exact value shown in Netlify's domain management screen) | Proxied (orange cloud), consistent with the apex record for `rosalessport.com` |

1. Add the record at your DNS provider.
2. Wait for propagation (15 minutes to a few hours).
3. Back in Netlify Site 2 -> **Domain management** -> **HTTPS** -> confirm Let's Encrypt certificate issues once DNS resolves.
4. If Cloudflare is proxying this record, set SSL/TLS mode to **Full (strict)** for `admin.rosalessport.com` same as the apex, per [netlify-cloudflare-guide.md](./netlify-cloudflare-guide.md).

### Extra hardening for the CRM subdomain (do this, it's staff-only)

- `apps/admin/netlify.toml` already sends `X-Robots-Tag: noindex, nofollow` - confirm it's present after deploy (check response headers on `admin.rosalessport.com`).
- Consider a Cloudflare Access rule or IP allowlist on `admin.rosalessport.com` if staff work from a small, known set of networks - optional, evaluate against how staff actually work (remote vs office).
- Do not link to `admin.rosalessport.com` from any public page except the single staff-login link in the storefront header (already wired via `NEXT_PUBLIC_ADMIN_URL`).

---

## Keeping the two sites in sync

| Value | Must match across sites? |
|-------|---------------------------|
| `DATABASE_URL` | Yes - same Neon database, same connection string |
| `RESEND_API_KEY`, `EMAIL_FROM` | Yes - same Resend account |
| `AUTH_SECRET` | **No - must differ.** Reusing this value between the two apps weakens the domain-isolation benefit of the split (ADR-014) |
| `NODE_VERSION` | Yes - keep both on the same Node LTS version set in each `netlify.toml` |
| Prisma schema/migrations | Single source of truth in `packages/db/prisma/` - both apps read the same migrations, never duplicate them |

When `packages/db/prisma/schema.prisma` changes, run migrations once (`npm run db:migrate:deploy`) - both sites pick up the new schema on their next deploy since they share the database, no per-site migration step needed.

---

## Rollback plan

If Site 1's cutover from `demo/` to `apps/web` has problems:

1. In Netlify Site 1 -> **Build & deploy**, change base directory back to *(empty)* and publish directory back to `demo/`.
2. Redeploy the last known-good `demo/` commit.
3. `admin.rosalessport.com` (Site 2) is unaffected either way - it was never serving the demo.

---

## Verify before calling Stage 0 "live"

| Check | How |
|-------|-----|
| `rosalessport.com` loads `apps/web`, not the demo | Open `/`, confirm real product data from Neon, not static HTML |
| `admin.rosalessport.com` loads `apps/admin` | Open `/login`, confirm staff login works |
| Staff login link from storefront header goes to the right domain | Click it, lands on `admin.rosalessport.com/login` |
| No `/admin/*` routes exist on `rosalessport.com` | Try `rosalessport.com/admin` - should 404, not redirect into staff pages |
| `/api/health` returns 200 on both domains | `curl https://rosalessport.com/api/health` and the admin equivalent |
| HTTPS valid on both domains | Padlock in browser on both |

---

## Related

- [ADR-014-monorepo-two-apps.md](../architecture/decisions/ADR-014-monorepo-two-apps.md)
- [demo-dns-netlify-setup.md](./demo-dns-netlify-setup.md) - unaffected by this doc, still governs `demo/`
- [netlify-cloudflare-guide.md](./netlify-cloudflare-guide.md) - Cloudflare/WAF/cache config, applies to both sites
- [production-deployment-readiness-2026-07.md](./production-deployment-readiness-2026-07.md) - env vars and what's actually done so far
- [03-staged-delivery-roadmap.md](../architecture/03-staged-delivery-roadmap.md) - Stage 0 deployment topology
