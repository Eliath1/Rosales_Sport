#!/usr/bin/env node
/**
 * Rosales Sport logo from rs-logo-source.png (black background master).
 * Removes outer black only; keeps white ROSALES, red baseball, black Sport script.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "demo", "assets");

function argValue(flag, fallback) {
  const arg = process.argv.find((a) => a.startsWith(`--${flag}=`));
  return arg ? arg.slice(flag.length + 3) : fallback;
}

const SOURCE = path.resolve(argValue("source", path.join(ASSETS, "rs-logo-source.png")));
const OUT_HEADER = path.resolve(argValue("out-header", path.join(ASSETS, "rs-logo.png")));
const OUT_HERO = path.resolve(argValue("out-hero", path.join(ASSETS, "rs-logo-hero.png")));
const PAD = 48;

function isBlackish(r, g, b, a) {
  if (a < 20) return false;
  return Math.max(r, g, b) <= 40;
}

function isWhiteish(r, g, b, a) {
  if (a < 20) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (min >= 200 && max - min <= 50) return true;
  if (max >= 235 && max - min <= 65) return true;
  return false;
}

function isRedPixel(r, g, b, a) {
  if (a < 20) return false;
  return r >= 150 && g <= 90 && b <= 90 && r > g + 30;
}

function touchesLogoContent(data, width, height, x, y) {
  for (let dy = -1; dy <= 1; dy++) {
    for (let dx = -1; dx <= 1; dx++) {
      if (!dx && !dy) continue;
      const nx = x + dx;
      const ny = y + dy;
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const np = (ny * width + nx) * 4;
      if (isWhiteish(data[np], data[np + 1], data[np + 2], data[np + 3])) return true;
      if (isRedPixel(data[np], data[np + 1], data[np + 2], data[np + 3])) return true;
    }
  }
  return false;
}

function isBackgroundBlack(data, width, height, x, y) {
  const p = (y * width + x) * 4;
  if (!isBlackish(data[p], data[p + 1], data[p + 2], data[p + 3])) return false;
  return !touchesLogoContent(data, width, height, x, y);
}

function removeBlackBackground(data, width, height) {
  const original = Buffer.from(data);
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = [];

  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (bg[i]) return;
    if (!isBackgroundBlack(original, width, height, x, y)) return;
    bg[i] = 1;
    queue.push(i);
  }

  for (let x = 0; x < width; x++) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i - x) / width;
    for (const [nx, ny] of [
      [x - 1, y],
      [x + 1, y],
      [x, y - 1],
      [x, y + 1],
    ]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (bg[ni]) continue;
      const np = ni * 4;
      if (!isBackgroundBlack(original, width, height, nx, ny)) continue;
      bg[ni] = 1;
      queue.push(ni);
    }
  }

  for (let i = 0; i < total; i++) {
    if (!bg[i]) continue;
    const p = i * 4;
    data[p + 3] = 0;
  }
}

function addPadding(data, width, height, pad) {
  const nw = width + pad * 2;
  const nh = height + pad * 2;
  const out = Buffer.alloc(nw * nh * 4);
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const sp = (y * width + x) * 4;
      const dp = ((y + pad) * nw + (x + pad)) * 4;
      out[dp] = data[sp];
      out[dp + 1] = data[sp + 1];
      out[dp + 2] = data[sp + 2];
      out[dp + 3] = data[sp + 3];
    }
  }
  return { data: out, width: nw, height: nh };
}

async function buildFromSource() {
  const { data, info } = await sharp(SOURCE)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  const buf = Buffer.from(data);
  removeBlackBackground(buf, info.width, info.height);

  const padded = addPadding(buf, info.width, info.height, PAD);
  return sharp(padded.data, {
    raw: { width: padded.width, height: padded.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

async function writePngFile(buf, target) {
  const tmp = target + ".tmp";
  fs.writeFileSync(tmp, buf);
  try {
    if (fs.existsSync(target)) fs.unlinkSync(target);
  } catch (_) {}
  fs.copyFileSync(tmp, target);
  fs.unlinkSync(tmp);
}

async function main() {
  if (!fs.existsSync(SOURCE)) {
    console.error("Missing source:", SOURCE);
    process.exit(1);
  }

  const logoPng = await buildFromSource();

  await writePngFile(logoPng, OUT_HEADER);
  await writePngFile(logoPng, OUT_HERO);

  const headerMeta = await sharp(OUT_HEADER).metadata();
  const heroMeta = await sharp(OUT_HERO).metadata();
  console.log("Source:", SOURCE);
  console.log("Header:", OUT_HEADER, `${headerMeta.width}x${headerMeta.height}`);
  console.log("Hero:", OUT_HERO, `${heroMeta.width}x${heroMeta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
