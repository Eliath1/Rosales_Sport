# Security Checklist - Pre-Launch & Ongoing

> Use this checklist before Wave Zero internal launch, Wave One public launch, and quarterly thereafter.

## Authentication & Authorization

- [ ] Passwords hashed with bcrypt (cost ≥12) or argon2
- [ ] Session cookies: `HttpOnly`, `Secure`, `SameSite=Lax`
- [ ] Role checks on all `/api/admin/*` routes
- [ ] No default admin credentials in production
- [ ] Password reset tokens single-use, expire ≤1 hour
- [ ] (Wave One) Consider 2FA for admin role

## Transport & Headers

- [ ] HTTPS enforced (Cloudflare + Netlify)
- [ ] HSTS enabled after stable deploy
- [ ] Security headers: `X-Content-Type-Options`, `X-Frame-Options`, CSP baseline
- [ ] No mixed content (HTTP assets on HTTPS pages)

## Input Validation

- [ ] Server-side validation on all API inputs
- [ ] Email/phone format validation
- [ ] Max length on text fields (prevent DoS)
- [ ] Sanitize user HTML in notes before PDF/email render
- [ ] File upload disabled or strictly typed (Wave Zero: no uploads)

## Database

- [ ] `DATABASE_URL` only in Netlify env (not git)
- [ ] TLS required for connections (`sslmode=require`)
- [ ] Least-privilege DB user (no superuser in app)
- [ ] Migrations reviewed in PR
- [ ] Backups enabled (Neon default)

## Secrets Management

- [ ] All API keys in environment variables
- [ ] `.env` in `.gitignore`
- [ ] Rotate keys if ever exposed
- [ ] Separate secrets per environment (dev/staging/prod)

## API Security

- [ ] Rate limiting on `/api/auth/login`
- [ ] Rate limiting on public forms (quote request)
- [ ] CORS restricted to known origins
- [ ] No stack traces in production JSON errors
- [ ] Webhook endpoints verify signatures

## Privacy (LFPDPPP)

- [ ] Aviso de privacidad published
- [ ] Consent captured for marketing
- [ ] Cookie banner if analytics cookies used
- [ ] ARCO contact published
- [ ] Data inventory current

## Dependencies

- [ ] `npm audit` run in CI; critical CVEs addressed
- [ ] Dependabot or Renovate enabled
- [ ] Pin major framework versions

## Logging & Monitoring

- [ ] Logs exclude passwords, tokens, full card data
- [ ] Admin actions on PII export logged
- [ ] Uptime monitor on production URL
- [ ] Alert on payment webhook failures (Wave One)

## Cloudflare

- [ ] Proxy enabled (orange cloud)
- [ ] WAF rules for admin paths
- [ ] Bot fight mode evaluated for checkout
- [ ] DNS CAA records optional hardening

## Incident Response

- [ ] Contact list for breach (owner, legal, engineering)
- [ ] 72-hour internal response playbook documented
- [ ] Know how to rotate all secrets quickly

## Wave One Additions (payments)

- [ ] PCI scope minimized (hosted fields / redirect)
- [ ] Webhook idempotency tested
- [ ] Payment amounts verified server-side against order
- [ ] OXXO expiry handling tested

## Sign-Off

| Role | Name | Date | Wave |
|------|------|------|------|
| Engineering | | | |
| Client owner | | | |
| Legal (privacy) | | | |

## Related

- [threat-model.md](./threat-model.md)
- [../templates/review/security-review-report-template.md](../../templates/review/security-review-report-template.md)
