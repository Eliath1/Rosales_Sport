#!/usr/bin/env node
/**
 * Builds the header logo (black-background use) from the same pristine
 * original artwork as the hero variant (rs-logo-full.png), instead of the
 * old black-background source pipeline, which thinned ROSALES's bold outline
 * down to a hairline (the flood fill couldn't tell the outline's black apart
 * from the black background). Building from the light-background original
 * keeps the outline at full thickness for both variants; only "Sport" needs
 * to differ (white here, black on the hero).
 */
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "demo", "assets");
const SOURCE = path.join(ASSETS, "rs-logo-full.png");
const OUT_HEADER = path.join(ASSETS, "rs-logo.png");
const PAD = 48;

const EXCLUSION_DILATE = 6;
const SPORT_Y_FLOOR = 300;
const MIN_COMPONENT_SIZE = 40;
const GAP_CLOSE_RADIUS = 2;

function isWhiteish(r, g, b, a) {
  if (a < 20) return false;
  return Math.min(r, g, b) >= 251;
}

function isRedPixel(r, g, b, a) {
  if (a < 20) return false;
  return r >= 150 && g <= 90 && b <= 90 && r > g + 30;
}

function isBlackish(r, g, b, a) {
  if (a < 20) return false;
  return Math.max(r, g, b) <= 60;
}

function isBackgroundGray(r, g, b, a) {
  if (a < 20) return false;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  return min >= 220 && max - min <= 15;
}

function dilateBox(mask, width, height, radius) {
  const tmp = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);
  for (let y = 0; y < height; y++) {
    const row = y * width;
    let count = 0;
    for (let x = -radius; x < width; x++) {
      const addX = x + radius;
      if (addX < width && mask[row + addX]) count++;
      const removeX = x - radius - 1;
      if (removeX >= 0 && mask[row + removeX]) count--;
      if (x >= 0) tmp[row + x] = count > 0 ? 1 : 0;
    }
  }
  for (let x = 0; x < width; x++) {
    let count = 0;
    for (let y = -radius; y < height; y++) {
      const addY = y + radius;
      if (addY < height && tmp[addY * width + x]) count++;
      const removeY = y - radius - 1;
      if (removeY >= 0 && tmp[removeY * width + x]) count--;
      if (y >= 0) out[y * width + x] = count > 0 ? 1 : 0;
    }
  }
  return out;
}

function erodeBox(mask, width, height, radius) {
  const inverted = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) inverted[i] = mask[i] ? 0 : 1;
  const dilatedInverted = dilateBox(inverted, width, height, radius);
  const out = new Uint8Array(width * height);
  for (let i = 0; i < mask.length; i++) out[i] = dilatedInverted[i] ? 0 : 1;
  return out;
}

function closeMask(mask, width, height, radius) {
  return erodeBox(dilateBox(mask, width, height, radius), width, height, radius);
}

function filterComponents(mask, width, height, keepFn) {
  const visited = new Uint8Array(width * height);
  const out = new Uint8Array(width * height);
  const stack = [];
  for (let start = 0; start < width * height; start++) {
    if (!mask[start] || visited[start]) continue;
    const component = [start];
    visited[start] = 1;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop();
      const x = i % width;
      const y = (i - x) / width;
      for (const [nx, ny] of [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || !mask[ni]) continue;
        visited[ni] = 1;
        stack.push(ni);
        component.push(ni);
      }
    }
    if (keepFn(component)) {
      for (const i of component) out[i] = 1;
    }
  }
  return out;
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

function isRemovableBackground(data, width, height, x, y) {
  const p = (y * width + x) * 4;
  if (!isBackgroundGray(data[p], data[p + 1], data[p + 2], data[p + 3])) return false;
  return !touchesLogoContent(data, width, height, x, y);
}

function removeGrayBackground(data, width, height) {
  const original = Buffer.from(data);
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = [];
  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (bg[i]) return;
    if (!isRemovableBackground(original, width, height, x, y)) return;
    bg[i] = 1;
    queue.push(i);
  }
  for (let x = 0; x < width; x++) { tryPush(x, 0); tryPush(x, height - 1); }
  for (let y = 0; y < height; y++) { tryPush(0, y); tryPush(width - 1, y); }
  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i - x) / width;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      if (bg[ni]) continue;
      if (!isRemovableBackground(original, width, height, nx, ny)) continue;
      bg[ni] = 1;
      queue.push(ni);
    }
  }
  for (let i = 0; i < total; i++) {
    if (!bg[i]) continue;
    data[i * 4 + 3] = 0;
  }
}

/**
 * Second-pass cleanup: the border-seeded flood fill in removeGrayBackground
 * can get blocked by isolated anti-aliased pixels near the red stitching,
 * stranding small pockets of background-gray pixels against the dome's
 * black outline (a jagged white speckle band). Flood inward from pixels we
 * already know are transparent instead of only from the image border; any
 * opaque neighbor that is still background-gray-colored gets cleared too.
 * Safe against eroding real content because the black outline (fails
 * isBackgroundGray) blocks the flood before it reaches interior white/red.
 */
