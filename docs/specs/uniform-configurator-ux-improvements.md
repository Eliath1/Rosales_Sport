# Uniform Configurator - UX Improvements Plan

> **Status:** Planning (do not copy Idink frontend)  
> **Builds on:** [uniform-configurator-phase-a.md](./uniform-configurator-phase-a.md), [uniform-configurator.md](../architecture/uniform-configurator.md)  
> **Reference (patterns only, not visual clone):** [Idink customizable jersey](https://www.idinkclothing.com.mx/products/jersey-beisbol-combinado-personalizable-2?variant=51342761984216)

## Design principles (RS, not Idink)

| Principle | RS approach | Avoid (Idink-style) |
|-----------|-------------|---------------------|
| Job to be done | "Armar pedido de equipo" | "Comprar 1 jersey" |
| Layout | Wizard claro + preview lateral en tarjeta clara | PDP ecommerce con carrito |
| Background preview | Fondo blanco/gris claro, sombra suave | Panel negro tipo tienda |
| Progress | Pasos con nombre y checkmarks | Solo dots o variantes Shopify |
| Copy | Español directo para coach/liga | Jerga retail ("Agregar a carrito") |
| Color | Zonas de prenda + paleta tela | Solo swatch de producto |
| Cierre | Enviar pedido -> ventas contacta | Checkout inmediato |
| Marca | Rojo `#ED090D`, negro, blanco (header existente) | Estética competidor |

**Goal:** Intuitivo, amigable, práctico para quien pide 12-24 uniformes sin ser diseñador.

---

## Target personas

| Persona | Needs | UX priority |
|---------|-------|-------------|
| Coach / coordinador liga | Rápido, sin errores en tallas y números | Roster práctico, resumen claro |
| Padre / fan (1-3 piezas) | Simple, pocos campos | Atajo "pedido pequeño" |
| Ventas RS (admin) | Spec completo sin WhatsApp | Resumen humano + assets |
| Diseñador RS | Preview fiel a colores/zonas | Compositor por máscaras |

---

## Information architecture (revised wizard)

Reduce fricción: **6 pasos -> 4 pasos** manteniendo el mismo `uniform_spec_v1`.

| Step | Title (ES) | Contains | Why merged |
|------|------------|----------|------------|
| 1 | **Tu pedido** | Tipo (uniforme/jersey/pantalon/set), plantilla, cantidad estimada | Contexto primero |
| 2 | **Apariencia** | Colores por zona + logo + nombre equipo | Look junto; preview reacciona aqui |
| 3 | **Equipo** | Tallas, roster, decoración (bordado/DTF...) | Datos de producción juntos |
| 4 | **Revisar y enviar** | Resumen tarjetas + contacto + consentimiento | Sin JSON crudo visible por default |

Internal step IDs stay compatible: `product`, `template`, `colors`, `branding`, `roster`, `review` map into 4 UI screens.

---

## Layout wireframe (desktop)

```
+------------------------------------------------------------------+
| [RS header negro]                                                |
+------------------------------------------------------------------+
|  Diseña tu uniforme                                              |
|  [====o--------] Paso 2 de 4: Apariencia                         |
+------------------------------------------------------------------+
|  FORM (60%)                    |  PREVIEW (40%)                  |
|  Tarjeta blanca                |  Tarjeta gris claro             |
|  - campos del paso             |  [ Frente | Espalda ]           |
|  - hint amigable               |  +------------------+           |
|  - [Anterior] [Siguiente]      |  | mockup realistic |           |
|                                |  +------------------+           |
|                                |  Resumen mini:                  |
|                                |  12 pzas · Bordado              |
|                                |  Blanco / Rojo RS               |
+------------------------------------------------------------------+
```

### Mobile

- Preview **sticky** arriba del formulario (altura ~180px), colapsable "Ver diseño".
- Un paso por pantalla; botón Siguiente fijo abajo (thumb zone).
- Colores: una zona por fila; al tocar zona, preview resalta esa parte (borde rojo RS).

---

## Preview improvements (realistic, RS look)

### Engine (unchanged technically)

- `LayeredPreviewRenderer`: máscaras PNG + overlay sombras.
- Keep `COLOR_ZONES` and `state.colors`.

### Presentation (RS-specific)

| Element | Spec |
|---------|------|
| Container | `background: #f5f5f5`, `border-radius: 8px`, padding 16px |
| View toggle | Segmented control: `Frente` / `Espalda` (activo = rojo RS) |
| Label | "Vista previa de tu diseño" (no flechas graffiti) |
| Live summary | Line under preview: qty, decoration, 2-3 color names |
| Loading | Skeleton silueta mientras cargan capas |
| Fallback | SVG si faltan assets (`previewMode: "svg" | "photo"`) |

### Interaction

- Tap zone label in step 2 -> pulse highlight on mockup zone.
- Changing color updates preview in < 200ms (client canvas).

---

## Step-by-step UX (friendly + practical)

### Paso 1 - Tu pedido

- Cards con **icono + titulo + subtitulo** (ej. "Uniforme completo - jersey y pantalon").
- Plantillas: foto thumbnail + nombre ("Clasico con botones").
- Chip "Pedido chico (1-5 piezas)" vs "Equipo (12+)" ajusta hints y validación mínima.
- **No precio** en wizard (cotización después).

### Paso 2 - Apariencia

- Lista vertical de zonas (Cuerpo, Mangas, Cuello...) cada una con:
  - Nombre en español claro
  - Swatches redondeados (marca + paleta tela)
  - Input color opcional avanzado
- Paleta agrupada: **Neutros | Rojos | Azules | Verdes | Otros** (16-20 colores con nombre legible, no solo hex).
- Logo: drag-and-drop zone con texto "Arrastra tu escudo o haz clic".
- Ubicación logo: 3 botones pictograma (pecho/manga/pantalon), no solo radio.

### Paso 3 - Equipo

- Tabla tallas XS-XXL (actual) + total automático.
- Roster:
  - Filas auto según total piezas
  - Botón **Pegar desde Excel/WhatsApp** (parse `Nombre | Numero | Talla`)
  - Plantilla CSV descargable
  - Primer jugador opcionalmente mostrado en preview espalda (fase UX-B3)
- Decoración: tarjetas con recomendación "Recomendado en Mexico: Bordado".
- Nota práctica: "No necesitas archivo final. Sube referencia y ventas afina."

### Paso 4 - Revisar y enviar

- **Tarjetas resumen** (no JSON por defecto):
  - Pedido (tipo, plantilla, cantidad)
  - Colores (swatches + nombres)
  - Equipo (tabla roster compacta)
  - Contacto
- Acordeón "Detalle técnico" para JSON (staff/debug).
- Checkbox doble:
  1. Privacidad (LFPDPPP)
  2. "Revisé mi diseño y datos del roster"
- CTA primario: **Enviar pedido a Rosales Sport** (rojo RS).
- Post-submit: mensaje amigable + tiempo respuesta "24 horas hábiles" + link admin demo.

---

## Admin UX alignment

| Current | Improved |
|---------|----------|
| JSON block first | Resumen legible primero |
| Raw preview only | Preview + descarga logo |
| "Crear cotización" toast | Flujo: En revisión -> Aprobado -> Cotización |

Pantalla detalle: mismas 4 tarjetas que el cliente vio + botón "Solicitar cambio al cliente" (fase C).

---

## Copy tone (ES examples)

| Avoid | Prefer |
|-------|--------|
| "Spec JSON" | "Detalle de tu pedido" |
| "Template slug" | "Modelo: Clasico con botones" |
| "Decoration type" | "Tipo de estampado: Bordado" |
| "Submit design order" | "Enviar pedido" |
| Error: "Select template" | "Elige un modelo de jersey para continuar" |

---

## Delivery phases

| Phase | Scope | Effort | Depends on |
|-------|-------|--------|------------|
| **UX-B1** | 4 pasos, progress con nombres, resumen tarjetas, preview card RS, mobile sticky | 2-3 días | Ninguno |
| **UX-B2** | `LayeredPreviewRenderer`, frente/espalda, 1 asset pack | 3-4 días | Mockup PNG/PSD |
| **UX-B3** | Paleta tela nombrada, paste roster, zona <-> preview highlight, nombre en espalda preview | 2-3 días | B2 |
| **UX-B4** | API Neon, email ventas, link aprobación cliente | Wave 0 | B1 |

**Recommended order:** UX-B1 first (mejora percepción sin assets). UX-B2 when RS or placeholder PSD ready.

---

## What we explicitly do not build

- Carrito / precio en vivo estilo Idink
- Carrusel marketing de 6 fotos fijas
- Panel preview negro
- Selector de 1 sola talla retail
- Copiar tipografía, badges, o layout PDP Shopify del competidor

---

## Acceptance criteria (UX-B1)

1. Usuario completa flujo en 4 pasos sin ver JSON obligatorio.
2. Progress muestra "Paso X de 4" + nombre del paso.
3. Preview visible en mobile (sticky o colapsable).
4. Paso 4 muestra tarjetas resumen con roster y colores.
5. Mensajes de error en español claro.
6. `uniform_spec_v1` sigue siendo el payload guardado (sin breaking change).
7. ES/EN en todas las cadenas nuevas.

---

## Files to touch (when executing)

| File | Change |
|------|--------|
| `demo/custom/uniform/builder.html` | 4-step layout, preview card, summary cards |
| `demo/css/configurator.css` | RS preview card, progress, mobile sticky |
| `demo/js/configurator.js` | Step merge, summary renderer, paste roster |
| `demo/js/preview-compositor.js` | New (UX-B2) |
| `demo/js/messages.js` | New copy keys `builder.v2.*` |
| `demo/admin/designs/detail.html` | Human summary cards |
| `scripts/verify-demo.js` | Assert 4-step markers |

---

## Open questions for client (before UX-B2 assets)

Answer in photographer brief section 11; track decisions here:

1. Nombres oficiales de colores de tela (para swatches etiquetados).
2. Un modelo hero para mockup (el que más venden) - default propuesto: `classic-button`.
3. Zonas personalizables confirmadas por modelo.
4. Quién produce máscaras y sombras (fotógrafo vs diseñador RS).
5. Tiempo de respuesta comercial prometido (24h? 48h?).

**Photographer deliverable spec:** [uniform-mockup-asset-brief-photographer.md](./uniform-mockup-asset-brief-photographer.md)
