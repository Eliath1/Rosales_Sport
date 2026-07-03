---
name: multimedia-asset-management
description: >-
  Manages product images, customization artwork, and media storage with CDN
  delivery via Cloudflare. Use when handling uploads, asset URLs, or image
  optimization for catalog and custom requests.
---

# Multimedia Asset Management

## Instructions

1. Store blobs in object storage; serve via Cloudflare CDN with cache headers.
2. Separate buckets or prefixes: `catalog/`, `custom-requests/`, `marketing/`.
3. Validate MIME type and size server-side; generate thumbnails for catalog images.
4. Custom request uploads may contain team logos - treat as confidential; restrict access by role.
5. Reference assets in Prisma by stable key/URL, not embedded binary.

## Key Workflows

### Upload pipeline

```
- [ ] Client requests signed upload URL (or direct POST to API)
- [ ] API validates and stores metadata in Asset table
- [ ] Cloudflare cache purge on replace
- [ ] Link Asset to ProductVariant or CustomRequest
```

### Image optimization

- WebP/AVIF variants where Next.js Image supports
- Alt text via i18n for catalog images
- Placeholder blur for LCP improvement

## Reference Docs

- [docs/architecture/01-module-map.md](../../../docs/architecture/01-module-map.md)
- [docs/hosting/netlify-cloudflare-guide.md](../../../docs/hosting/netlify-cloudflare-guide.md)
- [docs/domain/reference-site-newera-mx.md](../../../docs/domain/reference-site-newera-mx.md)
- [docs/architecture/wave-zero-quote-crm.md](../../../docs/architecture/wave-zero-quote-crm.md)
