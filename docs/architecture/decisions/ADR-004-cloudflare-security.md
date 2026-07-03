# ADR-004: Cloudflare Edge Security

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

## Context

A Mexico e-commerce/CRM site faces bot traffic, credential stuffing, and DDoS. Netlify provides origin hosting but limited WAF on lower tiers. Customer PII and future payments require defense in depth.

## Decision

Place **Cloudflare** in front of Netlify as DNS proxy, TLS termination at edge, and security layer (WAF rules, rate limiting, bot management on paid tier when needed).

## Architecture

```
User -> Cloudflare (DNS + WAF + CDN) -> Netlify (origin) -> Neon DB
```

## Required Controls (Wave Zero)

| Control | Implementation |
|---------|----------------|
| HTTPS only | Full (strict) SSL mode |
| HSTS | Enable after stable deploy |
| Rate limit login | `/api/auth/*` - 10 req/min/IP |
| Security headers | CSP, X-Frame-Options via Cloudflare or Next.js |
| Geo block (optional) | Not default; Mexico + US for diaspora fans |

## Wave One Additions

- OWASP Core Rule Set (managed WAF)
- Bot Fight Mode on checkout paths
- Turnstile CAPTCHA on public quote request forms

## Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| Netlify-only | WAF/rate limits weaker on starter |
| AWS CloudFront + WAF | Overkill cost/complexity for MVP |
| No CDN | Slower asset delivery to Monterrey/CDMX |

## Consequences

**Positive:** Centralized DNS, DDoS protection, cache static jersey images.

**Negative:** Extra DNS step; debug harder when caching misconfigured.

**Runbook:** Document "orange cloud" proxy settings in [../../hosting/netlify-cloudflare-guide.md](../../hosting/netlify-cloudflare-guide.md).

## Related

- ADR-003 (Netlify)
- [../../security/threat-model.md](../../security/threat-model.md)
