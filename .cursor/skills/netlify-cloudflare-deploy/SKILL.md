---
name: netlify-cloudflare-deploy
description: >-
  Deploys and configures the Next.js app on Netlify with Cloudflare DNS, CDN,
  and WAF. Use when setting up environments, CI deploy pipelines, or debugging
  production/staging issues.
---

# Netlify & Cloudflare Deploy

## Instructions

1. Netlify hosts the Next.js app; Cloudflare fronts DNS, CDN, and WAF - follow topology doc.
2. Separate contexts: production, staging, preview (PR deploys).
3. Env vars per context: DATABASE_URL, email keys, analytics - never shared blindly.
4. Prisma: use connection strategy compatible with serverless (pooler/proxy if documented).
5. Purge Cloudflare cache after static asset or catalog image changes.

## Key Workflows

### Deploy checklist

```
- [ ] Quality gates pass on branch
- [ ] Migrate DB (staging first, then prod)
- [ ] Netlify build succeeds with Next plugin
- [ ] Smoke test staging URL (quote intake)
- [ ] Cloudflare SSL mode Full (Strict)
- [ ] Verify custom domain and redirects
```

### Rollback

1. Redeploy previous Netlify publish
2. Revert migration only if forward migration is destructive (requires plan)
3. Post incident note in ops doc

## Reference Docs

- [docs/ops/netlify-cloudflare-deploy.md](../../../docs/ops/netlify-cloudflare-deploy.md)
- [docs/hosting/netlify-cloudflare-guide.md](../../../docs/hosting/netlify-cloudflare-guide.md)
- [docs/architecture/tech-stack.md](../../../docs/architecture/tech-stack.md)
- [docs/quality/quality-gates.md](../../../docs/quality/quality-gates.md)
