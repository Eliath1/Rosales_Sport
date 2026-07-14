# Custom Uniforms and Decoration Types

> **Business reality:** RS sells **custom baseball uniforms and caps**, not only licensed retail jerseys. Every team order must capture personalization and decoration method before sales can quote accurately.

## Product scope

| Product | Typical buyer | Notes |
|---------|---------------|-------|
| Full uniform (jersey + pants) | Liga, escuela, equipo | Most common B2B order |
| Jersey only | Fan groups, partial reorders | Often paired with embroidery |
| Cap / gorra | Team bundle, retail custom | Logo on front panel |
| Uniform + caps set | Full team package | Single quote, multiple line items |

## Customization fields (required for quote)

These fields appear on the public **custom order form** (`/custom/uniform`) in Stage D demo and become structured data in Wave 0.

| Field | Purpose | Example |
|-------|---------|---------|
| Product type | Uniform, jersey, cap, or set | `uniform` |
| Base design / model | Which blank or licensed base | "Diablos borgona 2026" |
| Team / league / business | CRM customer context | "Liga Norte CDMX" |
| Total quantity | Piece count for pricing tier | 12 |
| Size breakdown | Per-size qty (XS-XXL) | 4x S, 6x M, 2x L |
| Player roster | Names and numbers per piece | `Garcia Lopez \| 12` |
| Logo / crest note | Artwork reference | "Escudo liga adjunto por WhatsApp" |
| Decoration type | How names/logos are applied | See below |

## Decoration types (estampado / bordado)

| Code | ES label | EN label | Market note |
|------|----------|----------|-------------|
| `embroidery` | Bordado | Embroidery | **Most common in Mexico** for ligas, escuelas, and local teams |
| `dtf` | DTF | DTF (direct to film) | More common in **US** wholesale and performance wear |
| `tpu` | TPU | TPU patches | More common in **US**; thermoplastic raised patches |
| `3d_dtf` | 3D DTF | 3D DTF finishing | More common in **US**; raised film finish |

Sales should default suggested decoration by customer market:

- **Mexico (es-MX):** suggest embroidery first; explain lead time vs DTF.
- **US (en):** present DTF, TPU, and 3D DTF; embroidery still available.

## Wave 0 data model (planned)

```text
QuoteLineItemCustomization
  line_item_id
  decoration_type   embroidery | dtf | tpu | 3d_dtf
  size_breakdown    JSON { "S": 4, "M": 6, "L": 2 }
  roster            JSON [{ name, number }]
  logo_notes        text
```

Public lead capture maps to `leads` with `customization_json` until staff converts to a formal quote.

## Pricing

This doc covers decoration *types* and the fields needed to quote, not prices. For the official price per garment tier and add-on (gorras, jerseys linea 1/2, pantalones, complementos, chamarras, sudaderas), see [custom-uniform-price-list-2026-07.md](../business/custom-uniform-price-list-2026-07.md).

## Related docs

- [custom-uniform-price-list-2026-07.md](../business/custom-uniform-price-list-2026-07.md) - official decoration pricing
- [user-journeys.md](./user-journeys.md) - Journey 6: custom uniform quote
- [baseball-store-glossary.md](./baseball-store-glossary.md) - Bordado, DTF terms
- [../architecture/wave-zero-quote-crm.md](../architecture/wave-zero-quote-crm.md) - CRM entities
- [../data/schema-design-guide.md](../data/schema-design-guide.md) - Future tables
