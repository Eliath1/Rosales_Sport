#!/usr/bin/env node
/** Add i18n scripts and lang switcher to demo HTML files. */

const fs = require("fs");
const path = require("path");

const DEMO = path.join(__dirname, "..", "demo");
const LANG = `        <div class="lang-switcher" role="group" aria-label="Language">
          <button type="button" class="lang-btn active" data-lang="es">ES</button>
          <button type="button" class="lang-btn" data-lang="en">EN</button>
        </div>
`;
const SCRIPTS = `<script src="/js/messages.js"></script>
  <script src="/js/i18n.js"></script>
  <script src="/js/demo.js"></script>`;

function walk(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    if (fs.statSync(p).isDirectory()) walk(p, out);
    else if (name.endsWith(".html")) out.push(p);
  }
  return out;
}

for (const file of walk(DEMO)) {
  let html = fs.readFileSync(file, "utf8");
  let changed = false;

  if (!html.includes("messages.js")) {
    html = html.replace(
      /<script src="\/js\/demo\.js"><\/script>/,
      SCRIPTS
    );
    changed = true;
  }

  if (html.includes("header-icons") && !html.includes("lang-switcher")) {
    html = html.replace(
      /(<div class="header-icons">\s*\n)/,
      `$1${LANG}`
    );
    changed = true;
  }

  if (changed) fs.writeFileSync(file, html, "utf8");
}

console.log("Patched HTML files for i18n.");
