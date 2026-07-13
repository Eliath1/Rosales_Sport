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
const SRC_IMAGES = path.join(ROOT, "images");
const DEMO_IMAGES = path.join(DEMO, "images");
const ZIP = path.join(ROOT, "rs-demo-netlify.zip");

const REQUIRED_JERSEYS = [
  "jersey1.webp",
  "jersey2.jpg",
  "jersey3.webp",
  "jersey4.jpg",
  "jersey5.jpg",
  "jersey6.jpg",
];

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

function syncImagesFromRoot() {
  if (!fs.existsSync(SRC_IMAGES)) {
    console.warn("Warning: repo images/ not found; using demo/images/ only.");
    return;
  }

  fs.mkdirSync(DEMO_IMAGES, { recursive: true });
  let copied = 0;

  for (const name of fs.readdirSync(SRC_IMAGES)) {
    const src = path.join(SRC_IMAGES, name);
    if (!fs.statSync(src).isFile()) continue;
    fs.copyFileSync(src, path.join(DEMO_IMAGES, name));
    copied += 1;
  }

  if (copied) {
    console.log(`Synced ${copied} file(s) from images/ -> demo/images/`);
  }
}

function validateJerseyImages() {
  const errors = [];

  if (!fs.existsSync(DEMO_IMAGES)) {
    errors.push("Missing demo/images/ (copy from repo images/ before deploy)");
    return errors;
  }

  for (const name of REQUIRED_JERSEYS) {
    const full = path.join(DEMO_IMAGES, name);
    if (!fs.existsSync(full)) {
      errors.push(`Missing jersey photo: demo/images/${name}`);
    }
  }

  return errors;
}

syncImagesFromRoot();

for (const rel of required) {
  const full = path.join(DEMO, rel);
  if (!fs.existsSync(full)) {
    console.error("Missing:", full);
    process.exit(1);
  }
}

const imageErrors = validateJerseyImages();
if (imageErrors.length) {
  console.error("Cannot package demo without jersey images:");
  imageErrors.forEach((e) => console.error("  -", e));
  console.error("");
  console.error("Fix: copy photos into demo/images/ or place them in repo images/ and re-run.");
  process.exit(1);
}

if (fs.existsSync(ZIP)) fs.unlinkSync(ZIP);

// tar -a creates zip with POSIX paths (css/styles.css not css\styles.css)
execSync(`tar -a -c -f "${ZIP}" -C "${DEMO}" .`, { stdio: "inherit" });

const listing = execSync(`tar -tf "${ZIP}"`, { encoding: "utf8" });
const lines = listing.split(/\r?\n/).filter(Boolean);

const bad = lines.filter((line) => line.includes("\\"));
if (bad.length) {
  console.error("Zip still has backslash paths:", bad.slice(0, 5));
  process.exit(1);
}

const zipImages = lines.filter((line) => line.startsWith("./images/") && !line.endsWith("/"));
const missingInZip = REQUIRED_JERSEYS.filter(
  (name) => !zipImages.some((line) => line.endsWith(name))
);

if (missingInZip.length) {
  console.error("Zip built but jersey files missing inside archive:");
  missingInZip.forEach((name) => console.error("  -", name));
  process.exit(1);
}

const size = fs.statSync(ZIP).size;
console.log("");
console.log("Netlify upload package ready (POSIX paths):");
console.log(" ", ZIP);
console.log(" ", (size / 1024).toFixed(1), "KB");
console.log("");
console.log("Jersey images included:");
zipImages.forEach((line) => console.log(" ", line.replace("./", "")));
console.log("");
console.log("In Netlify: Site -> Deploys -> drag rs-demo-netlify.zip");
console.log("Do NOT use dist-netlify-upload/ or Windows Compress-Archive.");
console.log("");
console.log("Verify after publish:");
console.log("  https://rosalessport.com/images/jersey1.webp");
console.log("  https://rosalessport.com/css/styles.css");
