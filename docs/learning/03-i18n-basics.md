# i18n Basics - Internationalization

> **Learning series:** Doc 03 of 07  
> **Our default locale:** Spanish (Mexico) - `es-MX`

## What Is i18n?

**i18n** = **i**nternationalizatio**n** (18 letters between i and n)

It means designing software so **text, numbers, dates, and currency** adapt to a locale without rewriting code.

**L10n** (localization) is the act of translating and tuning for a specific market (Mexico).

## Why It Matters for This Project

| Element | Mexico expectation |
|---------|-------------------|
| Language | Spanish UI; English optional for MLB fan tourists |
| Currency | MXN with `$1,299.00` formatting |
| Dates | `2 de julio de 2026` or `02/07/2026` |
| Phone | +52 format |
| Privacy copy | LFPDPPP aviso in Spanish |

## Strings: Don't Hardcode in Components

**Avoid:**

```tsx
<button>Send Quote</button>
```

**Prefer:**

```tsx
<button>{t('quotes.send')}</button>
```

Translation file `es-MX.json`:

```json
{
  "quotes": {
    "send": "Enviar cotización"
  }
}
```

Libraries: `next-intl`, `react-i18next`, or Next.js built-in patterns.

## Money Formatting

Use `Intl.NumberFormat`:

```javascript
new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN'
}).format(1299);
// "$1,299.00"
```

Store money as **integer cents** in DB; format only for display.

## Dates & Timezones

- Store UTC in database (`TIMESTAMPTZ`)
- Display in `America/Mexico_City`
- Quote validity: "Vigente hasta el 15 de julio de 2026"

## Pluralization

Spanish has different plural rules:

```json
{
  "items": "{count, plural, one {# artículo} other {# artículos}}"
}
```

## RTL / Layout

Not required for Spanish. If adding Arabic later, plan CSS logical properties (`margin-inline`).

## Content vs UI Translation

| Type | Owner |
|------|-------|
| UI labels | Developers + JSON files |
| Product descriptions | Client / catalog admin |
| Legal (aviso) | Lawyer - version controlled |
| Email templates | Bilingual optional; ES primary |

## SEO i18n (Wave One)

```html
<html lang="es-MX">
<link rel="alternate" hreflang="es-MX" href="..." />
```

## Testing Checklist

- [ ] No English leaks in production ES mode
- [ ] MXN displays correctly (not USD)
- [ ] PDF quotes use Spanish labels
- [ ] Error messages from API in Spanish

## Next Reads

- [../domain/baseball-store-glossary.md](../domain/baseball-store-glossary.md)
- [../legal/mexico-privacy-framework.md](../legal/mexico-privacy-framework.md)
