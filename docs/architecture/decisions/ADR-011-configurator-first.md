# ADR-011: Configurator-first product (no inventory)

> **Status:** Accepted  
> **Date:** 2026-07  
> **Context:** Client discovery - 95% made-to-order custom uniforms; D2C channel new; pain is designer approval loop, not stock display.

## Decision

1. **Primary public journey** is the uniform configurator (`/custom/uniform/builder`), not retail catalog with inventory.
2. **No inventory module** in Wave 0-1. Products are **base templates** (blanks), not stocked SKUs.
3. Introduce a **Design** domain (`DesignRequest`, `DesignRevision`, assets) that feeds Quotes/Leads.
4. **Stage D demo** ships a working wizard + client-side preview on `localhost:3456` before Neon/API wiring.
5. **Retail licensed jerseys** remain secondary (~5%); collection pages stay but are not the home CTA.

## Consequences

| Area | Change |
|------|--------|
| Home / nav | Hero CTA -> "Diseña tu uniforme" |
| Catalog module | Becomes **Templates** submodule (base models, color zones) |
| Quotes module | Links to `design_request_id`; PDF includes preview image |
| Admin | New **Design inbox** with spec JSON, assets, approval status |
| Wave 1 checkout | Blocked until design approval flow is stable |
| Schema | New tables; `stock_hint` deprecated for templates |

## Alternatives rejected

| Option | Why not |
|--------|---------|
| Full Canva-like editor in Wave 0 | Too slow; client needs structured intake first |
| Shopify + custom app | Quote + approval loop is core IP |
| Keep text-only `/custom/uniform` form | Does not reduce designer ping-pong enough |

## Implementation note (2026-07)

The Stage D demo (item 4) shipped, but as a **narrower slice** than this ADR's full vision: only the `jersey` product type and the `classic-button` / `pants-classic` templates are enabled; other templates and product types (uniform/pants+jersey, cap, set) render disabled with a "No disponible en este DEMO" note, and color selection is restricted to a curated preset combo bank rather than free-form zone colors for those two templates. This was a deliberate scope narrowing for demo consistency, not a reversal of the decision - see [variant-bank-spec.md](../../specs/variant-bank-spec.md) "DEMO scope narrowing" section for the full rationale and exact restrictions.

Item 3 (Design domain: `DesignRequest`/`DesignRevision`/assets) has **not been implemented** in `app/` yet - the current Prisma schema there still reflects the pre-ADR-011 `Customer`/`Product`/`Quote`/`Lead` model from `wave-zero-quote-crm.md`, with no configurator UI. Phase B in [uniform-configurator.md](../uniform-configurator.md) tracks when this work starts.

## Related

- [../uniform-configurator.md](../uniform-configurator.md)
- [../../specs/uniform-configurator-phase-a.md](../../specs/uniform-configurator-phase-a.md)
- [../../specs/uniform-mockup-asset-brief-photographer.md](../../specs/uniform-mockup-asset-brief-photographer.md)
- [../../specs/variant-bank-spec.md](../../specs/variant-bank-spec.md)
