#!/usr/bin/env node
/**
 * Shared offline jersey zone tint for variant bank and catalog compose.
 */
const sharp = require("sharp");
const { buildMasksFromBase } = require("./mockup-mask-builder");

function hexToRgb(hex) {
  var h = String(hex).replace("#", "").toUpperCase();
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
  var t = strength || 0.92;

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

async function composeJerseyVariant(basePath, view, zoneColors, masksDir) {
  var base = await sharp(basePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  var masks;

  if (masksDir) {
    var fs = require("fs");
    var path = require("path");
    masks = {
      body: await sharp(path.join(masksDir, "front-mask-body.png")).toBuffer(),
      sleeve: await sharp(path.join(masksDir, view === "front" ? "front-mask-sleeve.png" : "back-mask-sleeve.png")).toBuffer(),
      collar: view === "front" && fs.existsSync(path.join(masksDir, "front-mask-collar.png"))
        ? await sharp(path.join(masksDir, "front-mask-collar.png")).toBuffer()
        : null,
    };
    if (view === "back") {
      masks.body = await sharp(path.join(masksDir, "back-mask-body.png")).toBuffer();
    }
  } else {
    masks = await buildMasksFromBase(basePath, view);
  }
  var out = Buffer.from(base.data);
  var baseRef = { data: out, info: base.info };

  if (zoneColors.body && masks.body) {
    out = await applyZoneTint(baseRef, masks.body, hexToRgb(zoneColors.body));
    baseRef.data = out;
  }
  if (zoneColors.sleeve && masks.sleeve) {
    out = await applyZoneTint(baseRef, masks.sleeve, hexToRgb(zoneColors.sleeve));
    baseRef.data = out;
  }
  if (zoneColors.collar && masks.collar) {
    out = await applyZoneTint(baseRef, masks.collar, hexToRgb(zoneColors.collar));
    baseRef.data = out;
  }

  return sharp(out, { raw: { width: base.info.width, height: base.info.height, channels: 4 } }).png().toBuffer();
}

module.exports = { composeJerseyVariant, hexToRgb };
