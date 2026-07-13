#!/usr/bin/env node
/** Generate RS custom catalog PDP HTML from template. */
const fs = require("fs");
const path = require("path");

const OUT = path.join(__dirname, "..", "demo", "products");

var PRODUCTS = [
  { file: "jersey-rs-navy-pinstripe.html", sku: "RS-JER-CUS-NAV-PIN", title: "Jersey RS Navy Pinstripe", image: "/images/catalog-jersey-navy-pinstripe-front.png", crumb: "RS Navy Pinstripe", descKey: "pdp.custom.navy.desc", bodyKey: "pdp.custom.navy.body" },
  { file: "jersey-rs-royal-azul.html", sku: "RS-JER-CUS-ROY-AZU", title: "Jersey RS Royal Blanco y Azul", image: "/images/catalog-jersey-royal-azul-front.png", crumb: "RS Royal Azul", descKey: "pdp.custom.royal.desc", bodyKey: "pdp.custom.royal.body" },
  { file: "jersey-rs-verde-militar.html", sku: "RS-JER-CUS-VER-MIL", title: "Jersey RS Verde Militar y Negro", image: "/images/catalog-jersey-verde-militar-front.png", crumb: "RS Verde Militar", descKey: "pdp.custom.verde.desc", bodyKey: "pdp.custom.verde.body" },
  { file: "pants-rs-blanco.html", sku: "RS-PAN-CUS-BLANCO", title: "Pantalon RS Classic Blanco", image: "/images/catalog-pants-blanco-front.png", crumb: "Pants RS Blanco", descKey: "pdp.custom.pants_blanco.desc", bodyKey: "pdp.custom.pants_blanco.body", builder: true },
  { file: "pants-rs-negro.html", sku: "RS-PAN-CUS-NEGRO", title: "Pantalon RS Classic Negro", image: "/images/catalog-pants-negro-front.png", crumb: "Pants RS Negro", descKey: "pdp.custom.pants_negro.desc", bodyKey: "pdp.custom.pants_negro.body", builder: true },
  { file: "pants-rs-navy-franja.html", sku: "RS-PAN-CUS-NAV-FRA", title: "Pantalon RS Navy con Franja Roja", image: "/images/catalog-pants-navy-franja-front.png", crumb: "Pants RS Navy Franja", descKey: "pdp.custom.pants_navy.desc", bodyKey: "pdp.custom.pants_navy.body", builder: true },
  { file: "pants-rs-gris-rayas.html", sku: "RS-PAN-CUS-GRIS-RAY", title: "Pantalon RS Gris con Rayas", image: "/images/catalog-pants-gris-rayas-front.png", crumb: "Pants RS Gris Rayas", descKey: "pdp.custom.pants_gris.desc", bodyKey: "pdp.custom.pants_gris.body", builder: true },
];

function html(p) {
  var quoteName = encodeURIComponent(p.title);
  var builderHref = p.builder ? "/custom/uniform/builder.html?template=pants-classic" : "/custom/uniform/builder.html";
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
      <div class="header-icons">
        <div class="lang-switcher" role="group" aria-label="Language"><button type="button" class="lang-btn active" data-lang="es">ES</button><button type="button" class="lang-btn" data-lang="en">EN</button></div>
      </div>
    </div>
    <nav class="header-nav container"><a href="/collections/jerseys.html">Jerseys</a><a href="/custom/uniform/builder.html" data-i18n="nav.custom">Personalizar</a></nav>
  </header>
  <main class="container">
    <nav class="breadcrumb"><a href="/" data-i18n="breadcrumb.home">Inicio</a> / <a href="/collections/jerseys.html" data-i18n="collection.title">Jerseys</a> / ${p.crumb}</nav>
    <div class="pdp-layout">
      <div>
        <div class="pdp-gallery-main"><div class="placeholder-jersey has-photo" style="width:75%;height:85%;background-image:url('${p.image}')" data-i18n="pdp.view.front">Vista frontal</div></div>
      </div>
      <div class="pdp-details">
        <h1>${p.title}</h1>
        <p class="pdp-sku">SKU: ${p.sku}</p>
        <div class="pdp-price-block">
          <p class="pdp-price-label" data-i18n="pdp.price.standard">Estandar (sin personalizar)</p>
          <p class="pdp-price">$ 450.00 MXN</p>
          <p class="pdp-price-label" data-i18n="pdp.price.custom">Personalizado</p>
          <p class="pdp-price-secondary">$ 650.00 MXN</p>
        </div>
        <p data-i18n="${p.descKey}">Producto RS personalizable.</p>
        <label class="size-label" data-i18n="pdp.size">Talla</label>
        <div class="size-options"><button type="button" class="size-btn">S</button><button type="button" class="size-btn">M</button><button type="button" class="size-btn">L</button><button type="button" class="size-btn">XL</button></div>
        <div class="pdp-actions">
          <a href="${builderHref}" class="btn btn-primary" data-i18n="pdp.cta.customize">Personalizar en linea</a>
          <a href="/quote/?sku=${p.sku}&name=${quoteName}" class="btn btn-outline" data-i18n="pdp.cta.quote">Solicitar cotizacion</a>
        </div>
        <div class="pdp-section"><h2 data-i18n="pdp.desc.title">Descripcion</h2><p data-i18n="${p.bodyKey}">Producto RS para equipos y ligas.</p></div>
      </div>
    </div>
  </main>
  <div class="pdp-sticky-bar"><span class="pdp-price">$ 450.00 MXN</span><a href="${builderHref}" class="btn btn-primary" style="flex:2;" data-i18n="pdp.cta.customize">Personalizar</a></div>
  <footer class="site-footer"><p class="footer-copy">RS Beisbol Mexico</p></footer>
  <script src="/js/messages.js"></script><script src="/js/i18n.js"></script><script src="/js/demo.js"></script>
</body>
</html>
`;
}

PRODUCTS.forEach(function (p) {
  fs.writeFileSync(path.join(OUT, p.file), html(p));
  console.log("Wrote", p.file);
});
