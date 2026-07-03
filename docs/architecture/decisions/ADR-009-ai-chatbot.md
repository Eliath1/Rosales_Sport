# ADR-009: AI Chatbot Approach

| Field | Value |
|-------|-------|
| **Status** | Accepted (phased) |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

## Context

Customers ask repetitive questions (tallas, tiempos de envío, disponibilidad de jersey). Staff spend time on WhatsApp answering FAQs. AI could deflect volume but introduces hallucination, cost, and privacy risks under LFPDPPP.

## Decision

Adopt a **phased AI strategy**:

1. **Phase 0:** Static FAQ (no LLM) - Wave Zero
2. **Phase 1:** RAG-based Q&A with citations - Wave One
3. **Phase 2:** Read-only tool use (catalog search, quote status)
4. **Phase 3:** Admin sales copilot (draft emails, summaries)

**No autonomous pricing or payment actions** without human approval.

## Rationale

- Reduces risk of wrong price quotes on limited-edition jerseys
- RAG grounds answers in approved catalog/policy content
- Phasing controls API cost before traffic exists

See [../ai-chatbot-roadmap.md](../ai-chatbot-roadmap.md) and [../../ai/model-routing.md](../../ai/model-routing.md).

## Model Selection Principles

| Use case | Model tier |
|----------|------------|
| FAQ, size guide | Fast/cheap model |
| Tool orchestration | Capable model with JSON mode |
| Admin copilot | Capable model; no customer PII in prompts unless necessary |

## Privacy Constraints

- Do not send full customer records to LLM; use retrieved snippets only
- Log retention 30 days default (ADR-010)
- Disclose AI use in aviso de privacidad when chat goes live

## Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| Full autonomous agent | Liability on pricing/stock |
| Buy Intercom/Zendesk AI | Cost + less control over Spanish baseball domain |
| No AI ever | Missed deflection opportunity at scale |

## Consequences

**Positive:** Better CX, staff time savings at Phase 2+.

**Negative:** Ongoing prompt tuning, content indexing pipeline, API spend.

**Success metric:** >30% FAQ deflection at Phase 1 with <2% reported wrong answers.

## Related

- ADR-010 (data privacy)
- ADR-008 (buy LLM API vs self-host - buy API for MVP)
