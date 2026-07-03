# Stage D - Static Demo Specification

> **Goal:** Client can click through a believable storefront and CRM shell in under 10 minutes.  
> **Deploy target:** Netlify, publish directory `demo/`  
> **Timeline:** 1-3 days to polish after HTML scaffold

---

## Demo principles

1. **Looks real, behaves fake** - banner on every page states this is a preview.
2. **Bilingual** - Spanish (es-MX) default; English (en) for US market expansion. Toggle ES | EN in header; preference saved in browser.
3. **Quote-first** - no checkout button; primary CTA is custom uniform quote or "Solicitar cotizacion" / "Request a quote".
4. **Original branding** - placeholder store name until client provides logo.
5. **Mobile-first** - client will open the link on their phone.

---

## Placeholder brand

| Field | Demo value |
|-------|------------|
| Store name | RS (client logo) |
| Logo | `demo/assets/rs-logo.png` |
| Colors | Brown `#924628`, Red `#E31B23`, Black `#000000`, White `#FFFFFF` |
| Sample catalog | LMB-style jerseys (names only, no New Era copy) |

---

## Page inventory

### Storefront (public)

| File | URL | Content |
|------|-----|---------|
| `index.html` | `/` | Hero (custom uniforms focus), custom CTA band, featured products |
| `collections/jerseys.html` | `/collections/jerseys.html` | 6 product cards, filter chips by team/liga |
| `products/jersey-padres-local.html` | PDP example 1 | Gallery, sizes, price, quote CTA |
| `products/jersey-mexico-oficial.html` | PDP example 2 | Second SKU for variety |
| `quote/index.html` | `/quote/` | Name, email, phone, product interest, consent |
| `quote/bulk.html` | `/quote/bulk.html` | Equipo name, qty, sizes, logo note |
| `custom/uniform.html` | `/custom/uniform` | **Custom uniform/cap order:** product type, design, qty, size grid, roster (names/numbers), decoration type (embroidery, DTF, TPU, 3D DTF), contact |

### Admin (mock CRM)

| File | URL | Content |
|------|-----|---------|
| `admin/index.html` | `/admin/` | KPI cards, pipeline chart placeholder, recent quotes table |
| `admin/quotes.html` | `/admin/quotes.html` | Sortable static table (draft, enviada, aceptada) |
| `admin/quotes/detail.html` | `/admin/quotes/detail.html` | Customization block (decoration, sizes, roster), line items, totals, send button (toast) |

Admin has **no auth** in demo. Show a note: "En produccion: login requerido".

---

## Interaction spec

| Interaction | Behavior |
|-------------|----------|
| Mobile menu | Toggle nav links |
| Collection filters | Show/hide cards by `data-team` attribute |
| PDP size buttons | Toggle selected state; enable quote CTA |
| Quote form submit | `preventDefault`; show green success box |
| Bulk form submit | Same |
| Admin "Enviar cotizacion" | Toast: "Demo: PDF y correo en etapa siguiente" |
| Footer links | Privacy pages = anchor `#` with tooltip "Etapa 0.2" |

---

## Sample catalog data (hardcoded)

| SKU | Name | Price MXN | Team | Liga |
|-----|------|-----------|------|------|
| JER-PAD-01 | Jersey Padres local | $1,899.00 | Padres | MLB |
| JER-NYY-01 | Jersey Yankees visitante | $2,199.00 | Yankees | MLB |
| JER-MEX-01 | Jersey Mexico oficial | $1,699.00 | Mexico | Seleccion |
| JER-DOD-01 | Jersey Dodgers local | $2,099.00 | Dodgers | MLB |
| JER-SER-01 | Jersey Sultanes local | $1,499.00 | Sultanes | LMB |
| JER-AGU-01 | Jersey Aguilas local | $1,499.00 | Aguilas | LMB |

---

## Visual parity checklist (vs New Era patterns)

| Pattern | Demo includes |
|---------|---------------|
| Collection grid 2/4 col | Yes |
| MXN price format | Yes |
| PDP size selector | Yes |
| Quote CTA not cart | Yes |
| Breadcrumb | Home > Jerseys > Product |
| Trust strip (envio, original) | Yes |
| Sticky header | Yes |

Reference: [reference-site-newera-mx.md](../domain/reference-site-newera-mx.md)

---

## Files in repo

```
demo/
  index.html
  collections/jerseys.html
  products/jersey-padres-local.html
  products/jersey-mexico-oficial.html
  quote/index.html
  quote/bulk.html
  admin/index.html
  admin/quotes.html
  admin/quotes/detail.html
  css/styles.css
  js/demo.js
  assets/logo.svg
```

---

## Client walkthrough script (5 min)

1. Open home on phone - scroll featured jerseys.
2. Tap "Ver jerseys" - filter by Padres.
3. Open a product - pick talla L - tap "Solicitar cotizacion".
4. Fill quote form - submit - show success message.
5. Open `/admin/` - show dashboard and quote list.
6. Open quote detail - click enviar - explain PDF/email in Stage 0.

---

## Handoff to Stage 0

When client approves, carry forward:

- Approved color tokens -> Tailwind config in `app/`
- Approved page list -> App Router routes
- Approved copy -> `messages/es-MX.json`
- Product seed data -> Prisma seed script

Demo HTML is **throwaway** for backend; reuse only CSS tokens and UX decisions.

---

## Related

- [03-staged-delivery-roadmap.md](./03-staged-delivery-roadmap.md)
- [demo-dns-netlify-setup.md](../hosting/demo-dns-netlify-setup.md)
