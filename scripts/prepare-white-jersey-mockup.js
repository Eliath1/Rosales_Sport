#!/usr/bin/env node
/**
 * Build classic-button mockup pack from a white 3D jersey photo (demo).
 * Replaces flat Vecteezy illustration with photo-real blank for localhost preview.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const OUT = path.join(REPO, "demo", "assets", "mockups", "classic-button");
const SOURCE = path.join(OUT, "source");

const WHITE_JERSEY_SRC =
  process.env.WHITE_JERSEY_SRC ||
  path.join(REPO, "assets", "white-jersey-3d-front.png");

const OUT_W = 800;
const OUT_H = 1000;

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isJerseyPixel(r, g, b, x, y, w, h, bounds) {
  if (x < bounds.left || x > bounds.right || y < bounds.top || y > bounds.bottom) {
    return false;
  }
  var l = lum(r, g, b);
  return l > 120 && l < 252;
}

function zoneBody(x, y, w, h, bounds) {
  var nx = (x - bounds.left) / bounds.width;
  var ny = (y - bounds.top) / bounds.height;
  return nx > 0.28 && nx < 0.72 && ny > 0.12 && ny < 0.92;
}

function zoneSleeve(x, y, w, h, bounds) {
  var nx = (x - bounds.left) / bounds.width;
  var ny = (y - bounds.top) / bounds.height;
  var left = nx < 0.3 && ny > 0.14 && ny < 0.55;
  var right = nx > 0.7 && ny > 0.14 && ny < 0.55;
  return left || right;
}

function zoneCollar(x, y, w, h, bounds, isFront) {
  if (!isFront) return false;
  var nx = (x - bounds.left) / bounds.width;
  var ny = (y - bounds.top) / bounds.height;
  return nx > 0.38 && nx < 0.62 && ny > 0.02 && ny < 0.2;
}

async function findJerseyBounds(baseBuffer) {
  var { data, info } = await sharp(baseBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  var w = info.width;
  var h = info.height;
  var minX = w;
  var minY = h;
  var maxX = 0;
  var maxY = 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * info.channels;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      if (lum(r, g, b) > 175 && lum(r, g, b) < 252) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return {
    left: minX,
    top: minY,
    right: maxX,
    bottom: maxY,
    width: Math.max(1, maxX - minX),
    height: Math.max(1, maxY - minY),
  };
}

async function resizeBase(inputBuffer) {
  return sharp(inputBuffer)
    .resize(OUT_W, OUT_H, { fit: "contain", background: { r: 58, g: 58, b: 58, alpha: 1 } })
    .png()
    .toBuffer();
}

async function buildMasks(baseBuffer, isFront) {
  var bounds = await findJerseyBounds(baseBuffer);
  var { data, info } = await sharp(baseBuffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  var w = info.width;
  var h = info.height;
  var body = Buffer.alloc(w * h);
  var sleeve = Buffer.alloc(w * h);
  var collar = Buffer.alloc(w * h);
  var shadow = Buffer.alloc(w * h * 4);

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * info.channels;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var p = y * w + x;
      var si = p * 4;
      var onJersey = isJerseyPixel(r, g, b, x, y, w, h, bounds);

      if (onJersey && zoneCollar(x, y, w, h, bounds, isFront)) collar[p] = 255;
      else if (onJersey && zoneSleeve(x, y, w, h, bounds)) sleeve[p] = 255;
      else if (onJersey && zoneBody(x, y, w, h, bounds)) body[p] = 255;

      var l = lum(r, g, b);
      var shade = Math.max(0, Math.min(255, Math.round(255 - l * 0.5)));
      shadow[si] = shade;
      shadow[si + 1] = shade;
      shadow[si + 2] = shade;
      shadow[si + 3] = onJersey ? Math.round(40 + (255 - l) * 0.25) : 0;
    }
  }

  async function maskPng(buf, singleChannel) {
    if (singleChannel) {
      return sharp(buf, { raw: { width: w, height: h, channels: 1 } }).png().toBuffer();
    }
    return sharp(shadow, { raw: { width: w, height: h, channels: 4 } }).png().toBuffer();
  }

  return {
    body: await maskPng(body, true),
    sleeve: await maskPng(sleeve, true),
    collar: await maskPng(collar, true),
    shadow: await maskPng(null, false),
  };
}

async function flipForBack(frontBase) {
  return sharp(frontBase).flop().png().toBuffer();
}

async function main() {
  if (!fs.existsSync(WHITE_JERSEY_SRC)) {
    throw new Error("White jersey source not found: " + WHITE_JERSEY_SRC);
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(SOURCE, { recursive: true });

  console.log("Using white 3D jersey:", WHITE_JERSEY_SRC);
  fs.copyFileSync(WHITE_JERSEY_SRC, path.join(SOURCE, "white-jersey-3d-front.png"));

  var frontBase = await resizeBase(await sharp(WHITE_JERSEY_SRC).toBuffer());
  var backBase = await flipForBack(frontBase);

  var frontMasks = await buildMasks(frontBase, true);
  var backMasks = await buildMasks(backBase, false);

  var files = {
    "front-base.png": frontBase,
    "back-base.png": backBase,
    "front-mask-body.png": frontMasks.body,
    "front-mask-sleeve.png": frontMasks.sleeve,
    "front-mask-collar.png": frontMasks.collar,
    "back-mask-body.png": backMasks.body,
    "back-mask-sleeve.png": backMasks.sleeve,
    "front-shadow.png": frontMasks.shadow,
    "back-shadow.png": backMasks.shadow,
  };

  for (var name of Object.keys(files)) {
    await sharp(files[name]).png().toFile(path.join(OUT, name));
    console.log("Wrote", name);
  }

  var placement = {
    baseType: "white-3d",
    front: {
      chest_center: { x: 0.5, y: 0.42, maxW: 0.18, maxH: 0.1 },
    },
    back: {
      number: { x: 0.5, y: 0.46, maxW: 0.26, maxH: 0.16 },
      name: { x: 0.5, y: 0.58, maxW: 0.48, maxH: 0.06 },
    },
  };
  fs.writeFileSync(path.join(OUT, "placement.json"), JSON.stringify(placement, null, 2));

  fs.writeFileSync(
    path.join(OUT, "SOURCE.txt"),
    [
      "Demo mockup pack - classic-button (white 3D photo)",
      "Built from: " + path.basename(WHITE_JERSEY_SRC),
      "Source copy: ./source/white-jersey-3d-front.png",
      "Back view is mirrored front until RS delivers back photo.",
      "Replace with RS photographer pack for production.",
      "Generated: " + new Date().toISOString(),
    ].join("\n")
  );

  console.log("White jersey mockup pack ready:", OUT);
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
