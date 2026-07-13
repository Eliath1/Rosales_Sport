# Stage D - Static Demo Specification

> **Goal:** Client can click through a believable storefront and CRM shell in under 10 minutes.  
> **Deploy target:** Netlify, publish directory `demo/`  
> **Timeline:** 1-3 days to polish after HTML scaffold
>
> **Status: this is the only stage currently deployed.** `netlify.toml` publishes `demo/` with no build step, no database, and no server code. Stage 0 (`app/`, Next.js + Prisma) exists as local scaffolding only and is not deployed anywhere - see [03-staged-delivery-roadmap.md](./03-staged-delivery-roadmap.md). Everything in this doc describes the live, client-facing demo as of the last review (2026-07); the page inventory below has grown well past the original scaffold, so re-check against the repo before quoting exact counts to a client.

---

## Demo principles

1. **Looks real, behaves fake** - banner on every page states this is a preview.
2. **Bilingual** - Spanish (es-MX) default; English (en) for US market expansion. Toggle ES | EN in header; preference saved in browser.
3. **Quote-first, cart/checkout as a secondary path** - the primary CTA on PDPs is still custom uniform quote / "Solicitar cotizacion", but a client-requested addition added `cart/index.html` and `checkout/index.html` (localStorage cart, fake payment-method selector, no real charge) as a secondary buy-now flow alongside quoting - see Journey update in [user-journeys.md](../domain/user-journeys.md). Both paths coexist; do not remove the cart/checkout CTA when touching PDPs.
4. **Original branding** - placeholder store name until client provides logo.
5. **Mobile-first** - client will open the link on their phone.

---

## Placeholder brand

| Field | Demo value |
|-------|------------|
| Store name | RS (client logo) |
| Logo | `demo/assets/rs-logo.png` |
| Colors | Red `#ED090D`, Black `#000000`, White `#FFFFFF` |
| Sample catalog | LMB-style jerseys (names only, no New Era copy) |

---

## Page inventory

The demo has grown to 52 HTML files. This table lists page *types*, not every file - see `demo/README.md` for the maintained page list and `scripts/verify-demo.js` (`npm run demo:build-check`) for what's actually validated on every change.

### Storefront (public)

| File(s) | URL | Content |
|------|-----|---------|
| `index.html` | `/` | Hero (custom uniforms focus), featured products, 3 hero CTAs (all `btn btn-outline` for visual consistency), footer with real legal links |
| `collections/jerseys.html` | `/collections/jerseys.html` | Product grid, filter chips by team/liga, includes RS-branded custom catalog |
| `products/jersey-*.html`, `products/pants-*.html` (~24 files) | PDPs | RS custom-catalog SKUs (`jersey-rs-*`, `pants-rs-*`) with standard (450 MXN) / customized (650 MXN) dual pricing, plus legacy MLB/LMB-styled examples (`jersey-diablos-borgona.html`, `jersey-sultanes-navy.html`, etc.) |
| `quote/index.html` | `/quote/` | Name, email, phone, product interest, consent |
| `quote/bulk.html` | `/quote/bulk.html` | Equipo name, qty, sizes, logo note |
| `custom/uniform/builder.html` | `/custom/uniform/builder.html` | **Primary custom-uniform flow.** 4-step wizard: (1) product type + template, (2) colors (curated combo presets for `classic-button` jersey and `pants-classic` pants only - see [variant-bank-spec.md](../specs/variant-bank-spec.md)), (3) roster table (Nombre/Numero/Talla, add/remove rows, auto-computed size totals) + Tipo de trabajo (Bordado/DTF/TPU/3D DTF/Sublimado), (4) review + submit. Enforces a 6-unit minimum order. Only the `jersey` product type and `classic-button`/`pants-classic` templates are enabled for this demo; other templates/product types render disabled with a "No disponible en este DEMO" note. |
| `custom/uniform.html` | `/custom/uniform` | **Legacy flat form**, kept only because `scripts/package-demo-netlify.js` still requires it. Nav and hero CTAs link to the wizard (`builder.html`) instead - treat the wizard as authoritative and this page as a fallback pending removal or explicit re-approval. |
| `aviso-de-privacidad.html`, `terminos-condiciones.html` | `/aviso-de-privacidad.html`, `/terminos-condiciones.html` | Real LFPDPPP-aligned legal copy, linked directly from the footer. These already shipped in Stage D, ahead of the "Stage 0.2" gate originally planned for this content (see [03-staged-delivery-roadmap.md](./03-staged-delivery-roadmap.md)). |
| `mi-cuenta/registro/index.html`, `mi-cuenta/login/index.html`, `mi-cuenta/index.html`, `mi-cuenta/pedidos/index.html`, `mi-cuenta/pedidos/detail.html` | `/mi-cuenta/*` | Simulated customer login/registration and order history, added by client request as an approved exception to the "no login" rule normally listed under Stage D's explicitly-fake scope - see Journey 7 in [user-journeys.md](../domain/user-journeys.md) and [ADR-012](./decisions/ADR-012-customer-accounts.md). Fully client-side, localStorage-backed (`demo/js/demo.js`, `CUSTOMER_KEY`); order status strings match the `OrderStatus` enum in `app/prisma/schema.prisma` for copy consistency with the real backend. |
| `cart/index.html` | `/cart/` | Session cart (localStorage), added alongside quoting as a secondary buy-now path. Renders line items added via `data-add-to-cart` buttons on PDPs; links to `checkout/index.html`. |
| `checkout/index.html` | `/checkout/` | Fake checkout form: contact info, payment-method radio (Tarjeta/Mercado Pago/OXXO/SPEI), consent checkbox. `preventDefault`, shows success state; no real charge, no server call. |

