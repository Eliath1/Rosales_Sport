# What Is a CRM?

> **Learning series:** Doc 01 of 07 - beginner-friendly concepts for the baseball store project.

## CRM in Plain Language

**CRM** stands for **Customer Relationship Management**. It is software that helps a business remember who its customers are, what they bought or asked about, and what to do next.

For a **Mexico baseball store**, a CRM answers questions like:

- "¿Este cliente ya pidió cotización de jerseys de los Sultanes?"
- "¿Cuándo le enviamos la última cotización a la liga infantil?"
- "¿Quién debe recibir seguimiento esta semana?"

Without a CRM, this information lives in WhatsApp chats, Excel sheets, and sticky notes - easy to lose.

## CRM vs Online Store

| Online store (e-commerce) | CRM |
|---------------------------|-----|
| Focus: browse & buy now | Focus: relationships & sales process |
| Shopping cart, checkout | Leads, quotes, follow-ups |
| Same for every visitor | Knows each customer history |

**Our project combines both over time:**

- **Wave Zero:** CRM first (cotizaciones)
- **Wave One:** Add storefront + payments

## Core CRM Objects (Our Project)

```
Customer  ->  Person or business you sell to
Product   ->  Jersey, gorra, etc. in catalog
Quote     ->  Formal price offer before they pay
Order     ->  (Later) Confirmed sale after payment
```

Think of a **quote (cotización)** like a restaurant bill proposal for a catering event - not the final receipt yet.

## Why a Baseball Store Needs This

1. **Mayoreo quotes** - 24 jerseys with numbers takes time; you need a saved proposal
2. **Seasonal spikes** - Opening day, playoffs; don't lose leads in the rush
3. **Multiple channels** - Tienda física, Instagram, WhatsApp -> one customer record
4. **Professional image** - PDF cotización with logo beats a screenshot of prices

## Simple Workflow

```
Nuevo contacto -> Crear cliente -> Armar cotización -> Enviar PDF
                                              ↓
                                    Seguimiento -> Aceptada -> Pedido
```

## CRM for Small Teams

Enterprise CRMs (Salesforce) are heavy. Our CRM is **right-sized**:

- Spanish interface
- MXN prices
- Few clicks for sales staff
- Privacy rules for Mexico (LFPDPPP)

## Try It Yourself (Conceptual)

Imagine a fan calls asking for 2 Yankees jerseys talla L:

1. Search customer by phone - if new, create record
2. Add products from catalog
3. System calculates total with IVA if configured
4. Click "Enviar" - email with PDF
5. Status = **enviada** - appears on owner dashboard

That's CRM value in one call.

## Next Reads

- [02-rest-apis-explained.md](./02-rest-apis-explained.md) - How the admin talks to the server
- [../domain/user-journeys.md](../domain/user-journeys.md) - Real scenarios
- [../architecture/wave-zero-quote-crm.md](../architecture/wave-zero-quote-crm.md) - What we build first
