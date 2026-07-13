#!/usr/bin/env node
/**
 * DEPRECATED: replaced by scripts/build-curated-variant-manifest.js.
 *
 * This script tinted the same grey mockup base algorithmically for all 343
 * body/sleeve/collar combos, which looked like a color filter rather than a
 * real product photo. The current approach generates a curated set of real
 * AI product photos per combo (see images/variant-bank-colors.json, mode
 * "curated-photo") with a live-tint fallback for uncurated combos. Kept here
 * for reference only; not wired to any npm script.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { composeJerseyVariant } = require("./lib/jersey-variant-composer");

const REPO = path.join(__dirname, "..");
const SPEC = path.join(REPO, "images", "variant-bank-colors.json");
const OUT = path.join(REPO, "demo", "assets", "variant-bank", "classic-button");

function comboKey(bodyId, sleeveId, collarId) {
  return bodyId + "_" + sleeveId + "_" + collarId;
}

async function main() {
  var spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));
  var bank = spec.bank;
  var ids = bank.map(function (c) { return c.id; });
  var hexById = {};
  bank.forEach(function (c) { hexById[c.id] = c.hex; });

  var frontBase = path.join(REPO, spec.baseFront);
  var backBase = path.join(REPO, spec.baseBack);
  var masksDir = spec.masksDir ? path.join(REPO, spec.masksDir) : null;
  if (!fs.existsSync(frontBase) || !fs.existsSync(backBase)) {
    throw new Error("Missing mockup base photos. Run npm run demo:mockups:gemini first.");
  }

  fs.mkdirSync(path.join(OUT, "front"), { recursive: true });
  fs.mkdirSync(path.join(OUT, "back"), { recursive: true });

  var manifest = {
    version: 1,
    template: spec.template,
    generatedAt: new Date().toISOString(),
    colorCount: bank.length,
    comboCount: Math.pow(bank.length, 3),
    bank: bank,
    paletteMap: spec.paletteMap,
    variants: {},
  };

  var count = 0;
  var total = ids.length * ids.length * ids.length * 2;

  for (var bi = 0; bi < ids.length; bi++) {
    for (var si = 0; si < ids.length; si++) {
      for (var ci = 0; ci < ids.length; ci++) {
        var bodyId = ids[bi];
        var sleeveId = ids[si];
        var collarId = ids[ci];
        var key = comboKey(bodyId, sleeveId, collarId);
        var colors = {
          body: hexById[bodyId],
          sleeve: hexById[sleeveId],
          collar: hexById[collarId],
        };

        for (var vi = 0; vi < spec.views.length; vi++) {
          var view = spec.views[vi];
          var basePath = view === "back" ? backBase : frontBase;
          var buf = await composeJerseyVariant(basePath, view, colors, masksDir);
          var fileName = key + ".png";
          var rel = view + "/" + fileName;
          await sharp(buf).resize({ width: 720, withoutEnlargement: true }).png({ compressionLevel: 8 }).toFile(path.join(OUT, rel));
          count++;
          if (count % 50 === 0) console.log("[variant-bank]", count, "/", total);
        }

        manifest.variants[key] = {
          body: bodyId,
          sleeve: sleeveId,
          collar: collarId,
          bodyHex: colors.body,
          sleeveHex: colors.sleeve,
          collarHex: colors.collar,
          front: "front/" + key + ".png",
          back: "back/" + key + ".png",
        };
      }
    }
  }

  fs.writeFileSync(path.join(OUT, "manifest.json"), JSON.stringify(manifest, null, 2));
  fs.writeFileSync(
    path.join(OUT, "SOURCE.txt"),
    [
      "RS variant bank - classic-button jersey",
      "Combos: " + bank.length + "^3 = " + manifest.comboCount + " per view",
      "Base: mockup pack classic-button (grey blank + ingested masks)",
      "Generated: " + manifest.generatedAt,
    ].join("\n")
  );

  console.log("\nVariant bank ready:", OUT);
  console.log("Combos:", manifest.comboCount, "x 2 views =", count, "PNG files");
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
