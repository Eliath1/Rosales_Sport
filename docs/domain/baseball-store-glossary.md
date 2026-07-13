# Baseball Store Glossary

> **Purpose:** Shared vocabulary for developers, sales staff, and documentation.  
> **Locale:** Mexican Spanish retail context; English equivalents where useful.

## Teams & Leagues

| Term (ES) | English | Notes |
|-----------|---------|-------|
| **LMB** | Mexican Baseball League | Liga Mexicana de Béisbol - Sultanes, Charros, etc. |
| **LMP** | Mexican Pacific League | Liga invernal (Oct-Jan) |
| **MLB** | Major League Baseball | US league; high demand in MX for Yankees, Dodgers, Padres |
| **Selección Mexicana** | Team Mexico | WBC, international tournaments |
| **Equipo local** | Local team | Store's regional favorite (e.g., Sultanes in Monterrey) |

## Product Categories

| Term | Description |
|------|-------------|
| **Jersey / playera** | Button-up or replica game jersey; often "Replica" vs "Authentic" |
| **Gorra** | Cap; includes **59FIFTY** (fitted flat bill), **39THIRTY** (stretch), **9FORTY** (adjustable) |
| **Sudadera / hoodie** | Hooded sweatshirt with team branding |
| **Fan gear / accesorios** | Llaveros, pins, bufandas |
| **Edición limitada** | Limited drop; often no restock - quote carefully |
| **Playera de jugador** | Jersey with specific player name/number (licensing constraints) |

## Sizing

| Term | Meaning |
|------|---------|
| **Talla** | Size: XS, S, M, L, XL, XXL (sometimes numeric for fitted caps: 7, 7⅛, 7¼...) |
| **Fit** | Regular vs athletic cut |
| **Guía de tallas** | Size chart; measurements in cm for MX customers |
| **59FIFTY fitted** | No adjustable strap; must match head size exactly |
| **Dama / Caballero** | Gender sizing split (`ProductVariant.gender`); same XS-XXL label set today, different measurement chart per gender - not a separate size scale unless the owner confirms otherwise |
| **Unisex** | Default gender value for products without a gender split (e.g., gorras) |
| **Manga Normal** | Jersey sleeve model 1: regular sleeve, solid body color |
| **Manga Raglan** | Jersey sleeve model 2: raglan sleeve, collar/placket matches body color, sleeves in a contrasting color |

## Pricing & Sales

| Term | Description |
|------|-------------|
| **Precio de lista** | MSRP / public shelf price |
| **Mayoreo** | Wholesale; typically 12+ units or registered B2B account |
| **Precio equipo** | Team/club pricing for uniforms |
| **Cotización / quote** | Formal price offer with validity date |
| **MSI** | Meses sin intereses - installment payments via card |
| **Anticipo** | Deposit (common on custom/bulk orders); formalized as 50% for orders of 6+ pieces (`Order.paymentPlan = deposit_50`) - see [ADR-013](../architecture/decisions/ADR-013-split-payments.md) |
| **Saldo / pago final** | Balance payment; requested once staff marks an order `ready_to_ship` |
| **Comisión (del procesador)** | Processor's transaction fee (`Payment.feeCents`), captured from webhook data so the owner can see effective % and adjust pricing |

## Customer Types

| Type | Characteristics |
|------|-----------------|
| **Fan retail (B2C)** | 1-3 items, price-sensitive, wants MSI/OXXO |
| **Mayorista** | Reseller or league; needs tiered pricing, factura |
| **Equipo / liga** | Bulk uniforms, names on back, long sales cycle |
| **Corporate** | Promotional event jerseys; logo placement rules |
| **Invitado / Guest** | No account; checks out with contact info only (`Customer.passwordHash = null`) |
| **Distribuidor** | Registered, frequent reseller (`Customer.isDistributor = true`); gets `/mi-cuenta` dashboard, order tracking, and saved payment methods |

## Order & Fulfillment

| Term | Meaning |
|------|---------|
| **Pedido** | Order (post-payment) |
| **Apartado** | Hold/reserve item (informal; document in CRM notes) |
| **Bordado / personalización** | Embroidery - name on jersey; **most common in Mexico** for team orders |
| **DTF** | Direct-to-film print; common in US wholesale |
| **TPU** | Thermoplastic patches; common in US |
| **3D DTF** | Raised DTF finish; common in US |
| **Guía de envío** | Shipping tracking number (Estafeta, FedEx, DHL) |
| **Pick-up en tienda** | Click-and-collect |
| **Testimonios** | Owner-curated carousel of real customer photos + quotes on the homepage; staff add/approve entries, no public upload form |

## Payment Methods (Mexico)

| Method | Context |
|--------|---------|
| **Tarjeta crédito/débito** | Most online checkout |
| **OXXO** | Cash voucher; 1-3 day expiry typical |
| **SPEI** | Bank transfer; common for B2B |
| **Mercado Pago** | Wallet + aggregator |
| **Transferencia** | Direct bank transfer for wholesale |

## CRM Status Terms (Wave Zero)

| Status (ES) | Meaning |
|-------------|---------|
| **borrador** | Draft quote, not sent |
| **enviada** | Emailed to customer |
| **aceptada** | Customer agreed; convert to order in Wave One |
| **vencida** | Past `valid_until` date |
| **rechazada** | Customer declined |

## Abbreviations

| Abbr | Expansion |
|------|-----------|
| **SKU** | Stock keeping unit - unique product identifier |
| **CFDI** | Digital tax invoice (SAT Mexico) - Wave Two+ |
| **ARCO** | Access, Rectification, Cancellation, Opposition (privacy rights) |
| **LFPDPPP** | Federal privacy law for private entities in Mexico |

## Licensing Note (for developers)

Replica jerseys are **licensed merchandise**. Product data should respect:

- No false "official" claims without license documentation
- Player names may have expiry when traded
- Images often come from supplier feeds, not scraped from other stores

## Related

- [reference-site-newera-mx.md](./reference-site-newera-mx.md) - UX patterns, not brand copy
- [user-journeys.md](./user-journeys.md)
- [../architecture/decisions/ADR-012-customer-accounts.md](../architecture/decisions/ADR-012-customer-accounts.md)
- [../architecture/decisions/ADR-013-split-payments.md](../architecture/decisions/ADR-013-split-payments.md)
