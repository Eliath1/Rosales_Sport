# RS Client Brand (Demo)

> Used in Stage D static demo. Original client assets - not New Era.

## Colors

| Token | Hex | RGB | Use |
|-------|-----|-----|-----|
| Red | `#ED090D` | 237, 9, 13 | Demo banner, hero, primary CTA, KPI highlights, admin active nav |
| Black | `#000000` | 0, 0, 0 | Logo circle in header, promo bar, footer, text, admin sidebar |
| White | `#FFFFFF` | 255, 255, 255 | Page background, cards, button text on red |

Brown (`#924628`) is deprecated. Do not use in new demo work.

## Logo

| File | Use |
|------|-----|
| `demo/assets/rs-logo-source.png` | Client master (black background) |
| `demo/assets/rs-logo.png` | Header on black (transparent PNG; Sport script white) |
| `demo/assets/rs-logo-hero.png` | Hero on red (transparent PNG; Sport script black) |

Run `npm run demo:logo` after updating source or reference files.

Both outputs are PNG with alpha. Counters inside **Sport** (p, o, r) are transparent so the header (black) or hero (red) background shows through.

## Business focus (demo messaging)

RS sells **custom baseball uniforms and caps** (team orders with names, numbers, and decoration) plus licensed retail jerseys. Primary decoration in Mexico: **embroidery (bordado)**. US expansion: **DTF, TPU, 3D DTF** more common.

Custom order capture: `/custom/uniform` in demo; see [custom-uniform-decoration.md](./custom-uniform-decoration.md).

## Markets

| Market | Locale | Demo |
|--------|--------|------|
| Mexico (primary) | es-MX | Default |
| United States (expansion) | en | Header toggle ES / EN |

Prices stay in **MXN** in both locales until dual-currency is scoped in Stage 1+.

Defined in `demo/css/styles.css` as `--rs-red`, `--rs-black`, `--rs-white`.

## Production

Carry tokens into `app/` Tailwind config when scaffolding Stage 0.
