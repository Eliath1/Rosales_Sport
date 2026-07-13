# ARCO Procedure - Access, Rectification, Cancellation, Opposition

> **Contact channel:** `contacto@rosalessport.com` (published in aviso de privacidad)  
> **Response time:** 20 business days (extendable once, +20 days, with notice)

## Overview

Under LFPDPPP, individuals may exercise **ARCO rights** regarding their personal data held by the baseball store (data controller).

This procedure defines intake, verification, fulfillment, and documentation.

## Channels for Requests

| Channel | Accept? |
|---------|---------|
| Email to published privacidad address | Yes Primary |
| Web form (template) | Yes Preferred |
| Physical letter to domicilio in aviso | Yes |
| Social media DM | No Redirect to email (no PII in DM) |
| Phone | No Verbal not valid; send form link |

Form template: [../../templates/legal/arco-request-form-template.md](../../templates/legal/arco-request-form-template.md)

## Request Types

| Right | Customer asks... | We do... |
|-------|----------------|--------|
| **Acceso** | "What data do you have on me?" | Export structured summary |
| **Rectificación** | "My email is wrong" | Update after verification |
| **Cancelación** | "Delete my data" | Delete/anonymize per retention policy |
| **Oposición** | "Stop marketing emails" | Revoke consent; suppress list |

## Process Flow

```
1. INTAKE
   Receive request -> Assign ticket ID (ARCO-YYYY-NNNN)
   Send ack email within 3 business days

2. VERIFY IDENTITY
   Match 2+ factors:
  - Email on file + confirmation link
  - Quote/order number + full name
  - For sensitive requests: copy of INE (store encrypted, delete after 30 days)

3. ASSESS
   Legal/compliance review if:
  - Conflicts with retention law (active dispute, tax records)
  - Third-party data involved

4. FULFILL
   Acceso: JSON or PDF export within SLA
   Rectificación: Update DB + confirm
   Cancelación: Anonymize per retention policy
   Oposición: Update consent flags

5. CLOSE
   Notify requester of outcome
   Log in ARCO register (no unnecessary PII in log)
```

## Denial Grounds (document reason)

- Identity not verified
- Data not found in systems
- Legal obligation to retain (e.g., open order, tax audit window)
- Request affects third-party rights
- Manifestly unfounded/repetitive (rare; counsel review)

Denial must be **motivated** in writing with appeal path info.

## Roles

| Role | Responsibility |
|------|----------------|
| Privacy contact | Intake, customer communication |
| Admin user | DB export, rectification |
| Legal counsel | Denials, complex cases |
| Engineering | Anonymization scripts |

## Export Package (Acceso)

Include:

- Customer profile fields
- Quote history (IDs, dates, totals - not other customers' data)
- Consent records
- Email delivery log metadata (not full marketing content of other campaigns)

Deliver via **password-protected ZIP** or secure link expiring in 7 days.

## Cancellation Nuances

| Scenario | Action |
|----------|--------|
| No open orders | Anonymize customer record |
| Open quote | Complete or cancel quote first; inform customer |
| Completed orders | Anonymize identity; retain order lines 7y anonymized |
| Marketing only | Suppress; keep transactional record |

## Metrics

Track monthly:

- Requests by type
- Average days to close
- Denied count + reason category

## Register Fields (internal)

```
arco_requests
  id, ticket_id, type, requester_email, status
  received_at, due_at, closed_at, outcome, notes_redacted
```

## Related

- [mexico-privacy-framework.md](./mexico-privacy-framework.md)
- [data-retention-policy.md](./data-retention-policy.md)
- [../architecture/decisions/ADR-010-data-privacy.md](../architecture/decisions/ADR-010-data-privacy.md)
