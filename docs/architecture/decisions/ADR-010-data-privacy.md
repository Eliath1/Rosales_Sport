# ADR-010: Data Privacy & LFPDPPP Compliance

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead, client stakeholder |

## Context

The CRM processes personal data (nombre, email, teléfono, dirección de envío) of Mexican customers and staff. **Ley Federal de Protección de Datos Personales en Posesión de los Particulares (LFPDPPP)** requires lawful basis, consent where applicable, security measures, and ARCO rights fulfillment.

## Decision

Implement **privacy by design**:

1. Collect minimum data needed per workflow
2. Publish bilingual aviso de privacidad before collecting data
3. Separate marketing consent from transactional necessity
4. Implement ARCO request workflow within 20 business days
5. Encrypt data in transit (TLS) and at rest (Neon default)
6. Document data inventory and retention schedules

## Lawful Basis Mapping

| Data use | Basis (LFPDPPP) |
|----------|-----------------|
| Quote delivery | Contract / pre-contractual |
| Order fulfillment | Contract |
| Marketing emails | Consent (opt-in) |
| Analytics cookies | Consent |
| Fraud prevention | Legitimate interest (documented) |
| AI chat logs | Consent + notice when feature enabled |

## Technical Measures

| Measure | Implementation |
|---------|----------------|
| Access control | Role-based admin; least privilege |
| Audit log | Admin views/exports of customer PII |
| Retention jobs | Anonymize quotes >7 years per policy |
| Subprocessors | Document Neon, Resend, Cloudflare, payment providers |
| Breach response | 72-hour internal SLA; legal counsel for INAI notification if required |

## Data We Do NOT Collect (by default)

- CURP, RFC (unless wholesale invoicing Wave Two+)
- Full payment card numbers (hosted checkout only)
- Biometrics

## Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| Ignore compliance until launch | Legal exposure; client reputational risk |
| Store all data indefinitely | Violates proportionality principle |
| US-only privacy policy | Insufficient for Mexican customers |

## Consequences

**Positive:** Client trust; wholesale B2B clients may require privacy annex.

**Negative:** Engineering overhead for consent UI, ARCO tooling, legal review costs.

**Required:** Lawyer review of aviso de privacidad template before production.

## Related

- [../../legal/mexico-privacy-framework.md](../../legal/mexico-privacy-framework.md)
- [../../legal/arco-procedure.md](../../legal/arco-procedure.md)
- [../../legal/data-inventory.md](../../legal/data-inventory.md)
