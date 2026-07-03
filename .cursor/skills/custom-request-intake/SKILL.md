---
name: custom-request-intake
description: >-
  Builds intake forms and APIs for non-catalog and customization requests
  from teams and retail customers. Use when implementing request forms,
  lead creation, or handoff to quotation workflow.
---

# Custom Request Intake

## Instructions

1. Intake captures: contact info, team/league, product type, quantity, artwork notes, deadline.
2. Create CRM Lead + CustomRequest record atomically on submit.
3. Validate and sanitize uploads; route files to multimedia-asset-management patterns.
4. Bilingual labels and error messages required.
5. Consent checkbox for LFPDPPP before storing personal data.

## Key Workflows

### Public intake flow

```
- [ ] Multi-step or single-page form (per spec)
- [ ] File upload limits and virus scan hook (if configured)
- [ ] POST /api/custom-requests
- [ ] Confirmation email to customer (es default)
- [ ] Staff notification in CRM queue
```

### Staff triage

1. Review request details and attachments
2. Convert to quote (pre-fill line items as TBD)
3. Assign owner and priority

## Reference Docs

- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/architecture/01-module-map.md](../../../docs/architecture/01-module-map.md)
- [docs/legal/lfpdppp-compliance.md](../../../docs/legal/lfpdppp-compliance.md)
- [docs/learning/03-i18n-basics.md](../../../docs/learning/03-i18n-basics.md)
