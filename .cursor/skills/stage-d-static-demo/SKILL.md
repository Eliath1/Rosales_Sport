---
name: stage-d-static-demo
description: >-
  Edits, validates, and deploys the Stage D static HTML demo in demo/.
  Use when changing demo copy, jersey images, collection grid, hero, custom
  uniform form, or Netlify preview deploy. Prevents layout regressions.
---

# Stage D Static Demo

## When to use

- Client preview on Netlify (`publish = demo`)
- Hero, collection, PDP, quote forms in `demo/`
- Adding jersey images from `images/` into the live demo

**Not for:** `app/` Next.js CRM (use `implement-frontend-nextjs`).

## Instructions

1. Read `.cursor/rules/stage-d-demo.mdc` and [docs/architecture/stage-demo-static.md](../../../docs/architecture/stage-demo-static.md).
2. **Plan first:** list files to touch; confirm card HTML and CSS constraints unchanged unless requested.
3. Copy changes: edit `demo/js/messages.js` (es + en); keep `data-i18n` attributes in HTML.
4. Images: copy to `demo/images/`; wire with `placeholder-jersey has-photo` + inline `background-image`.
5. Run `npm run demo:build-check` and `npm run demo` for local smoke at http://localhost:3456.
6. Deploy: `npx netlify deploy --prod --dir=demo` or `npm run demo:package` for drag-and-drop zip.

## Pre-edit checklist

```
- [ ] Product cards keep product-image + product-info + h3 + price
- [ ] No raw <img> in .product-image on collection/home grids
- [ ] PDP thumbs keep data-i18n-key or data-image for demo.js gallery
- [ ] Finishing copy does not imply MX-only or US-only unless approved
- [ ] No duplicate hero CTA band repeating Personalizar uniforme
```

## Post-edit checklist

```
- [ ] npm run demo:build-check (files + HTML structure)
- [ ] Spot-check /collections/jerseys (uniform card sizes)
- [ ] Spot-check / and /custom/uniform
- [ ] ES and EN toggle still works on edited strings
```

## Reference Docs

- [docs/architecture/stage-demo-static.md](../../../docs/architecture/stage-demo-static.md)
- [demo/README.md](../../../demo/README.md)
- [docs/domain/custom-uniform-decoration.md](../../../docs/domain/custom-uniform-decoration.md)
