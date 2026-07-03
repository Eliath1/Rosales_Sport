# REST APIs Explained

> **Learning series:** Doc 02 of 07

## What Problem Do APIs Solve?

The **admin CRM** runs in the browser (frontend). **Customer data** lives in the database on the server (backend). They need a structured way to talk over the internet.

An **API** (Application Programming Interface) is that contract: "If you send this request, I'll send this response."

**REST** is a popular style using URLs and HTTP methods - like verbs for the web.

## Restaurant Analogy

| REST concept | Restaurant |
|--------------|------------|
| Resource | Menu item (jersey #42) |
| GET | "What's on the menu?" |
| POST | "I'd like to place an order" |
| PATCH | "Change my order to talla M" |
| DELETE | "Cancel that line item" |
| URL | `/api/products`, `/api/quotes/abc-123` |

The kitchen (server) does the work; the waiter (API) carries messages.

## Example: List Quotes

**Request:**

```
GET /api/quotes?status=sent
Authorization: (session cookie)
```

**Response:**

```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "customerName": "María González",
      "total": { "amountCents": 259800, "currency": "MXN" },
      "status": "sent"
    }
  ]
}
```

The browser displays a table; it doesn't touch the database directly.

## HTTP Methods (Verbs)

| Method | Safe to repeat? | Typical use |
|--------|-----------------|-------------|
| GET | Yes | Read data |
| POST | No | Create / send quote |
| PATCH | No | Update status |
| DELETE | No | Remove draft |

## Status Codes (Quick Reference)

| Code | Meaning | Baseball store example |
|------|---------|------------------------|
| 200 | OK | Quote list returned |
| 201 | Created | New customer saved |
| 400 | Bad request | Invalid email format |
| 401 | Unauthorized | Staff not logged in |
| 404 | Not found | Quote ID doesn't exist |
| 500 | Server error | Database down - call IT |

## Why Not Put Database in the Browser?

1. **Security** - Passwords and API keys stay on server
2. **Validation** - Server recalculates prices (client could cheat)
3. **Privacy** - LFPDPPP: control who accesses PII

## Webhooks (Bonus)

When **Mercado Pago** confirms an OXXO payment, it **calls our API** (`POST /api/webhooks/payments/mercadopago`). That's the provider initiating the conversation - like the kitchen ringing a bell when orden lista.

## Our Project Standards

See [../api/design-standards.md](../api/design-standards.md) for:

- JSON format
- Spanish error messages
- Money as cents (no decimals float bugs)

## Next Reads

- [05-frontend-vs-backend.md](./05-frontend-vs-backend.md)
- [06-databases-and-data-modeling.md](./06-databases-and-data-modeling.md)
