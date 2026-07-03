# Stage D - Static Demo

Client-facing preview for **RS** brand. No backend.

Brand: [docs/domain/rs-client-brand.md](../docs/domain/rs-client-brand.md)

## Bilingual (Stage D)

| Locale | Default | URL |
|--------|---------|-----|
| es-MX | Yes (Mexico) | `/?lang=es` or no param |
| en | US market preview | `/?lang=en` |

Files: `demo/js/messages.js`, `demo/js/i18n.js`. Production will use `next-intl` in Stage 0 app.

## Local preview

```bash
npm run demo
```

Open http://localhost:3456

Or: `npx serve demo`

## Pages

| URL | Screen |
|-----|--------|
| `/` | Home |
| `/collections/jerseys.html` | Collection + filters |
| `/products/jersey-padres-local.html` | Product detail |
| `/quote/` | Quote form |
| `/quote/bulk.html` | Bulk / equipo form |
| `/custom/uniform.html` | Custom uniforms (qty, sizes, names, decoration) |
| `/admin/` | CRM dashboard mock |

## Deploy (drag and drop, no Git yet)

1. Use the zip at project root: **`rs-demo-netlify.zip`**
2. On [Netlify Start](https://app.netlify.com/start), scroll to **Upload your project files**
3. Drag **`rs-demo-netlify.zip`** onto the drop zone (or choose the **`demo`** folder)
4. Netlify publishes in seconds and gives you a `*.netlify.app` URL

The zip contains `index.html` at the root plus `_redirects` for clean URLs (`/quote`, `/custom/uniform`, etc.).

Regenerate with POSIX paths (required for Netlify on Linux):

```bash
npm run demo:package
```

Do **not** use Windows `Compress-Archive` or right-click zip. Backslash paths (`css\styles.css`) deploy as broken filenames and CSS returns 404.

## Deploy (Git, later)

See [docs/hosting/demo-dns-netlify-setup.md](../docs/hosting/demo-dns-netlify-setup.md).

Netlify publish directory: `demo` (configured in root `netlify.toml`).

## Spec

[docs/architecture/stage-demo-static.md](../docs/architecture/stage-demo-static.md)
