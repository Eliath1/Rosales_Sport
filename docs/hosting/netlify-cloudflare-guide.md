# Netlify + Cloudflare Setup Guide

> **Goal:** Production-ready hosting with edge security for the Mexico baseball store CRM.
> **Status: target state for Stage 0+, not applied yet.** The live site today is the Stage D static demo (`demo/`), deployed via plain Netlify drag-and-drop zip upload - no GitHub CI, no Cloudflare, no Next.js runtime, no Neon, no Resend. Follow [demo-dns-netlify-setup.md](./demo-dns-netlify-setup.md) for how the demo is actually hosted today. Use this guide when Stage 0 (`app/`) is ready to deploy.

## Architecture Recap

```
GitHub repo -> Netlify CI -> Deploy
                    ↑
              Cloudflare DNS (proxied)
                    ↑
                 Users (MX + global)
```

## Step 1: Netlify Site

1. Connect GitHub repository to Netlify
2. Configure build:
  - **Build command:** `npm run build`
  - **Publish directory:** `.next` (follow Next.js Netlify adapter docs)
  - **Node version:** 20 (environment variable `NODE_VERSION=20`)
3. Add environment variables:

| Variable | Example | Notes |
|----------|---------|-------|
| `DATABASE_URL` | `postgresql://...neon.tech/...?sslmode=require` | Neon pooler URL for serverless |
| `RESEND_API_KEY` | `re_...` | Production key |
| `SESSION_SECRET` | random 32+ bytes | Rotate if leaked |
| `PAYMENT_PROVIDER` | `mock` / `mercadopago` | Wave Zero: mock |

4. Enable **Deploy Previews** for PRs
5. Set production branch (`main`)

## Step 2: Custom Domain on Netlify

1. Add domain `crm.mitiendabeisbol.mx` (example)
2. Note Netlify DNS target or CNAME instructions
3. Do **not** enable Netlify DNS if using Cloudflare - use CF as DNS authority

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

- [infrastructure-cost-tiers.md](./infrastructure-cost-tiers.md)
- [../architecture/decisions/ADR-003-netlify-hosting.md](../architecture/decisions/ADR-003-netlify-hosting.md)
- [../architecture/decisions/ADR-004-cloudflare-security.md](../architecture/decisions/ADR-004-cloudflare-security.md)
