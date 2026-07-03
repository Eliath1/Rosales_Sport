# Frontend vs Backend

> **Learning series:** Doc 05 of 07

## The Split

| | Frontend | Backend |
|--|----------|---------|
| **Runs where** | User's browser | Server (Netlify / Neon) |
| **Technologies** | React, HTML, CSS, Tailwind | Node.js, API routes, SQL |
| **Users see** | Buttons, forms, dashboards | Nothing directly |
| **Secrets** | Never store API keys here | Database passwords, payment keys |
| **Example** | "Enviar cotización" button | Saves quote, sends email |

## Baseball Store Example

**Frontend (Admin CRM page):**

- Sales selects customer "Liga Venados"
- Adds 15 jerseys to quote form
- Clicks **Enviar cotización**

**Backend (same Next.js app, server side):**

1. Validates prices from database (not from browser totals)
2. Generates PDF
3. Calls Resend API
4. Updates quote status to `sent`
5. Returns success JSON to frontend

## Why Next.js Blurs the Line

Next.js is **full-stack**:

- `.tsx` pages = frontend
- `/app/api/*` or server actions = backend
- Still **one mental model**: never trust the browser for money or permissions

## Frontend Responsibilities

- Display catalog with team filters
- Form validation (UX - "email looks wrong")
- Loading spinners, error toasts in Spanish
- Responsive layout (mobile sales rep on shop floor)

## Backend Responsibilities

- Authentication sessions
- Authorization (sales vs admin)
- Business rules: "can't edit sent quote"
- Database reads/writes
- Webhook processing from Mercado Pago
- ARCO data export

## Communication Bridge: REST API

Frontend -> `fetch('/api/quotes', { method: 'POST', body: ... })` -> Backend

See [02-rest-apis-explained.md](./02-rest-apis-explained.md).

## Security Rule of Thumb

> If tampering with browser DevTools could steal money or data, the protection must be on the **backend**.

Bad: price in hidden `<input>`  
Good: product ID + qty sent; server looks up price

## Modular Monolith Note

Our backend modules (customers, quotes) live in one deploy - not separate servers. See [../architecture/01-module-map.md](../architecture/01-module-map.md).

## Next Reads

- [06-databases-and-data-modeling.md](./06-databases-and-data-modeling.md)
- [../architecture/decisions/ADR-001-stack-choice.md](../architecture/decisions/ADR-001-stack-choice.md)
