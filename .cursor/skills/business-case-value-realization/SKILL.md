---
name: business-case-value-realization
description: >-
  Builds a business case combining one-time dev cost and recurring
  infra-only maintenance cost, with ROI hooks, payback estimate, and a
  post-launch value-realization tracker that gates further investment on
  demand signals rather than sunk cost. Use when proposing a new wave, or
  reporting results after a stage ships.
---

# Business Case & Value Realization

## Instructions

1. Never blend one-time dev cost and recurring infra maintenance cost into a single number - present them as two clearly labeled figures, sourced from `docs/business/development-cost-phases.md` and the `infra-cost-worksheet` output respectively.
2. Anchor the investment ask to the stage that `architecture-viability-auditor` already verified as feasible - fund what's needed now, not a speculative future stage.
3. Express expected value using the ROI hooks already defined in `development-cost-phases.md` (hours saved, errors avoided) plus any GMV/online-revenue targets for the stage.
4. Make the next wave's funding explicitly conditional on a stop-gate signal from `docs/business/hybrid-mvap-paths.md` - not on this business case's optimism.
5. After launch, revisit the value-realization tracker against the stage's exit criteria in `docs/architecture/03-staged-delivery-roadmap.md`; recommend continue/hold/pivot from actuals only.

## Key Workflows

### Business case template

```
# Business Case: <Stage/Wave name>

## Problem & current cost of inaction

## Investment ask
- One-time dev: $X MXN (cite development-cost-phases.md phase)
- Recurring infra (maintenance only): $Y MXN/mo (cite infra-cost-worksheet)

## Expected value / ROI hooks

## Payback estimate

## Demand-driven gate for next investment
(cite the specific stop-gate or exit-criteria signal that must be observed first)

## Risks / assumptions
```

### Value realization tracker (post-launch)

```
| Stage exit metric | Target | Actual | Verdict (continue/hold/pivot) |
|---|---|---|---|
```

### Payback estimate pattern

```
Payback (months) = One-time dev cost / (Monthly value hook - Monthly infra maintenance cost)
```

Use the same monthly value figure the client agreed on in `development-cost-phases.md`'s ROI Hooks section; state the assumption plainly if the client hasn't validated it yet.

## Reference Docs

- [docs/business/development-cost-phases.md](../../../docs/business/development-cost-phases.md)
- [docs/business/hybrid-mvap-paths.md](../../../docs/business/hybrid-mvap-paths.md)
- [docs/business/client-pricing-models.md](../../../docs/business/client-pricing-models.md)
- [docs/architecture/03-staged-delivery-roadmap.md](../../../docs/architecture/03-staged-delivery-roadmap.md)
- [docs/hosting/infrastructure-cost-tiers.md](../../../docs/hosting/infrastructure-cost-tiers.md)
