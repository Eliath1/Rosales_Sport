# Build vs Buy Assessment: [Feature / Capability Name]

| Field | Value |
|-------|-------|
| **Assessor** | |
| **Date** | YYYY-MM-DD |
| **Stakeholders** | |
| **Related ADR** | ADR-008 or new ADR-NNN |

## Capability Description

What business need are we evaluating?

Example: *Wholesale liga portal with tier pricing and quote self-service.*

## Strategic Fit

| Question | Score 1-5 | Notes |
|----------|-----------|-------|
| Core differentiator for baseball store? | | |
| Mexico-specific regulation impact? | | |
| Revenue impact in 12 months? | | |
| Integration complexity with existing CRM? | | |

## Options

### Option A: Build Custom

| Dimension | Assessment |
|-----------|------------|
| Est. effort (dev-days) | |
| Est. cost (MXN) | |
| Time to market | |
| Ongoing maintenance | |
| Flexibility | High / Med / Low |
| Risk | |

**Pros:**

-

**Cons:**

-

### Option B: Buy / Subscribe [Vendor Name]

| Dimension | Assessment |
|-----------|------------|
| License/month (MXN) | |
| Implementation cost | |
| Time to market | |
| Vendor lock-in | |
| MX payment / i18n fit | |

**Pros:**

-

**Cons:**

-

### Option C: Hybrid

Describe combination (e.g., Shopify catalog + custom quote API).

---

## Scoring Matrix

| Criterion | Weight | Build | Buy | Hybrid |
|-----------|--------|-------|-----|--------|
| Cost (3 yr TCO) | 25% | | | |
| Time to market | 20% | | | |
| Fit for mayoreo workflow | 25% | | | |
| Maintenance burden | 15% | | | |
| LFPDPPP / data control | 15% | | | |
| **Weighted total** | 100% | | | |

## Recommendation

**Selected option:** Build / Buy / Hybrid

**Rationale (2-3 sentences):**

## Decision Gate

Proceed if:

- [ ] Weighted score ≥ ___ ahead of alternatives
- [ ] Client budget confirmed
- [ ] Legal review complete (if buy involves data transfer)

## Next Steps

- [ ] Create ADR if architectural impact
- [ ] Update build-vs-buy-matrix.md
- [ ] Add to roadmap wave assignment

## Approvals

| Role | Name | Date | Decision |
|------|------|------|----------|
| Client owner | | | |
| Tech lead | | | |

## References

- docs/business/build-vs-buy-matrix.md
- docs/architecture/decisions/ADR-008-build-vs-buy.md
