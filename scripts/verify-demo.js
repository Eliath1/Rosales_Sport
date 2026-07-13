#!/usr/bin/env node
/** Verify demo pages exist and product-card HTML structure is intact. */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..", "demo");
const REPO = path.join(__dirname, "..");

const required = [
  "index.html",
  "404.html",
  "css/styles.css",
  "js/demo.js",
  "js/messages.js",
  "js/i18n.js",
  "assets/rs-logo.png",
  "assets/rs-logo-hero.png",
  "collections/jerseys.html",
  "products/jersey-diablos-borgona.html",
  "products/jersey-mexico-estrellas.html",
  "products/jersey-sultanes-navy.html",
  "products/jersey-mexico-emblem.html",
  "products/jersey-rs-blank-blanco.html",
  "products/jersey-rs-borgona-negro.html",
  "products/jersey-rs-estrellas-rojo.html",
  "products/jersey-rs-navy-pinstripe.html",
  "products/jersey-rs-royal-azul.html",
  "products/jersey-rs-verde-militar.html",
  "products/jersey-rs-negro-solido.html",
  "products/jersey-rs-navy-blanco.html",
  "products/jersey-rs-naranja-negro.html",
  "products/jersey-rs-celeste-blanco.html",
  "products/pants-rs-blanco.html",
  "products/pants-rs-negro.html",
  "products/pants-rs-navy-franja.html",
  "products/pants-rs-gris-rayas.html",
  "products/pants-rs-royal-franja.html",
  "products/pants-rs-verde-militar.html",
  "products/pants-rs-borgona.html",
  "products/pants-rs-rojo-franja.html",
  "products/pants-rs-naranja-franja.html",
  "products/pants-rs-navy-pinstripe.html",
  "quote/index.html",
  "quote/bulk.html",
  "custom/uniform.html",
  "custom/uniform/builder.html",
  "css/configurator.css",
  "js/configurator.js",
  "js/variant-bank.js",
  "js/preview-compositor.js",
  "assets/templates/jersey-classic.svg",
  "assets/templates/jersey-classic-back.svg",
  "assets/templates/pants-classic.svg",
  "assets/mockups/classic-button/front-base.png",
  "assets/mockups/classic-button/back-base.png",
  "assets/mockups/classic-button/front-mask-body.png",
  "assets/mockups/classic-button/placement.json",
  "assets/mockups/pants-classic/front-base.png",
  "assets/mockups/pants-classic/front-mask-pants.png",
  "assets/mockups/pants-classic/placement.json",
  "assets/variant-bank/classic-button/manifest.json",
  "assets/variant-bank/classic-button/front/wht_wht_wht.png",
  "assets/variant-bank/classic-button/back/wht_wht_wht.png",
  "assets/variant-bank/pants-classic/manifest.json",
  "assets/variant-bank/pants-classic/front/wht_wht.png",
  "assets/variant-bank/pants-classic/back/wht_wht.png",
  "assets/mockups/classic-button/source/vecteezy-48973378-preview.jpg",
  "assets/mockups/classic-button/source/vecteezy-48973378-preview.png",
  "assets/mockups/classic-button/source/vecteezy-48973378-mockup.eps",
  "admin/designs.html",
  "admin/designs/detail.html",
  "admin/index.html",
  "admin/quotes.html",
  "admin/quotes/detail.html",
  "admin/orders.html",
  "admin/orders/detail.html",
  "admin/customers.html",
  "js/mock-crm-data.js",
  "js/admin-dashboard.js",
];

let errors = [];

for (const rel of required) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) errors.push(`Missing file: ${rel}`);
}

function validateProductGrids(fileRel) {
  const html = fs.readFileSync(path.join(ROOT, fileRel), "utf8");
  const cardBlocks = html.match(/<article class="product-card"[\s\S]*?<\/article>/g) || [];

  if (!cardBlocks.length) return;

  cardBlocks.forEach((block, index) => {
    const label = `${fileRel} card #${index + 1}`;

    if (!block.includes('class="product-image"')) {
      errors.push(`${label}: missing .product-image`);
    }
    if (!block.includes('class="product-info"')) {
      errors.push(`${label}: missing .product-info wrapper`);
    }
    if (!/<h3[\s>]/.test(block)) {
      errors.push(`${label}: missing <h3> title`);
    }
    if (!block.includes('class="product-price"')) {
      errors.push(`${label}: missing .product-price`);
    }
    if (/<div class="product-image">[\s\S]*?<img\s/i.test(block)) {
      errors.push(`${label}: use .placeholder-jersey.has-photo, not <img> in .product-image`);
    }
  });
}

["index.html", "collections/jerseys.html"].forEach(validateProductGrids);

const imagesDir = path.join(ROOT, "images");
const requiredJerseys = [
  "jersey1.webp",
  "jersey2.jpg",
  "jersey3.webp",
  "jersey4.jpg",
  "jersey5.jpg",
  "jersey6.jpg",
  "catalog-jersey-blank-front.png",
  "catalog-jersey-blank-back.png",
  "catalog-jersey-borgona-front.png",
  "catalog-jersey-borgona-back.png",
  "catalog-jersey-estrellas-front.png",
  "catalog-jersey-estrellas-back.png",
  "catalog-jersey-navy-pinstripe-front.png",
  "catalog-jersey-royal-azul-front.png",
  "catalog-jersey-verde-militar-front.png",
  "catalog-pants-blanco-front.png",
  "catalog-pants-negro-front.png",
  "catalog-pants-navy-franja-front.png",
  "catalog-pants-gris-rayas-front.png",
  "catalog-pants-royal-franja-front.png",
  "catalog-pants-verde-militar-front.png",
  "catalog-pants-borgona-front.png",
  "catalog-pants-rojo-franja-front.png",
  "catalog-pants-naranja-franja-front.png",
  "catalog-pants-navy-pinstripe-front.png",
  "catalog-jersey-negro-solido-front.png",
  "catalog-jersey-navy-blanco-front.png",
  "catalog-jersey-naranja-negro-front.png",
  "catalog-jersey-celeste-blanco-front.png",
];

if (!fs.existsSync(imagesDir)) {
  errors.push("Missing directory: demo/images/ (copy from repo images/ before deploy)");
} else {
  for (const name of requiredJerseys) {
    if (!fs.existsSync(path.join(imagesDir, name))) {
      errors.push(`Missing jersey photo: demo/images/${name}`);
    }
  }
}

const jsFiles = [
  "js/configurator.js",
  "js/preview-compositor.js",
  "js/mock-crm-data.js",
  "js/admin-dashboard.js",
];

jsFiles.forEach((rel) => {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    errors.push(`Missing JS: ${rel}`);
    return;
  }
  try {
    execSync(`node --check "${full}"`, { stdio: "pipe" });
  } catch (e) {
    errors.push(`Syntax error in ${rel}`);
  }
});

const configuratorSrc = fs.readFileSync(path.join(ROOT, "js/configurator.js"), "utf8");
const previewSrc = fs.readFileSync(path.join(ROOT, "js/preview-compositor.js"), "utf8");
const builderHtml = fs.readFileSync(path.join(ROOT, "custom/uniform/builder.html"), "utf8");

const configuratorChecks = [
  ["function updatePreviewModeNote()", "configurator: updatePreviewModeNote missing"],
  ["function renderProductTypes()", "configurator: renderProductTypes missing"],
  ["function schedulePreviewRender()", "configurator: schedulePreviewRender missing"],
  ["document.addEventListener(\"DOMContentLoaded\", init)", "configurator: init hook missing"],
];

configuratorChecks.forEach(([needle, msg]) => {
  if (!configuratorSrc.includes(needle)) errors.push(msg);
});

if ((configuratorSrc.match(/function updatePreviewModeNote/g) || []).length !== 1) {
  errors.push("configurator: updatePreviewModeNote should be defined once");
}

const openBraces = (configuratorSrc.match(/\{/g) || []).length;
const closeBraces = (configuratorSrc.match(/\}/g) || []).length;
if (openBraces !== closeBraces) {
  errors.push(`configurator: brace mismatch ({ ${openBraces} vs } ${closeBraces})`);
}

const previewChecks = [
  ["window.RSPreview", "preview-compositor: RSPreview export missing"],
  ["window.RSVariantBank", "variant-bank: RSVariantBank export missing"],
  ["renderVariantBank", "preview-compositor: variant bank renderer missing"],
  ["renderPhotoApprox", "preview-compositor: photo fallback missing"],
  ["renderLayered", "preview-compositor: layered renderer missing"],
  ["getPackStatus", "preview-compositor: getPackStatus missing"],
];

previewChecks.forEach(([needle, msg]) => {
  if (!previewSrc.includes(needle)) errors.push(msg);
});

const builderChecks = [
  ["id=\"product-type-grid\"", "builder.html: product-type-grid missing"],
  ["id=\"color-compact\"", "builder.html: color-compact panel missing"],
  ["id=\"template-grid\"", "builder.html: template-grid missing"],
  ["id=\"preview-canvas\"", "builder.html: preview-canvas missing"],
  ["preview-compositor.js", "builder.html: preview-compositor script missing"],
  ["variant-bank.js", "builder.html: variant-bank script missing"],
  ["configurator.js", "builder.html: configurator script missing"],
];

builderChecks.forEach(([needle, msg]) => {
  if (!builderHtml.includes(needle)) errors.push(msg);
});

const mockupDir = path.join(ROOT, "assets/mockups/classic-button");
const mockupRequired = [
  "front-base.png",
  "back-base.png",
  "front-mask-body.png",
  "front-mask-sleeve.png",
  "front-mask-collar.png",
  "back-mask-body.png",
  "back-mask-sleeve.png",
  "front-shadow.png",
  "back-shadow.png",
  "placement.json",
];

mockupRequired.forEach((name) => {
  if (!fs.existsSync(path.join(mockupDir, name))) {
    errors.push(`Missing mockup asset: assets/mockups/classic-button/${name}`);
  }
});

if (errors.length) {
  console.error("Demo check FAILED:");
  errors.forEach((e) => console.error("  -", e));
  process.exit(1);
}

console.log("Demo check OK:", required.length, "files present; product grids validated.");
