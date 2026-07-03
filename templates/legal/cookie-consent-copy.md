# Cookie Consent Copy - Bilingual Draft

> **Usage:** Banner, preference modal, and privacy policy cookie section.  
> **Legal review:** Required before production. Adjust vendor list to match deployed analytics.

---

## Banner (short) - Spanish

**Título:** Usamos cookies

**Cuerpo:** Utilizamos cookies necesarias para el funcionamiento del sitio y, con su consentimiento, cookies analíticas para mejorar su experiencia. Consulte nuestro [Aviso de Privacidad](/aviso-de-privacidad).

**Botones:**

| Button | Label | Action |
|--------|-------|--------|
| Primary | Aceptar todas | Enable necessary + analytics + marketing |
| Secondary | Rechazar opcionales | Necessary only |
| Link | Configurar | Open preference modal |

---

## Banner (short) - English (optional)

**Title:** We use cookies

**Body:** We use necessary cookies for site functionality and, with your consent, analytics cookies to improve your experience. See our [Privacy Notice](/aviso-de-privacidad).

**Buttons:** Accept all | Reject optional | Configure

---

## Preference Modal - Spanish

### Cookies necesarias (siempre activas)

Estas cookies son indispensables para funciones básicas como inicio de sesión, carrito de compras y seguridad. No pueden desactivarse.

| Cookie | Propósito | Duración |
|--------|-----------|----------|
| `session` | Mantener sesión de usuario staff/cliente | Sesión |
| `csrf_token` | Seguridad en formularios | Sesión |
| `cookie_consent` | Recordar preferencias de cookies | 12 meses |

### Cookies analíticas (opcionales)

Nos ayudan a entender cómo se usa el sitio (páginas visitadas, origen del tráfico). Datos agregados y anonimizados cuando sea posible.

| Servicio | Cookie examples | Propósito |
|----------|-----------------|-----------|
| [Plausible / Google Analytics] | `_ga`, etc. | Estadísticas de visitas |

**Toggle label:** Permitir cookies analíticas

### Cookies de marketing (opcionales)

Utilizadas para medir campañas publicitarias y personalizar anuncios en otras plataformas.

| Servicio | Propósito |
|----------|-----------|
| [Meta Pixel - if used] | Conversión de anuncios |

**Toggle label:** Permitir cookies de marketing

**Note in UI:** No vendemos sus datos personales a terceros.

---

## Footer Link Text

- ES: **Preferencias de cookies**
- EN: **Cookie preferences**

---

## Implementation Notes (Engineering)

```javascript
// Pseudocode - consent categories
const consent = {
  necessary: true,      // always true
  analytics: false,       // default false until accept
  marketing: false
};

// Block analytics scripts until consent.analytics === true
// Store consent cookie 365 days; re-prompt on material policy change
```

- Default: **opt-in** for non-essential (LFPDPPP-aligned)
- Log consent timestamp server-side for marketing/analytics (link to `consents` table)
- Do not load Meta Pixel / GA until toggled on

---

## Policy Paragraph (for Aviso de Privacidad)

> Utilizamos cookies y tecnologías similares. Las cookies necesarias permiten el funcionamiento del sitio. Las cookies analíticas y de marketing se instalan solo con su consentimiento, que puede retirar en cualquier momento desde [Configuración de cookies](/cookies).

---

**Template version:** 1.0-draft | Lawyer review required
