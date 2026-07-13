# Feature Spec: Uniform Configurator - Phase A (Demo Local)

> **Wave:** Stage D extension -> Wave 0 backend  
> **Status:** Ready to implement  
> **Owner:** RS platform team  
> **Architecture:** [uniform-configurator.md](../architecture/uniform-configurator.md)

## Problem statement

Clients and designers lose hours in WhatsApp clarifying colors, logo placement, roster, and sizes. RS needs a self-service builder that produces a **complete, structured order** the admin can open without back-and-forth.

## User stories

| Actor | Story |
|-------|-------|
| Coach / cliente final | Quiero elegir modelo, colores y logos y ver un preview antes de enviar |
| Coach | Quiero cargar mi escudo y lista de jugadores en un solo formulario |
| Diseñador RS | Quiero abrir el admin y ver spec JSON, preview y archivos sin abrir WhatsApp |
| Ventas | Quiero convertir un diseno aprobado en cotizacion con un clic (Wave 0 B) |

## Acceptance criteria (Phase A - demo)

### AC-1: Wizard navigation

- **Given** the user opens `/custom/uniform/builder.html`
- **When** they complete all 6 steps with valid data
- **Then** they see a success message and data is stored in `sessionStorage` under key `rs_design_request`

### AC-2: Preview updates live

- **Given** step 3 (colors) or step 4 (logo) changes
- **When** the user views step 6 (review)
- **Then** the SVG preview reflects selected colors and uploaded logo within 200ms (client-side)

### AC-3: Structured spec output

- **Given** a completed submit
- **When** staff opens `/admin/designs.html` (demo) or quote detail mock
- **Then** roster, sizes, decoration, template slug, and colors are visible in a readable table/JSON block

### AC-4: Bilingual

- **Given** ES or EN toggle
- **When** navigating the wizard
- **Then** all step labels and hints translate via `messages.js` keys prefixed `builder.*`

### AC-5: Privacy

- **Given** submit step
- **When** consent checkbox is unchecked
- **Then** form does not submit

### AC-6: No backend required

- **Given** `npm run demo` on port 3456
- **When** user completes flow offline
- **Then** full UX works without Neon or Netlify functions

## UI routes (Phase A files to create/edit)

| Action | Path |
|--------|------|
| Create | `demo/custom/uniform/builder.html` |
| Create | `demo/js/configurator.js` |
| Create | `demo/css/configurator.css` (or extend `styles.css`) |
| Create | `demo/assets/templates/jersey-classic.svg` |
| Create | `demo/assets/templates/pants-classic.svg` |
| Create | `demo/admin/designs.html` |
| Edit | `demo/index.html` - primary CTA -> builder |
| Edit | `demo/js/messages.js` - `builder.*` keys ES+EN |
| Edit | `demo/admin/index.html` - link to designs inbox |
| Edit | `scripts/verify-demo.js` - builder page exists |

## Asset requirements

### What you can run locally WITHOUT client files

| Asset | Source | Notes |
|-------|--------|-------|
| Jersey SVG template | **Generate in repo** | Paths named `body`, `sleeve`, `collar`, `buttons` |
| Pants SVG template | **Generate in repo** | Paths `pants_body`, `stripe` |
| Template thumbnails | **Reuse** `demo/images/jersey1.webp` etc. | Card picker only; not used for mask compositing |
| Placeholder logo | **Inline SVG shield** in repo | Until user uploads |
| Brand colors | `#ED090D`, `#000000`, `#FFFFFF` | Already in CSS vars |

We will **not** depend on pulling images from the internet for the demo. Optional stock URLs break, have license issues, and do not match RS blanks.

### What to request FROM THE CLIENT (before layered preview UX-B2)

**Full handoff document for photographer / retouch:** [uniform-mockup-asset-brief-photographer.md](./uniform-mockup-asset-brief-photographer.md)

| Asset | Format | Purpose |
|-------|--------|---------|
| Blank jersey front/back per model | PNG 2000px+, neutral blank | `front-base.png`, `back-base.png` |
| Color masks per zone | PNG grayscale, same dimensions | Tint body/sleeve/collar independently |
| Shadow / texture overlays | PNG aligned to base | Realistic folds after tint |
| Pants front/back | Same as jersey | Uniform set preview |
| Logo placement safe zones | `placement.json` or annotated PNG | Chest, sleeve, number, name |
| Official color list | CSV or PDF | Palette in builder (team fabric codes) |
| Number/name fonts | OTF/TTF (optional) | Accurate preview text |
| 3-5 hero template photos | WebP optimized | Marketing + template picker only |

**Minimum client pack for MVP preview:** 1 jersey model (`classic-button` recommended): front + back base, 3 front masks, 2 back masks, shadow layers. See photographer brief section 4 and 8 for QA checklist.

**Storage after delivery:** `demo/assets/mockups/{slug}/` (demo) -> R2 `rs-template-assets/{slug}/` (production). Manifest in `UniformTemplate.specSchema` per [uniform-configurator.md](../architecture/uniform-configurator.md#preview-engine-layered-png).

### Can we pull images from the web?

| Approach | Verdict |
|----------|---------|
| New Era / MLB / Google Images product shots | **No** - license + wrong product |
| Unsplash generic "baseball jersey" | **Demo only** if client has zero assets; label as placeholder |
| SVG generated in code | **Yes** - default for Phase A localhost |
| Existing `demo/images/` | **Yes** - already in repo for thumbnails |

## `uniform_spec_v1` schema (Zod sketch)

```typescript
const uniformSpecV1 = z.object({
  version: z.literal("1"),
  templateSlug: z.string(),
  productType: z.enum(["jersey", "pants", "uniform", "cap", "set"]),
  colors: z.record(z.string(), z.string().regex(/^#[0-9A-Fa-f]{6}$/)),
  logos: z.array(z.object({
    zone: z.string(),
    fileName: z.string(),
    dataUrl: z.string().optional(), // demo only; strip before API
  })),
  sizeBreakdown: z.record(z.string(), z.number().int().min(0)),
  roster: z.array(z.object({
    name: z.string(),
    number: z.string(),
    size: z.string(),
  })),
  decoration: z.enum(["embroidery", "dtf", "tpu", "3d_dtf"]),
  quantity: z.number().int().positive(),
  teamName: z.string().optional(),
  notes: z.string().optional(),
});
```

## Phase B hooks (when connecting Neon)

| Demo field | DB column |
|------------|-----------|
| `sessionStorage.rs_design_request` | `design_requests.spec` |
| Logo data URLs | Upload to R2 -> `design_assets.storage_url` |
| Preview data URL | `design_requests.preview_url` |
| Contact fields | `contact_name`, `contact_email`, + `customers` upsert |

## Test plan (localhost)

1. `npm run demo:build-check` passes
2. Open builder, complete all steps in ES
3. Toggle EN, confirm labels change
4. Upload PNG logo < 2MB, see it on preview
5. Submit, open `/admin/designs.html`, see row with team name and qty
6. Mobile width 375px: wizard usable without horizontal scroll

## Out of scope (Phase A)

- Email notifications
- Approval link `/design/[token]`
- Auto-price quote
- Server-side image compositing
- Cap template (can add stub step "coming soon")
