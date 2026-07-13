# Stage D - Static Demo

Client-facing preview for **RS** brand. No backend.

Brand: [docs/domain/rs-client-brand.md](../docs/domain/rs-client-brand.md)

## Bilingual (Stage D)

| Locale | Default | URL |
|--------|---------|-----|
| es-MX | Yes (Mexico) | `/?lang=es` or no param |
| en | US market preview | `/?lang=en` |

Files: `demo/js/messages.js`, `demo/js/i18n.js`. Production will use `next-intl` in Stage 0 app.

## Local preview

```bash
npm run demo
```

Open http://localhost:3456

Or: `npx serve demo`

## Pages

| URL | Screen |
|-----|--------|
| `/` | Home |
| `/collections/jerseys.html` | Collection + filters, RS custom catalog (10 jersey + 10 pants SKUs, 450/650 MXN dual pricing) |
| `/products/jersey-rs-*.html`, `/products/pants-rs-*.html` | RS custom-catalog product pages |
| `/quote/` | Quote form |
| `/quote/bulk.html` | Bulk / equipo form |
| `/custom/uniform/builder.html` | **Primary custom-uniform flow**: 4-step configurator wizard (product/template -> colors -> roster/decoration -> review). Nav and hero CTAs link here. |
| `/custom/uniform.html` | Legacy flat custom-uniform form. Kept only because `scripts/package-demo-netlify.js` still requires it; not linked from nav/CTAs anymore. |
| `/cart/` | Secondary buy-now path alongside quoting: localStorage session cart populated by `data-add-to-cart`/`data-buy-now` buttons on PDPs. |
| `/checkout/` | Fake checkout form (contact info, payment-method radio, consent). `preventDefault`, no real charge, no server call. |
| `/aviso-de-privacidad.html`, `/terminos-condiciones.html` | Real LFPDPPP-aligned legal pages, linked from the footer |
| `/admin/login/` | Simulated staff login (any input "succeeds"); gates every other `/admin/*` page via a `rs_demo_staff_v1` localStorage session - see `initStaffGate` in `demo/js/demo.js` |
| `/admin/` | CRM dashboard mock (simulated 6-month financials + order pipeline) |
| `/admin/quotes.html` | Quotes list (simulated) |
| `/admin/orders.html` | Orders / fulfillment pipeline (simulated) |
| `/admin/customers.html` | Customers list (simulated) |
| `/admin/designs.html` | Configurator design submissions inbox (simulated, reads from browser storage) |
| `/mi-cuenta/registro/` | Fake customer registration (nombre, correo, contrasena, telefono opcional, marketing consent) - sets a localStorage session and redirects to `/mi-cuenta/` |
| `/mi-cuenta/login/` | Fake customer login - any input "succeeds" and sets a localStorage session |
| `/mi-cuenta/` | Account home: login prompt when logged out; name/email, order history link, logout, and a distributor payment-method stub when logged in |
| `/mi-cuenta/pedidos/` | Order history list from hardcoded seed orders (status strings match `OrderStatus` in `app/prisma/schema.prisma`) - login-gated |
| `/mi-cuenta/pedidos/detail.html?id=...` | Order detail with the shared `.order-step` status timeline |

Simulated CRM numbers (customers, quotes, orders, monthly revenue/cost/profit) all come from one seeded generator: `demo/js/mock-crm-data.js`, rendered by `demo/js/admin-dashboard.js`. Change the seed or ranges there to reshape the simulated dataset; do not hand-edit numbers into the admin HTML pages.

### Configurator (builder wizard) - demo-scope restrictions

The wizard at `/custom/uniform/builder.html` is intentionally narrower than the full architecture in [docs/architecture/uniform-configurator.md](../docs/architecture/uniform-configurator.md):

- Only the `jersey` product type is enabled; `uniform` (jersey+pants), `cap`, and `set` render disabled with a "No disponible en este DEMO" note.
- Only the `classic-button` (jersey) and `pants-classic` templates are enabled; `pro-pinstripe` and `mexico-stars` are disabled the same way.
- Color selection for those two enabled templates is restricted to a curated set of preset combos backed by real AI-generated product photos (`demo/assets/variant-bank/`), not free-form color pickers - see [docs/specs/variant-bank-spec.md](../docs/specs/variant-bank-spec.md).
- A global 6-unit minimum order is enforced on step 3.
- Step 3 (Equipo) is roster-driven: the roster table (Nombre/Numero/Talla) is the source of truth, and "Cantidad por talla" is a read-only total computed from it.

None of this is a backend restriction - it's all client-side JS (`demo/js/configurator.js`, `DISABLED_TEMPLATE_SLUGS` / `DISABLED_PRODUCT_TYPES`) for demo consistency, and the wizard has no server calls at all: submissions save to `sessionStorage`/`localStorage` only.

## Deploy (drag and drop, no Git yet)

1. Generate the zip (copies `images/` into `demo/images/` automatically):

```bash
npm run demo:package
```

2. Upload **`rs-demo-netlify.zip`** from the **project root** (not `dist-netlify-upload/`).
3. On [Netlify Start](https://app.netlify.com/start), drag the zip onto the drop zone.

The script prints every `images/jersey*.jpg` file inside the zip. If the list is empty, do not upload.

**Wrong ways to deploy (images will be missing or CSS breaks):**

- Zipping `dist-netlify-upload/` (stale copy, no photos)
- Windows right-click "Compress to ZIP" or `Compress-Archive` on `demo/`

## Deploy (Git, later)

See [docs/hosting/demo-dns-netlify-setup.md](../docs/hosting/demo-dns-netlify-setup.md).

**Image assets:** [docs/specs/demo-image-asset-plan.md](../docs/specs/demo-image-asset-plan.md)

```bash
# After adding PNGs to images/catalog/ or editing mockup-mapping.json
npm run demo:assets:sync
npm run demo:build-check
```

Netlify publish directory: `demo` (configured in root `netlify.toml`).

## Product images

Jersey photos live in `demo/images/` (copied from project root `images/`). After adding or replacing files in `images/`, copy them into `demo/images/` before deploy:

```powershell
Copy-Item images\* demo\images\
```

Then redeploy Netlify so `/images/jersey1.webp` etc. resolve on the live demo.

## Spec

[docs/architecture/stage-demo-static.md](../docs/architecture/stage-demo-static.md)

## Before you edit HTML or images

1. Read `.cursor/rules/stage-d-demo.mdc` (product card contract, image paths, copy rules).
2. Use skill `stage-d-static-demo` for hero, grid, or jersey photo changes.
3. Run validation before deploy:

```bash
npm run demo:build-check
```

Fails if product cards miss `.product-info`, use raw `<img>` in grids, or `demo/images/` is missing.
