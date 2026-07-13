# User Journeys - Mexico Baseball Store CRM

> **Format:** Each journey lists actors, steps, system touchpoints, and Wave assignment.

---

## Journey 1: Fan requests quote via phone (Wave Zero)

**Actor:** Retail customer (fan)  
**Goal:** Get price for 2 jerseys + 1 gorra before buying

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Customer | Calls store / WhatsApp | (external) |
| 2 | Sales | Creates customer record if new | Admin -> Customers |
| 3 | Sales | Builds quote from catalog | Admin -> Quotes |
| 4 | Sales | Sends PDF email | Quotes -> Resend |
| 5 | Customer | Reviews PDF, asks about MSI | (external) |
| 6 | Sales | Notes "interesado en MSI" on quote | Admin -> Quote detail |
| 7 | Sales | Marks quote **aceptada** | Admin -> Status update |

**Pain points addressed:** No more lost WhatsApp screenshots; single customer history.

**Success metric:** Quote sent within 5 minutes of call.

---

## Journey 2: Wholesale league order (Wave Zero -> One)

**Actor:** Liga infantil coordinator  
**Goal:** 24 uniforms with numbers and team logo

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Coordinator | Emails requirements | (external) |
| 2 | Sales | Creates B2B customer type `equipo` | Customers |
| 3 | Sales | Quote with tier pricing + bordado line | Quotes |
| 4 | Owner | Approves discount >15% | Admin approval (future) |
| 5 | Sales | Sends quote, validity 30 days | PDF + email |
| 6 | Coordinator | Accepts; asks for SPEI | Status **aceptada** |
| 7 | Sales | (Wave One) Creates order, records transfer | Orders + Payments |

**Wave Zero ends at step 5-6 manual payment. Wave One automates order record.

---

## Journey 3: Staff daily pipeline review (Wave Zero)

**Actor:** Store owner  
**Goal:** See what quotes need follow-up

| Step | Action | System |
|------|--------|--------|
| 1 | Login | Auth module |
| 2 | Open dashboard | Quotes by status |
| 3 | Filter **enviada** > 7 days | Quote list |
| 4 | Assign follow-up to sales rep | (manual / notes) |
| 5 | Export weekly MXN pipeline | CSV report (stretch) |

---

## Journey 3b: Fan browses website and requests quote (Wave Zero)

**Actor:** Retail customer (fan)  
**Goal:** See jerseys online and request a price without calling

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Customer | Lands on `/collections/jerseys` | Storefront SSR |
| 2 | Customer | Opens PDP, selects talla | Catalog + variants |
| 3 | Customer | Clicks **Solicitar cotización** | `/quote` pre-filled |
| 4 | Customer | Submits form + privacy consent | `POST /api/leads/quote` |
| 5 | System | Notifies sales via email | Resend -> staff inbox |
| 6 | Sales | Reviews lead in `/admin/leads` | Admin CRM |
| 7 | Sales | Builds formal quote, sends PDF | Quotes module |

**Success metric:** Lead visible in admin within 1 minute of submit.

---

## Journey 3c: Team orders custom uniforms online (Wave Zero)

**Actor:** Liga or school coordinator  
**Goal:** Submit full customization spec (sizes, names, numbers, decoration) without a phone call

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Coordinator | Opens `/custom/uniform` from home or nav | Storefront |
| 2 | Coordinator | Selects product type (uniform, cap, set) and base design | Custom form |
| 3 | Coordinator | Enters qty, size breakdown, player roster | Custom form |
| 4 | Coordinator | Chooses decoration: **bordado** (MX) or DTF/TPU/3D DTF (US) | Custom form |
| 5 | Coordinator | Submits contact + consent | `POST /api/leads/custom-uniform` |
| 6 | Sales | Reviews customization JSON in admin lead/quote | Admin CRM |
| 7 | Sales | Builds quote with decoration line items + sends PDF | Quotes module |

**Market note:** Embroidery is default recommendation for Mexico; DTF/TPU/3D DTF for US wholesale.

See [custom-uniform-decoration.md](./custom-uniform-decoration.md).

---

## Journey 4: Online browse and checkout (Wave One)

**Actor:** Digital-native fan in Guadalajara  
**Goal:** Buy limited jersey with OXXO payment

| Step | Action | System |
|------|--------|--------|
| 1 | Lands on SEO collection page | Storefront SSR |
| 2 | Filters Padres + talla L | Catalog API |
| 3 | Adds to cart | Session cart |
| 4 | Checkout with email + address | Checkout form + consent |
| 5 | Selects OXXO via Mercado Pago | Payment adapter |
| 6 | Pays at OXXO within 72h | Webhook -> order confirmed |
| 7 | Receives email confirmation | Resend |
| 8 | Tracks shipment | Order status page |

---

## Journey 4b: Guest checks out without an account (Priority 1)

