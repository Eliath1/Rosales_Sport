#!/usr/bin/env node
/** Offline sanity check using luminance-preserving tint (approximates canvas color blend). */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");
const { buildMasksFromBase } = require("./lib/mockup-mask-builder");

const PACK = path.join(__dirname, "..", "demo", "assets", "mockups", "classic-button");
const OUT = path.join(PACK, "preview-test-body-green.png");
const TARGET = { r: 22, g: 101, b: 52 };

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

async function main() {
  var frontBase = path.join(PACK, "front-base.png");
  if (!fs.existsSync(frontBase)) {
    console.error("Run npm run demo:mockups:gemini first");
    process.exit(1);
  }

  var masks = await buildMasksFromBase(frontBase, "front");
  var base = await sharp(frontBase).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var maskBody = await sharp(masks.body).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var th = rgbToHsl(TARGET.r, TARGET.g, TARGET.b);

  var w = base.info.width;
  var h = base.info.height;
  var out = Buffer.from(base.data);

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * 4;
      var ma = maskBody.data[i + 3];
      if (ma < 8) continue;
      var t = (ma / 255) * 0.92;
      var src = rgbToHsl(base.data[i], base.data[i + 1], base.data[i + 2]);
      var mixed = {
        h: th.h,
        s: th.s * t + src.s * (1 - t),
        l: src.l,
      };
      var rgb = hslToRgb(mixed.h, mixed.s, mixed.l);
      out[i] = rgb.r;
      out[i + 1] = rgb.g;
      out[i + 2] = rgb.b;
    }
  }

  await sharp(out, { raw: { width: w, height: h, channels: 4 } }).png().toFile(OUT);
  console.log("Wrote", OUT);
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
