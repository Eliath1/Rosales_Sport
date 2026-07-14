# Wave Zero - Quote CRM MVP

> **Goal:** Replace spreadsheet + WhatsApp quote chaos with a single source of truth for customers, catalog, and cotizaciones.  
> **Timeline guidance:** 4-8 weeks for a solo developer; 2-4 weeks with a small team.

## Wave Zero Definition

**Wave Zero** delivers internal value before public checkout. Sales staff can create professional quotes; customers receive PDF/email cotizaciones; owners see pipeline visibility.

### In Scope

| Feature | User story |
|---------|------------|
| Customer registry | "Registro un fan que pidió 10 jerseys del Águilas" |
| Product catalog | "Jerseys por equipo, talla, precio lista y mayoreo" |
| Quote builder | "Armo cotización con descuento 10% y vigencia 15 días" |
| Quote PDF | "El cliente recibe PDF con logo de la tienda" |
| Email delivery | "Envío cotización desde correo @mitienda.mx" |
| Quote status | draft / enviada / aceptada / vencida / rechazada |
| Staff auth | Login para vendedores y admin |
| Privacy baseline | Aviso de privacidad, consent checkbox en registro |

### Public storefront (Wave 0 - in scope)

Read-only **storefront** ships with Wave 0, not as an afterthought:

| Page | Purpose |
|------|---------|
| Home | Featured collections, trust strip |
| `/collections/*` | Jersey/gorra grids (New Era-style IA, original branding) |
| `/products/[slug]` | PDP with **Solicitar cotización** CTA |
| `/quote`, `/quote/bulk` | Inbound lead forms -> admin CRM |
| `/custom/uniform` | Custom uniform/cap form: sizes, names, numbers, decoration (embroidery, DTF, TPU, 3D DTF) |

See [custom-uniform-decoration.md](../domain/custom-uniform-decoration.md) for field definitions.

See [02-website-architecture-plan.md](./02-website-architecture-plan.md) for full route map.

### Explicitly out of scope

- Online payment capture
- Shopping cart and checkout
- Inventory sync with warehouse
- Shipping label integration
- AI chatbot
- Mobile app

## User Flows

### Flow 1: Sales creates quote

```
Sales opens Admin -> New Quote
  -> Search/create customer
  -> Add line items (catalog search)
  -> Apply discount (optional)
  -> Preview PDF
  -> Send email -> Status: enviada
```

### Flow 2: Customer receives quote

```
Customer gets email (Resend)
  -> PDF attachment + link to view (optional token URL)
  -> Replies via WhatsApp/phone (manual follow-up in Wave Zero)
  -> Sales marks: aceptada | rechazada
```

### Flow 3: Owner dashboard (minimal)

```
Owner opens Dashboard
  -> Quotes this week (count, MXN total)
  -> Pipeline by status
  -> Top products quoted
```

## Data Entities (Wave Zero)

```
Customer
  id, name, email, phone, type (retail|wholesale), consent_at

Product
  id, sku, name, team, category, base_price_mxn, wholesale_price_mxn

ProductVariant
  id, product_id, size, color, stock_hint (optional manual)

Quote
  id, customer_id, status, valid_until, subtotal, discount, total, notes

QuoteLineItem
  id, quote_id, product_variant_id, qty, unit_price, line_total

QuoteLineItemCustomization (custom uniforms)
  id, line_item_id
  decoration_type   embroidery | dtf | tpu | 3d_dtf
  size_breakdown    JSON
  roster            JSON [{ name, number }]
  logo_notes        text

Lead (web forms)
  id, source, customer_id, payload_json (includes customization for /custom/uniform)

User (staff)
  id, email, role, password_hash
```

## API Endpoints (Wave Zero)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Staff session |
| GET/POST | `/api/customers` | List/create |
| GET/POST | `/api/products` | Catalog CRUD |
| GET/POST | `/api/quotes` | Quote CRUD |
| POST | `/api/quotes/:id/send` | Email + PDF |
| GET | `/api/quotes/:id/pdf` | Download PDF |

See [../api/design-standards.md](../api/design-standards.md) for conventions.

**Implementation status (2026-07):** `apps/admin/src/app/api/quotes/route.ts` implements `GET`/`POST` on the collection only - the `/api/quotes/:id/send` and `/api/quotes/:id/pdf` routes above have not been built yet. `packages/shared/src/pdf/quotePdf.ts` exists but has no callers anywhere in the codebase, and the `resend` dependency in `packages/shared/package.json` is not imported anywhere. Treat PDF generation and email delivery as not-yet-wired, even though the schema and some supporting code exist. (Paths updated for the [ADR-014](./decisions/ADR-014-monorepo-two-apps.md) monorepo split - the quotes API and PDF logic used to live in a single `app/`.)

## Acceptance Criteria

1. Sales user can create and send a quote in **< 3 minutes** after catalog is loaded.
2. PDF renders correctly with MXN formatting (`$1,299.00 MXN`).
3. Email delivers to inbox (not spam) via Resend with SPF/DKIM configured.
4. Quote cannot be edited after status `enviada` (create revision instead).
5. Customer PII encrypted at rest (Neon TLS); access logged for admin actions.
6. Aviso de privacidad linked on any public-facing form.

## Stretch Goals (if time permits)

- [ ] WhatsApp share link with quote summary text
- [ ] CSV import for bulk product upload
- [ ] Basic full-text search on customers
- [ ] Signed token URL for customer quote view

## Migration from Spreadsheets

| Legacy | Wave Zero |
|--------|-----------|
| Google Sheet "Clientes" | `customers` table + import script |
| Sheet "Precios 2026" | `products` + admin UI |
| Word/PDF manual | Auto-generated PDF template |
| Gmail copy-paste | Resend template `quote-sent-es` |

## Success Metrics

| Metric | Target (30 days post-launch) |
|--------|------------------------------|
| Quotes created in system | > 80% of all quotes |
| Avg time to send quote | < 5 min (down from ~20 min) |
| Lost quotes (no follow-up) | Visible in dashboard, trend down |
| Staff adoption | 100% sales team logged in weekly |

## Next Wave Preview

**Wave One:** Public storefront + Mercado Pago checkout + order entity linked to accepted quotes.

See [../business/hybrid-mvap-paths.md](../business/hybrid-mvap-paths.md) for full roadmap options.
