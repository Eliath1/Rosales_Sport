#!/usr/bin/env node
/**
 * Package demo/ for Netlify drag-and-drop deploy.
 * Uses tar (forward-slash paths). PowerShell Compress-Archive breaks on Netlify
 * because it stores css\styles.css as a literal filename on Linux.
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const DEMO = path.join(ROOT, "demo");
const ZIP = path.join(ROOT, "rs-demo-netlify.zip");

const required = [
  "index.html",
  "css/styles.css",
  "js/demo.js",
  "js/messages.js",
  "js/i18n.js",
  "assets/rs-logo.png",
  "custom/uniform.html",
  "_redirects",
];

for (const rel of required) {
  const full = path.join(DEMO, rel);
  if (!fs.existsSync(full)) {
    console.error("Missing:", full);
    process.exit(1);
  }
}

if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);

// tar -a creates zip with POSIX paths (css/styles.css not css\styles.css)
execSync(`tar -a -c -f "${ZIP}" -C "${DEMO}" .`, { stdio: "inherit" });

const listing = execSync(`tar -tf "${ZIP}"`, { encoding: "utf8" });
const bad = listing.split(/\r?\n/).filter((line) => line.includes("\\"));
if (bad.length) {
  console.error("Zip still has backslash paths:", bad.slice(0, 5));
  process.exit(1);
}

const size = fs.statSync(ZIP).size;
console.log("");
console.log("Netlify upload package ready (POSIX paths):");
console.log(" ", ZIP);
console.log(" ", (size / 1024).toFixed(1), "KB");
console.log("");
console.log("In Netlify: Site -> Deploys -> drag rs-demo-netlify.zip");
console.log("Verify after publish:");
console.log("  https://rosalessport.com/css/styles.css");
console.log("  https://rosalessport.com/assets/rs-logo.png");
