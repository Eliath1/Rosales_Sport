---
name: infra-cost-worksheet
description: >-
  Calculates recurring infrastructure-only costs (Netlify, Neon, Cloudflare,
  Resend, domain, AI) by stage/tier using a manual fill-in worksheet, isolated
  from dev labor and payment-processing fees. Use when the client asks what
  hosting will cost, or when sizing infra for the next stage.
---

# Infra Cost Worksheet

## Instructions

1. Pull every price from `docs/hosting/infrastructure-cost-tiers.md` - never invent or guess a vendor price. If a price looks stale, flag it for update there instead of overriding it locally.
2. Infra-only scope: hosting, database, CDN/WAF, email delivery, domain, and AI inference if live. Exclude dev retainer/labor (`docs/business/development-cost-phases.md`) and payment-processing fees (% of GMV) - those are separate business costs, not infrastructure maintenance.
3. Always show USD (vendor billing currency) and MXN (client budgeting) side by side, using the documented FX note (~$17-20 MXN/USD - verify current rate before presenting).
4. Tie the tier choice to the stage confirmed by `architecture-viability-auditor` - size for the stage that exists today, not a hoped-for future one.
5. Every upgrade recommendation must cite a measured demand signal (see "When to Upgrade" table below) - no speculative upgrades.
6. Whenever asked for "maintenance cost," report the **Infra maintenance total** row on its own - do not blend it with the dev retainer figure.

## Key Workflows

### Worksheet template

```
Scenario: <Stage D / Wave Zero / Wave One / Growth>

| Line item | Tier selected | USD/mo | MXN/mo (@ FX) | Demand trigger to upgrade |
|---|---|---|---|---|
| Netlify | | | | |
| Neon | | | | |
| Cloudflare | | | | |
| Resend | | | | |
| Domain (amortized) | | | | |
| AI (if live) | | | | |
| **Infra maintenance total** | | | | |
```

### When-to-upgrade signals (reuse, don't reinvent)

| Signal | Action |
|--------|--------|
| Neon CPU alerts | Upgrade Launch -> Scale |
| CF bot traffic on checkout | Cloudflare Pro + Turnstile |
| Build queue delays | Netlify Pro |
| Email bounces spike | Dedicated IP (Resend higher tier) |

### Annualized view

Multiply the monthly infra maintenance total by 12 for board/client annual budgeting. Present it next to, never combined with, the one-time dev cost phase total from `development-cost-phases.md`.

## Reference Docs

- [docs/hosting/infrastructure-cost-tiers.md](../../../docs/hosting/infrastructure-cost-tiers.md)
- [docs/business/development-cost-phases.md](../../../docs/business/development-cost-phases.md)
- [docs/learning/04-hosting-costs-explained.md](../../../docs/learning/04-hosting-costs-explained.md)
