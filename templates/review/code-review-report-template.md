# Code Review Report

| Field | Value |
|-------|-------|
| **PR / Branch** | |
| **Author** | |
| **Reviewer** | |
| **Date** | YYYY-MM-DD |
| **Wave / Feature** | |
| **Scope** | [Brief description - e.g., Quote PDF generation] |

## Summary

| Verdict | ☐ Approve ☐ Approve with comments ☐ Request changes |
|---------|-----------------------------------------------------|

One-paragraph summary of the change and overall quality assessment.

---

## Change Overview

| File / Area | Change type | Risk |
|-------------|-------------|------|
| | Add / Modify / Delete | Low / Med / High |

---

## Checklist

### Correctness

- [ ] Logic matches feature spec / acceptance criteria
- [ ] Edge cases handled (empty cart, expired quote, etc.)
- [ ] MXN money uses integer cents, not floats
- [ ] Dates/timezones handled (`America/Mexico_City`)

### Code Quality

- [ ] Follows module boundaries (no cross-module SQL)
- [ ] No unnecessary abstraction or dead code
- [ ] Naming consistent with codebase conventions
- [ ] Error messages user-facing in Spanish where applicable

### Security

- [ ] AuthZ on new API routes
- [ ] Input validation server-side
- [ ] No secrets or PII in logs
- [ ] IDOR considered on resource IDs

### Privacy (LFPDPPP)

- [ ] New PII fields documented if added
- [ ] Consent flows unchanged or updated appropriately

### Tests

- [ ] Unit/integration tests added or justified N/A
- [ ] Manual test steps documented in PR

### Performance

- [ ] N+1 queries avoided
- [ ] Pagination on list endpoints
- [ ] PDF/generation won't exceed serverless timeout

---

## Findings

| ID | Severity | File:Line | Description | Suggestion |
|----|----------|-----------|-------------|------------|
| CR-1 | Blocker / Major / Minor / Nit | | | |
| CR-2 | | | | |

**Severity guide:**

- **Blocker:** Must fix before merge (security, data loss)
- **Major:** Should fix before merge
- **Minor:** Fix or follow-up ticket
- **Nit:** Optional style preference

---

## Positive Observations

- 

---

## Follow-Up Tasks

- [ ] 

---

## Re-Review

| Round | Date | Verdict |
|-------|------|---------|
| 1 | | |
| 2 | | |

---

**Related:** [security-review-report-template.md](./security-review-report-template.md)