### Admin (mock CRM)

| File | URL | Content |
|------|-----|---------|
| `admin/index.html` | `/admin/` | Full simulated financial dashboard: revenue/cost/profit/margin/units, monthly trend, order pipeline - all generated client-side by `demo/js/mock-crm-data.js` (seeded, deterministic) and rendered by `demo/js/admin-dashboard.js` |
| `admin/quotes.html`, `admin/quotes/detail.html` | `/admin/quotes*` | Quotes list + detail (simulated data) |
| `admin/orders.html`, `admin/orders/detail.html` | `/admin/orders*` | Order/fulfillment pipeline (simulated data) - not in the original Stage D scope |
| `admin/customers.html` | `/admin/customers.html` | Customer list (simulated data) - not in the original Stage D scope |
| `admin/designs.html`, `admin/designs/detail.html` | `/admin/designs*` | Saved configurator designs (from `builder.html` submissions, stored client-side) - not in the original Stage D scope |
| `admin/login/index.html` | `/admin/login/` | Simulated staff login gating the pages above - see note below |

Admin has a **simulated login gate** (`admin/login/index.html`, mirroring the customer login pattern - any input "succeeds"): visiting any `/admin/*` page without a `rs_demo_staff_v1` localStorage session client-side-redirects to `/admin/login/?next=<path>`; logging in redirects back. A logout link renders in the sidebar nav once "signed in". This is still client-side only - no server, no password check, no real access control - see `admin.note` copy on the dashboard. None of the "CRM" data is real - it is regenerated from a seeded random generator on every page load and never touches a server.

---

## Interaction spec

| Interaction | Behavior |
|-------------|----------|
| Mobile menu | Toggle nav links |
| Collection filters | Show/hide cards by `data-team` attribute |
| PDP size buttons | Toggle selected state; enable quote CTA |
| Quote form submit | `preventDefault`; show green success box |
| Bulk form submit | Same |
| Add to cart / Buy now (PDP) | `data-add-to-cart` / `data-buy-now` write to the localStorage cart and update the header cart badge; buy-now also navigates to `/cart/` |
| Checkout form submit | `preventDefault`; shows success state. No real charge, no server call |
| Admin "Enviar cotizacion" | Toast: "Demo: PDF y correo en etapa siguiente" |
| Footer links | Real pages: `/aviso-de-privacidad.html`, `/terminos-condiciones.html` (shipped ahead of the original Stage 0.2 gate, see note above) |
| Configurator submit (`builder.html`) | Saves the design spec to browser storage (`sessionStorage`/`localStorage`) and shows a success screen with a link into `admin/designs/detail.html`. No network call, no server, no persistence beyond the browser tab/profile. |

---

## Product card HTML contract

Collection and home grids must keep this structure. Breaking it (missing `.product-info`, stray `</div>`, or raw `<img>` in cards) causes layout regressions.

```html
<article class="product-card" data-team="..." data-liga="..." data-price="...">
  <a href="/products/....html">
    <span class="product-badge">...</span>  <!-- optional -->
    <div class="product-image">
      <div class="placeholder-jersey has-photo" style="background-image:url('/images/....')">Jersey</div>
    </div>
    <div class="product-info">
      <h3>Product title</h3>
      <p class="product-price">$ X,XXX.00</p>
    </div>
  </a>
</article>
```

**Do not:**

- Replace `.placeholder-jersey` with full-bleed `<img>` inside `.product-image` on grids.
- Omit the `.product-info` wrapper or `<h3>` title.
- Add a second hero band on home that repeats the same "Personalizar uniforme" CTA.

Enforced by `scripts/verify-demo.js` via `npm run demo:build-check`.

---

## Jersey images

| Path | Role |
|------|------|
| `demo/images/` | Served at `/images/*` when Netlify publishes `demo/` |
| `images/` (repo root) | Staging only; copy into `demo/images/` before deploy |

