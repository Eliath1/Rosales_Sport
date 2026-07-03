# RS Client Brand (Demo)

> Used in Stage D static demo. Original client assets - not New Era.

## Colors

| Token | Hex | Use |
|-------|-----|-----|
| Brown | `#924628` | Hero backgrounds, demo banner, accents |
| Red | `#E31B23` | Primary CTA, KPI highlights, admin active nav |
| Black | `#000000` | Header promo, footer, text, admin sidebar |
| White | `#FFFFFF` | Page background, cards, button text on red |

## Logo

File: `demo/assets/rs-logo.png`

## Business focus (demo messaging)

RS sells **custom baseball uniforms and caps** (team orders with names, numbers, and decoration) plus licensed retail jerseys. Primary decoration in Mexico: **embroidery (bordado)**. US expansion: **DTF, TPU, 3D DTF** more common.

Custom order capture: `/custom/uniform` in demo; see [custom-uniform-decoration.md](./custom-uniform-decoration.md).

## Markets

| Market | Locale | Demo |
|--------|--------|------|
| Mexico (primary) | es-MX | Default |
| United States (expansion) | en | Header toggle ES / EN |

Prices stay in **MXN** in both locales until dual-currency is scoped in Stage 1+.

Defined in `demo/css/styles.css` as `--rs-brown`, `--rs-red`, `--rs-black`, `--rs-white`.

## Production

Carry tokens into `app/` Tailwind config when scaffolding Stage 0.
