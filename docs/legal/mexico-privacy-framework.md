# Mexico Privacy Framework - LFPDPPP Overview

> **Disclaimer:** This is educational documentation for the project team, **not legal advice**. Have a licensed Mexican privacy lawyer review all public-facing documents before launch.

## What is LFPDPPP?

The **Ley Federal de Protección de Datos Personales en Posesión de los Particulares** (2010, reformed 2025) regulates how private businesses in Mexico collect, use, store, and share **datos personales** (personal data).

The **INAI** (Instituto Nacional de Transparencia, Acceso a la Información y Protección de Datos Personales) oversees compliance for federal-scope matters; state laws may also apply for local businesses.

## Key Principles (Article 6)

| Principle (ES) | Plain language |
|----------------|----------------|
| **Licitud** | You must have legal basis to process data |
| **Consentimiento** | Informed consent when required (e.g., marketing) |
| **Información** | Tell people via aviso de privacidad |
| **Calidad** | Data must be accurate and relevant |
| **Finalidad** | Use data only for stated purposes |
| **Lealtad** | No deceptive collection |
| **Proporcionalidad** | Collect minimum necessary |
| **Responsabilidad** | Implement security measures |

## Personal Data in Our CRM

| Category | Examples | Sensitivity |
|----------|----------|-------------|
| Identificación | Nombre, email, teléfono | General |
| Contacto | Dirección de envío | General |
| Comercial | Historial de cotizaciones | General |
| Financiera | Last 4 of card (via provider) | **Sensitive** - avoid storing |
| Laboral | N/A unless B2B contact title | General |

**Datos personales sensibles** (health, biometrics, etc.) - we do not collect in Wave Zero.

## Aviso de Privacidad (Privacy Notice)

Required **before** collecting data. Must include:

1. Identity and address of **responsable** (data controller - the store/legal entity)
2. Purposes of processing (primary and secondary)
3. Mechanisms to express **negativa** for secondary uses
4. **ARCO rights** and how to exercise them
5. Transfers to third parties (Neon, Resend, payment processors)
6. Means to revoke consent
7. Changes to the notice

Template: [../../templates/legal/aviso-de-privacidad-template.md](../../templates/legal/aviso-de-privacidad-template.md)

## Consent Models

| Processing | Consent needed? |
|------------|-----------------|
| Send quote email | No - contractual/pre-contractual |
| Order confirmation | No - contract fulfillment |
| Marketing newsletter | **Yes** - opt-in checkbox |
| Analytics cookies | **Yes** - cookie banner |
| AI chat (when live) | **Yes** - disclosed in notice + UI |

## ARCO Rights

| Right (ES) | Meaning |
|------------|---------|
| **Acceso** | Know what data we hold |
| **Rectificación** | Correct inaccurate data |
| **Cancelación** | Delete when no longer needed |
| **Oposición** | Object to certain processing |

Procedure: [arco-procedure.md](./arco-procedure.md)

**Response SLA:** 20 business days (extendable once for complex requests).

## Cross-Border Transfers

Neon, Resend, Cloudflare, and LLM providers may process data in the US. The aviso must disclose transfers and whether the recipient country provides comparable protection or contractual clauses apply.

## Security Obligations (Article 19)

Implement **administrative, technical, and physical** safeguards appropriate to data sensitivity:

- Access controls on admin CRM
- TLS in transit
- Encrypted database at rest (provider-managed)
- Staff training on phishing and PII handling
- Incident response plan

## Penalties (awareness)

Non-compliance can result in fines, reputational damage, and customer churn. Wholesale clients may require DPA annexes.

## Project Checklist

- [ ] Lawyer-reviewed aviso de privacidad published
- [ ] Consent checkboxes on marketing forms
- [ ] Cookie consent copy deployed
- [ ] ARCO contact email published (`privacidad@...`)
- [ ] Data inventory maintained
- [ ] Retention policy implemented
- [ ] Subprocessor list in notice

## Related

- [data-inventory.md](./data-inventory.md)
- [data-retention-policy.md](./data-retention-policy.md)
- [../architecture/decisions/ADR-010-data-privacy.md](../architecture/decisions/ADR-010-data-privacy.md)
- [../learning/07-privacy-and-your-data.md](../learning/07-privacy-and-your-data.md)
