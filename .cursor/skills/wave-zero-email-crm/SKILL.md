---
name: wave-zero-email-crm
description: >-
  Implements Wave 0 email notifications and lightweight CRM for leads and
  quotes. Use when wiring transactional email, lead tracking, or sales
  follow-up workflows.
---

# Wave Zero Email & CRM

## Instructions

1. Wave 0 scope: transactional email + lead/activity log - no full marketing automation.
2. Use provider webhooks (delivered, bounced, opened) to update CRM activity timeline.
3. Templates in es-MX primary; en-US fallback where customer locale known.
4. Idempotent send: same quote version must not duplicate sends without explicit resend.
5. Store minimal email content; link to app for full quote details.

## Key Workflows

### Email events

| Trigger | Template | CRM activity |
|---------|----------|--------------|
| Custom request submitted | confirmation | Lead created |
| Quote sent | quote-summary | Status -> sent |
| Quote accepted | acceptance-notice | Status -> accepted |

### CRM minimum viable

```
- [ ] Lead list with source (form, email, manual)
- [ ] Activity feed per lead/quote
- [ ] Assignee and next-follow-up date
- [ ] Search by email or team name
```

## Reference Docs

- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/hosting/netlify-cloudflare-guide.md](../../../docs/hosting/netlify-cloudflare-guide.md)
