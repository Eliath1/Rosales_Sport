# ADR-014: Monorepo Split - Two Next.js Apps (Storefront + CRM)

| Field | Value |
|-------|-------|
| **Status** | Accepted |
| **Date** | 2026-07 |
| **Deciders** | Project lead |

## Context

ADR-002 chose a modular monolith: one Next.js app serving both the public storefront (`/`, `/products/*`, `/quote`) and the staff CRM (`/admin/*`) from the same deployment, same domain, same Netlify site. That was the right call for Wave Zero when the priority was shipping quotes fast with a one-person team.

Moving toward Initial Production Deployment changed the risk profile:

- The public storefront is internet-facing by design - it must accept anonymous traffic, be indexable, and tolerate scraping/bot noise.
- The staff CRM handles customer PII (names, emails, phone, addresses), order/payment data, and eventually distributor accounts. It should never be reachable by the same attack surface as the public site.
- A single Next.js deployment means a vulnerability, dependency CVE, or misconfiguration in the storefront's public surface (leads, quote forms, product API) sits in the same process and route table as the CRM's staff-auth routes. Middleware bugs are the main risk: one misconfigured matcher can leak an `/admin/*` route to the internet.
- Netlify billing/scaling is also shared today - a public traffic spike (viral post, bot crawl) could degrade CRM availability for staff mid-shift.

We need to decide whether to keep the single-app monolith or split into physically separate deployments before opening the site to real customer traffic.

## Decision

Split into **two independently deployable Next.js apps in one npm-workspaces monorepo**, sharing one Neon Postgres database:

```
RS/
  apps/
    web/     -> @rs/web   - public storefront, /mi-cuenta, guest checkout
    admin/   -> @rs/admin - staff CRM, no public marketing routes
  packages/
    db/      -> @rs/db     - Prisma schema, migrations, shared client singleton
    shared/  -> @rs/shared - services, validators, email/PDF/payment adapters
  demo/                    - Stage D static demo, untouched, still monolithic
```

- `apps/web` deploys to `rosalessport.com` (the existing Netlify site; replaces the Stage D demo when Stage 0 production goes live).
- `apps/admin` deploys to a **second, separate Netlify site** at `admin.rosalessport.com`.
- Both apps import `@rs/db` (Prisma client + generated types) and `@rs/shared` (business logic: `orderService`, `quoteService`, email templates, payment adapters, Zod schemas) as workspace packages - no duplicated logic, no HTTP calls between the two apps.
- Staff auth (`apps/admin`) and customer auth (`apps/web`) remain two separate NextAuth instances with separate cookies, as already decided in ADR-012 - the split now also gives them separate domains, which is a stronger isolation guarantee than separate cookies on the same origin.
- `demo/` is explicitly out of scope for this split. It stays a single static site on its own Netlify config (root `netlify.toml`) exactly as it is today; nothing here changes how the client-facing demo is deployed.

## Rationale

| Factor | Two-app split wins because |
|--------|------------------------------|
| Blast radius | A bug or breach in the public storefront's routes cannot reach `/admin/*` at the network level - there is no `/admin/*` route in that deployment at all |
| Independent scaling/incidents | A storefront traffic spike or DDoS does not touch the CRM's Netlify site, functions, or rate limits |
| Auth isolation | Staff and customer sessions already used separate NextAuth instances (ADR-012); separate domains removes the shared-origin cookie risk entirely, satisfying the security baseline rule that staff CRM routes require server-side role checks with no client-trust path |
| Independent deploys | Ship a CRM fix without redeploying (or risking) the public site, and vice versa |
| Team size still small | npm workspaces + two Next.js apps is one extra `apps/*` folder each, not new infra categories - no new hosting provider, no new database, no new ops tooling |
| Shared code stays shared | `@rs/db` and `@rs/shared` prevent the "two deploys = duplicated business logic" trap that made ADR-001 reject a separate SPA + Express split |

### Why this doesn't reintroduce the concerns ADR-001 rejected

ADR-001 rejected "Separate React SPA + Express" because of *two deploys, CORS, duplicated auth for MVP scope*. Those concerns don't transfer to this split:

- **CORS:** each app's frontend only calls its own backend (`apps/web`'s pages call `apps/web`'s API routes; `apps/admin`'s pages call `apps/admin`'s API routes). Neither app's browser code makes cross-origin calls to the other app - `apps/web` only *links* to `admin.rosalessport.com` for the staff-login button, it never fetches from it.
- **Duplicated auth:** staff and customer auth were already two separate NextAuth configs before this split (ADR-012); moving them into two apps doesn't duplicate anything new - it just relocates existing, already-separate code.
- **Duplicated business logic:** the SPA + Express alternative would have meant reimplementing services in two languages/frameworks. Here both apps are Next.js and both import the same `@rs/shared` and `@rs/db` TypeScript packages - one implementation, two runtimes.
- **Two deploys:** still true, and now intentional - see Rationale table above. This is the one ADR-001 concern that does apply, and it's an accepted tradeoff, not an oversight.

## Alternatives Considered

| Option | Rejected because |
|--------|------------------|
| Keep single Next.js app (status quo, ADR-002) | CRM and public site share one attack surface and one Netlify site's availability; acceptable for Wave Zero internal use, not for public production traffic |
| Separate repos (no monorepo) | Loses shared `@rs/db`/`@rs/shared` type safety across a schema/service change; would need to publish an internal npm package or duplicate code |
| Path-based split on one Netlify site (`/admin` proxied to a second Next app via redirects) | Still one shared domain/cookie origin unless carefully scoped; more fragile than two real domains and doesn't remove the shared-deploy blast radius |
| Full microservices (per-module services) | Same rejection as ADR-002: no ops capacity for 5+ services at current team size |

## Consequences

**Positive:** Public storefront outage/incident cannot take down or expose the CRM. Independent deploy cadence. Existing ADR-012 auth separation is now reinforced by domain separation, not just cookie scoping.

**Negative:** Two Netlify sites to configure and monitor instead of one. Two `.env` sets to keep in sync for shared values (`DATABASE_URL`). Slightly more local-dev setup (`npm run web:dev` and `npm run admin:dev` run on different ports).

**Mitigation:** `packages/db` and `packages/shared` keep the actual business logic and schema in one place - the split only duplicates *deployment config*, not code. `docs/hosting/monorepo-netlify-setup.md` documents both sites' env vars side by side to keep them from drifting.

## Related

- ADR-001 (stack choice - see "why this doesn't reintroduce" above)
- ADR-002 (modular monolith - amended by this ADR: module boundaries now also map to physical app boundaries for `admin` vs public/customer-facing modules)
- ADR-012 (customer accounts - the two-NextAuth-instance decision this split builds on)
- [01-module-map.md](../01-module-map.md)
- [02-website-architecture-plan.md](../02-website-architecture-plan.md)
- [docs/hosting/monorepo-netlify-setup.md](../../hosting/monorepo-netlify-setup.md)
