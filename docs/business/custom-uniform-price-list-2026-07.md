# Custom Uniform and Decoration Price List - 2026-07

> **Source:** Official Rosales Sport price list, provided by the client 2026-07-13.
> **Currency:** All prices in **MXN**. No IVA breakdown given - treat as list price until confirmed otherwise.
> **ADL / JR:** Adult / Junior sizing tiers, called out per item where the client's list prices them differently.
> **Status:** Canonical. This is the single source of truth for custom-uniform decoration pricing - do not duplicate these numbers elsewhere; link here instead (see [mexico-pricing-reference.md](./mexico-pricing-reference.md) and [custom-uniform-decoration.md](../domain/custom-uniform-decoration.md)).

## Gorras / Caps

| Item | Price (MXN) |
|---|---|
| Gorra, 1 logo frente | $150 |

### Add-ons (gorra)

| Item | Price (MXN) |
|---|---|
| Logo lateral (max 5 cm) | $30 |
| Logo trasero (max 3 cm) | $20 |
| Personalizacion lateral (max 10 letras) | $50 |

## Camisa sola / Jerseys

### Linea 1 - Sublimado full color

| Item | ADL | JR |
|---|---|---|
| Jersey sublimado | $400 | $300 |

Style options at no price delta: cuello "V" o cerrada, 2 botones o abierta; cada uno con manga normal o ranglan.

### Linea 2 - Bordado

| Item | ADL | JR |
|---|---|---|
| Tela color solido | $500 | $400 |
| Tela rayada o efecto full color | $600 | $500 |

Includes: letrero al frente, numero espalda, 1 escudo en manga, y personalizacion.

### Add-ons (jersey)

| Item | Bordado | Sublimado |
|---|---|---|
| Escudo en 2a manga o cualquier otro lado | $40 | $20 |
| Publicidad espalda (max 30 cm) | $80 | $40 |

| Item | Precio |
|---|---|
| Numeros al frente bajo el letrero | $40 |

## Pantalon / Pants

| Item | ADL | JR |
|---|---|---|
| Regular (Bco, Gris, Beige, Rojo, Negro, Azul Rey, Azul Marino, Gris Obscuro) | $350 | $300 |

Includes: presillas para cinto, 2 bolsas traseras, doble tela refuerzo rodillas.

### Add-ons (pantalon)

| Item | Precio |
|---|---|
| 1 linea al costado | $20 |
| 2 o 3 lineas al costado | $40 |
| Numeros en 1 pierna | $40 |

| Item | Sublimado | Bordado |
|---|---|---|
| Logo o publicidad por pierna (max 30 cm) | $40 | $80 |

## Complementos

| Item | Precio |
|---|---|
| Cinto, elastico con puntas de piel | $100 |
| Cinto, todo sintetico o charol | $200 |
| Medias lisas | $70 |
| Medias rayadas (3 lineas) | $100 |
| Playera interior, mangas de licra | $250 |

## Chamarras

| Item | ADL | JR |
|---|---|---|
| Tela repelente, letrero bordado al frente | $900 | $800 |

### Add-ons (chamarra)

| Item | Precio |
|---|---|
| Escudo manga | $40 |
| Numeros | $40 |
| Personalizacion en espalda | $80 |

## Sudadera felpa con gorro / Hoodies

| Item | ADL | JR |
|---|---|---|
| Sublimada full color | $500 | $400 |
| Felpa tela color solido, bordada | $500 | $400 |

### Add-ons (sudadera)

| Item | Precio |
|---|---|
| Efectos sublimados en tela | $100 |

## How this maps to the data model

Every priced item above (base garment tier and add-on) is seeded as its own `Product` row in [packages/db/prisma/seed.ts](../../packages/db/prisma/seed.ts), following the same upsert pattern already used for the licensed jerseys. There is no separate "surcharge" or "add-on" model in the schema - staff pick a base garment and any add-ons as separate line items on the same quote, exactly like combining products today in the CRM's `/quotes` builder (`apps/admin`, see [ADR-014](../architecture/decisions/ADR-014-monorepo-two-apps.md)). See that plan's SKU convention (e.g. `JER-SUBL-ADL`, `JER-ADD-ESCUDO-BORD`, `PANT-REG-JR`) for how base garments and add-ons are grouped and named so staff can find them quickly.

## Open question - deferred, not decided now

**EN locale / USD display.** Per [rs-client-brand.md](../domain/rs-client-brand.md): "Prices stay in MXN in both locales until dual-currency is scoped in Stage 1+." This price list is MXN-only, seeded as `basePriceCents` MXN with no USD field and no FX lookup. When dual-currency is scoped, decide between:

- **(a) Fixed operator-set rate** (e.g. 1 USD = 20 MXN) - simple and predictable for quoting, but drifts from market rate over time.
- **(b) Live FX rate** pulled periodically - more accurate, but adds a dependency and re-quote risk if the rate moves between quote and acceptance.

Not part of this pass - logged here so it isn't lost.

## Related

- [mexico-pricing-reference.md](./mexico-pricing-reference.md) - general market pricing context (retail ranges, labor, shipping)
- [custom-uniform-decoration.md](../domain/custom-uniform-decoration.md) - decoration *types* (bordado/DTF/TPU) and customization fields
- [rs-client-brand.md](../domain/rs-client-brand.md) - MXN-only pricing rule pending dual-currency scoping
