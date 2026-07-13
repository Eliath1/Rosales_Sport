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
2. **Stage D (now):** static `demo/` publish; images in `demo/images/`; run `npm run demo:build-check` before deploy.
3. Separate contexts: production, staging, preview (PR deploys).
4. Env vars per context: DATABASE_URL, email keys, analytics - never shared blindly.
5. Prisma: use connection strategy compatible with serverless (pooler/proxy if documented).
6. Purge Cloudflare cache after static asset or catalog image changes.

## Key Workflows

### Stage D demo deploy

```
- [ ] npm run demo:build-check
- [ ] Images present in demo/images/
- [ ] npx netlify deploy --prod --dir=demo (or demo:package zip)
- [ ] Smoke: /, /collections/jerseys, /images/jersey1.webp
```

### Stage 0+ app deploy checklist

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
