# Brief de entrega: activos fotográficos para el configurador de uniformes RS

> **Audiencia:** Fotógrafo / retocador / diseñador gráfico de RS  
> **Consumidor técnico:** Equipo de desarrollo (configurador web)  
> **Arquitectura:** [uniform-configurator.md](../architecture/uniform-configurator.md)  
> **Estado:** Borrador para aprobación RS - julio 2026

## 1. Para qué sirven estos archivos

RS está construyendo un **configurador en línea** donde el cliente elige modelo, colores, logo y roster, y ve un **preview realista** antes de enviar el pedido. El objetivo es reducir el ida y vuelta por WhatsApp entre cliente y diseñador.

Hoy el preview usa fotos de producto con zonas de color aproximadas. Para lograr un mockup de calidad profesional (comparable a herramientas del sector), necesitamos un **paquete de capas por modelo**:

```
Foto base (jersey en blanco)
  + máscaras por zona (cuerpo, manga, cuello, etc.)
  + capa de sombras / textura
  + logo y texto del cliente (lo agrega el sitio)
  = preview final
```

**Este documento define qué debe entregar el fotógrafo (y retoque) para que desarrollo pueda integrarlo.**

---

## 2. Alcance por fases

| Fase | Qué entregar | Prioridad |
|------|--------------|-----------|
| **Fase 1 - Hero** | 1 modelo de jersey (frente + espalda + máscaras + sombras) | **Urgente** - desbloquea preview real en el sitio |
| **Fase 2 - Pantalón** | 1 modelo de pantalón (mismo esquema) | Alta - pedidos de uniforme completo |
| **Fase 3 - Catálogo** | Resto de modelos del configurador | Media - según ventas RS |
| **Fase 4 - Marketing** | Fotos terminadas para tarjetas y home | Baja - no alimentan el tintado |

**Recomendación RS:** empezar con el jersey que más venden (botones clásico o el que el equipo comercial indique).

---

## 3. Modelos a cubrir (slugs del configurador)

Cada fila es un **paquete independiente** con la misma estructura de archivos.

| Slug (nombre de carpeta) | Prenda | Notas |
|--------------------------|--------|-------|
| `classic-button` | Jersey botones | **Fase 1 - hero** |
| `pro-pinstripe` | Jersey rayas | Fase 3 - requiere máscara extra `pinstripe` |
| `mexico-stars` | Jersey detalle especial | Fase 3 - zonas según diseño RS |
| `pants-classic` | Pantalón beisbol | Fase 2 |

Si un modelo no existe aún en producción RS, omitir hasta tener la prenda física en blanco.

---

## 4. Lista de archivos por modelo (checklist)

Usar el slug como carpeta. Ejemplo: `classic-button/`

### 4.1 Fotos base (responsabilidad principal del fotógrafo)

| Archivo | Vista | Descripción |
|---------|-------|-------------|
| `front-base.png` | Frente | Jersey **en blanco neutro** (blanco o gris claro), sin logo, sin número, sin nombre de equipo |
| `back-base.png` | Espalda | Misma prenda, misma escala y encuadre que el frente |

### 4.2 Máscaras de color (retoque / diseñador; puede ser el mismo proveedor)

Una máscara por **zona personalizable** en el configurador. Formato: PNG en escala de grises, **mismas dimensiones en píxeles** que la foto base correspondiente.

| Archivo | Zona en el sitio | Regla |
|---------|------------------|-------|
| `front-mask-body.png` | Cuerpo del jersey | Blanco = área que recibe color; negro = transparente al tintado |
| `front-mask-sleeve.png` | Mangas (ambas) | Igual regla |
| `front-mask-collar.png` | Cuello / botonera | Igual regla |
| `back-mask-body.png` | Espalda (número y nombre) | Igual regla |
| `back-mask-sleeve.png` | Mangas espalda | Igual regla |

**Modelos con rayas o piping extra:**

| Archivo | Zona |
|---------|------|
| `front-mask-pinstripe.png` | Rayas verticales |
| `front-mask-piping.png` | Borde / piping |
| `front-mask-trim.png` | Otros detalles |

