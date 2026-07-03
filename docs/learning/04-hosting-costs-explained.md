# Hosting Costs Explained

> **Learning series:** Doc 04 of 07 - demystifying cloud bills for non-engineers.

## What Are You Paying For?

When the baseball CRM runs "in the cloud," you rent:

| Service | Analogy | What it does |
|---------|---------|--------------|
| **Hosting (Netlify)** | Storefront lease | Runs website & API code |
| **Database (Neon)** | Filing cabinet | Stores customers, quotes |
| **CDN/Security (Cloudflare)** | Security guard + delivery | Fast, safe access |
| **Email (Resend)** | Post office | Sends cotización PDFs |
| **Payments (MP/Stripe)** | Card terminal | % per sale, not flat hosting |

## Fixed vs Variable Costs

**Fixed (monthly):** Netlify plan, Neon plan, Cloudflare Pro - predictable.

**Variable:**

- Payment fees: ~3-4% of each online sale
- Email: free tier then per 1,000 emails
- AI (future): per chat message to LLM provider

## Why Serverless Fits a Small Store

Traditional server: pay 24/7 even when closed at 2 AM.

**Serverless (Netlify functions):** pay per request when someone uses the CRM. Overnight cost ≈ $0.

Tradeoff: cold starts (first request slightly slower) - usually fine for admin CRM.

## Realistic Monthly Scenarios (USD)

See full detail: [../hosting/infrastructure-cost-tiers.md](../hosting/infrastructure-cost-tiers.md)

| Stage | ~USD/mo | Who it's for |
|-------|---------|--------------|
| Dev | $0-5 | Building & testing |
| Wave Zero internal | $0-25 | Staff only, few users |
| Public launch | $50-120 | Online sales moderate |
| Busy season | $150+ | Playoffs traffic spike |

At ~18 MXN/USD, launch tier ≈ **$900-2,200 MXN/mo** - often less than Shopify + apps for custom quote workflows.

## Hidden Costs to Plan For

1. **Domain renewal** - `.mx` yearly
2. **SSL** - Free via Cloudflare/Netlify
3. **Backups** - Included in Neon paid tiers
4. **Developer maintenance** - Bug fixes, dependency updates (not infra but real cost)
5. **Legal review** - One-time privacy documents

## Cost vs Building Your Own Server

| | Cloud (our stack) | VPS in garage |
|--|-------------------|---------------|
| Setup time | Hours | Days |
| Security patches | Provider helps | You manage |
| Scale on opening day | Auto | Manual |
| Expertise needed | Low | High |

## How to Keep Bills Low Early

1. Stay on free tiers until real users arrive
2. Don't enable AI chat until traffic justifies it
3. Cache product images at Cloudflare
4. Delete old preview databases

## Questions for Budget Meetings

- "¿Cuántos pedidos en línea esperamos mes 1?" -> drives payment fees
- "¿Cuántos correos de cotización por semana?" -> Resend tier
- "¿Necesitamos WAF pagado día 1?" -> Cloudflare Pro at public launch

## Next Reads

- [../hosting/netlify-cloudflare-guide.md](../hosting/netlify-cloudflare-guide.md)
- [../business/development-cost-phases.md](../business/development-cost-phases.md)
