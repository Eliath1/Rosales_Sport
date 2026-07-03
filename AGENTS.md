# Agent Orchestration Guide

How to use the 18 project subagents in `.cursor/agents/` for the baseball-store CRM toolkit.

## Pipeline overview

```
Business Request
  -> build-vs-buy-analyst (optional: vendor vs custom)
  -> pricing-strategist-mexico (budget, client MXN pricing)
  -> privacy-compliance-advisor (before PII forms)
  -> solution-architect (ADRs, modules)
  -> storefront-ux-analyst (New Era MX parity)
  -> domain-analyst-baseball (business rules)
  -> data-modeler + api-designer (schema + contracts)
  -> frontend-engineer + backend-engineer (implementation)
  -> security-reviewer + code-quality-reviewer + i18n-reviewer
  -> validate-quality-gate -> verify-usage-e2e
  -> netlify-cloudflare-deploy
```

Invoke `payments-integration-mexico` when designing payment waves. Invoke `ai-solutions-architect` for Wave 5 chatbot only.

## Agents and recommended models

| Agent | Model | When to use |
|-------|-------|-------------|
| `solution-architect` | Sonnet 5 thinking high | ADRs, system design, module boundaries |
| `frontend-engineer` | Sonnet or Codex | UI, collection pages, cart, admin CRM |
| `backend-engineer` | Sonnet or Codex | API routes, webhooks, email triggers |
| `data-modeler` | Sonnet thinking | Prisma schema, migrations, indexes |
| `api-designer` | Sonnet thinking | REST/OpenAPI, Zod contracts |
| `security-reviewer` | **Opus** thinking | After auth, payments, forms, API changes |
| `code-quality-reviewer` | Sonnet thinking | Post-implementation review |
| `domain-analyst-baseball` | Sonnet thinking | Catalog, quotes, team orders, LMB/MLB rules |
| `i18n-reviewer` | Sonnet | EN/ES copy parity |
| `integration-specialist` | Sonnet thinking | ERP sync, inventory |
| `analytics-designer` | Sonnet thinking | KPIs, event taxonomy |
| `learner-documenter` | Sonnet | TSDoc, module READMEs for learning |
| `pricing-strategist-mexico` | Sonnet thinking | MXN proposals, infra costs, funding |
| `payments-integration-mexico` | Sonnet; **Opus** for PCI | Payment waves, webhooks |
| `build-vs-buy-analyst` | Sonnet thinking | Tiendanube vs custom TCO |
| `storefront-ux-analyst` | Sonnet thinking | New Era MX reference parity |
| `ai-solutions-architect` | Sonnet 5 thinking high | Chatbot, RAG (Wave 5) |
| `privacy-compliance-advisor` | Sonnet thinking | LFPDPPP, aviso de privacidad, ARCO |

Full routing: [docs/ai/model-routing.md](docs/ai/model-routing.md)

## Quality gates (required artifacts)

| Gate | Agent + Skill | Artifact |
|------|---------------|----------|
| MVAP chosen | `build-vs-buy-analyst` | Build-vs-buy matrix |
| Privacy approved | `privacy-compliance-advisor` | Aviso draft + data inventory |
| Architecture approved | `solution-architect` | ADR + diagram |
| Storefront parity | `storefront-ux-analyst` | MVP checklist vs New Era |
| Schema approved | `data-modeler` | Prisma schema plan |
| API approved | `api-designer` | OpenAPI spec |
| Security reviewed | `security-reviewer` | Threat-model checklist |
| Payment wave | `payments-integration-mexico` | Wave spec + ADR-006 |
| Deploy ready | `netlify-cloudflare-deploy` | Deploy checklist |

## Escalation rules

- Unresolved **security** findings -> re-review with **Opus** (`security-reviewer`)
- **PCI / webhook** payment issues -> Opus sign-off before go-live
- **Legal text** (aviso, términos) -> flag for licensed **abogado** review; agent drafts only

## Documentation style

All docs, templates, rules, skills, and agent outputs follow `.cursor/rules/human-writing-style.mdc`: plain developer prose, no em dashes, section symbols, emoji markers, or decorative Unicode. Use `->` instead of fancy arrows; use `BAD` / `GOOD` in code examples.

## Related skills

See `.cursor/skills/` - 27 skills map to agents above. Invoke by name or let Cursor match from description.

## Example prompts

```
Use privacy-compliance-advisor to draft aviso de privacidad for quote forms.

Use storefront-ux-analyst and mvp-reference-newera-mx to compare our collection page plan to New Era MX.

Use data-modeler to design QuoteRequest and Order entities in Prisma.

Use payments-integration-mexico to plan Wave 1 (Mercado Pago + OXXO).
```
