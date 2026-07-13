#!/usr/bin/env node
/** Sync catalog photos from catalog-spec.json and generate PDP HTML. */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const SPEC = path.join(REPO, "images", "catalog-spec.json");
const DEMO_IMAGES = path.join(REPO, "demo", "images");
const OUT = path.join(REPO, "demo", "products");

function html(p) {
  var image = "/images/" + p.dest;
  var quoteName = encodeURIComponent(p.title);
  var builderHref = p.team === "rs-pants"
    ? "/custom/uniform/builder.html?template=pants-classic"
    : "/custom/uniform/builder.html";
  var crumb = p.title.replace(/^Jersey RS /, "").replace(/^Pantalon RS /, "");
  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${p.title} - RS</title>
  <link rel="icon" href="/assets/rs-logo.png" type="image/png">
  <link rel="stylesheet" href="/css/styles.css">
</head>
<body>
  <div class="demo-banner" data-i18n="banner.demo">Vista previa para cliente</div>
  <div class="promo-bar" data-i18n="promo.bar">Cotiza mayoreo y equipos</div>
  <header class="site-header">
    <div class="header-inner">
      <div class="header-left"><button class="menu-toggle" type="button" aria-label="Menu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg></button></div>
      <a href="/" class="logo"><img src="/assets/rs-logo.png" alt="Rosales Sport"></a>
      <div class="header-icons"><div class="lang-switcher" role="group" aria-label="Language"><button type="button" class="lang-btn active" data-lang="es">ES</button><button type="button" class="lang-btn" data-lang="en">EN</button></div></div>
    </div>
    <nav class="header-nav container"><a href="/collections/jerseys.html">Jerseys</a><a href="/custom/uniform/builder.html" data-i18n="nav.custom">Personalizar</a></nav>
  </header>
  <main class="container">
    <nav class="breadcrumb"><a href="/" data-i18n="breadcrumb.home">Inicio</a> / <a href="/collections/jerseys.html" data-i18n="collection.title">Jerseys</a> / ${crumb}</nav>
    <div class="pdp-layout">
      <div><div class="pdp-gallery-main"><div class="placeholder-jersey has-photo" style="width:75%;height:85%;background-image:url('${image}')" data-i18n="pdp.view.front">Vista frontal</div></div></div>
      <div class="pdp-details">
        <h1>${p.title}</h1>
        <p class="pdp-sku">SKU: ${p.sku}</p>
        <div class="pdp-price-block">
          <p class="pdp-price-label" data-i18n="pdp.price.standard">Estandar (sin personalizar)</p>
          <p class="pdp-price">$ 450.00 MXN</p>
          <p class="pdp-price-label" data-i18n="pdp.price.custom">Personalizado</p>
          <p class="pdp-price-secondary">$ 650.00 MXN</p>
        </div>
        <label class="size-label" data-i18n="pdp.size">Talla</label>
        <div class="size-options"><button type="button" class="size-btn">S</button><button type="button" class="size-btn">M</button><button type="button" class="size-btn">L</button><button type="button" class="size-btn">XL</button></div>
        <div class="pdp-actions">
          <a href="${builderHref}" class="btn btn-primary" data-i18n="pdp.cta.customize">Personalizar en linea</a>
          <a href="/quote/?sku=${p.sku}&name=${quoteName}" class="btn btn-outline" data-i18n="pdp.cta.quote">Solicitar cotizacion</a>
        </div>
      </div>
    </div>
  </main>
  <div class="pdp-sticky-bar"><span class="pdp-price">$ 450.00 MXN</span><a href="${builderHref}" class="btn btn-primary" style="flex:2;" data-i18n="pdp.cta.customize">Personalizar</a></div>
  <footer class="site-footer"><p class="footer-copy">RS Beisbol Mexico</p></footer>
  <script src="/js/messages.js"></script><script src="/js/i18n.js"></script><script src="/js/demo.js"></script>
</body>
</html>`;
}

async function syncPhoto(p) {
  var src = path.join(REPO, p.source);
  if (!fs.existsSync(src)) {
    var alt = path.join(DEMO_IMAGES, p.dest);
    if (fs.existsSync(alt)) src = alt;
    else throw new Error("Missing " + p.source);
  }
  var dest = path.join(DEMO_IMAGES, p.dest);
  fs.mkdirSync(DEMO_IMAGES, { recursive: true });
  await sharp(src).rotate().resize({ width: 900, withoutEnlargement: true }).png().toFile(dest);
  console.log("[sync]", p.dest);
}

async function redirectStub(p) {
  var target = "/products/" + p.consolidatedInto + ".html?color=" + p.slug.replace(/^jersey-rs-/, "");
  return `<!DOCTYPE html>
<html lang="es-MX">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta http-equiv="refresh" content="0; url=${target}">
  <link rel="canonical" href="${target}">
  <title>${p.title} - RS</title>
  <link rel="icon" href="/assets/rs-logo.png" type="image/png">
  <link rel="stylesheet" href="/css/styles.css">
  <script>window.location.replace("${target}");</script>
</head>
<body>
  <div class="demo-banner" data-i18n="banner.demo">Vista previa para cliente</div>
  <main class="container" style="padding:3rem 1.25rem;text-align:center;">
    <p data-i18n="pdp.redirect.notice">Este color ahora se elige desde el modelo Manga Normal. Redirigiendo...</p>
    <p><a href="${target}" class="btn btn-primary" data-i18n="product.manga_normal.title">Jersey RS Manga Normal</a></p>
  </main>
  <script src="/js/messages.js"></script>
  <script src="/js/i18n.js"></script>
</body>
</html>
`;
}

async function main() {
  var spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));
  fs.mkdirSync(OUT, { recursive: true });

  for (var i = 0; i < spec.products.length; i++) {
    var p = spec.products[i];
    if (p.type === "photo") await syncPhoto(p);
    var file = p.slug + ".html";
    if (p.consolidatedInto) {
      // Consolidated into a single base-model PDP with a color swatch strip
      // (see docs/specs/variant-bank-spec.md) - keep old bookmarked/shared
      // links alive as a redirect instead of regenerating a standalone PDP.
      fs.writeFileSync(path.join(OUT, file), await redirectStub(p));
      console.log("[redirect]", file, "->", p.consolidatedInto);
    } else {
      fs.writeFileSync(path.join(OUT, file), html(p));
      console.log("[pdp]", file);
    }
  }

  var standalone = spec.products.filter(function (p) { return !p.consolidatedInto; });
  var grid = standalone.map(function (p) {
    var team = p.team || "rs";
    var label = team === "rs-pants" ? "Pantalon" : "Jersey";
    return `          <article class="product-card" data-team="${team}" data-liga="rs-custom" data-price="450">
            <a href="/products/${p.slug}.html">
              <span class="product-badge" data-i18n="badge.custom">Personalizable</span>
              <div class="product-image"><div class="placeholder-jersey has-photo" style="background-image:url('/images/${p.dest}')">${label}</div></div>
              <div class="product-info">
                <h3>${p.title}</h3>
                <p class="product-price" data-i18n="product.price.from">Desde $ 450.00</p>
                <p class="product-price-note" data-i18n="product.price.custom_note">Personalizado $ 650.00</p>
              </div>
            </a>
          </article>`;
  }).join("\n");

  fs.writeFileSync(path.join(REPO, "demo", "collections", "_rs-catalog-grid.html"), grid);
  console.log("\nWrote demo/collections/_rs-catalog-grid.html (" + standalone.length + " standalone cards; " +
    (spec.products.length - standalone.length) + " consolidated - add their base-model card to jerseys.html by hand)");
}

main().catch(function (e) {
  console.error(e.message || e);
  process.exit(1);
});
