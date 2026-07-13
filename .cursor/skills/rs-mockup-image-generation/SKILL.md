---
name: rs-mockup-image-generation
description: >-
  Generate and ingest RS uniform mockup bases, derived zone masks, and catalog
  hero images without a photographer. Use when building configurator preview
  packs, grey blank jerseys/pants, catalog photos, or running the demo asset
  pipeline.
---

# RS Mockup Image Generation

## When to use

- Configurator preview needs grey blank bases or masks
- Catalog needs new jersey/pants hero photos
- User attaches Gemini or Cursor-generated product images
- `images/mockup-mapping.json` or `images/catalog-spec.json` needs updates

## Hard rules

1. **Never use separate AI mask PNGs for jerseys.** Masks must be derived from the same base photo via `scripts/lib/mockup-mask-builder.js`.
2. **Grey blanks for mockups, finished colors for catalog.** Mockup bases are neutral `#D8D8D8` to `#E8E8E8`. Catalog heroes show final team colors.
3. **Stage D paths:** staging in `images/`, served from `demo/images/` and `demo/assets/mockups/`.
4. **No licensed MLB/LMB logos** in generated images. Generic stars or stripes only.
5. **MXN pricing** for RS custom catalog: $450 standard, $650 customized unless user specifies otherwise.

## Image generation prompts (Cursor GenerateImage)

### Jersey mockup base (front)

```
Professional e-commerce product photo of a blank grey baseball jersey, front view.
Solid light grey mesh fabric (#D8D8D8), no logos, no numbers, no team marks.
Full button placket, short sleeves, V-neck collar, ghost mannequin shape.
Pure white background #FFFFFF, soft studio lighting, subtle fabric folds.
Photorealistic, centered, vertical 4:5 aspect ratio.
```

### Jersey mockup base (back)

```
Professional e-commerce product photo of a blank grey baseball jersey, back view.
Same light grey mesh as front, no logos, no name, no number.
Ghost mannequin, white background, studio lighting, photorealistic, 4:5 vertical.
```

### Pants mockup base (front)

```
Professional product photo of blank grey baseball pants, front view.
Light grey athletic fabric, elastic waistband, no logos, white background.
Ghost mannequin legs, studio light, photorealistic, 4:5 vertical.
```

### Pants mockup base (back)

```
Professional product photo of blank grey baseball pants, back view.
Light grey fabric, no logos, white background, ghost mannequin, 4:5 vertical.
```

### Catalog hero (finished jersey)

Add color specifics: body color hex, sleeve color, trim, optional generic stars (not MLB). Always: white background, no brand logos, no player names/numbers unless demo licensed SKU.

## Pipeline workflow

```
1. Save or generate PNGs -> images/ (or images/catalog/)
2. Update images/mockup-mapping.json (mockup bases only)
3. Update images/catalog-spec.json (catalog color presets)
4. npm run demo:mockups:bootstrap   # if sources only in demo/assets
5. npm run demo:assets:sync         # ingest + catalog
6. npm run demo:mockups:test
7. npm run demo:build-check
8. Hard-refresh /custom/uniform/builder.html
```

## mockup-mapping.json shape

```json
{
  "verified": true,
  "classic-button": {
    "front-base.png": "mockup-classic-front-base.png",
    "back-base.png": "mockup-classic-back-base.png"
  },
  "pants-classic": {
    "front-base.png": "mockup-pants-front-base.png",
    "back-base.png": "mockup-pants-back-base.png"
  }
}
```

Only list `*-base.png` entries. Masks are auto-derived on ingest.

## Catalog composition (configurator only)

**Do not** use `demo:catalog:compose` for storefront heroes. That tints grey mockup bases and looks like a digital filter on cards.

For catalog cards, use **finished product photos** via Cursor `GenerateImage` or chat attachments, then:

```bash
npm run demo:catalog:sync
```

Preset list: `images/catalog-spec.json` (all entries `type: "photo"`).

## Configurator variant bank (curated AI photos + live tint fallback)

