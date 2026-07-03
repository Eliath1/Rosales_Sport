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

## Journey Map Summary

| Journey | Wave | Priority |
|---------|------|----------|
| Phone quote | Zero | P0 |
| Website browse + quote | Zero | P0 |
| Wholesale quote | Zero | P0 |
| Owner dashboard | Zero | P1 |
| Online checkout OXXO | One | P0 |
| ARCO access | Zero (manual) | P1 |
| AI size help | Two+ | P2 |

## Related

- [../architecture/wave-zero-quote-crm.md](../architecture/wave-zero-quote-crm.md)
- [baseball-store-glossary.md](./baseball-store-glossary.md)
