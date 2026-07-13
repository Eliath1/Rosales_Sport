# Feature Spec: Rewards / Credits Program

| Field | Value |
|-------|-------|
| **Author** | Product owner (verbal, captured 2026-07-13) |
| **Status** | **Definicion en progreso, no Wave asignado.** Not started, not scoped, not scheduled. This document exists only so the idea is not lost between sessions. |
| **Wave** | Unassigned |
| **Target release** | Unassigned |
| **ADR links** | None |

## Summary

Idea, in the product owner's own words (2026-07-13): above a certain number of orders, a customer earns "credits" that can be redeemed for "gifts," each gift priced in credits, with customers able to see how to spend the credits they have. The product owner is still defining the rules and explicitly asked that this **not be built yet**.

## Problem Statement

Not yet defined. Presumed motivation is repeat-purchase incentive / loyalty for teams, schools, and distributors who order uniforms regularly, but this has not been confirmed with the product owner.

## Goals

Not yet defined. Do not infer measurable goals from this stub - revisit with the product owner first.

## Non-Goals (for now)

- Building any of this in the demo (`demo/`) or the production app (`app/`).
- Adding a credit-balance field to `Customer`.
- Adding `RewardCatalogItem`, `CreditLedger`, or any related Prisma model.
- Deciding the order-count threshold, the credit-to-MXN conversion rate, or the gift catalog contents.

## Open Questions (all unresolved - confirm with product owner before scoping)

- [ ] What counts as a qualifying "order" for threshold purposes - accepted quote, paid order, delivered order?
- [ ] Is the threshold a running lifetime count, a rolling window (e.g. per year), or per-order-size (e.g. orders of 50+ units)?
- [ ] How many credits per qualifying order/threshold crossed?
- [ ] What is the gift catalog - physical merchandise, discount codes, both? Who curates and prices it in credits?
- [ ] Do credits expire?
- [ ] Is this customer-facing self-service redemption, or does staff redeem on the customer's behalf via the CRM?
- [ ] Does this apply to individual customers, team/distributor accounts, or both differently?
- [ ] Any LFPDPPP/privacy angle if credit history is tied to marketing (see [mexico-data-privacy-compliance skill](../../.cursor/skills/mexico-data-privacy-compliance/SKILL.md) when this is picked up)?

## Functional Requirements

Not yet defined - blocked on the open questions above.

## UX Notes

Not yet defined. Likely touchpoints once scoped: `/mi-cuenta/` (credit balance + redemption), storefront gift catalog, `/admin/customers.html` (staff visibility into a customer's credit balance and history).

## API / Data Changes

None. Explicitly deferred - see Non-Goals.

## Security & Privacy

Not assessed - revisit with [`privacy-compliance-advisor`](../../.cursor/agents/privacy-compliance-advisor.md) once the feature is scoped, since credit history may count as profiling-adjacent data under LFPDPPP.

## Acceptance Criteria

None yet - feature is not scoped.

## Test Plan

None yet - feature is not scoped.

## Rollout

Not applicable - no Wave assigned.

## Related

- Captured during the Demo Completion Tier One session (2026-07-13), scoped out per product owner instruction: "aun no lo construyas eso, apenas lo estoy definiendo."
- [templates/feature/feature-spec-template.md](../../templates/feature/feature-spec-template.md) - template used for this stub.
- When this idea is picked up: route through `domain-analyst-baseball` (business rules) and `data-modeler` (schema) per [AGENTS.md](../../AGENTS.md) orchestration order, before any implementation.
