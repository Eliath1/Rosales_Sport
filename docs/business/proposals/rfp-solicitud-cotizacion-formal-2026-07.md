# Solicitud de Cotización Formal (RFQ) - Plataforma CRM y Tienda en Línea para Artículos de Béisbol

> **Tipo de documento:** Términos de referencia para cotización formal (RFQ/RFP).
> **Uso previsto:** Enviar a freelancers y empresas de desarrollo de software (Jalisco / México) para obtener una cotización comparable, sin requerir múltiples llamadas de aclaración.
> **Versión:** 1.0
> **Fecha de emisión:** 2026-07-09
> **Vigencia de esta solicitud:** 30 días naturales desde la fecha de emisión, salvo aviso contrario.
> **Confidencialidad:** Este documento y sus anexos son confidenciales. El destinatario se compromete a usarlos únicamente para preparar la cotización solicitada y a no compartirlos con terceros sin autorización.

---

## Nota de uso (leer antes de enviar, borrar esta sección al enviar)

Este documento tiene dos usuarios posibles:

1. **El propietario del proyecto**, para obtener una cotización externa e independiente y compararla contra una estimación interna ya realizada.
2. **El cliente final del proyecto**, para solicitar cotizaciones de manera independiente a otros proveedores, sin depender de que un solo desarrollador defina el alcance.

Este RFQ pide una cotización **de un proyecto construido desde cero**, como si nada existiera todavía. No se menciona ni se comparte ningún trabajo previo, código, o activo ya construido: el objetivo es que el proveedor dimensione el valor completo de lo que se necesita construir, sin descuentos por avance previo. El proveedor decide libremente qué plataforma, framework y proveedores de hospedaje/pagos usar; este documento describe **qué debe hacer la plataforma**, no con qué herramienta específica debe construirse.

Antes de enviarlo, completar los campos marcados entre corchetes `[ ]`: datos de contacto, fecha límite de entrega de cotización, y fecha límite para preguntas. El resto del documento no requiere edición para que sea usable.

---

## 0. Datos de contacto y logística

| Campo | Valor |
|---|---|
| Nombre del proyecto | Plataforma CRM y tienda en línea para artículos de béisbol - Rosales Sport |
| Sitio de referencia (una vez publicado) | rosalessport.com |
| Contacto para preguntas | [Nombre] - [correo] - [teléfono/WhatsApp] |
| Fecha límite para enviar preguntas por escrito | [FECHA] |
| Fecha límite para entregar la cotización | [FECHA] |
| Formato de entrega de la cotización | PDF o Word, usando el formato del Anexo D |
| Idioma de la cotización | Español |
| Moneda de la cotización | Pesos mexicanos (MXN) |

**Regla del proceso:** todas las preguntas y respuestas de aclaración se centralizan por escrito (correo) antes de la fecha límite de preguntas, y las respuestas relevantes se comparten con todos los proveedores invitados, para que ninguno tenga información que otro no tenga. Esto sustituye a llamadas individuales de aclaración.

---

## 1. Resumen ejecutivo

Se solicita una cotización formal para completar y poner en producción una plataforma de comercio y CRM para una tienda de artículos de béisbol con operación en México (mercado objetivo inicial: Jalisco y venta nacional). La plataforma debe permitir:

- Mostrar un catálogo de productos (jerseys, gorras, uniformes personalizados) al público.
- Capturar solicitudes de cotización de clientes retail y de equipos/ligas (mayoreo).
- Que el equipo de ventas administre clientes, catálogo y cotizaciones desde un panel interno, sustituyendo el proceso manual actual por hojas de cálculo y WhatsApp.
- Opcionalmente (Fase 2, cotizar por separado), vender en línea con pagos en México (tarjeta, y de ser posible OXXO y SPEI, vía el agregador de pagos que el proveedor proponga) y dar seguimiento a pedidos.

El alcance obligatorio (**Fase 1**) y el alcance opcional a cotizar por separado (**Fase 2**) se detallan en las secciones 4 y 5. Se cotiza como un **proyecto nuevo, construido desde cero**: catálogo, panel administrativo, generación de cotizaciones, sitio público, y en Fase 2 checkout y pagos, todo por construir. La riqueza del alcance descrito abajo es intencional: representa el valor completo de la plataforma que se necesita, no una lista mínima recortada para abaratar la cotización.