**Pantalón (`pants-classic`):**

| Archivo | Zona |
|---------|------|
| `front-mask-pants.png` | Cuerpo del pantalón |
| `front-mask-pants_stripe.png` | Franja lateral |
| `back-mask-pants.png` | Espalda pantalón |
| `back-mask-pants_stripe.png` | Franja espalda |

### 4.3 Capas de realismo (retoque)

| Archivo | Descripción |
|---------|-------------|
| `front-shadow.png` | Pliegues, costuras, sombras; se superpone encima del color (modo multiply u overlay) |
| `back-shadow.png` | Igual para espalda |

Opcional pero recomendado:

| Archivo | Descripción |
|---------|-------------|
| `front-texture.png` | Tejido sutil si la base queda muy plana |
| `placement.json` | Coordenadas de logo y texto (ver sección 6) |

---

## 5. Especificaciones de captura (fotógrafo)

### 5.1 Prenda

- Usar **blank real de RS** (misma tela y corte que producción).
- Color de muestra: **blanco** o **gris muy claro** (#e8e8e8 aprox.). Evitar colores fuertes en la muestra.
- Sin parches, sin bordado, sin sublimado de prueba.
- Planchado / presentación limpia; sin arrugas que distorsionen el corte.
- Si el modelo lleva botones, que sean neutros (blanco o gris).

### 5.2 Encuadre y consistencia

| Parámetro | Requisito |
|-----------|-----------|
| Resolución mínima | **2000 px** en el lado más largo (ideal 2500-3000 px) |
| Formato de entrega | PNG sin pérdida (fotos base y máscaras) |
| Proporción frente / espalda | **Misma escala**: el jersey debe ocupar el mismo % del frame en ambas vistas |
| Orientación | Vertical (prenda centrada) |
| Simetría | Prenda centrada horizontalmente; eje vertical consistente |
| Vistas | Frente y espalda como **dos disparos reales**. No voltear la foto del frente en Photoshop. |

### 5.3 Iluminación y fondo

| Parámetro | Requisito |
|-----------|-----------|
| Iluminación | Suave, difusa; que se lean pliegues y textura sin quemar blancos |
| Fondo | Gris claro uniforme **o** transparente (recorte en post) |
| Sombras en piso | Evitar sombras duras que compitan con la capa `shadow` del compositor |
| Color | Perfil sRGB; sin filtro creativo fuerte |

### 5.4 Qué no debe aparecer en la base

- Logos de MLB, NFL, marcas de terceros (licencias).
- Números o nombres de jugador.
- Maniquí visible (preferir recorte o ghost mannequin limpio).
- Etiquetas de talla visibles en zona de logo (recortar o retocar).

---

## 6. Colocación de logo y texto (opcional Fase 1, requerido Fase 2)

Archivo `placement.json` por modelo. Coordenadas en **porcentaje del ancho/alto de la imagen** (0.0 a 1.0).

```json
{
  "front": {
    "chest_center": { "x": 0.5, "y": 0.42, "maxW": 0.22, "maxH": 0.12 },
    "chest_left": { "x": 0.38, "y": 0.40, "maxW": 0.18, "maxH": 0.10 },
    "sleeve_left": { "x": 0.12, "y": 0.38, "maxW": 0.08, "maxH": 0.08 }
  },
  "back": {
    "number": { "x": 0.5, "y": 0.38, "maxW": 0.28, "maxH": 0.22 },
    "name": { "x": 0.5, "y": 0.52, "maxW": 0.55, "maxH": 0.08 }
  }
}
```

Alternativa: entregar un PNG anotado (`placement-guide.png`) con rectángulos y etiquetas; desarrollo lo traduce a JSON.

---

## 7. Estructura de carpetas para entrega

Comprimir en ZIP o subir a Drive con esta estructura:

```
rs-mockup-assets/
  README.txt                    # contacto, fecha, modelo físico usado
  classic-button/
    front-base.png
    back-base.png
    front-mask-body.png
    front-mask-sleeve.png
    front-mask-collar.png
    back-mask-body.png
    back-mask-sleeve.png
    front-shadow.png
    back-shadow.png
    placement.json              # opcional Fase 1
  pants-classic/
    ...
  marketing/                      # Fase 4 - no usado para tintado
    classic-button-card.webp
    pro-pinstripe-card.webp
  reference/
    fabric-palette.pdf            # colores oficiales de tela RS (para el sitio)
```

**Nombres de archivo:** minúsculas, guiones, sin espacios ni acentos.

---

## 8. Criterios de aceptación (QA antes de entregar)

Marcar cada ítem por modelo:

- [ ] `front-base` y `back-base` tienen las **mismas dimensiones en píxeles**
- [ ] La prenda está **centrada** y a la **misma escala** en frente y espalda
- [ ] Cada `*-mask-*.png` tiene **exactamente** el mismo tamaño que su `*-base.png` correspondiente
- [ ] En máscaras: zona de color = blanco puro (#FFFFFF); fuera = negro puro (#000000); sin grises intermedios salvo anti-alias mínimo en bordes
- [ ] La base no tiene logos, números ni marcas de terceros
- [ ] Resolución >= 2000 px en el lado largo
- [ ] `front-shadow` / `back-shadow` alineadas pixel a pixel con la base
- [ ] Archivos PNG, espacio de color sRGB

**Prueba visual sugerida (retoque):** en Photoshop, capa de color sólido rojo sobre la máscara de cuerpo en modo Multiply; el tintado debe seguir pliegues de la tela, no un rectángulo.

---

## 9. División de roles sugerida

| Rol | Entrega |
|-----|---------|
| **Fotógrafo** | `front-base.png`, `back-base.png`, tomas crudas si retoque externo |
| **Retocador / diseñador** | Máscaras, sombras, recorte, `placement.json` |
| **RS comercial / producción** | Elegir modelo hero, lista de zonas por modelo, `fabric-palette.pdf` |
| **Desarrollo** | Integración en configurador, pruebas en localhost y producción |

Si una sola persona cubre foto + retoque, entregar el paquete completo de la sección 4.

---

## 10. Materiales de apoyo RS (no son del fotógrafo pero bloquean el sitio)

| Material | Quién | Para qué |
|----------|-------|----------|
| Catálogo de colores de tela (hex o referencia) | RS producción | Paleta en el configurador |
| Fuentes de número y nombre (OTF/TTF) | RS diseño | Preview de espalda |
| Confirmación de zonas por modelo | RS diseño | Cuántas máscaras crear |

---

## 11. Preguntas abiertas (RS debe responder antes de Fase 1)

1. ¿Cuál es el **modelo hero** para el primer paquete? (recomendado: `classic-button`)
2. ¿Qué **zonas** son personalizables en ese modelo? (mínimo: cuerpo, manga, cuello)
3. ¿El pantalón usa la misma tela / franja que el jersey en sets?
4. ¿Quién genera las máscaras si el fotógrafo solo entrega CR2/JPG base?

---

## 12. Qué hace desarrollo al recibir el paquete

1. Copiar archivos a `incoming/mockup-packs/{slug}/` (o cualquier carpeta y usar `MOCKUP_SRC`).
2. Ejecutar `npm run demo:mockups:ingest` (valida dimensiones y nombres, copia a `demo/assets/mockups/{slug}/`).
3. Probar en http://localhost:3456/custom/uniform/builder.html con cambio de colores frente/espalda.
4. En producción: subir el mismo paquete a R2 y registrar en `UniformTemplate.specSchema`.

Detalle técnico: [Preview engine (layered PNG)](../architecture/uniform-configurator.md#preview-engine-layered-png).

---

## 13. Contacto y versiones

| Versión | Fecha | Cambio |
|---------|-------|--------|
| 0.1 | 2026-07 | Borrador inicial para fotógrafo RS |

**Entregas:** indicar en `README.txt` fecha, responsable, talla de muestra y código interno RS del blank usado.
