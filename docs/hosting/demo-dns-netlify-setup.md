# Demo DNS and Netlify Setup (Stage D)

> **Goal:** Client opens your purchased domain and sees the static demo within 24-48 hours.  
> **Cost:** Netlify Free tier is enough for the demo. Domain ~$200-800 MXN/year for `.mx`.

---

## What you need before starting

| Item | Who |
|------|-----|
| Domain purchased (e.g. `mitiendabeisbol.mx`) | You |
| Git repo pushed to GitHub (or GitLab) | You |
| Netlify account | You |
| Cloudflare account (optional, recommended before Stage 1) | You |

---

## Option A - Fastest: Netlify subdomain first

Use this while DNS propagates.

1. Deploy site to Netlify (see Step 2 below).
2. Netlify gives you `random-name.netlify.app`.
3. Send that URL to the client immediately.
4. Add custom domain when DNS is ready.

---

## Option B - Custom domain on Netlify (no Cloudflare yet)

Good for demo week. You can add Cloudflare before Stage 0 production.

### 1. Buy the domain

Common registrars for `.mx`: GoDaddy Mexico, Namecheap, Google Domains successor, local registrar.

Write down:
- Registrar login
- Domain name (apex): `example.mx`
- Whether you want `www.example.mx` too

### 2. Create Netlify site

1. Log in to [Netlify](https://app.netlify.com).
2. **Add new site** -> **Import an existing project** -> connect GitHub.
3. Select this repository (`RS`).
4. Build settings:

| Setting | Value |
|---------|-------|
| Branch to deploy | `master` or `main` |
| Build command | *(leave empty)* |
| Publish directory | `demo` |
| Base directory | *(leave empty)* |

5. Click **Deploy site**.

The root `netlify.toml` in this repo already sets `publish = "demo"`.

### 3. Add custom domain in Netlify

1. Site -> **Domain management** -> **Add a domain**.
2. Enter `example.mx` and `www.example.mx`.
3. Netlify shows DNS records you must add at your registrar.

Typical records (Netlify will show exact values):

| Type | Name | Value |
|------|------|-------|
| A | `@` | Netlify load balancer IP (e.g. `75.2.60.5`) |
| CNAME | `www` | `your-site-name.netlify.app` |

Some `.mx` registrars prefer CNAME flattening on apex; follow Netlify's registrar-specific doc if A record is not accepted.

### 4. Configure at registrar

1. Open DNS panel at domain registrar.
2. Add records Netlify listed.
3. Save. Propagation can take 15 minutes to 48 hours.

### 5. Enable HTTPS on Netlify

Netlify provisions Let's Encrypt automatically once DNS resolves. Check **Domain management** -> **HTTPS** -> certificate issued.

### 6. Set primary domain

Choose apex `example.mx` or `www` as primary; Netlify redirects the other.

---

## Option C - Cloudflare in front (recommended before Stage 1)

Use for demo if you already own the domain and want one DNS home for later production.

1. Add site in Cloudflare (free plan).
2. Change nameservers at registrar to Cloudflare NS.
3. In Cloudflare DNS:

| Type | Name | Content | Proxy |
|------|------|---------|-------|
| CNAME | `@` | `your-site.netlify.app` | Proxied (orange) |
| CNAME | `www` | `your-site.netlify.app` | Proxied |

4. In Netlify: add same custom domain; SSL mode with Cloudflare is **Full (strict)**.
5. SSL/TLS in Cloudflare: **Full (strict)**.

For **demo only**, Option B is fewer steps.

---

## Deploy updates

Every `git push` to the production branch redeploys the demo.

```bash
git add demo/
git commit -m "Update demo storefront"
git push
```

Netlify build log should show "0 build steps" and publish `demo/`.

---

## Verify before sending to client

| Check | How |
|-------|-----|
| Home loads | Open `/` |
| Mobile layout | Chrome dev tools or real phone |
| Quote form | Submit shows success message |
| Admin mock | `/admin/` loads |
| HTTPS | Padlock in browser |
| Demo banner visible | Top of every page |

---

## When Stage 0 replaces demo

Since [ADR-014](../architecture/decisions/ADR-014-monorepo-two-apps.md), Stage 0 is **two Next.js apps**, not one - the storefront (`apps/web`) and the staff CRM (`apps/admin`) deploy separately. Full checklist: [monorepo-netlify-setup.md](./monorepo-netlify-setup.md).

Summary for this site (becomes `apps/web`):

1. In this Netlify project's **Build & deploy** settings, set **Base directory** to `apps/web`.
2. `apps/web/netlify.toml` (already in the repo) sets the build command and publish directory - no manual `netlify.toml` edit needed here.
3. Add env vars (`DATABASE_URL`, `AUTH_SECRET`, etc.) in Netlify UI - see the full table in [monorepo-netlify-setup.md](./monorepo-netlify-setup.md).
4. Same domain (`rosalessport.com`) stays; content switches from static HTML to the live app.
5. The staff CRM (`apps/admin`) is a **separate, new** Netlify site on `admin.rosalessport.com` - it is not part of this site's cutover.

Keep `demo/` folder in repo for reference or retire to `demo/archive/`.

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| 404 on inner pages | Ensure `demo/collections/jerseys.html` exists; static paths need `.html` or `_redirects` |
| DNS not resolving | Wait; check registrar records match Netlify exactly |
| SSL pending | DNS must point to Netlify first |
| Old site showing | Clear browser cache; check wrong branch deployed |

### Pretty URLs (optional)

Add `demo/_redirects` for Netlify:

```
/collections/jerseys  /collections/jerseys.html  200
/quote                /quote/index.html          200
/admin                /admin/index.html          200
```

---

## Checklist for you (today)

- [ ] Purchase domain
- [ ] Push repo to GitHub if not already
- [ ] Create Netlify site, publish `demo/`
- [ ] Share `*.netlify.app` link to client
- [ ] Add DNS records at registrar
- [ ] Confirm HTTPS on custom domain
- [ ] Send client walkthrough (see [stage-demo-static.md](../architecture/stage-demo-static.md))

---

## Related

- [monorepo-netlify-setup.md](./monorepo-netlify-setup.md) - two-site setup for `apps/web` + `apps/admin` (Stage 0+)
- [netlify-cloudflare-guide.md](./netlify-cloudflare-guide.md) - Cloudflare/WAF layer on top of either site
- [infrastructure-cost-tiers.md](./infrastructure-cost-tiers.md)
- [03-staged-delivery-roadmap.md](../architecture/03-staged-delivery-roadmap.md)
- [../architecture/decisions/ADR-014-monorepo-two-apps.md](../architecture/decisions/ADR-014-monorepo-two-apps.md)