**Lo que se espera de la cotización:** un desglose por rubro de trabajo (no un número global), con horas, costo en MXN, tiempo estimado y supuestos, siguiendo el formato del Anexo D. Esto permite comparar cotizaciones de distintos proveedores entre sí y contra una estimación de referencia ya realizada.

---

## 2. Contexto de negocio

| Aspecto | Detalle |
|---|---|
| Giro | Venta de artículos de béisbol licenciados (jerseys, gorras, uniformes de equipo) |
| Mercado | México, con enfoque inicial en Jalisco; incluye venta nacional |
| Clientes | Aficionados individuales (retail, 1-3 piezas), equipos y ligas (mayoreo, 12+ piezas con nombre/número personalizado), y distribuidores recurrentes |
| Canal actual | Cotizaciones manuales por WhatsApp y hojas de cálculo; sin sitio de ventas en línea activo |
| Idiomas requeridos | Español (México) como idioma principal; inglés como segundo idioma en todo el sitio público |
| Moneda | Pesos mexicanos (MXN) en todo el sitio y documentos generados (cotizaciones, PDF) |

El negocio necesita, en orden de prioridad: (1) dejar de perder cotizaciones y clientes por un proceso manual, (2) eventualmente vender y cobrar en línea, (3) dar de alta cuentas de cliente para pedidos recurrentes. Ese orden de prioridad debe reflejarse en cómo el proveedor secuencia su propuesta, no solo en el precio total.

---

## 3. Objetivo de esta solicitud

Se busca una propuesta que permita comparar, de forma objetiva, distintas opciones de proveedor para completar este proyecto. Para lograrlo, cada proveedor invitado debe:

1. Leer este documento completo antes de hacer preguntas.
2. Enviar preguntas de aclaración únicamente por el canal y antes de la fecha indicada en la Sección 0.
3. Entregar la cotización en el formato del Anexo D, sin omitir ningún rubro (marcar como "$0 / no aplica" si el proveedor considera que un rubro no aplica, con la justificación correspondiente).
4. Declarar la plataforma/stack tecnológico que propone usar y por qué, ya que este documento no impone una tecnología específica (ver Sección 8).

No se espera, ni se requiere, que el proveedor proponga cambios de alcance o de arquitectura en esta etapa. Si detecta un riesgo u omisión real en el alcance, debe señalarlo por escrito como pregunta o como nota en su cotización, no asumir un alcance distinto sin decirlo.

---

## 4. Alcance obligatorio - Fase 1 (Demo público + CRM interno de cotizaciones)

Esta fase es la base mínima vendible: un sitio público de solo lectura con captura de cotizaciones, más un panel interno donde el equipo de ventas administra clientes, catálogo y cotizaciones. No incluye pagos en línea ni carrito de compra (eso es Fase 2).

### 4.1 Sitio público (solo lectura, sin login de cliente)

| Página / flujo | Descripción funcional |
|---|---|
| Inicio | Presenta la marca, colecciones destacadas, franja de confianza |
| Colecciones (`/collections/*`) | Cuadrícula de productos filtrable por equipo/categoría (jerseys, gorras) |
| Ficha de producto (`/products/[slug]`) | Galería de imágenes, selección de talla, llamada a la acción "Solicitar cotización" |
| Formulario de cotización retail (`/quote`) | Captura datos de contacto y productos de interés, envía a panel interno |
| Formulario de cotización mayoreo/equipo (`/quote/bulk`) | Igual que el anterior, con campos adicionales de cantidad, nombres/números y tipo de decoración |
| Formulario de personalización de uniforme (`/custom/uniform`) | Captura tallas por jugador, nombres/números, tipo de decoración (bordado, DTF, TPU, 3D DTF), notas de logo |
| Aviso de privacidad y términos y condiciones | Páginas legales enlazadas desde cualquier formulario que capture datos personales |

### 4.2 Panel interno (CRM administrativo, con login de staff)

