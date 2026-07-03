# Mexico Pricing Reference - Baseball Retail Context

> **Purpose:** Anchor development estimates and client conversations in realistic Mexico market rates.  
> **Note:** Figures are illustrative ranges for 2025-2026; verify with current supplier and labor market.

## Licensed Merchandise (Retail MXN)

| Product | Typical range (MXN) | Notes |
|---------|---------------------|-------|
| Replica jersey (MLB) | $1,299 - $2,499 | Team/player premium at high end |
| Authentic jersey | $3,500 - $6,000+ | Smaller volume |
| 59FIFTY gorra | $899 - $1,699 | Limited collabs higher |
| 9FORTY adjustable | $599 - $999 | Entry price point |
| Sudadera licenciada | $1,199 - $2,200 | Seasonal |
| Playera local LMB | $799 - $1,499 | Regional demand |

## Wholesale / Equipo (indicative)

| Order size | Discount off list |
|------------|-------------------|
| 12-23 units | 10-15% |
| 24-47 units | 15-20% |
| 48+ / liga package | 20-30% + bordado quote separate |

CRM must support **tier rules** without hardcoding in code (admin-configurable in Wave Two).

## Payment Method Customer Preference ( anecdotal / industry )

| Method | B2C online | B2B wholesale |
|--------|------------|---------------|
| Tarjeta | High | Medium |
| OXXO | High (cash culture) | Low |
| SPEI | Medium | **High** |
| MSI 3-6 meses | High for >$1,500 | Negotiated |

## Shipping (Mexico domestic)

| Zone | Estafeta/FedEx economy | Notes |
|------|------------------------|-------|
| Same city | $99 - $149 MXN | 1-2 días |
| Nacional | $149 - $249 MXN | 3-5 días hábiles |
| Remote | +$50-100 MXN | Extra days |

Display **envío calculado en checkout** in Wave One; flat rate OK for MVP.

## Software & Services (client OpEx reference)

| Service | MXN/mo approx @18 MXN/USD |
|---------|---------------------------|
| Infra MVP tier | $0 - $500 |
| Infra launch tier | $1,000 - $2,500 |
| Shopify Basic (comparison) | ~$550 + fees |
| Domain .mx | ~$700/año amortized |

## Development Labor (Mexico market, 2026)

| Role | MXN/hour (range) | USD/hour equiv |
|------|------------------|----------------|
| Junior dev | $150 - $300 | $8 - $17 |
| Mid full-stack | $350 - $600 | $19 - $33 |
| Senior / lead | $600 - $1,000+ | $33 - $55 |
| UX/UI freelance | $400 - $800 | $22 - $44 |
| Privacy lawyer (review) | Project fee $15k-40k MXN | One-time |

Use [development-cost-phases.md](./development-cost-phases.md) for phase totals.

## MSI Impact on Margin

If offering 3 MSI on $2,000 jersey:

- Customer pays ~$667 × 3 (no interest if merchant absorbs fee)
- Merchant fee ~3.5% + MSI surcharge from acquirer - model in finance template

## Tax Awareness (not advice)

- IVA 16% on most goods
- CFDI invoicing separate from Wave Zero CRM - integrate Wave Two+
- Prices in storefront typically **IVA incluido** for B2C clarity

## Related

- [client-pricing-models.md](./client-pricing-models.md)
- [payment-methods-roadmap.md](./payment-methods-roadmap.md)
- [../domain/baseball-store-glossary.md](../domain/baseball-store-glossary.md)
