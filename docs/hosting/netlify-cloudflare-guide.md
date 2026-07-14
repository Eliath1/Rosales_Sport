# Netlify + Cloudflare Setup Guide

> **Goal:** Production-ready hosting with edge security for the Mexico baseball store CRM.
> **Status: target state for Stage 0+, not applied yet.** The live site today is the Stage D static demo (`demo/`), deployed via plain Netlify drag-and-drop zip upload - no GitHub CI, no Cloudflare, no Next.js runtime, no Neon, no Resend. Follow [demo-dns-netlify-setup.md](./demo-dns-netlify-setup.md) for how the demo is actually hosted today. Use this guide's Cloudflare/WAF/cache steps when Stage 0 is ready to deploy - for the actual **two-site** Netlify setup (`apps/web` + `apps/admin`, per [ADR-014](../architecture/decisions/ADR-014-monorepo-two-apps.md)), do Step 1 below via [monorepo-netlify-setup.md](./monorepo-netlify-setup.md) instead, then come back here for Steps 3-7.

## Architecture Recap

```
GitHub repo -> Netlify CI -> Deploy (apps/web site)
            -> Netlify CI -> Deploy (apps/admin site)
                    ↑
              Cloudflare DNS (proxied, both domains)
                    ↑
                 Users (MX + global)
```

Two Netlify sites, one GitHub repo, one Cloudflare zone. See [monorepo-netlify-setup.md](./monorepo-netlify-setup.md) for the full two-site checklist; the summary below is Site 1 (`apps/web`) as an example - repeat with `apps/admin`'s base directory and its own domain for Site 2.

## Step 1: Netlify Site

1. Connect GitHub repository to Netlify
2. Configure build (repeat per app, with the matching base directory - see [monorepo-netlify-setup.md](./monorepo-netlify-setup.md)):
  - **Base directory:** `apps/web` or `apps/admin`
  - **Build command:** `npm run build` (from that app's own `netlify.toml`)
  - **Publish directory:** `.next`
  - **Node version:** 20 (environment variable `NODE_VERSION=20`)
3. Add environment variables (values differ slightly per app - `AUTH_SECRET` and `AUTH_URL` must never be shared between the two sites; see the full table in [monorepo-netlify-setup.md](./monorepo-netlify-setup.md)):

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...neon.tech/...?sslmode=require` | Neon pooler URL for serverless |
| `RESEND_API_KEY` | `re_...` | Production key |
| `SESSION_SECRET` | random 32+ bytes | Rotate if leaked |
| `PAYMENT_PROVIDER` | `mock` / `mercadopago` | Wave Zero: mock |

4. Enable **Deploy Previews** for PRs
5. Set production branch (`main`)

## Step 2: Custom Domain on Netlify

1. Site 1 (`apps/web`): domain is already `rosalessport.com` (apex, DNS already points at Netlify).
2. Site 2 (`apps/admin`): add domain `admin.rosalessport.com`.
3. Note Netlify DNS target or CNAME instructions for each.
4. Do **not** enable Netlify DNS if using Cloudflare - use CF as DNS authority.

## Step 3: Cloudflare DNS

1. Add site to Cloudflare; import DNS records
2. Point root/`www` CNAME to Netlify load balancer hostname
3. Enable **Proxied** (orange cloud) for web records
4. SSL/TLS mode: **Full (strict)**
5. Enable **Always Use HTTPS**
6. Minimum TLS 1.2

## Step 4: Cloudflare Security Rules

### Rate limiting (Free/Pro)

Create rule: URI Path contains `/api/auth` -> 10 requests/minute/IP -> Block

### WAF (Pro recommended for launch)

- OWASP Core Ruleset managed
- Block common SQLi/XSS on `/*`

### Cache

| Path | Cache |
|------|-------|
| `/_next/static/*` | Cache everything, long TTL |
| `/api/*` | Bypass cache |
| `/catalog/*` | Standard cache (Wave One) |

**Warning:** Never cache authenticated admin pages.

## Step 5: Email DNS (Resend)

Add to Cloudflare DNS (often not proxied):

| Type | Name | Value |
|------|------|-------|
| TXT | `@` | SPF include Resend |
| CNAME | `resend._domainkey` | From Resend dashboard |
| TXT | `_dmarc` | `v=DMARC1; p=none; rua=mailto:...` |

Verify domain in Resend before sending quote emails.

## Step 6: Neon Connection for Serverless

Use Neon's **pooled connection string** for Netlify functions to avoid connection exhaustion.

```
postgresql://user:pass@ep-xxx-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require
```

## Step 7: Preview Environments

| Env | Database | Email |
|-----|----------|-------|
| Production | Neon main branch | Resend prod domain |
| Preview | Neon branch or dev DB | Resend test / suppress |
| Local | Docker Neon local or dev branch | Console log |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| 525 SSL handshake | Set CF SSL to Full strict; valid cert on Netlify |
| Redirect loop | Check `www` vs apex redirect rules once |
| Stale admin UI | Purge CF cache or bypass on admin path |
| DB too many connections | Switch to pooler URL |
| Function timeout on PDF | Optimize or move PDF to background job |

## Monitoring

- Netlify analytics (basic)
- Cloudflare security events dashboard
- External uptime (e.g., UptimeRobot -> `/api/health`)

## Related

- [monorepo-netlify-setup.md](./monorepo-netlify-setup.md) - the actual two-site setup checklist
- [infrastructure-cost-tiers.md](./infrastructure-cost-tiers.md)
- [../architecture/decisions/ADR-003-netlify-hosting.md](../architecture/decisions/ADR-003-netlify-hosting.md)
- [../architecture/decisions/ADR-004-cloudflare-security.md](../architecture/decisions/ADR-004-cloudflare-security.md)
- [../architecture/decisions/ADR-014-monorepo-two-apps.md](../architecture/decisions/ADR-014-monorepo-two-apps.md)