| Módulo | Funcionalidad requerida |
|---|---|
| Autenticación de staff | Login con correo y contraseña; roles mínimos: administrador y ventas |
| Catálogo | Alta, edición y baja de productos y variantes (talla, color); precio de lista y precio mayoreo por producto |
| Clientes | Alta y búsqueda de clientes (retail y mayoreo); historial de cotizaciones por cliente |
| Constructor de cotizaciones | Armar una cotización con múltiples líneas de producto, cantidad, descuento opcional y vigencia (por defecto 15 días) |
| Generación de PDF | La cotización se genera como PDF con logo y formato de marca, montos en formato MXN (`$1,299.00 MXN`) |
| Envío por correo | La cotización se envía por correo al cliente desde una cuenta de correo del negocio, con el PDF adjunto |
| Estatus de cotización | Ciclo de vida: borrador, luego enviada, luego aceptada / rechazada / vencida; una cotización enviada no se edita, se genera una revisión nueva |
| Panel de indicadores (dashboard) | Vista mínima: cotizaciones de la semana (cantidad y monto), cotizaciones por estatus, productos más cotizados |

### 4.3 Requisito transversal de Fase 1

- Todo el flujo anterior debe funcionar en español (México) como idioma por defecto, con inglés disponible como segundo idioma.
- El sitio público y el panel interno deben ser responsivos (usables desde un teléfono).

### 4.4 Criterios de aceptación de Fase 1

| Criterio | Meta |
|---|---|
| Tiempo para crear y enviar una cotización | Menor a 5 minutos, una vez cargado el catálogo |
| Entrega de correo | El correo con la cotización llega a la bandeja de entrada del cliente, no a spam |
| Formato de moneda | Todos los montos visibles en MXN con separador de miles y dos decimales |
| Edición de cotizaciones enviadas | No permitida; se crea una revisión nueva en su lugar |
| Aviso de privacidad | Enlazado y visible en cualquier formulario público que capture datos personales |
| Acceso al panel interno | Restringido por login; ningún dato de cliente o cotización es visible sin sesión de staff |

---

## 5. Alcance opcional - Fase 2 (Tienda en línea con pagos, cotizar por separado)

Esta fase agrega venta y cobro en línea sobre la base de Fase 1. **Debe cotizarse como un rubro separado del total**, ya que el cliente puede decidir contratarla más adelante, no necesariamente junto con Fase 1.

| Bloque | Funcionalidad requerida |
|---|---|
| Checkout de invitado | El cliente compra sin necesidad de crear cuenta; el precio de cada producto siempre se calcula en el servidor, nunca se confía en un precio enviado desde el navegador |
| Pedidos | Registro de pedidos con líneas de producto, ligado al flujo de cotización aceptada cuando aplique |
| Pagos en México | Integración con un agregador de pagos mexicano que el proveedor proponga y justifique - tarjeta, y si el agregador lo soporta, OXXO y SPEI |
| Pago dividido | Soporte para anticipo (ej. 50%) más saldo en pedidos grandes (6 piezas o más), y pago de una sola exhibición en pedidos menores |
| Notificaciones de pedido | Correo automático al equipo de ventas cuando se crea un pedido; correo de estatus al cliente en los cambios de estatus relevantes |
| Seguimiento de comisión | Reporte administrativo que muestre el porcentaje efectivo de comisión cobrado por el procesador de pagos sobre los pedidos pagados |
| Cuentas de cliente (opcional dentro de Fase 2) | Login de cliente separado del login de staff; historial de pedidos con línea de tiempo de estatus; marcado de "distribuidor" para clientes recurrentes |

### 5.1 Criterios de aceptación de Fase 2

| Criterio | Meta |
|---|---|
| Confiabilidad de confirmación de pago | 99% o más de los pagos confirmados vía webhook del procesador, sin intervención manual |
| Checkout de invitado | Nunca exige registro para completar una primera compra |
| Visibilidad de comisión | El reporte de comisión efectiva está disponible dentro de 1 día de un pago real |

---

## 6. Fuera de alcance (en cualquier fase, salvo acuerdo explícito por escrito)

