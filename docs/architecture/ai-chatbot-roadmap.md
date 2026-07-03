# AI Chatbot Roadmap

> **Decision record:** [ADR-009-ai-chatbot.md](./decisions/ADR-009-ai-chatbot.md)  
> **Principle:** AI assists sales and support - it does not replace human judgment on pricing disputes or wholesale contracts.

## Vision

A bilingual (ES primary, EN optional) assistant embedded in the storefront and admin that helps customers find the right jersey size, checks quote status, and answers FAQs - while escalating to staff for exceptions.

## Phased Rollout

### Phase 0 - Knowledge Base Only (Wave Zero adjacent)

**No LLM in production.** Static FAQ + search over docs.

| Capability | Implementation |
|------------|----------------|
| "¿Cómo saber mi talla?" | Structured FAQ page |
| "¿Cuánto tarda el envío?" | Policy snippets |
| Product discovery | Catalog filters (no chat) |

**Effort:** 1-2 days content + UI widget shell.

### Phase 1 - Constrained Q&A (Wave One)

**LLM with retrieval (RAG), no tools.**

```
User question
    -> Embed query
    -> Retrieve top-k chunks (catalog, policies, glossary)
    -> LLM answer with citations
    -> "Hablar con vendedor" button always visible
```

| Guardrails | Detail |
|------------|--------|
| Scope | Baseball store topics only |
| No pricing promises | "Consulta cotización vigente" |
| PII | Do not ask for CURP, full card numbers |
| Logging | Prompt + response retained 30 days (see ADR-010) |

**Model routing:** See [../ai/model-routing.md](../ai/model-routing.md).

### Phase 2 - Tool-Use Assistant (Wave Two)

LLM can call **read-only** internal APIs:

| Tool | Example |
|------|---------|
| `search_catalog` | "Jersey Yankees talla L azul marino" |
| `get_quote_status` | Requires customer email + quote number token |
| `check_order_tracking` | Post-checkout only |

**Still cannot:** Create quotes, apply discounts, or process payments without human approval.

### Phase 3 - Sales Copilot (Admin)

Internal assistant for staff:

- Draft follow-up emails after quote sent
- Summarize customer history before call
- Suggest upsell (gorra matching jersey) - **suggestion only**

## Architecture Sketch

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│  Chat UI    │────▶│  Chat API    │────▶│ Model Router│
│  (widget)   │     │  /api/chat   │     │ (fast/deep) │
└─────────────┘     └──────┬───────┘     └──────┬──────┘
                           │                     │
                           ▼                     ▼
                    ┌──────────────┐     ┌─────────────┐
                    │  RAG Index   │     │ LLM Provider│
                    │  (embeddings)│     │ (API)       │
                    └──────────────┘     └─────────────┘
```

## Content Sources for RAG

1. Product catalog (name, team, sizes, materials)
2. [baseball-store-glossary.md](../domain/baseball-store-glossary.md)
3. Shipping & return policies (legal-approved)
4. Size guide (measurements in cm)
5. **Excluded:** Wholesale price lists, staff notes, raw customer PII

## Cost Controls

| Lever | Setting |
|-------|---------|
| Rate limit | 20 messages / session / hour |
| Model tier | Fast model for FAQ; deep model on tool failure |
| Cache | Common questions (talla, envío) -> cached responses |
| Max tokens | 1024 output cap |

## Human Handoff Triggers

Escalate to WhatsApp / staff when:

- User mentions "factura", "mayoreo", "crédito"
- Sentiment negative (2+ frustrated messages)
- Tool returns "not found" twice
- User requests human explicitly

## Metrics

| KPI | Phase 1 target |
|-----|----------------|
| Deflection rate | 30% FAQ resolved without staff |
| Hallucination reports | < 2% of sessions |
| Escalation rate | Track; tune prompts if > 40% |
| CSAT (thumb up/down) | > 70% positive |

## Open Questions

- [ ] WhatsApp Business API vs web widget first?
- [ ] Voice (phone) - defer to Phase 4+
- [ ] Fine-tune on store tone vs prompt engineering only?

## Related

- [../learning/07-privacy-and-your-data.md](../learning/07-privacy-and-your-data.md)
- [decisions/ADR-009-ai-chatbot.md](./decisions/ADR-009-ai-chatbot.md)
