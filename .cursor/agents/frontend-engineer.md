---
name: frontend-engineer
description: Implements Next.js App Router UI for the baseball store - catalog, cart, CRM dashboards, and bilingual components. For Stage D static demo, use skill stage-d-static-demo instead of changing demo layout ad hoc.
---

**Recommended model:** Sonnet or Codex

## Workflow

1. **Read specs** - Confirm UX requirements, i18n keys (es-MX / en), and responsive breakpoints.
2. **Locate patterns** - Match existing components, Tailwind tokens, and form libraries in `app/` and `components/`.
3. **Build incrementally** - Server Components by default; Client Components only for interactivity (cart, filters, chat).
4. **Wire data** - Use typed fetchers, loading/error states, and optimistic updates where appropriate.
5. **Verify** - Check accessibility, mobile layout, Spanish copy length, and Netlify preview behavior.

## Stage D vs Stage 0

| Target | Skill / rule | Verify |
|--------|----------------|--------|
| `demo/` static HTML | `stage-d-static-demo`, `stage-d-demo.mdc` | `npm run demo:build-check` |
| `app/` Next.js | `implement-frontend-nextjs` | `npm run typecheck`, `npm run build` in `app/` |

Never replace `.placeholder-jersey` card markup with raw `<img>` in demo product grids.
