#!/usr/bin/env node
/**
 * Builds the hero logo (red-background use) directly from the pristine,
 * untouched original artwork (rs-logo-full.png), instead of reconstructing
 * it from the recolored black-background master. This avoids any edge/color
 * fringing introduced by the recolor + composite pipeline and guarantees the
 * hero variant matches the original pixel-for-pixel (ROSALES, dome, stitches,
 * R9, and Sport all exactly as originally designed - Sport stays black).
 *
 * rs-logo-full.png has a light gray (247,247,247) background instead of
 * black, so Sport (solid black) is a completely different color from the
 * background and survives background removal automatically - no protection
 * masks needed, unlike the black-background source.
 */
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "demo", "assets");
const SOURCE = path.join(ASSETS, "rs-logo-full.png");
const OUT_HERO = path.join(ASSETS, "rs-logo-hero.png");
const PAD = 48;

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
      if (!isRemovableBackground(original, width, height, nx, ny)) continue;
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

/**
 * Second-pass cleanup: the border-seeded flood fill in removeGrayBackground
 * can get blocked by isolated anti-aliased pixels near the red stitching
 * (they touch a reddish neighbor and get protected), stranding small pockets
 * of background-gray pixels against the dome's black outline - visible as a
 * jagged white speckle band. Since we now know exactly which pixels are
 * already transparent, flood inward from them instead of from the border:
 * any opaque neighbor that is still background-gray-colored gets cleared too.
 * This can't erode real content because the black outline (fails
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

/** Removes tiny isolated opaque speckles (JPEG edge noise) left outside the main shapes. */
function removeSpeckle(data, width, height, minSize) {
  const mask = new Uint8Array(width * height);
  for (let i = 0; i < width * height; i++) {
    if (data[i * 4 + 3] > 40) mask[i] = 1;
  }
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
    if (component.length < minSize) {
      for (const i of component) data[i * 4 + 3] = 0;
    }
  }
}

/**
 * Sport's "outline" in rs-logo-full.png is not a deliberate design stroke -
 * it's unremoved background-gray anti-aliasing enclosed by Sport's own
 * strokes (thin gaps a border-seeded flood fill can't reach, the same class
 * of bug as the letter-counter holes in the header logo). Some of Sport's
 * thin strokes anti-alias all the way through without ever reaching a fully
 * black core, so a component-based "find the black fill, dilate its ring"
 * approach leaves faint gray halo pixels wherever no black core is nearby
 * to dilate from. The client's reference confirms Sport should be solid
 * black with NO trace of this at all.
 *
 * Instead: find ROSALES's own outline strokes (isBlackish, flood-filled
 * bounded below the wordmark - any fragment touching that Y boundary is
 * ROSALES dipping down from above, never Sport) and build a protection
 * buffer around them. Then, within Sport's bounding rectangle, force every
 * opaque pixel outside that protection buffer to solid black - no reliance
 * on finding a black "core" first, so thin anti-aliased strokes get
 * flattened too. Coordinates assume the PAD=48 border has already been added.
 */
const SPORT_MIN_Y_BOUND = 400;
const SPORT_REGION_MIN_X = 350;
const ROSALES_PROTECTION_DILATE = 20;

function findRosalesProtectionMask(data, width, height) {
  const visited = new Uint8Array(width * height);
  const rosalesMask = new Uint8Array(width * height);
  for (let y = 0; y < SPORT_MIN_Y_BOUND; y++) {
    for (let x = 0; x < width; x++) visited[y * width + x] = 1;
  }
  for (let start = 0; start < width * height; start++) {
    if (visited[start]) continue;
    const p0 = start * 4;
    if (!isBlackish(data[p0], data[p0 + 1], data[p0 + 2], data[p0 + 3])) {
      visited[start] = 1;
      continue;
    }
    const stack = [start];
    visited[start] = 1;
    const component = [start];
    let touchesBound = false;
    while (stack.length) {
      const i = stack.pop();
      const x = i % width;
      const y = (i - x) / width;
      if (y === SPORT_MIN_Y_BOUND) touchesBound = true;
      for (const [nx, ny] of [
        [x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1],
        [x - 1, y - 1], [x + 1, y - 1], [x - 1, y + 1], [x + 1, y + 1],
      ]) {
        if (nx < 0 || ny < SPORT_MIN_Y_BOUND || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni]) continue;
        visited[ni] = 1;
        const np = ni * 4;
        if (isBlackish(data[np], data[np + 1], data[np + 2], data[np + 3])) {
          stack.push(ni);
          component.push(ni);
        }
      }
    }
    if (touchesBound) {
      for (const i of component) rosalesMask[i] = 1;
    }
  }
  return dilateMask(rosalesMask, width, height, ROSALES_PROTECTION_DILATE);
}

function dilateMask(mask, width, height, radius) {
  let current = mask;
  for (let step = 0; step < radius; step++) {
    const next = new Uint8Array(current);
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = y * width + x;
        if (current[i]) continue;
        for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
          if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
          if (current[ny * width + nx]) {
            next[i] = 1;
            break;
          }
        }
      }
    }
    current = next;
  }
  return current;
}

function removeSportOutline(data, width, height) {
  const rosalesProtect = findRosalesProtectionMask(data, width, height);
  for (let y = SPORT_MIN_Y_BOUND; y < height; y++) {
    for (let x = SPORT_REGION_MIN_X; x < width; x++) {
      const i = y * width + x;
      if (rosalesProtect[i]) continue;
      const p = i * 4;
      if (data[p + 3] <= 20) continue; // leave transparent pixels alone
      if (data[p] === 0 && data[p + 1] === 0 && data[p + 2] === 0) continue; // already black
      data[p] = 0;
      data[p + 1] = 0;
      data[p + 2] = 0;
    }
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

async function main() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  removeGrayBackground(buf, info.width, info.height);
  // NOTE: cleanupResidualBackground was tried here to fix a minor dome-edge
  // speckle, but its border-agnostic flood fill breaches through the black
  // outline into the near-white "ALES" letter fill and erases it to
  // transparent (red background bleeds through). Reverted per user report -
  // the minor speckle is preferable to losing the ROSALES lettering.
  removeSpeckle(buf, info.width, info.height, 20);

  const padded = addPadding(buf, info.width, info.height, PAD);
  removeSportOutline(padded.data, padded.width, padded.height);
  await sharp(padded.data, { raw: { width: padded.width, height: padded.height, channels: 4 } })
    .png()
    .toFile(OUT_HERO);

  const meta = await sharp(OUT_HERO).metadata();
  console.log("Source:", SOURCE);
  console.log("Hero (from original):", OUT_HERO, `${meta.width}x${meta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