- Facturación electrónica CFDI / integración directa con el SAT (se contempla como integración con un proveedor externo de facturación en una etapa posterior, no en este alcance)
- Sincronización de inventario en tiempo real con un punto de venta físico
- Aplicación móvil nativa (iOS/Android)
- Chatbot o asistente con inteligencia artificial
- Integración de paquetería/guías de envío automatizadas
- Diseño de marca/logotipo (se asume que el cliente ya cuenta con logotipo e identidad visual básica)
- Sesión fotográfica de producto (el cliente entrega imágenes de producto; si el proveedor considera necesario un banco de imágenes adicional, debe cotizarlo como rubro aparte)
- Revisión legal del aviso de privacidad por un abogado certificado (se entrega un borrador alineado a LFPDPPP, pero la validación legal final corre por cuenta del cliente con su asesor legal)

Si el proveedor considera que alguno de estos puntos es indispensable para que el resto del alcance funcione correctamente, debe indicarlo como nota en su cotización, no incluirlo tácitamente en el precio.

---

## 7. Insumos que el cliente proporciona

El proyecto se cotiza como una construcción nueva, completa, de principio a fin. Para que el proveedor no tenga que adivinar ni preguntar por estos puntos, el cliente se compromete a entregar lo siguiente al proveedor seleccionado, antes o durante el arranque del proyecto:

- Catálogo real de productos, precios y variantes (talla, color) en un formato exportable (hoja de cálculo)
- Imágenes de producto para el catálogo (fotografía propia o banco de imágenes ya disponible del negocio)
- Logotipo e identidad visual básica (colores, tipografía si existe)
- Acceso al dominio y a una cuenta de correo del negocio para configurar el envío de cotizaciones y notificaciones
- Glosario de términos de negocio (Anexo A), para no perder tiempo en llamadas aclarando vocabulario del giro (mayoreo, bordado, anticipo, etc.)
- Borradores de aviso de privacidad y términos y condiciones alineados a la ley mexicana (LFPDPPP), como punto de partida para que el proveedor los integre; la validación legal final sigue corriendo por cuenta del cliente con su asesor legal, según la Sección 6

Ningún código, diseño ni activo de desarrollo previo se entrega como parte de este proceso: la cotización debe reflejar el costo completo de construir la plataforma descrita en las Secciones 4 y 5.

---

## 8. Requisitos técnicos

### 8.1 Libertad de plataforma y stack tecnológico

Este documento describe **qué debe hacer la plataforma**, no con qué herramienta debe construirse. El proveedor elige libremente la plataforma, framework, base de datos, hospedaje y agregador de pagos que considere mejor para el proyecto (incluyendo, si lo prefiere, una plataforma de comercio existente en lugar de desarrollo 100% a la medida), siempre y cuando:

1. Cumpla todos los requisitos funcionales (Secciones 4 y 5) y no funcionales (Sección 9) de este documento.
2. Declare explícitamente en su cotización qué plataforma/stack propone y por qué es la adecuada para este proyecto.
3. Incluya, dentro de su propia cotización, una estimación del costo recurrente de hospedaje/infraestructura de su stack propuesto (ver Anexo D), ya que ese costo lo paga el cliente por separado del honorario de desarrollo y varía según la herramienta elegida.
4. Aclare si el código resultante queda en propiedad exclusiva del cliente o si depende de una plataforma con licenciamiento propio (ver Sección 13); ambas opciones son aceptables si se declaran con claridad, pero deben compararse en esos términos.

### 8.2 Requisitos funcionales de infraestructura (sin importar el stack elegido)

| Necesidad | Requisito |
|---|---|
| Hospedaje | Disponibilidad alta, con capacidad de crecer de un uso interno pequeño a tráfico público sin rediseño completo |
| Almacenamiento de datos | Registro estructurado y confiable de clientes, catálogo, cotizaciones y (en Fase 2) pedidos y pagos, con respaldo periódico |
| Correo transaccional | Envío confiable de cotizaciones y notificaciones, sin caer en spam |
| Seguridad de borde | Protección básica contra tráfico malicioso, relevante sobre todo una vez que exista checkout público en Fase 2 |
| Pagos (Fase 2) | Agregador de pagos operando en México, con soporte para tarjeta y, de ser posible, OXXO y SPEI |

