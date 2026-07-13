# Demo Image Asset Plan (Stage D)

> **Purpose:** Single source of truth for every image the RS demo needs: catalog, configurator preview, and ingest pipeline.  
> **Do not use Gemini for masks.** Use Cursor image generation + repo scripts instead.

## Architecture (how pieces connect)

```
images/                          Staging (you drop or generate files here)
  catalog-mapping.json           Maps jersey1-6 -> source files
  mockup-mapping.json            Maps mockup pack -> base PNGs
       |
       v
npm run demo:assets:sync         Converts catalog + runs mockup ingest
       |
       +---> demo/images/jersey*     Storefront grids + PDP + builder thumbs
       |
       +---> demo/assets/mockups/{slug}/
                 front-base.png     Grey blank (configurator tint source)
                 back-base.png
                 front-mask-*.png   Auto-derived from bases (sharp script)
                 placement.json
       |
       v
preview-compositor.js            Canvas: base + mask tint + logo + back text
configurator.js                  Wizard state -> RSPreview.render()
```

**Why not one PNG per color combo?**  
12^4 combinations is impossible. We use **one grey base + derived zone masks + runtime tint** (realistic enough for demo). Catalog uses **finished hero photos** (6 SKUs), not every combo.

**Why not Gemini masks?**  
Masks must pixel-align with bases. The ingest script derives them from the base photo (`scripts/lib/mockup-mask-builder.js`).

---

## Track A: Catalog (storefront)

Finished product photos. **Not used for tinting.** Served at `/images/jersey*`.

| File | Product (demo) | Visual spec |
|------|----------------|-------------|
| `jersey1.webp` | Diablos borgona | Body borgona #6B0F1A, sleeves black, black placket, silver buttons |
| `jersey2.jpg` | Mexico estrellas | White body, red sleeves, small generic stars on sleeves |
| `jersey3.webp` | Diablos espalda | Back view borgona/black, no number |
| `jersey4.jpg` | Mexico emblem | Red body, white collar, abstract chest emblem |
| `jersey5.jpg` | Sultanes navy pinstripe | Navy body vertical pinstripes, plain navy sleeves |
| `jersey6.jpg` | Detail macro | Close-up buttons + mesh texture |

**Style reference (all catalog):** Professional e-commerce product photo, white background #FFFFFF, ghost mannequin, athletic mesh texture, full button placket, soft studio light, no logos, no numbers.

**Source:** `images/catalog/` or generate via Cursor -> mapped in `images/catalog-mapping.json`.

---

## Track B: Configurator mockup (`classic-button`)

Grey blank jersey for **live color preview** in `/custom/uniform/builder.html`.

| Pack file | Source | Who creates |
|-----------|--------|-------------|
| `front-base.png` | Grey/white blank front | Cursor generate -> `images/mockup-mapping.json` |
| `back-base.png` | Grey blank back (real back shot) | Cursor generate |
| `front-mask-body.png` | **Auto** from front-base | `npm run demo:mockups:gemini` |
| `front-mask-sleeve.png` | **Auto** | ingest script |
| `front-mask-collar.png` | **Auto** | ingest script |
| `back-mask-body.png` | **Auto** from back-base | ingest script |
| `back-mask-sleeve.png` | **Auto** | ingest script |
| `placement.json` | **Auto** | ingest script |

**Default preview colors** (grey blank): body/sleeve/collar `#E8E8E8`. User picks fabric swatches -> compositor tints zones.

### Color zones (configurator)

| Zone ID | UI label | Tint on |
|---------|----------|---------|
| `body` | Cuerpo jersey | Torso panels |
| `sleeve` | Mangas | Both sleeves |
| `collar` | Cuello | V-neck + placket |
| `pants` | Pantalon | pants-classic pack |
| `pants_stripe` | Franja pantalon | pants-classic pack |

### Fabric palette (closed set)

From `configurator.js` `FABRIC_GROUPS`: white, black, grey, light grey, RS red `#ED090D`, tinto, orange, navy, royal, sky, military green, flag green.

**Not every hex combo gets a catalog image.** The builder tints the grey base live.

### Patterns vs templates

| User concept | Demo implementation |
|--------------|---------------------|
| Liso | Template `classic-button` |
| Rayas verticales | Template `pro-pinstripe` (separate base when pack exists) |
| Franja lateral | Template `mexico-stars` or future pack |
| Pantalon | Template `pants-classic` |

Patterns are **separate mockup packs**, not multiplied by every color.

---

## Track C: Optional packs (later)

| Slug | Priority | Base photos needed |
|------|----------|-------------------|
| `pro-pinstripe` | P2 | front + back grey with pinstripe texture |
| `mexico-stars` | P3 | front + back grey with generic star trim |
| `pants-classic` | P2 | front + back pants blank (+ stripe masks manual or derived) |

Partial mapping already in `mockup-mapping.json` for `pants-classic`.

---

## Track D: Layer stack (future, not Phase 1)

Pre-rendered PNG per zone per color (stack without runtime tint) needs ~140 PNG/model/view. Defer until client approves demo. Current mask+tint path is sufficient for Stage D.

---

## Commands

```bash
npm run demo:mockups:bootstrap   # Copy pack sources into images/ if missing
npm run demo:assets:sync         # Catalog + mockup ingest
npm run demo:mockups:gemini      # Bases + derived masks only
npm run demo:catalog:compose     # 10 RS catalog heroes from mockup tint
npm run demo:mockups:test        # Offline tint sanity check
npm run demo:build-check
npm run demo
```

Full pipeline: [mockup-asset-pipeline.md](../architecture/mockup-asset-pipeline.md). Skill: `.cursor/skills/rs-mockup-image-generation/SKILL.md`.

---

## Acceptance checklist

- [ ] `demo/images/jersey1.webp` through `jersey6.jpg` exist and load on collection page
- [ ] `demo/assets/mockups/classic-button/front-base.png` is grey blank (not burgundy catalog shot)
- [ ] Builder step 2: changing body color tints torso on canvas within 200ms
- [ ] Front/back toggle works; back shows roster number/name
- [ ] Logo upload overlays on chest
- [ ] `demo/assets/mockups/pants-classic/` has derived pants masks
- [ ] 10 RS catalog heroes in `demo/images/catalog-*.png`
- [ ] Builder: pants template tints pants zones

---

## Related

- [uniform-mockup-asset-brief-photographer.md](./uniform-mockup-asset-brief-photographer.md)
- [../architecture/uniform-configurator.md](../architecture/uniform-configurator.md)
- `images/README-mockups.txt`
- `demo/assets/mockups/README.md`
