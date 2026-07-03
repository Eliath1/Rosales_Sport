---
name: verify-usage-e2e
description: >-
  Verifies end-to-end user flows with Playwright or documented manual scripts
  for quotes, CRM, and store journeys. Use when validating features before
  release or reproducing reported bugs.
---

# Verify Usage (E2E)

## Instructions

1. Follow the e2e playbook scenarios - prioritize Wave 0: quote request -> staff review -> email follow-up.
2. Test both `es-MX` and `en-US` locales for customer-facing flows.
3. Use staging URLs on Netlify; never run destructive tests against production.
4. Capture screenshots or traces on failure for bug reports.
5. Map each test to feature spec acceptance criteria.

## Key Workflows

### Core E2E scenarios

```
- [ ] Customer submits custom request (bilingual form)
- [ ] Staff creates quote from request
- [ ] Quote status transition (draft -> sent -> accepted)
- [ ] CRM lead appears with correct attribution
- [ ] Analytics event fired (verify in dashboard or logs)
```

### Bug reproduction

1. Identify user role and locale
2. Reproduce minimal steps from playbook
3. Compare API responses to OpenAPI contract
4. File issue with trace, env, and data snapshot (redact PII)

## Reference Docs

- [docs/testing/e2e-playbook.md](../../../docs/testing/e2e-playbook.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/learning/03-i18n-basics.md](../../../docs/learning/03-i18n-basics.md)
