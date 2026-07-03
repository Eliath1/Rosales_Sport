---
name: bilingual-content-i18n
description: >-
  Implements Spanish (Mexico) and English bilingual content with i18n
  conventions for the baseball store. Use when adding UI copy, emails,
  API messages, or locale routing.
---

# Bilingual Content (i18n)

## Instructions

1. Default locale: `es-MX`; secondary: `en-US` or `en-MX` per project config.
2. All user-visible strings live in message files - no hardcoded Spanish/English in components.
3. Use ICU placeholders for plurals, dates (Mexico timezone), and MXN currency formatting.
4. Email templates maintain parallel es/en versions or single template with locale branch.
5. SEO: hreflang tags for public pages where applicable.

## Key Workflows

### Add new copy

```
- [ ] Add key to messages/es-MX.json and messages/en-US.json
- [ ] Use key in component via useTranslations / getTranslations
- [ ] Verify layout handles longer Spanish strings
- [ ] Update email template if notification copy changed
```

### Locale routing

- Middleware detects locale prefix or cookie preference
- Persist customer locale on Lead/Customer record when known

## Reference Docs

- [docs/learning/03-i18n-basics.md](../../../docs/learning/03-i18n-basics.md)
- [docs/domain/customer-segments-mx.md](../../../docs/domain/customer-segments-mx.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/learning/documentation-standards.md](../../../docs/learning/documentation-standards.md)
