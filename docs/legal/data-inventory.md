# Data Inventory - Baseball Store CRM

> **Owner:** Data protection responsible / project lead  
> **Review cadence:** Quarterly or when new feature ships  
> **Last updated:** 2026-07

## Purpose

Document **what personal data** we process, **where** it lives, **why**, and **who** can access it. Required for LFPDPPP accountability and ARCO fulfillment.

## Inventory Table

| ID | Data element | Category | Source | Stored in | Purpose | Lawful basis | Retention | Access roles |
|----|--------------|----------|--------|-----------|---------|--------------|-----------|--------------|
| D-001 | Nombre completo | Identity | Customer form, quote | Neon `customers` | CRM, quotes | Contract | Life of account + 7y quotes | sales, admin |
| D-002 | Email | Contact | Customer form | Neon `customers` | Quotes, comms | Contract | Same as D-001 | sales, admin |
| D-003 | Teléfono | Contact | Customer form | Neon `customers` | Follow-up | Contract / consent | Same | sales, admin |
| D-004 | Dirección envío | Contact | Checkout (W1) | Neon `addresses` | Fulfillment | Contract | Order life + 7y | sales, admin |
| D-005 | Tipo cliente | Commercial | Admin | Neon `customers.type` | Pricing tier | Contract | Same | sales, admin |
| D-006 | Consent marketing | Consent | Web form | Neon `consents` | Newsletter | Consent | Until revoked | admin |
| D-007 | Consent timestamp | Consent | Web form | Neon `consents` | Proof | Legal obligation | 5 years | admin |
| D-008 | Quote line items | Commercial | Admin | Neon `quote_line_items` | Sales | Contract | 7 years | sales, admin |
| D-009 | Staff email | Identity | HR/onboarding | Neon `users` | Auth | Contract | Employment + 2y | admin |
| D-010 | Password hash | Auth | Registration | Neon `users` | Login | Contract | Until account deleted | system |
| D-011 | Session cookie | Technical | Login | Browser | Auth | Contract | Session | system |
| D-012 | IP address (logs) | Technical | Cloudflare | CF logs | Security | Legitimate interest | 30 days | admin |
| D-013 | Email delivery events | Technical | Resend webhook | Neon `email_events` | Deliverability | Contract | 1 year | admin |
| D-014 | Payment provider ID | Financial | MP/Stripe | Neon `payments` | Reconciliation | Contract | 7 years | admin |
| D-015 | Chat transcript (future) | Interaction | Chat widget | Neon `chat_logs` | Support | Consent | 30 days | admin |

## Subprocessors

| Vendor | Data shared | Location | DPA status |
|--------|-------------|----------|------------|
| Neon | All DB records | US (region TBD) | Provider ToS |
| Netlify | Build logs, env | US | Provider ToS |
| Cloudflare | IP, HTTP headers | Global edge | Provider ToS |
| Resend | Email, name | US | Provider ToS |
| Mercado Pago / Stripe | Payment metadata | US/MX | Provider agreement |
| LLM provider (future) | Chat snippets only | US | Review before launch |

## Data Flow Diagram

```
Customer form -> API -> Neon DB
                    ↘ Resend (email only)
Quote PDF       -> Email attachment (no extra store)
Payment         -> Provider (card data never touches our DB)
Admin export    -> Encrypted ZIP for ARCO response
```

## Not Collected

- CURP, RFC (until Wave Two invoicing - re-inventory)
- Full card numbers, CVV
- Precise geolocation
- Health data

## Change Log

| Date | Change | Author |
|------|--------|--------|
| 2026-07 | Initial inventory Wave Zero | Project team |

## Related

- [data-retention-policy.md](./data-retention-policy.md)
- [arco-procedure.md](./arco-procedure.md)
