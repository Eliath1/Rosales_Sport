---
name: quotation-workflow
description: >-
  Implements quote lifecycle from draft through sent, negotiation, and
  acceptance for baseball store sales. Use when building quote UI, status
  transitions, or staff approval flows.
---

# Quotation Workflow

## Instructions

1. Enforce valid state machine - reject illegal transitions at API layer.
2. Every transition logs actor, timestamp, and optional note.
3. Sending a quote triggers email notification (wave-zero-email-crm).
4. Expired quotes require explicit renewal - not silent auto-extend.
5. Line items must reference catalog variant or custom-request link.

## Key Workflows

### Quote states (default)

```
draft -> sent -> viewed -> accepted | declined | expired
         ↘ revised (returns to draft)
```

### Implementation checklist

```
- [ ] Prisma Quote + QuoteLineItem + QuoteStatusHistory
- [ ] PATCH /api/quotes/{id}/status with validation
- [ ] Staff UI: edit lines, apply discounts, preview PDF/email
- [ ] Customer view: read-only accepted quote (auth token or magic link)
- [ ] E2E scenario in e2e-playbook
```

## Reference Docs

- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/product/financial-plan-mexico.md](../../../docs/product/financial-plan-mexico.md)
- [docs/api/contracts/README.md](../../../docs/api/contracts/README.md)
