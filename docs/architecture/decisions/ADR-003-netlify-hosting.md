# ADR-003: Netlify Hosting

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

## Context

The baseball store CRM needs hosting for Next.js (SSR + API routes), preview deployments for client review, and predictable costs for an MVP in Mexico.

## Decision

Deploy the application on **Netlify** with the official Next.js runtime adapter.

## Rationale

1. **Preview URLs per PR** - Client can review cotización UI changes without staging server maintenance.
2. **Free/starter tier** - Sufficient for Wave Zero internal users (see [../../hosting/infrastructure-cost-tiers.md](../../hosting/infrastructure-cost-tiers.md)).
3. **Git-based deploys** - Matches small-team workflow (GitHub -> auto build).
4. **Serverless functions** - API routes scale to zero when store is closed overnight.

## Configuration Notes

| Setting | Recommendation |
|---------|----------------|
| Build command | `npm run build` |
| Node version | 20 LTS (env `NODE_VERSION`) |
| Env vars | `DATABASE_URL`, `RESEND_API_KEY`, secrets in Netlify UI |
| Functions region | Prefer US edge close to Neon (often `us-east`) |

## Alternatives Considered

| Provider | Notes |
|----------|-------|
| Vercel | Excellent Next.js support; comparable cost; Netlify chosen for client familiarity |
| AWS Amplify | Higher setup complexity for small team |
| VPS (DigitalOcean) | Fixed cost but manual SSL, scaling, patching |

## Consequences

**Positive:** Low ops, fast previews, HTTPS by default.

**Negative:** Serverless timeouts (10s default on free) - PDF generation may need optimization or external worker later.

**Pair with:** Cloudflare in front (ADR-004) for WAF and caching static assets.

## Related

- [../../hosting/netlify-cloudflare-guide.md](../../hosting/netlify-cloudflare-guide.md)
- ADR-004 (Cloudflare)
