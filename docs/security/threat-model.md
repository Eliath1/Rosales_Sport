# Threat Model - Baseball Store CRM

> **Method:** Simplified STRIDE for Wave Zero-One scope  
> **Review:** Before each wave launch and after major feature adds

## System Assets

| Asset | Sensitivity |
|-------|-------------|
| Customer PII (DB) | High |
| Staff credentials | High |
| Quote/pricing data | Medium |
| Payment tokens (provider) | High (handled off-system) |
| API keys (Resend, MP, Stripe) | Critical |
| Source code / env secrets | Critical |

## Trust Boundaries

```
[Internet] ──▶ Cloudflare ──▶ Netlify ──▶ Neon
                  │              │
            Untrusted        Semi-trusted
            clients          origin
```

## STRIDE Analysis

### Spoofing

| Threat | Mitigation |
|--------|------------|
| Fake staff login | bcrypt/argon2 passwords; rate limit auth |
| Webhook spoofing | Verify HMAC signatures per provider |
| Customer impersonation on ARCO | Multi-factor identity verification |

### Tampering

| Threat | Mitigation |
|--------|------------|
| Quote amount modified in transit | HTTPS only; server-side price recalc |
| Client-side price override | Never trust browser totals |
| SQL injection | Parameterized queries via ORM |

### Repudiation

| Threat | Mitigation |
|--------|------------|
| Staff denies sending quote | Audit log: `quote.sent` with user_id |
| Customer denies order | Email confirmation + payment provider receipt |

### Information Disclosure

| Threat | Mitigation |
|--------|------------|
| IDOR on `/api/quotes/:id` | AuthZ check; UUID not guessable |
| Verbose error messages | Generic 500 in production |
| DB backup exposure | Neon encryption; restrict console access |
| Log PII leakage | Structured logging with redaction |

### Denial of Service

| Threat | Mitigation |
|--------|------------|
| Login flood | Cloudflare rate limit |
| PDF generation abuse | Auth required; per-user quota |
| Expensive search | Pagination + query timeouts |

### Elevation of Privilege

| Threat | Mitigation |
|--------|------------|
| Sales -> admin | Role checks on every admin route |
| JWT/session fixation | Secure cookies; rotate session on login |

## Attack Scenarios (Top 5)

### 1. Credential stuffing on admin

**Impact:** Full CRM access  
**Controls:** CF rate limit, strong passwords, optional 2FA (Wave One)

### 2. Leaked DATABASE_URL in GitHub

**Impact:** Data breach  
**Controls:** Secret scanning, env only in Netlify, pre-commit hooks

### 3. XSS in quote notes rendered in PDF

**Impact:** Session steal if admin views  
**Controls:** Sanitize HTML; escape in PDF template

### 4. Mercado Pago webhook replay

**Impact:** Duplicate order confirmation  
**Controls:** Idempotency on `provider_event_id`

### 5. Insider exports customer list

**Impact:** LFPDPPP violation  
**Controls:** Export audit log; least privilege; DLP policy

## Data Flow Threats

| Flow | Risk | Control |
|------|------|---------|
| Quote email via Resend | Email interception | TLS; no sensitive attachments beyond quote |
| Admin CSV export | USB leak | Encrypt; policy training |
| AI chat (future) | Prompt injection | RAG scope limits; no tool write access |

## Residual Risk Acceptance

| Risk | Accepted until | Owner |
|------|----------------|-------|
| No 2FA Wave Zero | Wave One launch | Admin |
| Manual ARCO process | Automation in Wave Two | Privacy lead |
| Single region DB | Multi-region if uptime SLA required | Engineering |

## Related

- [security-checklist.md](./security-checklist.md)
- [../architecture/decisions/ADR-004-cloudflare-security.md](../architecture/decisions/ADR-004-cloudflare-security.md)
- [../hosting/netlify-cloudflare-guide.md](../hosting/netlify-cloudflare-guide.md)