Wire photos with `background-image` on `.placeholder-jersey.has-photo`. PDP gallery uses the same placeholder pattern inside `.pdp-gallery-main` and `.pdp-thumb` (see `demo/js/demo.js`).

---

## Copy: decoration markets

Finishing types (bordado, DTF, TPU, 3D DTF) are available for **Mexico and US** in demo copy unless product owner overrides. Use `custom.market.all` in `demo/js/messages.js`; do not split badges by market without approval.

---

## Validation and agent toolkit

Before every demo edit or Netlify deploy:

```bash
npm run demo:build-check
npm run demo          # optional local smoke at http://localhost:3456
```

| Artifact | Location |
|----------|----------|
| Rule (auto on `demo/**`) | `.cursor/rules/stage-d-demo.mdc` |
| Skill | `.cursor/skills/stage-d-static-demo/SKILL.md` |
| Quality gate | `validate-quality-gate` Stage D checklist |
| Agents | `storefront-ux-analyst`, `frontend-engineer`, `code-quality-reviewer` |

Deploy: `npx netlify deploy --prod --dir=demo` (see `netlify.toml`, `publish = "demo"`).

---

## Sample catalog data (hardcoded)

The catalog shipped is the RS-branded custom catalog defined in `images/catalog-spec.json`, not the original placeholder MLB/LMB SKU list. Every RS SKU uses the same dual-pricing pattern: standard 450 MXN / customized 650 MXN (see PDP `pdp-price` / `pdp-price-secondary`). Representative rows:

| SKU | Name | Standard MXN | Customized MXN | Category |
|-----|------|---------------|-----------------|----------|
| RS-JER-CUS-BLANCO | Jersey RS Blank Blanco | $450.00 | $650.00 | Jersey |
| RS-JER-CUS-BOR-NEG | Jersey RS Combinado Borgona y Negro | $450.00 | $650.00 | Jersey |
| RS-JER-CUS-NAV-PIN | Jersey RS Navy Pinstripe | $450.00 | $650.00 | Jersey |
| RS-PAN-CUS-BLANCO | Pantalon RS Classic Blanco | $450.00 | $650.00 | Pants |
| RS-PAN-CUS-NAV-FRA | Pantalon RS Navy con Franja Roja | $450.00 | $650.00 | Pants |

Full list (10 jersey + 10 pants SKUs): `images/catalog-spec.json`. The original MLB/LMB-styled example pages (`jersey-diablos-borgona.html`, `jersey-sultanes-navy.html`, `jersey-mexico-estrellas.html`, `jersey-mexico-emblem.html`) still exist alongside the RS catalog as earlier examples; they are not part of the current primary catalog story.

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

This is a representative tree, not exhaustive (52 HTML files total). See `demo/README.md` for the maintained list.

```
demo/
  index.html
  collections/jerseys.html
  products/jersey-rs-*.html, pants-rs-*.html   # RS custom catalog (10 + 10 SKUs)
  products/jersey-diablos-borgona.html, ...    # legacy example PDPs
  quote/index.html
  quote/bulk.html
  custom/uniform/builder.html    # primary 4-step configurator wizard
  custom/uniform.html            # legacy flat form (kept for packaging script only)
  cart/index.html                 # secondary buy-now path (localStorage cart)
  checkout/index.html             # fake checkout form, no real charge
  aviso-de-privacidad.html
  terminos-condiciones.html
  admin/index.html                 # simulated financial dashboard
  admin/quotes.html, admin/quotes/detail.html
  admin/orders.html, admin/orders/detail.html
  admin/customers.html
  admin/designs.html, admin/designs/detail.html
  css/styles.css, css/configurator.css
  js/demo.js, js/messages.js, js/i18n.js
  js/configurator.js          # builder wizard state/UI
  js/preview-compositor.js    # canvas rendering (tinting + curated photo compositing)
  js/variant-bank.js          # curated-combo lookup + fallback logic
  js/mock-crm-data.js         # seeded fake CRM dataset generator
  js/admin-dashboard.js       # renders mock-crm-data into admin pages
  images/                     # jersey/product photos for /images/*
  assets/rs-logo.png, assets/mockups/, assets/variant-bank/, assets/templates/
```

---

## Client walkthrough script (5 min)

1. Open home on phone - scroll featured jerseys, point out the RS custom catalog.
2. Tap "Personalizar uniforme" - walk through the 4-step configurator: pick a template, choose a curated color combo, fill the roster table (name/number/talla), review and submit.
3. Show the auto-computed size totals and the 6-unit minimum enforcement.
4. Open `/admin/` - show the simulated financial dashboard, quotes, orders, customers, and the submitted design under `/admin/designs.html`.
5. Explain that "Enviar" actions and admin data are simulated in-browser today; real PDF/email/DB persistence is Stage 0 scope, not yet built or deployed.

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
