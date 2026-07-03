# Security Review Report

| Field | Value |
|-------|-------|
| **Scope** | PR # / Release / Feature name |
| **Reviewer** | |
| **Date** | YYYY-MM-DD |
| **Threat model ref** | [docs/security/threat-model.md](../../docs/security/threat-model.md) |
| **Wave** | Zero / One |

## Executive Summary

| Risk rating | ☐ Low ☐ Medium ☐ High ☐ Critical |
|-------------|----------------------------------|
| **Ship recommendation** | ☐ Ship ☐ Ship with mitigations ☐ Do not ship |

Brief summary of security posture of the change.

---

## Scope of Review

**In scope:**

- 

**Out of scope:**

- Third-party penetration test
- Infrastructure config drift (unless changed)

---

## STRIDE Quick Assessment

| Category | Applicable? | Finding summary |
|----------|-------------|-----------------|
| **S**poofing | | |
| **T**ampering | | |
| **R**epudiation | | |
| **I**nformation disclosure | | |
| **D**enial of service | | |
| **E**levation of privilege | | |

---

## Checklist (from security-checklist.md)

### Authentication & Sessions

- [ ] Session cookies secure flags
- [ ] Password handling unchanged or improved
- [ ] Rate limiting on auth endpoints

### Authorization

- [ ] Role checks on admin routes
- [ ] No IDOR on customer/quote/order IDs

### Input & Output

- [ ] SQL injection prevented (parameterized)
- [ ] XSS prevented in user content -> PDF/email
- [ ] SSRF not introduced in URL fetchers

### Secrets & Config

- [ ] No credentials in code/git
- [ ] Env vars documented

### Payments (if applicable)

- [ ] Webhook signature verification
- [ ] Idempotent webhook handling
- [ ] Server-side amount validation
- [ ] PCI scope minimized

### Privacy

- [ ] PII logging minimized
- [ ] ARCO-related flows intact

---

## Findings

| ID | Severity | CWE/OWASP ref | Description | Remediation | Status |
|----|----------|---------------|-------------|-------------|--------|
| SEC-1 | Critical/High/Med/Low/Info | | | | Open/Fixed/Waived |

---

## Dependency Review

| Package | Version change | Known CVEs | Action |
|---------|----------------|------------|--------|
| | | | |

`npm audit` result: ☐ Clean ☐ Accepted risk (document)

---

## Waivers (if any)

| Finding ID | Business justification | Approved by | Expiry |
|------------|------------------------|-------------|--------|
| | | | |

---

## Recommended Follow-Ups

- [ ] Update threat model diagram
- [ ] Add regression test for finding SEC-X
- [ ] Schedule Cloudflare rule change

---

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Security reviewer | | |
| Tech lead | | |

---

**Related:**

- [docs/security/security-checklist.md](../../docs/security/security-checklist.md)
- [code-review-report-template.md](./code-review-report-template.md)