**Actor:** First-time or occasional retail customer
**Goal:** Buy without creating an account - the owner's #1 stated priority is getting new customers, so this path must have the least friction possible.

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Customer | Picks a jersey base model, color swatch, and gender/size | Catalog PDP swatch strip |
| 2 | Customer | Adds to order, goes to checkout | Storefront `/checkout` |
| 3 | Customer | Fills contact info inline (no login prompt) | Guest checkout form |
| 4 | System | Creates/matches `Customer` by email with `passwordHash = null` | Customers + Orders modules |
| 5 | System | Creates `Order` (`pending_payment`) | Orders module |
| 6 | Sales/owner | Gets notified immediately | Notifications -> `sales@rosalessport.com` |
| 7 | Customer | Gets order confirmation by email | Resend |

**Success metric:** a new visitor can complete steps 1-7 without ever seeing a login screen.

See [ADR-012-customer-accounts.md](../architecture/decisions/ADR-012-customer-accounts.md).

---

## Journey 4c: Split/deposit payment on a team order (Priority 2)

**Actor:** Liga or equipo coordinator ordering 6+ pieces
**Goal:** Pay a deposit now, the balance when the order is ready to ship - matching how the owner already sells larger orders informally.

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Customer | Checks out with 6+ pieces | Checkout computes `paymentPlan = deposit_50` |
| 2 | Customer | Pays 50% via Mercado Pago | Payments module, `Payment.kind = deposit` |
| 3 | System | Order moves to `deposit_paid` -> `in_production` | Orders module |
| 4 | Staff | Marks order `ready_to_ship` when production finishes | Admin -> Orders |
| 5 | System | Emails customer a balance-payment link | Notifications |
| 6 | Customer | Pays remaining 50% | Payments module, `Payment.kind = balance` |
| 7 | System | Order moves to `shipped` | Orders module |
| 8 | Owner | Sees effective commission % on both payments | Admin commission report |

**Success metric:** balance-payment email sent within minutes of the `ready_to_ship` status change.

See [ADR-013-split-payments.md](../architecture/decisions/ADR-013-split-payments.md).

---

## Journey 5: Privacy - customer exercises ARCO access (Wave Zero+)

**Actor:** Customer  
**Goal:** Know what data the store holds

| Step | Action | System |
|------|--------|--------|
| 1 | Reads aviso de privacidad | Public legal page |
| 2 | Submits ARCO form | Form -> Privacy module |
| 3 | Ops verifies identity | Manual (email match + order #) |
| 4 | Export JSON/PDF of records | Admin privacy tool |
| 5 | Deliver within 20 business days | Email secure link |

See [../legal/arco-procedure.md](../legal/arco-procedure.md).

---

## Journey 6: AI size assistant (Phase 1 - future)

**Actor:** Website visitor  
**Goal:** Pick correct 59FIFTY size

| Step | Action | System |
|------|--------|--------|
| 1 | Opens chat widget | Chat UI |
| 2 | Asks "¿Talla 7 1/2 en cm?" | RAG + size guide |
| 3 | Gets answer with citation | LLM + guardrails |
| 4 | Clicks "Cotizar esta gorra" | Deep link to quote form |

See [../architecture/ai-chatbot-roadmap.md](../architecture/ai-chatbot-roadmap.md).

---

## Journey 7: Distributor registers, then tracks order status (Priority 3)

**Actor:** Frequent distributor/mayorista customer
**Goal:** Have an account, see order history and status, and reuse a saved payment method - this is deliberately the last-built journey per the owner's priority order, since it serves repeat/B2B customers rather than new-customer acquisition.

| Step | Actor | Action | System |
|------|-------|--------|--------|
| 1 | Distributor | Registers with email + password at `/mi-cuenta/registro` | Customer auth (separate from staff auth) |
| 2 | Owner/staff | Flags the account `isDistributor = true` | Admin -> Customers |
| 3 | Distributor | Logs in, sees order history | `/mi-cuenta/pedidos` |
| 4 | Distributor | Opens an order, sees status timeline | `/mi-cuenta/pedidos/[id]` |
| 5 | Distributor | Saves a payment method for faster future checkout | `SavedPaymentMethod` (tokenized reference only) |
| 6 | Distributor | Places next order, attaches the saved method at checkout | Orders + Payments modules |

**Success metric:** a returning distributor completes checkout without re-entering payment details.

See [ADR-012-customer-accounts.md](../architecture/decisions/ADR-012-customer-accounts.md).

---

## Journey Map Summary

| Journey | Wave | Priority |
|---------|------|----------|
| Phone quote | Zero | P0 |
| Website browse + quote | Zero | P0 |
| Wholesale quote | Zero | P0 |
| Owner dashboard | Zero | P1 |
| Online checkout OXXO | One | P0 |
| Guest checkout (no account) | One (Priority 1) | P0 |
| Split/deposit payment | One (Priority 2) | P0 |
| Distributor registration + order tracking | One (Priority 3) | P1 |
| ARCO access | Zero (manual) | P1 |
| AI size help | Two+ | P2 |

## Related

- [../architecture/wave-zero-quote-crm.md](../architecture/wave-zero-quote-crm.md)
- [baseball-store-glossary.md](./baseball-store-glossary.md)
- [../architecture/decisions/ADR-012-customer-accounts.md](../architecture/decisions/ADR-012-customer-accounts.md)
- [../architecture/decisions/ADR-013-split-payments.md](../architecture/decisions/ADR-013-split-payments.md)
