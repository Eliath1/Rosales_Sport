---
name: security-hardening
description: >-
  Applies security hardening for auth, input validation, headers, and secrets
  on Netlify and Cloudflare. Use when reviewing security, fixing vulnerabilities,
  or preparing production deployment.
---

# Security Hardening

## Instructions

1. Work through hardening checklist for every release touching auth, uploads, or PII.
2. Enforce HTTPS, secure cookies, CSRF on mutating routes, rate limits on public forms.
3. Secrets only in Netlify env vars - never commit; rotate on leak suspicion.
4. Cloudflare WAF rules for admin and API paths; bot protection on intake forms.
5. Dependency audit: address high/critical before production.

## Key Workflows

### Pre-production security pass

```
- [ ] Auth/session configuration reviewed
- [ ] RBAC on staff CRM routes
- [ ] Input validation on all API endpoints
- [ ] Security headers (CSP, HSTS, X-Frame-Options)
- [ ] Upload restrictions and access control
- [ ] LFPDPPP encryption/at-rest for sensitive fields
```

### Incident response (minimal)

1. Identify exposed data scope
2. Rotate credentials
3. Document in security log; notify per legal framework if breach

## Reference Docs

- [docs/security/hardening-checklist.md](../../../docs/security/hardening-checklist.md)
- [docs/legal/mexico-privacy-framework.md](../../../docs/legal/mexico-privacy-framework.md)
- [docs/legal/lfpdppp-compliance.md](../../../docs/legal/lfpdppp-compliance.md)
- [docs/ops/netlify-cloudflare-deploy.md](../../../docs/ops/netlify-cloudflare-deploy.md)
