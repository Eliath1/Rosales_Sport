#!/usr/bin/env node
/**
 * Ingest mockup packs from images/mockup-mapping.json.
 * Jersey masks are derived from base photos (pixel-aligned), not separate Gemini masks.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { buildMasksFromBase, buildPantsMasksFromBase } = require("./lib/mockup-mask-builder");

const REPO = path.join(__dirname, "..");
const IMAGES = path.join(REPO, "images");
const MAPPING_FILE = path.join(IMAGES, "mockup-mapping.json");

async function normalizeMaskBuffer(buf) {
  var { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var rgba = Buffer.alloc(info.width * info.height * 4);
  for (var i = 0; i < info.width * info.height; i++) {
    var si = i * info.channels;
    var o = i * 4;
    var a = info.channels === 4 ? data[si + 3] : data[si];
    if (info.channels >= 3 && info.channels !== 4) {
      a = Math.round(0.299 * data[si] + 0.587 * data[si + 1] + 0.114 * data[si + 2]);
    }
    rgba[o] = 255;
    rgba[o + 1] = 255;
    rgba[o + 2] = 255;
    rgba[o + 3] = a;
  }
  return sharp(rgba, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toBuffer();
}

async function copyBase(slug, fileMap, out, sourceOut) {
  var bases = ["front-base.png", "back-base.png"];
  for (var b = 0; b < bases.length; b++) {
    var dest = bases[b];
    if (!fileMap[dest]) continue;
    var srcPath = path.join(IMAGES, fileMap[dest]);
    if (!fs.existsSync(srcPath)) {
      throw new Error("[" + slug + "] Missing " + fileMap[dest]);
    }
    fs.copyFileSync(srcPath, path.join(out, dest));
    fs.copyFileSync(srcPath, path.join(sourceOut, fileMap[dest]));
    console.log("[" + slug + "]", dest, "<-", fileMap[dest]);
  }
}

async function writeDerivedJerseyMasks(out) {
  var frontBase = path.join(out, "front-base.png");
  var backBase = path.join(out, "back-base.png");
  var front = await buildMasksFromBase(frontBase, "front");
  var back = await buildMasksFromBase(backBase, "back");

  var files = {
    "front-mask-body.png": front.body,
    "front-mask-sleeve.png": front.sleeve,
    "front-mask-collar.png": front.collar,
    "back-mask-body.png": back.body,
    "back-mask-sleeve.png": back.sleeve,
  };

  for (var name of Object.keys(files)) {
    if (!files[name]) continue;
    var buf = await normalizeMaskBuffer(files[name]);
    fs.writeFileSync(path.join(out, name), buf);
    console.log("[classic-button]", name, "(derived from base photo)");
  }
}

function slugLabel(out) {
  return path.basename(path.dirname(out));
}

async function writeDerivedPantsMasks(out) {
  var frontBase = path.join(out, "front-base.png");
  var backBase = path.join(out, "back-base.png");
  var front = await buildPantsMasksFromBase(frontBase, "front");
  var back = await buildPantsMasksFromBase(backBase, "back");

  var files = {
    "front-mask-pants.png": front.pants,
    "back-mask-pants.png": back.pants,
  };
  if (front.pants_stripe) files["front-mask-pants_stripe.png"] = front.pants_stripe;

  for (var name of Object.keys(files)) {
    if (!files[name]) continue;
    var buf = await normalizeMaskBuffer(files[name]);
    fs.writeFileSync(path.join(out, name), buf);
    console.log("[pants-classic]", name, "(derived from base photo)");
  }
}

async function ingestJersey(fileMap, options) {
  var out = path.join(REPO, "demo", "assets", "mockups", "classic-button");
  var sourceOut = path.join(out, "source");
  fs.mkdirSync(sourceOut, { recursive: true });

  await copyBase("classic-button", fileMap, out, sourceOut);
  await writeDerivedJerseyMasks(out);

  var placement = {
    baseType: "rs-photo",
    tintEnabled: true,
    shadowEnabled: false,
    masksDerivedFromBase: true,
    source: "mockup-mapping.json",
    verified: !!options.verified,
    defaultColors: { body: "#E8E8E8", sleeve: "#E8E8E8", collar: "#E8E8E8" },
    front: { chest_center: { x: 0.5, y: 0.4, maxW: 0.2, maxH: 0.11 } },
    back: {
      number: { x: 0.5, y: 0.42, maxW: 0.3, maxH: 0.2 },
      name: { x: 0.5, y: 0.55, maxW: 0.55, maxH: 0.07 },
    },
    ingestedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(out, "placement.json"), JSON.stringify(placement, null, 2));
  fs.writeFileSync(
    path.join(out, "SOURCE.txt"),
    [
      "RS mockup pack - classic-button",
      "Bases from images/mockup-mapping.json",
      "Masks derived from base photos (pixel-aligned)",
      "Ingested: " + new Date().toISOString(),
    ].join("\n")
  );
  console.log("[classic-button] pack ready");
}

async function ingestPants(fileMap, options) {
  var out = path.join(REPO, "demo", "assets", "mockups", "pants-classic");
  var sourceOut = path.join(out, "source");
  fs.mkdirSync(sourceOut, { recursive: true });
  await copyBase("pants-classic", fileMap, out, sourceOut);
  await writeDerivedPantsMasks(out);

  var placement = {
    baseType: "rs-photo",
    tintEnabled: true,
    shadowEnabled: false,
    masksDerivedFromBase: true,
    source: "mockup-mapping.json",
    defaultColors: { pants: "#E8E8E8", pants_stripe: "#C8C8C8" },
    ingestedAt: new Date().toISOString(),
  };
  fs.writeFileSync(path.join(out, "placement.json"), JSON.stringify(placement, null, 2));
  console.log("[pants-classic] pack ready");
}

async function main() {
  if (!fs.existsSync(MAPPING_FILE)) {
    throw new Error("Missing " + MAPPING_FILE);
  }
  var mapping = JSON.parse(fs.readFileSync(MAPPING_FILE, "utf8"));

  if (mapping["classic-button"]) {
    await ingestJersey(mapping["classic-button"], { verified: mapping.verified });
  }
  if (mapping["pants-classic"]) {
    await ingestPants(mapping["pants-classic"], { verified: mapping.verified });
  }
  console.log("\nIngest complete.");
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
