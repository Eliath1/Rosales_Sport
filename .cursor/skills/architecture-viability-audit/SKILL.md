---
name: architecture-viability-audit
description: >-
  Audits actual repo code against the declared delivery stage, ADRs, and
  module map, then renders a Go/Go-with-conditions/No-go feasibility verdict
  with a leanest-infra-tier recommendation. Use before approving a new stage,
  wave, or infrastructure spend.
---

# Architecture Viability Audit

## Instructions

1. Read `docs/architecture/03-staged-delivery-roadmap.md` first - it defines what "current stage" should look like (runtime, database, routes).
2. Compare against the repo: is `netlify.toml` publishing `demo/` or `app/`? Does `app/prisma/schema.prisma` match the stage's modules? Are the routes in `app/src/app/api/*` consistent with the stage's "Routes added" table?
3. Treat ADRs (`docs/architecture/decisions/ADR-*`) as the source of truth for past decisions - flag contradictions with current code instead of assuming the ADR is stale.
4. Never recommend advancing a stage unless its "Decision gates between stages" row in the roadmap is met.
5. The infra tier recommendation must match the *verified current* stage, not the stage being requested.

## Key Workflows

### Audit checklist

```
- [ ] Confirm current stage matches deployed code (netlify.toml publish dir)
- [ ] Diff schema.prisma vs docs/data/schema-design-guide.md
- [ ] List modules active vs 01-module-map.md
- [ ] Cross-check relevant ADRs still hold
- [ ] Security checklist pass (docs/security/security-checklist.md)
- [ ] Privacy baseline present if forms collect PII (docs/legal/mexico-privacy-framework.md)
- [ ] Identify blockers to next stage's decision gate
```

### Verdict template

```
## Verdict: Go / Go-with-conditions / No-go

- Current stage (verified): 
- Requested next stage: 
- Decision gate cited (03-staged-delivery-roadmap.md): 
- Blocking gaps: 
- Risk register (tech debt, missing tests, unresolved security findings): 
- Recommended infra tier for CURRENT stage (infrastructure-cost-tiers.md): 
- Handoff: infra-cost-strategist for cost worksheet + business case
```

## Reference Docs

- [docs/architecture/03-staged-delivery-roadmap.md](../../../docs/architecture/03-staged-delivery-roadmap.md)
- [docs/architecture/01-module-map.md](../../../docs/architecture/01-module-map.md)
- [docs/architecture/00-system-context.md](../../../docs/architecture/00-system-context.md)
- [docs/architecture/decisions/](../../../docs/architecture/decisions/)
- [docs/security/security-checklist.md](../../../docs/security/security-checklist.md)
- [docs/data/schema-design-guide.md](../../../docs/data/schema-design-guide.md)