For **builder preview** (not catalog cards), the bank ships a **curated set of real
AI-generated product photos** for the most common color combos, per garment. Any
combo outside the curated set falls back automatically to live tint over the grey
mockup base (`renderLayered` in `preview-compositor.js`) - no algorithmic tinting is
pre-rendered anymore.

Do not generate the full combinatorial product (e.g. 7^3 = 343 jersey combos). A
fully tinted bank looks identical to the live-tint fallback (same base photo, same
multiply-blend tint) and reads as a color filter rather than a real product photo.
Curated photos exist to look visibly different: real fabric, real seams, real
contrast between zones.

### Structure

- `images/variant-bank-colors.json` (`mode: "curated-photo"`): `bank` (7 shared
  colors), `paletteMap` (hex -> bank id), and `garments.{slug}` with `zones`,
  `baseFront`/`baseBack` (mockup base used as generation reference), `stagingDir`,
  `outDir`, and `curatedCombos` (the list of combos to render as real photos).
- Staging: generated photos land in `images/variant-photos/{slug}/` named
  `variant-{slug}-{comboKey}-{front|back}.png` before normalization.
- Served output: `demo/assets/variant-bank/{slug}/{front|back}/{comboKey}.png` +
  `manifest.json`, built by `scripts/build-curated-variant-manifest.js`.

### Adding or changing curated combos

1. Add an entry to `garments.{slug}.curatedCombos` in
   `images/variant-bank-colors.json` (`key`, one color id per zone, `label`).
2. Generate the front and back photos with Cursor `GenerateImage`, using the
   garment's `baseFront`/`baseBack` as the reference image so pose and framing stay
   consistent. Prompt pattern:

   ```
   Professional e-commerce product photo of [garment], [front|back] view, matching
   the exact pose, framing, and ghost-mannequin shape of the reference image.
   [Base color description], [any second zone: explicit color + which part of the
   garment it covers]. No logos, no numbers. Pure white background, soft studio
   lighting, photorealistic, centered, 4:5 vertical aspect ratio.
   ```

   For multi-zone jerseys, name each zone's color explicitly (e.g. "white body with
   red sleeves and red collar trim") - vague prompts tend to under-render contrast
   zones.
3. Save both images as `variant-{slug}-{comboKey}-front.png` /
   `-back.png` into `images/variant-photos/{slug}/` (the generator saves to the
   Cursor project's own `assets/` folder first; move them into the staging dir).
4. Run `npm run demo:variant-bank:build` (wraps
   `scripts/build-curated-variant-manifest.js`) to normalize size and rebuild
   `manifest.json`. This wipes and regenerates the `front/`/`back/` folders for
   every garment listed in `garments`, so re-run it any time combos change.
5. Hard-refresh `/custom/uniform/builder.html`, pick the curated combo, and confirm
   the preview swaps to the real photo (not a tint). Un-curated combos should still
   render via live tint.

## File placement

| Asset | Staging | Served |
|-------|---------|--------|
| Mockup bases | `images/mockup-classic-*.png` | `demo/assets/mockups/{slug}/` |
| Catalog heroes | `images/catalog/` or composed | `demo/images/catalog-*.png` |
| Mapping | `images/mockup-mapping.json` | n/a |

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| Solid color rectangles on preview | Re-ingest; masks must be derived from base, not separate files |
| No tint change | Check `placement.json` `tintEnabled: true` and `MOCKUP_PACKS` includes slug |
| Pants not tinting | Ensure `pants-classic` in `preview-compositor.js` `MOCKUP_PACKS` |
| Missing file on ingest | Run `npm run demo:mockups:bootstrap` |

## Related docs

- [docs/architecture/mockup-asset-pipeline.md](../../../docs/architecture/mockup-asset-pipeline.md)
- [docs/specs/demo-image-asset-plan.md](../../../docs/specs/demo-image-asset-plan.md)
- [docs/specs/uniform-mockup-asset-brief-photographer.md](../../../docs/specs/uniform-mockup-asset-brief-photographer.md)
