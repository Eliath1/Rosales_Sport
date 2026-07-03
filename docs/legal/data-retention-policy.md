# Data Retention Policy

> **Legal review:** Confirm periods with counsel and tax advisor (Mexico commercial record requirements).  
> **Effective:** Wave Zero launch

## Policy Statement

We retain personal data only as long as necessary for the purposes collected, legal obligations, and legitimate business needs - then **delete or anonymize**.

## Retention Schedule

| Data type | Retention period | Action after period |
|-----------|------------------|---------------------|
| Customer account (active) | While relationship active | - |
| Customer account (inactive) | 3 years no activity | Anonymize PII; keep aggregate stats |
| Quotes (all statuses) | 7 years | Anonymize customer link; keep amounts for tax audit |
| Orders & payments | 7 years | Required for fiscal/accounting defense |
| Marketing consent records | 5 years after revoke | Delete |
| Staff accounts | 2 years after termination | Delete |
| Application logs (app) | 90 days | Delete |
| Cloudflare logs | 30 days | Auto-expire (CF setting) |
| Email delivery events | 1 year | Delete |
| AI chat logs (future) | 30 days | Delete |
| ARCO request records | 5 years | Archive encrypted |
| Backups | 30 days rolling | Encrypted; same retention rules apply on restore |

## Anonymization Standard

When anonymizing customers:

- Replace `name` -> `"ANON-{uuid}"`
- Replace `email` -> `null` or hashed irreversible token
- Replace `phone` -> `null`
- Retain `customer_id` foreign keys on quotes as orphan for reporting OR reassign to system account `ANONYMIZED`

## Legal Holds

If litigation or regulatory inquiry occurs, suspend deletion for affected records until counsel releases hold.

## Implementation

| Mechanism | Owner |
|-----------|-------|
| Scheduled job (monthly) | Engineering |
| Manual ARCO cancellation | Privacy responsible |
| Backup purge | Neon/Netlify provider defaults + verify |

## Exceptions

- Data required for **pending ARCO** request: retain until case closed
- **Dispute/chargeback** open: retain payment records until resolved

## Staff Responsibilities

1. Do not export customer lists to personal devices
2. Delete local CSV exports after import completes
3. Report accidental retention violations to admin

## Review

Review this policy annually or when:

- New data category added (update inventory)
- Law reform (LFPDPPP 2025 reforms)
- New subprocessor introduced

## Related

- [data-inventory.md](./data-inventory.md)
- [mexico-privacy-framework.md](./mexico-privacy-framework.md)
- [../architecture/decisions/ADR-010-data-privacy.md](../architecture/decisions/ADR-010-data-privacy.md)
