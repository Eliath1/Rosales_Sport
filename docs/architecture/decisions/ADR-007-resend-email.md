# ADR-007: Resend for Transactional Email

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

## Context

Wave Zero requires reliable delivery of quote PDFs, password resets, and future order confirmations. Mexico deliverability depends on SPF, DKIM, and domain reputation - not the cheapest SMTP relay.

## Decision

Use **Resend** as the transactional email provider with a custom domain (e.g., `cotizaciones@mitiendabeisbol.mx`).

## Rationale

| Factor | Resend |
|--------|--------|
| Developer API | Simple REST, good Node SDK |
| React Email templates | JSX templates for bilingual emails |
| Free tier | 3,000 emails/month - enough for Wave Zero |
| Webhooks | Delivery, bounce, complaint events |
| Domain verification | Guided SPF/DKIM setup |

## Email Types (planned)

| Template ID | Trigger |
|-------------|---------|
| `quote-sent-es` | Sales sends cotización |
| `quote-reminder-es` | 3 days before expiry |
| `password-reset-es` | Staff forgot password |
| `order-confirm-es` | Wave One checkout |

## Alternatives Considered

| Provider | Notes |
|----------|-------|
| SendGrid | Mature; heavier UI |
| Amazon SES | Cheap at scale; more DNS/ops setup |
| Postmark | Excellent deliverability; similar to Resend |
| Gmail SMTP | Violates ToS for bulk; poor deliverability |

## Consequences

**Positive:** Fast integration, preview in dev with Resend test mode.

**Negative:** Vendor dependency; migrate path = abstract `EmailProvider` if needed (lower priority than payments).

**Legal:** Marketing emails require separate LFPDPPP consent; transactional exempt from marketing opt-in but include business identity in footer.

## Related

- ADR-010 (data privacy - email logs retention)
- [../../legal/data-retention-policy.md](../../legal/data-retention-policy.md)
