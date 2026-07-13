#!/usr/bin/env node
/**
 * Build curated variant bank manifest(s) from AI-generated staged photos.
 *
 * Reads images/variant-bank-colors.json (v2, "curated-photo" mode: garments +
 * curatedCombos), normalizes each staged photo with sharp, and writes
 * demo/assets/variant-bank/{slug}/{front,back}/{comboKey}.png plus a
 * manifest.json per garment.
 *
 * Combos not listed in curatedCombos are intentionally NOT generated here;
 * they fall back to live tint over the grey mockup base at runtime
 * (see demo/js/preview-compositor.js renderLayered).
 *
 * Replaces scripts/build-variant-bank.js (deprecated: produced 343 algorithmically
 * tinted PNGs that looked like a color filter instead of a real product photo).
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const SPEC_PATH = path.join(REPO, "images", "variant-bank-colors.json");
const TARGET_WIDTH = 720;

function stagedFile(stagingDir, slug, key, view) {
  return path.join(REPO, stagingDir, "variant-" + slug + "-" + key + "-" + view + ".png");
}

function hexById(bank) {
  var map = {};
  bank.forEach(function (c) { map[c.id] = c.hex; });
  return map;
}

async function buildGarment(slug, garment, spec) {
  var stagingDir = garment.stagingDir;
  var outDir = path.join(REPO, garment.outDir);
  var combos = garment.curatedCombos || [];
  var hexMap = hexById(spec.bank);

  // Wipe old front/back dirs so stale PNGs (e.g. the previous algorithmic-tint
  // bank) don't linger next to the new curated photos.
  fs.rmSync(path.join(outDir, "front"), { recursive: true, force: true });
  fs.rmSync(path.join(outDir, "back"), { recursive: true, force: true });
  fs.mkdirSync(path.join(outDir, "front"), { recursive: true });
  fs.mkdirSync(path.join(outDir, "back"), { recursive: true });

  var manifest = {
    version: 2,
    mode: "curated-photo",
    generatedAt: new Date().toISOString(),
    zones: garment.zones,
    bank: spec.bank,
    paletteMap: spec.paletteMap,
    curatedCount: combos.length,
    variants: {},
  };

  var count = 0;

  for (var i = 0; i < combos.length; i++) {
    var combo = combos[i];
    var entry = { label: combo.label };
    garment.zones.forEach(function (zone) {
      entry[zone] = combo[zone];
      entry[zone + "Hex"] = hexMap[combo[zone]] || null;
    });

    for (var v = 0; v < 2; v++) {
      var view = v === 0 ? "front" : "back";
      var src = stagedFile(stagingDir, slug, combo.key, view);
      if (!fs.existsSync(src)) {
        throw new Error("Missing staged photo for " + slug + " " + combo.key + " " + view + ": " + src);
      }
      var rel = view + "/" + combo.key + ".png";
      await sharp(src)
        .resize({ width: TARGET_WIDTH, withoutEnlargement: true })
        .png({ compressionLevel: 8 })
        .toFile(path.join(outDir, rel));
      entry[view] = rel;
      count++;
    }

    manifest.variants[combo.key] = entry;
  }

  fs.writeFileSync(path.join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(outDir, "SOURCE.txt"),
    [
      "RS curated variant bank - " + slug,
      "Curated combos: " + combos.length + " x 2 views = " + count + " PNG files (AI-generated product photos)",
      "Combinations outside this curated set fall back to live tint over the grey mockup base (renderLayered).",
      "Generated: " + manifest.generatedAt,
    ].join("\n")
  );

  console.log("[curated-variant-bank] " + slug + ": " + count + " files -> " + path.relative(REPO, outDir));
}

async function main() {
  var spec = JSON.parse(fs.readFileSync(SPEC_PATH, "utf8"));
  if (!spec.garments) {
    throw new Error("images/variant-bank-colors.json is missing 'garments' (expected curated-photo v2 format)");
  }

  var slugs = Object.keys(spec.garments);
  for (var i = 0; i < slugs.length; i++) {
    var slug = slugs[i];
    await buildGarment(slug, spec.garments[slug], spec);
  }

  console.log("\nCurated variant bank build complete: " + slugs.join(", "));
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
