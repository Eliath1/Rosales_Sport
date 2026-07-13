#!/usr/bin/env node
/**
 * Derive zone masks from base photos so masks pixel-align with bases.
 */
const sharp = require("sharp");

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

function isBackground(r, g, b, x, y, w, h) {
  var l = lum(r, g, b);
  var edge = x < w * 0.06 || x > w * 0.94 || y < h * 0.04 || y > h * 0.96;
  return edge && l > 200;
}

function isFabric(r, g, b) {
  var l = lum(r, g, b);
  return l > 95 && l < 248;
}

async function findGarmentBounds(data, info) {
  var w = info.width;
  var h = info.height;
  var minX = w;
  var minY = h;
  var maxX = 0;
  var maxY = 0;

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * info.channels;
      if (isFabric(data[i], data[i + 1], data[i + 2]) && !isBackground(data[i], data[i + 1], data[i + 2], x, y, w, h)) {
        if (x < minX) minX = x;
        if (y < minY) minY = y;
        if (x > maxX) maxX = x;
        if (y > maxY) maxY = y;
      }
    }
  }

  return { minX, minY, maxX, maxY, w, h };
}

function norm(x, y, bounds) {
  return {
    nx: (x - bounds.minX) / Math.max(1, bounds.maxX - bounds.minX),
    ny: (y - bounds.minY) / Math.max(1, bounds.maxY - bounds.minY),
  };
}

function zoneFrontBody(nx, ny) {
  if (zoneFrontSleeve(nx, ny) || zoneFrontCollar(nx, ny)) return false;
  var dx = (nx - 0.5) / 0.3;
  var dy = (ny - 0.54) / 0.4;
  return dx * dx + dy * dy <= 1;
}

function zoneFrontSleeve(nx, ny) {
  var left = nx < 0.26 && ny > 0.12 && ny < 0.52;
  var right = nx > 0.74 && ny > 0.12 && ny < 0.52;
  return left || right;
}

function zoneFrontCollar(nx, ny) {
  var vneck = nx > 0.44 && nx < 0.56 && ny > 0.02 && ny < 0.15;
  var placket = nx > 0.47 && nx < 0.53 && ny > 0.12 && ny < 0.88;
  return vneck || placket;
}

function zoneBackBody(nx, ny) {
  if (zoneBackSleeve(nx, ny)) return false;
  var dx = (nx - 0.5) / 0.3;
  var dy = (ny - 0.52) / 0.42;
  return dx * dx + dy * dy <= 1;
}

function zoneBackSleeve(nx, ny) {
  var left = nx < 0.28 && ny > 0.1 && ny < 0.5;
  var right = nx > 0.72 && ny > 0.1 && ny < 0.5;
  return left || right;
}

function zonePantsBody(nx, ny) {
  if (zonePantsStripe(nx, ny)) return false;
  return nx > 0.22 && nx < 0.78 && ny > 0.08 && ny < 0.92;
}

function zonePantsStripe(nx, ny) {
  var leftStripe = nx > 0.22 && nx < 0.3 && ny > 0.15 && ny < 0.88;
  var rightStripe = nx > 0.7 && nx < 0.78 && ny > 0.15 && ny < 0.88;
  return leftStripe || rightStripe;
}

async function buildMasksFromBase(basePath, view) {
  var { data, info } = await sharp(basePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var bounds = await findGarmentBounds(data, info);
  var w = info.width;
  var h = info.height;
  var body = Buffer.alloc(w * h);
  var sleeve = Buffer.alloc(w * h);
  var collar = Buffer.alloc(w * h);

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * info.channels;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var p = y * w + x;

      if (!isFabric(r, g, b) || isBackground(r, g, b, x, y, w, h)) continue;

      var n = norm(x, y, bounds);
      if (view === "front") {
        if (zoneFrontCollar(n.nx, n.ny)) collar[p] = 255;
        else if (zoneFrontSleeve(n.nx, n.ny)) sleeve[p] = 255;
        else if (zoneFrontBody(n.nx, n.ny)) body[p] = 255;
      } else {
        if (zoneBackSleeve(n.nx, n.ny)) sleeve[p] = 255;
        else if (zoneBackBody(n.nx, n.ny)) body[p] = 255;
      }
    }
  }

  async function toAlphaPng(buf) {
    var rgba = Buffer.alloc(w * h * 4);
    for (var j = 0; j < w * h; j++) {
      var o = j * 4;
      rgba[o] = 255;
      rgba[o + 1] = 255;
      rgba[o + 2] = 255;
      rgba[o + 3] = buf[j];
    }
    return sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .blur(1.2)
      .png()
      .toBuffer();
  }

  return {
    body: await toAlphaPng(body),
    sleeve: await toAlphaPng(sleeve),
    collar: view === "front" ? await toAlphaPng(collar) : null,
  };
}

async function buildPantsMasksFromBase(basePath, view) {
  var { data, info } = await sharp(basePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var bounds = await findGarmentBounds(data, info);
  var w = info.width;
  var h = info.height;
  var pants = Buffer.alloc(w * h);
  var stripe = Buffer.alloc(w * h);

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * info.channels;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var p = y * w + x;

      if (!isFabric(r, g, b) || isBackground(r, g, b, x, y, w, h)) continue;

      var n = norm(x, y, bounds);
      if (zonePantsStripe(n.nx, n.ny)) stripe[p] = 255;
      else if (zonePantsBody(n.nx, n.ny)) pants[p] = 255;
    }
  }

  async function toAlphaPng(buf) {
    var rgba = Buffer.alloc(w * h * 4);
    for (var j = 0; j < w * h; j++) {
      var o = j * 4;
      rgba[o] = 255;
      rgba[o + 1] = 255;
      rgba[o + 2] = 255;
      rgba[o + 3] = buf[j];
    }
    return sharp(rgba, { raw: { width: w, height: h, channels: 4 } })
      .blur(1.2)
      .png()
      .toBuffer();
  }

  var stripeMask = view === "front" ? await toAlphaPng(stripe) : null;

  return {
    pants: await toAlphaPng(pants),
    pants_stripe: stripeMask,
  };
}

module.exports = { buildMasksFromBase, buildPantsMasksFromBase, lum };