El proveedor debe indicar, para el stack que propone, qué herramienta específica cubre cada renglón de esta tabla.

### 8.3 Rango orientativo de costo de infraestructura (a cargo del cliente, no parte del honorario del proveedor)

Referencia de mercado, independiente del stack específico que finalmente se elija, para que el cliente sepa qué presupuestar aparte del pago al proveedor. El proveedor debe reemplazar este rango por su propia estimación en el Anexo D, ya que depende de las herramientas que proponga:

| Escenario | Costo mensual aproximado (MXN) | Qué lo activa |
|---|---|---|
| Solo CRM interno (Fase 1, uso del equipo de ventas) | Cercano a $0-500 | Los niveles gratuitos o de entrada de la mayoría de proveedores cubren este uso |
| Tienda pública en operación con tráfico real (Fase 2) | Aproximadamente $1,100-1,750 | Tráfico público, volumen de correo, cómputo de base de datos |

No incluye la comisión del procesador de pagos, que es un porcentaje de cada venta (aproximadamente 3.5% más una cuota fija en México, a confirmar con el agregador elegido), no un costo fijo de infraestructura.

### 8.4 Integraciones requeridas

- Correo transaccional para envío de cotizaciones (Fase 1) y notificaciones de pedido (Fase 2)
- Generación de PDF con marca propia
- Procesador de pagos mexicano (Fase 2 únicamente)

---

## 9. Requisitos no funcionales

### 9.1 Seguridad (mínimos no negociables)

- Las rutas del panel administrativo deben validar el rol del usuario en el servidor; nunca confiar en un valor de rol enviado desde el navegador
- Las contraseñas de staff se almacenan con hash, nunca en texto plano
- Los precios de productos se calculan y validan siempre en el servidor, nunca se aceptan desde el cliente (relevante sobre todo en Fase 2, checkout)
- Conexión HTTPS obligatoria en todo el sitio
- Límite de intentos (rate limiting) en el login de staff y, en Fase 2, en el flujo de checkout
- Ninguna credencial o llave de API se almacena en el código fuente; todas van en variables de entorno

### 9.2 Privacidad (México, LFPDPPP)

- Aviso de privacidad visible y enlazado en todo formulario que capture datos personales
- Casilla de consentimiento explícita para uso de datos con fines de mercadotecnia, separada del consentimiento necesario para completar una cotización o pedido
- Mecanismo administrativo para atender solicitudes de derechos ARCO (acceso, rectificación, cancelación, oposición) dentro de los plazos que marca la ley
- Datos mínimos indispensables: no capturar campos que el negocio no vaya a usar

### 9.3 Bilingüe

- Español (México) como idioma por defecto en todo el sitio público
- Inglés disponible como segundo idioma, con la misma cobertura de páginas que el español
- Formato de moneda siempre en pesos mexicanos, con el formato `$1,299.00 MXN`

### 9.4 Rendimiento y usabilidad

- Diseño responsivo, con prioridad al uso desde teléfono móvil
- Tiempos de carga razonables en el catálogo público (el proveedor debe declarar qué métrica y qué herramienta usará para medirlo)
- Accesibilidad básica: contraste de texto legible, formularios navegables por teclado, textos alternativos en imágenes de producto

---

## 10. Entregables esperados

| Entregable | Fase |
|---|---|
| Sitio público funcionando en el dominio del cliente | 1 |
| Panel administrativo funcionando con datos reales del negocio | 1 |
| Base de datos en producción con catálogo real cargado | 1 |
| Flujo de cotización completo (crear, generar PDF, enviar por correo, marcar estatus) | 1 |
| Manual breve de uso del panel para el equipo de ventas, y una sesión de capacitación | 1 |
| Checkout con pago en línea funcionando en producción | 2 |
| Reporte de comisión de procesador de pagos | 2 |
| Documentación mínima de las variables de entorno y credenciales necesarias para mantener el sitio (sin exponer los valores reales, solo qué se necesita) | 1 y 2 |
| Código fuente completo entregado al cliente, con transferencia total de derechos de uso | 1 y 2 |

---

## 11. Formato requerido de la cotización

