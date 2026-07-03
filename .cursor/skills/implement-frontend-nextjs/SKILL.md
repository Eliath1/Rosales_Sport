---
name: implement-frontend-nextjs
description: >-
  Implements Next.js App Router UI for the baseball store CRM with bilingual
  support and accessible patterns. Use when building pages, forms, dashboards,
  or customer-facing store flows.
---

# Implement Frontend (Next.js)

## Instructions

1. Use App Router conventions: `app/`, Server Components by default, Client Components only when needed.
2. Default locale `es-MX`; English via i18n - never hardcode user-visible strings.
3. Match existing component patterns; prefer composition over one-off styles.
4. Forms for quotes and custom requests must validate client-side and surface API errors clearly.
5. Optimize for Netlify: static where possible, dynamic routes documented.

## Key Workflows

### New page or feature UI

```
- [ ] Read feature spec and API contract
- [ ] Add route under app/ with loading/error boundaries
- [ ] Wire i18n keys (es + en)
- [ ] Implement form validation (Zod + react-hook-form if project uses it)
- [ ] Add analytics events per store-analytics doc
- [ ] Manual a11y check (labels, focus, contrast)
```

### CRM dashboard patterns

- List + detail views for leads, quotes, custom requests
- Status badges aligned with quotation workflow states
- Staff-only routes behind auth middleware

## Reference Docs

- [docs/architecture/tech-stack.md](../../../docs/architecture/tech-stack.md)
- [docs/learning/03-i18n-basics.md](../../../docs/learning/03-i18n-basics.md)
- [docs/domain/user-journeys.md](../../../docs/domain/user-journeys.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
- [docs/business/mexico-pricing-reference.md](../../../docs/business/mexico-pricing-reference.md)
