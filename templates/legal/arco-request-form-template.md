# Solicitud de Derechos ARCO - Formulario

> **Public URL suggestion:** `/privacidad/arco`  
> **Backend:** Creates ticket in `arco_requests` table; emails privacidad@  
> **Procedure:** [docs/legal/arco-procedure.md](../../docs/legal/arco-procedure.md)

---

## Instrucciones para el titular

Conforme a la **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)**, usted puede ejercer sus derechos de **Acceso**, **Rectificación**, **Cancelación** u **Oposición** respecto a sus datos personales.

**Plazo de respuesta:** 20 días hábiles a partir de recepción de su solicitud completa.

**Correo alternativo:** [privacidad@dominio.mx]

---

## Form Fields (Web Form / PDF)

### Sección 1 - Identificación del titular

| Field | Required | Notes |
|-------|----------|-------|
| Nombre completo | Sí | |
| Correo electrónico | Sí | Para notificaciones |
| Teléfono | No | |
| Domicilio (opcional) | No | |

### Sección 2 - Derecho que desea ejercer

Seleccione **uno** o más:

- [ ] **Acceso** - Conocer qué datos tenemos sobre usted
- [ ] **Rectificación** - Corregir datos inexactos o incompletos
- [ ] **Cancelación** - Solicitar eliminación cuando proceda
- [ ] **Oposición** - Oponerse a ciertos tratamientos (ej. marketing)

### Sección 3 - Descripción de la solicitud

**Campo de texto libre:**

> Describa su solicitud con el mayor detalle posible.  
> Ejemplo rectificación: "Mi correo correcto es juan@email.com en lugar de juan@gmail.con"  
> Ejemplo acceso: "Deseo copia de mis cotizaciones del último año"

| Field | Required |
|-------|----------|
| Descripción | Sí |
| Número de cotización o pedido (si aplica) | Recomendado |

### Sección 4 - Documentos de verificación

Para proteger su información, podemos solicitar copia de identificación oficial (INE/ pasaporte).  
**En formulario web:** checkbox confirmando que enviará documento por canal seguro si se solicita.

- [ ] Acepto proporcionar identificación para verificar mi identidad si la Tienda lo requiere

**Nota:** No envíe documentos con datos sensibles innecesarios por redes sociales.

### Sección 5 - Representante legal (si aplica)

| Field | Required if representative |
|-------|---------------------------|
| Nombre del representante | |
| Documento que acredita representación | |
| Relación con el titular | |

### Sección 6 - Declaración

- [ ] Declaro bajo protesta de decir verdad que soy el titular de los datos o representante legal autorizado
- [ ] He leído el [Aviso de Privacidad](/aviso-de-privacidad)

**Firma (PDF / presencial):** _________________________ **Fecha:** ___________

**Enviar solicitud** (botón web)

---

## Email Template (Auto-Acknowledgment)

**Asunto:** Confirmación de solicitud ARCO - [TICKET-ID]

Estimado/a [NOMBRE]:

Hemos recibido su solicitud de ejercicio de derechos ARCO con folio **[ARCO-YYYY-NNNN]**.

**Tipo de solicitud:** [Acceso / Rectificación / Cancelación / Oposición]  
**Fecha límite de respuesta:** [FECHA + 20 días hábiles]

Si necesitamos información adicional para verificar su identidad, le contactaremos a este correo.

Atentamente,  
**[RAZÓN SOCIAL]** - Privacidad  
[privacidad@dominio.mx]

---

## Internal Handling (Staff - Not Public)

| Step | System action |
|------|---------------|
| Submit | INSERT `arco_requests`, email privacidad@ |
| Assign | Ticket owner in admin |
| Verify | Match email + order/quote # |
| Fulfill | Export / update / anonymize per type |
| Close | Email outcome; log `closed_at` |

---

**Template version:** 1.0-draft
