# Model Routing - AI Chat Strategy

> **Scope:** Phase 1+ chatbot; Wave Zero uses static FAQ only.  
> **Decision:** [../architecture/decisions/ADR-009-ai-chatbot.md](../architecture/decisions/ADR-009-ai-chatbot.md)

## Goals

1. **Minimize cost** for high-volume simple questions (tallas, envío)
2. **Maximize accuracy** when tools or nuanced catalog queries needed
3. **Bound latency** - target <3s p95 for customer widget
4. **Privacy** - minimize PII in prompts; log redacted

## Tier Definitions

| Tier | Nickname | Use when | Examples |
|------|----------|----------|----------|
| **T0** | Static | Exact FAQ match | Shipping table, store hours |
| **T1** | Fast | RAG Q&A, no tools | "¿Qué talla es 7 1/4?" |
| **T2** | Capable | Tool calls, multi-step | "¿Tienen jersey Padres L azul?" |
| **T3** | Deep | Admin copilot drafts | Quote follow-up email |

*Specific model names configured in env - swap without code change.*

## Routing Flow

```
Incoming message
      │
      ▼
┌─────────────┐
│ T0 cache/   │── hit ── Return canned answer
│ FAQ match   │
└──────┬──────┘
       │ miss
       ▼
┌─────────────┐
│ Classifier  │── simple ── T1 Fast + RAG
│ (lite model)│
└──────┬──────┘
       │ needs catalog/stock
       ▼
     T2 Capable + tools (read-only)
       │
       │ admin UI flag
       ▼
     T3 Deep (staff only)
```

## Classifier Signals

Route to **T2** if message contains:

- Product names / team names + size
- "disponible", "stock", "cotización #"
- Follow-up after T1 low confidence score

Keep on **T1** if:

- General policy questions
- Size conversion FAQ

## RAG Configuration

| Parameter | Value |
|-----------|-------|
| Chunk size | ~500 tokens |
| Top-k | 4 chunks |
| Sources | Catalog, glossary, policies (no wholesale prices) |
| Citation required | Yes in UI |

Refresh index on catalog webhook or nightly cron.

## Tool Allowlist (Phase 2)

| Tool | Model tier | Auth |
|------|------------|------|
| `search_catalog` | T2 | Public |
| `get_quote_status` | T2 | Email + quote token |
| `get_order_tracking` | T2 | Order token |
| `draft_email` | T3 | Staff session |

**Denied always:** `create_quote`, `apply_discount`, `capture_payment`

## Cost Controls

| Control | Setting |
|---------|---------|
| Max messages/session/hour | 20 |
| Max output tokens | 1024 |
| T1 default | 80% traffic target |
| Cache TTL common Q | 24h |
| Daily budget alert | $5 USD dev, $50 prod |

## Fallback Chain

```
T2 tool error -> retry once -> T3 (if budget) -> escalate human
T1 low confidence -> suggest WhatsApp staff link
Provider outage -> static FAQ only mode (feature flag)
```

## Evaluation

Weekly sample review (20 conversations):

- Grounded in sources?
- Correct Spanish?
- Wrong price mentioned? (critical fail)

Track metrics in [../architecture/ai-chatbot-roadmap.md](../architecture/ai-chatbot-roadmap.md).

## Environment Variables (example)

```
AI_ROUTER_DEFAULT_TIER=fast
AI_ROUTER_ESCALATION_TIER=capable
AI_CHAT_DAILY_BUDGET_USD=50
AI_RAG_INDEX_URL=...
```

## Privacy

- Strip email/phone from user message before logging unless needed for tool
- Retention 30 days - [../legal/data-retention-policy.md](../legal/data-retention-policy.md)
- Disclose AI in aviso when live

## Related

- [../architecture/ai-chatbot-roadmap.md](../architecture/ai-chatbot-roadmap.md)
- [../domain/baseball-store-glossary.md](../domain/baseball-store-glossary.md)