La cotización debe entregarse desglosada por rubro, no como un monto único. Usar la tabla del **Anexo D** como base obligatoria. Además de esa tabla, incluir:

1. **Plataforma/stack propuesto**: qué tecnología usará y por qué, según la Sección 8.1.
2. **Composición del equipo**: cuántas personas, con qué rol, trabajarán en el proyecto.
3. **Forma de pago propuesta**: hitos sugeridos y porcentaje de cada uno (no se acepta 100% por adelantado).
4. **Garantía posterior a la entrega**: días sin costo para corrección de errores después de cada fase.
5. **Vigencia de la cotización**: cuántos días es válida esta propuesta.
6. **Facturación**: si el proveedor puede emitir factura (CFDI) por el servicio, y si los montos cotizados incluyen IVA o lo indican por separado.
7. **Referencias o portafolio**: al menos un proyecto similar (comercio electrónico o CRM) que el proveedor pueda mostrar o referenciar.
8. **Supuestos del proveedor**: cualquier condición que el proveedor asuma para que su precio sea válido (ej. "el cliente entrega el catálogo en un formato ya limpio", "no incluye más de 2 rondas de revisión por entregable").

---

## 12. Criterios de evaluación

La cotización se evaluará considerando, sin un único criterio dominante:

| Criterio | Qué se revisa |
|---|---|
| Comprensión del alcance | Si el desglose de rubros refleja haber leído este documento completo, no una plantilla genérica |
| Precio por rubro | Comparabilidad contra otras cotizaciones y contra una estimación de referencia ya realizada |
| Tiempo de entrega | Si es realista frente al alcance cotizado |
| Garantía y soporte posterior | Qué tanto cubre después de la entrega, y a qué costo continúa después de esa garantía |
| Capacidad de facturación formal | Relevante para una relación comercial formal, no solo para freelancers informales |
| Referencias/portafolio | Evidencia de trabajo similar entregado antes |
| Claridad de supuestos | Cotizaciones con supuestos ocultos se penalizan frente a cotizaciones con supuestos explícitos, aunque el precio final sea similar |

---

## 13. Condiciones contractuales esperadas

- **Transferencia completa de propiedad intelectual**: el código, diseños y contenido generados para este proyecto quedan en propiedad exclusiva del cliente al completar el pago correspondiente a cada hito. Ninguna licencia, componente o dependencia de terceros que limite esa propiedad debe usarse sin aviso explícito.
- **Pago por hitos**, no 100% anticipado. El proveedor debe proponer su esquema de hitos en la cotización (Sección 11, punto 3).
- **Confidencialidad**: si se otorga acceso a datos de clientes, catálogo real, o cualquier información sensible del negocio, se firma un acuerdo de confidencialidad antes de compartir el acceso.
- **Sin subcontratación no declarada**: si el proveedor plane subcontratar parte del trabajo, debe declararlo en la cotización.
- **Garantía posterior a la entrega** de al menos 15 días naturales sin costo adicional por corrección de errores atribuibles al desarrollo, salvo que el proveedor proponga un plazo distinto justificado.

---

## Anexo A - Glosario mínimo del negocio

| Término | Significado |
|---|---|
| Mayoreo | Venta al por mayor, típicamente 12 piezas o más, con descuento sobre precio de lista |
| Precio equipo | Precio especial para pedidos de uniformes de un equipo o liga completa |
| Cotización | Oferta formal de precio con fecha de vigencia, no una factura ni un pedido pagado |
| Bordado / personalización | Nombre y número bordado o impreso en el jersey; la forma de personalización más común en México |
| Anticipo | Pago parcial adelantado en pedidos grandes, con saldo pendiente contra entrega |
| LMB / LMP / MLB | Liga Mexicana de Béisbol / Liga Mexicana del Pacífico / Major League Baseball - ligas cuyos equipos vende la tienda |
| Talla | Tamaño de prenda (XS a XXL); en gorras ajustadas, medida numérica de cabeza |
| Aviso de privacidad | Documento legal que informa al cliente qué datos se recaban y para qué, requerido por la ley mexicana (LFPDPPP) |
| ARCO | Derechos de Acceso, Rectificación, Cancelación y Oposición sobre datos personales, bajo la ley mexicana de privacidad |

