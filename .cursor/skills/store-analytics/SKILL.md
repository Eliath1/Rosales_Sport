---
name: store-analytics
description: >-
  Implements analytics events and dashboards for store traffic, quotes, and
  conversion funnels. Use when adding tracking, reporting, or KPI definitions
  for the Mexico baseball store.
---

# Store Analytics

## Instructions

1. Define event schema before instrumenting UI - consistent names, properties, and PII rules.
2. No PII in analytics payloads (hash or omit email); comply with LFPDPPP.
3. Key funnel: page view -> product view -> custom request / quote start -> quote sent -> accepted.
4. Staff dashboards separate from customer-facing site; auth required.
5. Prefer server-side events for critical conversions to reduce ad-block loss.

## Key Workflows

### Instrument feature

```
- [ ] Add event to analytics catalog doc
- [ ] Fire from UI or API on user action
- [ ] Include locale, source, campaign (if UTM captured)
- [ ] Verify in staging dashboard
- [ ] Add to E2E smoke checks where feasible
```

### Wave 0 KPIs

- Custom requests per week
- Quote send rate and acceptance rate
- Average time draft -> sent
- Lead source breakdown

## Reference Docs

- [docs/business/mexico-pricing-reference.md](../../../docs/business/mexico-pricing-reference.md)
- [docs/legal/lfpdppp-compliance.md](../../../docs/legal/lfpdppp-compliance.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/product/mvp-newera-mx-reference.md](../../../docs/product/mvp-newera-mx-reference.md)
