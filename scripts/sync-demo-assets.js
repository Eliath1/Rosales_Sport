#!/usr/bin/env node
/**
 * Sync images/ -> demo/images/ (catalog) and run mockup ingest.
 * See docs/specs/demo-image-asset-plan.md
 */
const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const IMAGES = path.join(REPO, "images");
const DEMO_IMAGES = path.join(REPO, "demo", "images");
const CATALOG_MAP = path.join(IMAGES, "catalog-mapping.json");

async function exportCatalogEntry(destName, spec) {
  var srcPath = path.join(IMAGES, spec.source);
  if (!fs.existsSync(srcPath)) {
    throw new Error("Missing catalog source: " + spec.source + " (for " + destName + ")");
  }

  var destPath = path.join(DEMO_IMAGES, destName);
  var ext = path.extname(destName).toLowerCase();
  var maxWidth = spec.maxWidth || 900;
  var quality = spec.quality || 85;

  var pipeline = sharp(srcPath).rotate().resize({ width: maxWidth, withoutEnlargement: true });

  if (ext === ".webp") {
    await pipeline.webp({ quality: quality }).toFile(destPath);
  } else if (ext === ".jpg" || ext === ".jpeg") {
    await pipeline.jpeg({ quality: quality, mozjpeg: true }).toFile(destPath);
  } else if (ext === ".png") {
    await pipeline.png().toFile(destPath);
  } else {
    throw new Error("Unsupported catalog dest extension: " + destName);
  }

  console.log("[catalog]", destName, "<-", spec.source);
}

async function syncCatalog() {
  if (!fs.existsSync(CATALOG_MAP)) {
    console.warn("No catalog-mapping.json; skipping catalog sync.");
    return;
  }

  var map = JSON.parse(fs.readFileSync(CATALOG_MAP, "utf8"));
  fs.mkdirSync(DEMO_IMAGES, { recursive: true });

  var entries = Object.keys(map.catalog || {});
  for (var i = 0; i < entries.length; i++) {
    await exportCatalogEntry(entries[i], map.catalog[entries[i]]);
  }
}

function runMockupIngest() {
  if (!fs.existsSync(path.join(IMAGES, "mockup-mapping.json"))) {
    console.warn("No mockup-mapping.json; skipping mockup ingest.");
    return;
  }
  execSync("node scripts/ingest-gemini-mockups.js", { cwd: REPO, stdio: "inherit" });
}

async function main() {
  fs.mkdirSync(path.join(IMAGES, "catalog"), { recursive: true });
  await syncCatalog();
  runMockupIngest();
  console.log("\nAsset sync complete. Hard-refresh builder: /custom/uniform/builder.html");
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