---

## Anexo B - Referencia de costos de infraestructura (informativo, no forma parte del honorario cotizado)

Ver Sección 8.3. Estos montos son pagados directamente por el cliente a los proveedores de hospedaje/base de datos/correo que el proveedor de desarrollo elija, de forma continua, y son independientes del pago al desarrollador o empresa de desarrollo.

---

## Anexo C - Rango de referencia de mercado (contexto, no un precio objetivo)

Para dar contexto de magnitud, sin ser un número que el proveedor deba igualar ni un límite superior o inferior obligatorio: un proyecto de este alcance completo (Fase 1 más Fase 2), construido desde cero por una agencia de desarrollo en México con tarifas de mercado, suele ubicarse en un rango amplio de varias decenas a unos cuantos cientos de miles de pesos mexicanos, dependiendo del tamaño del equipo, el nivel de personalización visual, y si incluye sesión fotográfica profesional. Este documento no fija un presupuesto objetivo: se pide al proveedor cotizar según su propio análisis de esfuerzo, no según un número esperado.

---

## Anexo D - Formato obligatorio de respuesta (llenar y anexar a la cotización)

### D.1 Datos del proveedor

| Campo | Valor |
|---|---|
| Nombre o razón social | |
| Ubicación (ciudad/estado) | |
| ¿Persona física o empresa constituida? | |
| ¿Puede emitir factura (CFDI)? | Sí / No |
| Años de experiencia en proyectos similares | |
| Plataforma/stack tecnológico propuesto | |

### D.2 Desglose de Fase 1 (obligatoria)

| Rubro | Horas estimadas | Costo (MXN) | Notas / supuestos |
|---|---|---|---|
| Validación de esquema de datos (clientes, catálogo, cotizaciones) | | | |
| Panel administrativo: catálogo y precios | | | |
| Panel administrativo: clientes | | | |
| Constructor de cotizaciones + generación de PDF | | | |
| Envío de correo (integración) | | | |
| Autenticación y roles de staff | | | |
| Sitio público (inicio, colecciones, fichas de producto) | | | |
| Formularios de cotización (retail, mayoreo, personalización de uniforme) | | | |
| Páginas legales (aviso de privacidad, términos, consentimiento) | | | |
| Despliegue (hosting, base de datos, dominio) | | | |
| Pruebas (QA) | | | |
| Capacitación al equipo de ventas | | | |
| **Subtotal Fase 1** | | **$** | |

### D.3 Desglose de Fase 2 (opcional, cotizar aparte)

| Rubro | Horas estimadas | Costo (MXN) | Notas / supuestos |
|---|---|---|---|
| Checkout de invitado | | | |
| Registro de pedidos | | | |
| Integración de procesador de pagos | | | |
| Pago dividido (anticipo + saldo) | | | |
| Notificaciones de pedido | | | |
| Reporte de comisión de procesador | | | |
| Cuentas de cliente (login, historial de pedidos) | | | |
| **Subtotal Fase 2** | | **$** | |

### D.4 Condiciones generales de la propuesta

| Campo | Valor |
|---|---|
| Tiempo total estimado Fase 1 (semanas calendario) | |
| Tiempo total estimado Fase 2 (semanas calendario) | |
| Composición del equipo (roles y número de personas) | |
| Esquema de pago propuesto (hitos y %) | |
| Garantía posterior a la entrega (días) | |
| Costo de soporte/mantenimiento posterior a la garantía (MXN/mes) | |
| Estimación de costo de hospedaje/infraestructura para el stack propuesto (MXN/mes, Fase 1 y Fase 2 por separado) | |
| Vigencia de esta cotización (días) | |
| ¿Precio incluye IVA? | Sí / No / Se indica por separado |
| Referencias o portafolio (enlaces o nombres de proyectos) | |
| Supuestos adicionales del proveedor | |

---

## Documento relacionado (uso interno, no enviar al proveedor)

Este RFQ fue construido a partir de una estimación interna ya existente (desglose de fases, horas y rangos de costo de mercado) para poder comparar cotizaciones externas contra esa referencia. Ese documento interno no se comparte con los proveedores invitados, para no sesgar sus precios.
