# Reference Site Patterns - Licensed Jersey Retail (MX)

> **Reference:** [newera.mx/collections/jerseys](https://www.newera.mx/collections/jerseys)  
> **Important:** This document captures **UX and information architecture patterns**, not New Era branding, copy, imagery, or proprietary design assets. Build original visual identity for the client store.

## Why This Reference?

New Era Mexico represents a mature **licensed headwear and apparel** e-commerce experience familiar to Mexican baseball fans. Our storefront parity checklist uses similar patterns without copying brand identity.

## Collection Page Patterns

### Navigation hierarchy

```
Home -> Colecciones -> [Category] -> Product detail
         ├── Jerseys
         ├── Gorras
         ├── Sudaderas
         └── Accesorios
```

**Takeaway:** Shallow hierarchy (≤3 clicks to product). Team/league as secondary filters, not top-level nav clutter.

### Collection grid (jerseys)

| Pattern | Description | Our implementation |
|---------|-------------|-------------------|
| Card grid | 2-col mobile, 3-4 col desktop | Responsive CSS grid |
| Product image | Single hero on white/neutral | CDN URLs from catalog module |
| Title | Team + product type | `Product.name` |
| Price | MXN with thousands separator | `$1,899.00 MXN` |
| Badge | "Nuevo", "Edición limitada" | Optional `Product.badge` field |
| Quick filter | Team, league, size availability | Faceted search (Wave One) |

### Filtering & sorting

Observed patterns on licensed apparel sites:

- Filter by **equipo** (Yankees, Padres, México)
- Filter by **liga** (MLB, LMB, Selección)
- Sort: **Precio** (asc/desc), **Más vendidos**, **Novedades**

**Wave Zero:** Admin catalog tags only. **Wave One:** Public filters.

## Product Detail Page Patterns

### Above the fold

| Element | Purpose |
|---------|---------|
| Image gallery | Front/back/detail; zoom on desktop |
| Title + SKU | Clear identification |
| Price | List price; strike-through if sale |
| Size selector | Disabled options if unavailable |
| CTA | "Agregar al carrito" / Wave Zero: "Solicitar cotización" |
| Size guide link | Modal with cm measurements |

### Below the fold

- Description (material, fit, licensed product note)
- Shipping estimate ("Envío a CDMX: 2-5 días hábiles")
- Returns summary link
- Related products ("Completa tu outfit" - matching gorra)

### Trust signals

- Secure payment icons (when live)
- Aviso de privacidad link near email capture
- Authentic licensed product statement (client-approved legal text)

## Quote-First Variant (Wave Zero)

For MVP without checkout, adapt PDP CTA:

```
[Solicitar cotización]  ->  Pre-filled quote line item
[WhatsApp]              ->  Deep link with SKU in message (optional)
```

## Mobile Considerations

- Sticky "Agregar" / "Cotizar" bar at bottom
- Filters in bottom sheet, not sidebar
- Thumb-friendly size chips (min 44px touch target)

## Performance Patterns

- Lazy-load below-fold images
- WebP/AVIF with fallback
- Collection page SSR for SEO ("jersey Yankees México")

## SEO Patterns (not brand-specific)

| Page type | Title pattern example |
|-----------|-------------------------|
| Collection | `Jerseys de Béisbol \| [Store Name]` |
| Product | `[Team] Jersey Replica [Year] \| [Store Name]` |
| Meta description | Team + material + envío a México |

## What NOT to Copy

- Logos, fonts, color palette from New Era
- Product photography (use supplier/licensed assets)
- Exact copy, slogans, or promotional mechanics
- URL slugs that imply affiliation

## Parity Checklist

See [../../templates/feature/mvp-storefront-parity-checklist.md](../../templates/feature/mvp-storefront-parity-checklist.md).

## Related

- [baseball-store-glossary.md](./baseball-store-glossary.md)
- [user-journeys.md](./user-journeys.md)
