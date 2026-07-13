#!/usr/bin/env node
/**
 * Compose catalog hero PNGs by tinting mockup packs (offline).
 * See images/catalog-spec.json and docs/architecture/mockup-asset-pipeline.md
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { buildMasksFromBase, buildPantsMasksFromBase } = require("./lib/mockup-mask-builder");

const REPO = path.join(__dirname, "..");
const SPEC = path.join(REPO, "images", "catalog-spec.json");
const DEMO_IMAGES = path.join(REPO, "demo", "images");
const MOCKUPS = path.join(REPO, "demo", "assets", "mockups");

function hexToRgb(hex) {
  var h = String(hex).replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
  var max = Math.max(r, g, b), min = Math.min(r, g, b);
  var h = 0, s = 0, l = (max + min) / 2;
  if (max !== min) {
    var d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      case b: h = ((r - g) / d + 4) / 6; break;
    }
  }
  return { h: h * 360, s: s * 100, l: l * 100 };
}

function hslToRgb(h, s, l) {
  h /= 360; s /= 100; l /= 100;
  if (s === 0) {
    var v = Math.round(l * 255);
    return { r: v, g: v, b: v };
  }
  function hue2rgb(p, q, t) {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1 / 6) return p + (q - p) * 6 * t;
    if (t < 1 / 2) return q;
    if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
    return p;
  }
  var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
  var p = 2 * l - q;
  return {
    r: Math.round(hue2rgb(p, q, h + 1 / 3) * 255),
    g: Math.round(hue2rgb(p, q, h) * 255),
    b: Math.round(hue2rgb(p, q, h - 1 / 3) * 255),
  };
}

async function applyZoneTint(baseData, maskBuf, targetRgb, strength) {
  var mask = await sharp(maskBuf).ensureAlpha().resize(baseData.info.width, baseData.info.height).raw().toBuffer({ resolveWithObject: true });
  var w = baseData.info.width;
  var h = baseData.info.height;
  var out = Buffer.from(baseData.data);
  var th = rgbToHsl(targetRgb.r, targetRgb.g, targetRgb.b);
  var t = strength || 0.9;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4;
      var ma = mask.data[i + 3];
      if (ma < 8) continue;
      var blend = (ma / 255) * t;
      var src = rgbToHsl(out[i], out[i + 1], out[i + 2]);
      var mixed = { h: th.h, s: th.s * blend + src.s * (1 - blend), l: src.l };
      var rgb = hslToRgb(mixed.h, mixed.s, mixed.l);
      out[i] = rgb.r;
      out[i + 1] = rgb.g;
      out[i + 2] = rgb.b;
    }
  }
  return out;
}

async function composeJersey(packDir, view, colors) {
  var basePath = path.join(packDir, view + "-base.png");
  var base = await sharp(basePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var masks = await buildMasksFromBase(basePath, view);
  var out = Buffer.from(base.data);

  var baseRef = { data: out, info: base.info };

  if (colors.body && masks.body) {
    out = await applyZoneTint(baseRef, masks.body, hexToRgb(colors.body));
    baseRef.data = out;
  }
  if (colors.sleeve && masks.sleeve) {
    out = await applyZoneTint(baseRef, masks.sleeve, hexToRgb(colors.sleeve));
    baseRef.data = out;
  }
  if (colors.collar && masks.collar) {
    out = await applyZoneTint(baseRef, masks.collar, hexToRgb(colors.collar));
    baseRef.data = out;
  }

  return sharp(out, { raw: { width: base.info.width, height: base.info.height, channels: 4 } }).png().toBuffer();
}

async function composePants(packDir, view, colors) {
  var basePath = path.join(packDir, view + "-base.png");
  var base = await sharp(basePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var masks = await buildPantsMasksFromBase(basePath, view);
  var out = Buffer.from(base.data);
  var baseRef = { data: out, info: base.info };

  if (colors.pants && masks.pants) {
    out = await applyZoneTint(baseRef, masks.pants, hexToRgb(colors.pants));
    baseRef.data = out;
  }
  if (colors.pants_stripe && masks.pants_stripe) {
    out = await applyZoneTint(baseRef, masks.pants_stripe, hexToRgb(colors.pants_stripe));
  }

  return sharp(out, { raw: { width: base.info.width, height: base.info.height, channels: 4 } }).png().toBuffer();
}

async function copyPhoto(entry) {
  var src = path.isAbsolute(entry.source) ? entry.source : path.join(REPO, entry.source);
  if (!fs.existsSync(src)) throw new Error("Missing photo source: " + src);
  var dest = path.join(DEMO_IMAGES, entry.dest);
  fs.mkdirSync(DEMO_IMAGES, { recursive: true });
  fs.copyFileSync(src, dest);
  console.log("[photo]", entry.dest, "<-", path.relative(REPO, src));
}

async function composeOne(entry) {
  var packDir = path.join(MOCKUPS, entry.pack);
  var view = entry.view || "front";
  var buf;

  if (entry.pack === "pants-classic") {
    buf = await composePants(packDir, view, entry.colors);
  } else {
    buf = await composeJersey(packDir, view, entry.colors);
  }

  var dest = path.join(DEMO_IMAGES, entry.dest);
  fs.mkdirSync(DEMO_IMAGES, { recursive: true });
  await sharp(buf).resize({ width: 900, withoutEnlargement: true }).png().toFile(dest);
  console.log("[compose]", entry.dest, "<-", entry.pack, JSON.stringify(entry.colors));
}

async function main() {
  if (!fs.existsSync(SPEC)) throw new Error("Missing " + SPEC);
  var spec = JSON.parse(fs.readFileSync(SPEC, "utf8"));

  for (var i = 0; i < spec.products.length; i++) {
    var p = spec.products[i];
    if (p.type === "photo") await copyPhoto(p);
    else if (p.type === "compose") await composeOne(p);
  }

  console.log("\nCatalog compose complete:", spec.products.length, "heroes in demo/images/");
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