function cleanupResidualBackground(data, width, height) {
  const total = width * height;
  const queue = [];
  for (let i = 0; i < total; i++) {
    if (data[i * 4 + 3] === 0) queue.push(i);
  }
  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i - x) / width;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      const np = ni * 4;
      if (data[np + 3] === 0) continue;
      if (!isBackgroundGray(data[np], data[np + 1], data[np + 2], data[np + 3])) continue;
      data[np + 3] = 0;
      queue.push(ni);
    }
  }
}

function removeSpeckle(data, width, height, minSize) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) if (data[i * 4 + 3] > 40) mask[i] = 1;
  const visited = new Uint8Array(width * height);
  const stack = [];
  for (let start = 0; start < width * height; start++) {
    if (!mask[start] || visited[start]) continue;
    const component = [start];
    visited[start] = 1;
    stack.push(start);
    while (stack.length) {
      const i = stack.pop();
      const x = i % width;
      const y = (i - x) / width;
      for (const [nx, ny] of [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
      ]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || !mask[ni]) continue;
        visited[ni] = 1;
        stack.push(ni);
        component.push(ni);
      }
    }
    if (component.length < minSize) for (const i of component) data[i * 4 + 3] = 0;
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
      out[dp] = data[sp]; out[dp + 1] = data[sp + 1]; out[dp + 2] = data[sp + 2]; out[dp + 3] = data[sp + 3];
    }
  }
  return { data: out, width: nw, height: nh };
}

async function blurMask(mask, width, height, sigma) {
  const gray = Buffer.alloc(width * height);
  for (let i = 0; i < mask.length; i++) gray[i] = mask[i] ? 255 : 0;
  return sharp(gray, { raw: { width, height, channels: 1 } }).blur(sigma).toColourspace("b-w").raw().toBuffer();
}

async function main() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width, height = info.height;
  const original = Buffer.from(data);

  // Sport mask, fully self-contained from the original artwork: find whiteish
  // components reaching above y=400 (ROSALES/dome), dilate to build the
  // exclusion zone, then isolate the black Sport+bat shape outside of it.
  const whiteishRaw = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    if (isWhiteish(original[p], original[p + 1], original[p + 2], original[p + 3])) whiteishRaw[i] = 1;
  }
  const rosalesWhiteish = filterComponents(whiteishRaw, width, height, (c) => c.some((i) => Math.floor(i / width) < 400));
  const exclusionSeed = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    if (rosalesWhiteish[i] || isRedPixel(original[p], original[p + 1], original[p + 2], original[p + 3])) exclusionSeed[i] = 1;
  }
  const exclusionZone = dilateBox(exclusionSeed, width, height, EXCLUSION_DILATE);

  const sportSeed = new Uint8Array(width * height);
  for (let y = SPORT_Y_FLOOR; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = y * width + x;
      if (exclusionZone[i]) continue;
      const p = i * 4;
      if (isBlackish(original[p], original[p + 1], original[p + 2], original[p + 3])) sportSeed[i] = 1;
    }
  }
  const sportRaw = filterComponents(sportSeed, width, height, (c) => c.length >= MIN_COMPONENT_SIZE);
  // Close only pixel-scale gaps left where the ROSALES exclusion zone clipped
  // Sport pixels (e.g. where the script's ascenders pass near the SALES
  // baseline). A small radius here avoids the shape distortion a wider
  // dilate/outline pass caused on this thin cursive script.
  const sportMask = closeMask(sportRaw, width, height, GAP_CLOSE_RADIUS);
  console.log("Sport mask pixel count:", sportMask.reduce((a, v) => a + v, 0));

  // Clean transparent base (thick ROSALES outline preserved, Sport still
  // black for now).
  const buf = Buffer.from(original);
  removeGrayBackground(buf, width, height);
  cleanupResidualBackground(buf, width, height);
  removeSpeckle(buf, width, height, 20);

  // Recolor Sport to solid white, 1:1 with the original silhouette. No
  // separate outline stroke: on the black header background a black outline
  // would be invisible anyway, and dilating one distorted the thin script.
  const fillAlpha = await blurMask(sportMask, width, height, 0.7);
  for (let i = 0; i < width * height; i++) {
    const p = i * 4;
    const fa = fillAlpha[i];
    if (fa > 0) {
      const a = fa / 255;
      buf[p] = Math.round(buf[p] * (1 - a) + 255 * a);
      buf[p + 1] = Math.round(buf[p + 1] * (1 - a) + 255 * a);
      buf[p + 2] = Math.round(buf[p + 2] * (1 - a) + 255 * a);
      buf[p + 3] = Math.max(buf[p + 3], fa);
    }
  }

  const padded = addPadding(buf, width, height, PAD);
  await sharp(padded.data, { raw: { width: padded.width, height: padded.height, channels: 4 } }).png().toFile(OUT_HEADER);

  const meta = await sharp(OUT_HEADER).metadata();
  console.log("Header (from original, Sport white):", OUT_HEADER, `${meta.width}x${meta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
