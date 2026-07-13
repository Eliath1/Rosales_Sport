# Payment Methods Roadmap

> **Strategy:** Meet Mexico buyers where they pay; minimize PCI scope via hosted checkout.

## Timeline

| Wave | Methods | Provider |
|------|---------|----------|
| **Zero** | None (quotes only); manual SPEI/ cash in store | - |
| **One MVP (Priority 2)** | Tarjeta crédito/débito, OXXO; **split payment plan** (100% under 6 pieces, 50% deposit + balance for 6+, per [ADR-013](../architecture/decisions/ADR-013-split-payments.md)) | Mercado Pago primary |
| **One.b** | SPEI, Mercado Pago wallet | Mercado Pago |
| **Two** | MSI 3/6/9 meses, Apple Pay, saved payment methods for distributors ([ADR-012](../architecture/decisions/ADR-012-customer-accounts.md)) | MP + Stripe optional |
| **Three** | Wholesale credit terms (manual), PayPal intl | Process + admin |

## Method Details

### Tarjeta (credit/debit)

- **User expectation:** Instant confirmation
- **Implementation:** Mercado Pago Checkout Pro or Stripe Payment Element
- **CRM:** Order status `paid` on webhook

### OXXO

- **User expectation:** 72h to pay at convenience store
- **Implementation:** MP generates voucher PDF/barcode
- **CRM:** Order `pending_payment` until webhook; inventory hold TTL 72h
- **Ops:** Train staff not to ship until confirmed

### SPEI

- **User expectation:** Transfer from banking app
- **Implementation:** MP SPEI reference or CLABE display
- **B2B:** Primary for wholesale; may stay manual Wave One

### MSI (meses sin intereses)

- **Commercial:** Increases AOV on jerseys >$1,500 MXN
- **Implementation:** Enable in MP merchant settings; disclose merchant fee impact
- **UI:** Show "Desde $XXX/mes x 3" on PDP (Wave Two polish)

### Efectivo en tienda

- **Not online** - POS future integration
- Quote -> accepted -> "pago en tienda" flag for Wave Zero

## Provider Matrix

| Method | Mercado Pago | Stripe MX |
|--------|--------------|-----------|
| Card | Yes | Yes |
| OXXO | Yes | Limited |
| SPEI | Yes | Yes |
| Wallet | Yes | No |
| MSI | Yes | Via partners |

**Default B2C:** Mercado Pago (ADR-006)

## Engineering Checklist per Method

- [ ] Create payment session API
- [ ] Webhook handler tested in sandbox
- [ ] Idempotency on webhook events
- [ ] Email template per status (pending OXXO vs paid)
- [ ] Admin view: payment method + provider ID
- [ ] Reconciliation export CSV for accounting
- [ ] Capture `feeCents` from webhook payload where the provider exposes it (Mercado Pago does per-payment) - feeds the commission report in [mexico-pricing-reference.md](./mexico-pricing-reference.md)
- [ ] Deposit/balance split: `deposit` payment at checkout for 6+ pieces, `balance` payment request emailed on `ready_to_ship`

Template: [../../templates/feature/payment-rollout-template.md](../../templates/feature/payment-rollout-template.md)

## Fraud & Risk

| Method | Risk | Mitigation |
|--------|------|------------|
| Card | Chargebacks | AVS where available; clear product photos |
| OXXO | Fake voucher screenshots | Trust webhook only |
| SPEI | Wrong reference | Unique reference per order |

## Related

- [../architecture/payment-provider-abstraction.md](../architecture/payment-provider-abstraction.md)
- [mexico-pricing-reference.md](./mexico-pricing-reference.md)
