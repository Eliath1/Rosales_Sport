#!/usr/bin/env node
/**
 * Build classic-button mockup pack from Vecteezy source assets (demo).
 * Copies EPS + JPG into repo, splits front/back, generates zone masks.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const OUT = path.join(REPO, "demo", "assets", "mockups", "classic-button");
const SOURCE = path.join(OUT, "source");

const VECTEEZY_DIR =
  process.env.VECTEEZY_SRC ||
  path.join(
    process.env.USERPROFILE || "",
    "Downloads",
    "vecteezy_baseball-jersey-uniform-mockup-front-and-back-view_48973378_284"
  );

const VECTEEZY_JPG = path.join(
  VECTEEZY_DIR,
  "vecteezy_baseball-jersey-uniform-mockup-front-and-back-view_48973378.jpg"
);
const VECTEEZY_EPS = path.join(
  VECTEEZY_DIR,
  "vecteezy_baseball-jersey-uniform-mockup-front-and-back-view_48973378.eps"
);
const VECTEEZY_LICENSE = path.join(VECTEEZY_DIR, "Vecteezy-License-Information.pdf");

const OUT_W = 800;
const OUT_H = 1000;

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isBackground(r, g, b) {
  return r > 245 && g > 245 && b > 245;
}

function isNavy(r, g, b) {
  return b > r + 8 && b > g + 5 && lum(r, g, b) < 200;
}

function isBody(r, g, b) {
  if (isBackground(r, g, b) || isNavy(r, g, b)) return false;
  return lum(r, g, b) > 175;
}

function isCollar(r, g, b, x, y, w, h, isFront) {
  if (!isFront) return false;
  var cx = Math.abs(x - w * 0.5) < w * 0.08;
  var top = y < h * 0.42;
  return cx && top && (isNavy(r, g, b) || lum(r, g, b) < 160);
}

async function trimAndResize(inputBuffer, label) {
  return sharp(inputBuffer)
    .trim({ threshold: 12 })
    .resize(OUT_W, OUT_H, { fit: "contain", background: { r: 244, g: 244, b: 244, alpha: 1 } })
    .png()
    .toBuffer();
}

async function buildMasks(baseBuffer, isFront) {
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

      if (isBody(r, g, b)) body[p] = 255;
      if (isNavy(r, g, b)) sleeve[p] = 255;
      if (isCollar(r, g, b, x, y, w, h, isFront)) collar[p] = 255;

      var l = lum(r, g, b);
      var shade = Math.max(0, Math.min(255, Math.round(255 - l * 0.55)));
      shadow[si] = shade;
      shadow[si + 1] = shade;
      shadow[si + 2] = shade;
      shadow[si + 3] = isBackground(r, g, b) ? 0 : Math.round(90 + (255 - l) * 0.35);
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

async function copySources() {
  fs.mkdirSync(SOURCE, { recursive: true });

  if (!fs.existsSync(VECTEEZY_JPG)) {
    throw new Error("Vecteezy JPG not found: " + VECTEEZY_JPG);
  }

  fs.copyFileSync(VECTEEZY_JPG, path.join(SOURCE, "vecteezy-48973378-preview.jpg"));
  await sharp(VECTEEZY_JPG).png().toFile(path.join(SOURCE, "vecteezy-48973378-preview.png"));

  if (fs.existsSync(VECTEEZY_EPS)) {
    fs.copyFileSync(VECTEEZY_EPS, path.join(SOURCE, "vecteezy-48973378-mockup.eps"));
  }
  if (fs.existsSync(VECTEEZY_LICENSE)) {
    fs.copyFileSync(VECTEEZY_LICENSE, path.join(SOURCE, "Vecteezy-License-Information.pdf"));
  }
}

async function splitAndProcess() {
  var meta = await sharp(VECTEEZY_JPG).metadata();
  var half = Math.floor(meta.width / 2);

  var frontRaw = await sharp(VECTEEZY_JPG)
    .extract({ left: 0, top: 0, width: half, height: meta.height })
    .toBuffer();

  var backRaw = await sharp(VECTEEZY_JPG)
    .extract({ left: half, top: 0, width: meta.width - half, height: meta.height })
    .toBuffer();

  var frontBase = await trimAndResize(frontRaw, "front");
  var backBase = await trimAndResize(backRaw, "back");

  var frontMasks = await buildMasks(frontBase, true);
  var backMasks = await buildMasks(backBase, false);

  return { frontBase, backBase, frontMasks, backMasks };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });

  console.log("Copying Vecteezy source files...");
  await copySources();

  console.log("Processing front/back from Vecteezy JPG", VECTEEZY_JPG);
  var assets = await splitAndProcess();

  var files = {
    "front-base.png": assets.frontBase,
    "back-base.png": assets.backBase,
    "front-mask-body.png": assets.frontMasks.body,
    "front-mask-sleeve.png": assets.frontMasks.sleeve,
    "front-mask-collar.png": assets.frontMasks.collar,
    "back-mask-body.png": assets.backMasks.body,
    "back-mask-sleeve.png": assets.backMasks.sleeve,
    "front-shadow.png": assets.frontMasks.shadow,
    "back-shadow.png": assets.backMasks.shadow,
  };

  for (var name of Object.keys(files)) {
    await sharp(files[name]).png().toFile(path.join(OUT, name));
    console.log("Wrote", name);
  }

  var placement = {
    front: {
      chest_center: { x: 0.5, y: 0.4, maxW: 0.2, maxH: 0.12 },
    },
    back: {
      number: { x: 0.5, y: 0.44, maxW: 0.28, maxH: 0.18 },
      name: { x: 0.5, y: 0.56, maxW: 0.5, maxH: 0.07 },
    },
  };
  fs.writeFileSync(path.join(OUT, "placement.json"), JSON.stringify(placement, null, 2));

  fs.writeFileSync(
    path.join(OUT, "SOURCE.txt"),
    [
      "Demo mockup pack - classic-button",
      "Built from Vecteezy asset 48973378 (dev only).",
      "Source files in ./source/:",
      "  - vecteezy-48973378-preview.jpg",
      "  - vecteezy-48973378-preview.png",
      "  - vecteezy-48973378-mockup.eps (if present)",
      "  - Vecteezy-License-Information.pdf (if present)",
      "Replace with RS photographer pack for production.",
      "Generated: " + new Date().toISOString(),
    ].join("\n")
  );

  console.log("Mockup pack ready:", OUT);
}

main().catch(function (err) {
  console.error(err.message || err);
  process.exit(1);
});
