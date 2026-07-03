---
name: ai-chatbot-incremental
description: >-
  Plans incremental AI chatbot assistance for product questions, quote status,
  and custom request guidance. Use when scoping chat features, RAG over catalog,
  or integrating LLM providers post-Wave 0.
---

# AI Chatbot (Incremental)

## Instructions

1. Chatbot is incremental - not required for Wave 0 MVP unless spec explicitly includes it.
2. Phase 1: FAQ + quote status lookup (authenticated or tokenized); no open-ended ordering.
3. RAG over approved docs and catalog - never invent prices or inventory.
4. Escalate to human (CRM task) when confidence low or customization detected.
5. Log conversations with PII redaction; disclose AI use per Mexico privacy framework.

## Key Workflows

### Incremental rollout

```
Wave 0: none (optional static FAQ page only)
Wave 1: Product FAQ RAG (Spanish primary)
Wave 2: Quote status + handoff to custom request form
Wave 3: Staff copilot (internal only)
```

### Safety checklist

- [ ] System prompt forbids binding price quotes
- [ ] Ground answers in retrieved catalog chunks
- [ ] Rate limit and CAPTCHA on anonymous chat
- [ ] LFPDPPP notice if personal data collected

## Reference Docs

- [docs/architecture/ai-chatbot-roadmap.md](../../../docs/architecture/ai-chatbot-roadmap.md)
- [docs/product/build-vs-buy-mvap.md](../../../docs/product/build-vs-buy-mvap.md)
- [docs/domain/reference-site-newera-mx.md](../../../docs/domain/reference-site-newera-mx.md)
- [docs/legal/mexico-privacy-framework.md](../../../docs/legal/mexico-privacy-framework.md)
- [docs/learning/03-i18n-basics.md](../../../docs/learning/03-i18n-basics.md)
