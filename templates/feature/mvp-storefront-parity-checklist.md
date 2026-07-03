# MVP Storefront Parity Checklist

> **Reference patterns:** [docs/domain/reference-site-newera-mx.md](../../docs/domain/reference-site-newera-mx.md)  
> **Wave:** One (public storefront) - use during UAT

## Navigation & IA

- [ ] Home page with featured collections (Jerseys, Gorras, Equipos)
- [ ] Collection pages per category
- [ ] Breadcrumbs: Inicio -> Colección -> Producto
- [ ] Footer: aviso de privacidad, contacto, envíos, devoluciones
- [ ] Mobile hamburger menu functional

## Collection Page

- [ ] Responsive grid (2 col mobile, 3-4 desktop)
- [ ] Product card: image, title, price MXN
- [ ] Optional badge (Nuevo, Edición limitada)
- [ ] Filter by equipo / liga (Wave One.b OK if post-MVP)
- [ ] Sort by price, novedades
- [ ] Empty state when no results
- [ ] Pagination or infinite scroll (document choice)

## Product Detail Page

- [ ] Image gallery (min 2 images if available)
- [ ] Title, SKU visible
- [ ] Price formatted `es-MX` MXN
- [ ] Size selector with unavailable sizes disabled
- [ ] Link to guía de tallas
- [ ] CTA: Agregar al carrito OR Solicitar cotización (Wave Zero mode)
- [ ] Product description (material, licencia)
- [ ] Shipping estimate copy
- [ ] Related products section

## Cart & Checkout (Wave One)

- [ ] Cart persists session
- [ ] Line item qty edit/remove
- [ ] Subtotal / envío / total in MXN
- [ ] Guest checkout or account optional
- [ ] Consent checkbox if marketing opt-in
- [ ] Link to aviso de privacidad near email field
- [ ] Payment method selection (card, OXXO per roadmap)
- [ ] Order confirmation page + email

## Quote Mode (Wave Zero stretch)

- [ ] "Solicitar cotización" pre-fills quote request
- [ ] No price tampering client-side

## Performance & SEO

- [ ] LCP < 2.5s on 4G (target)
- [ ] Images lazy-loaded, WebP where supported
- [ ] `<html lang="es-MX">`
- [ ] Meta title + description per collection/product
- [ ] Open Graph tags for social sharing

## Accessibility

- [ ] Keyboard navigable size selector
- [ ] Alt text on product images
- [ ] Color contrast WCAG AA on primary buttons

## Security & Legal

- [ ] HTTPS only
- [ ] Cookie banner if analytics enabled
- [ ] No mixed content warnings

## Sign-Off

| Area | Reviewer | Date | Pass/Fail |
|------|----------|------|-----------|
| UX | | | |
| Client owner | | | |
| Engineering | | | |

**Parity score:** ___ / ___ items complete

Notes:
