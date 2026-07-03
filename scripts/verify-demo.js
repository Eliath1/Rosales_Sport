#!/usr/bin/env node
/** Verify all demo pages exist before deploy. */

const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..", "demo");

const required = [
  "index.html",
  "404.html",
  "css/styles.css",
  "js/demo.js",
  "js/messages.js",
  "js/i18n.js",
  "assets/rs-logo.png",
  "collections/jerseys.html",
  "products/jersey-diablos-borgona.html",
  "products/jersey-mexico-estrellas.html",
  "products/jersey-sultanes-navy.html",
  "products/jersey-mexico-emblem.html",
  "quote/index.html",
  "quote/bulk.html",
  "custom/uniform.html",
  "admin/index.html",
  "admin/quotes.html",
  "admin/quotes/detail.html",
];

let missing = [];
for (const rel of required) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) missing.push(rel);
}

if (missing.length) {
  console.error("Missing demo files:");
  missing.forEach((m) => console.error("  -", m));
  process.exit(1);
}

console.log("Demo check OK:", required.length, "files present.");
