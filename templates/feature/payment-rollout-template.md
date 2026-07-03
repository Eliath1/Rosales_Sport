# Payment Method Rollout: [Method Name]

| Field | Value |
|-------|-------|
| **Provider** | Mercado Pago / Stripe / Manual |
| **Method** | Card / OXXO / SPEI / MSI / Wallet |
| **Wave** | One |
| **Owner** | |
| **Target date** | |

## Business Justification

Why enable this method for Mexico baseball customers?

| Metric | Expected impact |
|--------|-----------------|
| Conversion | |
| AOV | |
| Support tickets | |

## Prerequisites

- [ ] Merchant account approved for method
- [ ] ADR-006 abstraction in place
- [ ] Sandbox credentials in dev env
- [ ] Production credentials in Netlify env
- [ ] Webhook URL registered with provider
- [ ] Legal/commercial fees understood (see mexico-pricing-reference)

## Technical Tasks

### Backend

- [ ] Extend `PaymentProvider` adapter
- [ ] Create checkout session for method
- [ ] Webhook handler + idempotency
- [ ] Order state machine updates (`pending_payment` -> `paid`)
- [ ] Inventory hold rules (OXXO TTL: ___ hours)

### Frontend

- [ ] Checkout UI option with icon + label (ES)
- [ ] Method-specific instructions (OXXO voucher display)
- [ ] Error messages in Spanish

### Email Templates

- [ ] `payment-pending-oxxo-es` (if applicable)
- [ ] `payment-confirmed-es`
- [ ] `payment-failed-es`

## Test Cases (Sandbox)

| # | Scenario | Expected | Pass |
|---|----------|----------|------|
| 1 | Successful card payment | Order paid, email sent | |
| 2 | Declined card | User sees retry message | |
| 3 | OXXO voucher generated | Pending until webhook | |
| 4 | Webhook replay | No duplicate charge | |
| 5 | Amount mismatch | Rejected server-side | |
| 6 | Expired OXXO | Order cancelled, stock released | |

## Monitoring & Alerts

- [ ] Dashboard: payments by method last 24h
- [ ] Alert if webhook error rate > 5%
- [ ] Reconciliation CSV export verified with accounting

## Rollout Plan

| Phase | Audience | Duration |
|-------|----------|----------|
| Internal staff test | Employees only | 3 days |
| Soft launch | 10% checkout traffic | 1 week |
| GA | 100% | |

Feature flag: `PAYMENT_METHOD_[METHOD]_ENABLED`

## Rollback

1. Disable feature flag
2. Hide method in checkout UI
3. Complete in-flight sessions manually (runbook below)

### In-Flight Orders Runbook

| Status | Action |
|--------|--------|
| Pending OXXO | Honor if paid; else cancel after expiry |
| Paid | Do not rollback without refund procedure |

## Sign-Off

| Role | Name | Date |
|------|------|------|
| Engineering | | |
| Client finance | | |
| Client owner | | |

## Related

- docs/architecture/payment-provider-abstraction.md
- docs/business/payment-methods-roadmap.md
