# Privacy and Your Data

> **Learning series:** Doc 07 of 07 - LFPDPPP basics for the project team.

## Why Privacy Matters Here

The CRM stores **datos personales**: names, emails, phones, addresses. Mexican law (**LFPDPPP**) requires businesses to handle this responsibly - not optional for a professional store.

Customers trust you with their info to receive jerseys, not spam or leaks.

## Key Ideas (Simple)

### 1. Tell people what you collect

**Aviso de privacidad** - a public notice explaining:

- Who you are (responsable)
- What data you collect
- Why (cotización, envío, marketing)
- Their rights (ARCO)

Publish **before** any form collects data.

### 2. Collect only what you need

For a quote, you need name + email. You don't need CURP for a fan buying one gorra.

### 3. Consent for marketing

Transactional email (cotización PDF) ≠ marketing newsletter.

Newsletter requires **opt-in checkbox** - not pre-checked.

### 4. ARCO rights

Customers can ask to:

| Right | Acción |
|-------|--------|
| **Acceso** | Ver qué datos tienen |
| **Rectificación** | Corregir email typo |
| **Cancelación** | Borrar cuando proceda |
| **Oposición** | Rechazar marketing |

Respond within **20 business days**.

Procedure: [../legal/arco-procedure.md](../legal/arco-procedure.md)

### 5. Security

- HTTPS everywhere
- Staff passwords hashed
- Limit who exports customer lists
- Use reputable providers (Neon, Resend) with contracts

## Data Flow (Customer View)

```
Formulario -> Servidor seguro -> Base de datos
                ↓
         Email (cotización) - solo lo necesario
```

Payment cards handled by **Mercado Pago** - we don't store full card numbers (reduces PCI risk).

## Cookies & Analytics

If Google Analytics or Meta Pixel:

- Disclose in aviso
- Cookie banner with consent
- See [../../templates/legal/cookie-consent-copy.md](../../templates/legal/cookie-consent-copy.md)

## AI Chat (Future)

When chatbot launches:

- Update aviso to mention AI processing
- Don't send unnecessary PII to LLM
- Short retention on chat logs (30 days)

## Your Role as Team Member

| Do | Don't |
|----|-------|
| Report suspected data leaks | Share customer exports on WhatsApp |
| Use admin login personally | Use weak password `123456` |
| Direct ARCO requests to privacidad@ | Ignore deletion requests |

## Not Legal Advice

Templates and docs educate the team. **A licensed Mexican lawyer** must review public legal text before launch.

## Deep Dives

- [../legal/mexico-privacy-framework.md](../legal/mexico-privacy-framework.md)
- [../architecture/decisions/ADR-010-data-privacy.md](../architecture/decisions/ADR-010-data-privacy.md)
- [../legal/data-retention-policy.md](../legal/data-retention-policy.md)

## Series Complete 

Return to [01-what-is-a-crm.md](./01-what-is-a-crm.md) or explore [../architecture/00-system-context.md](../architecture/00-system-context.md).
