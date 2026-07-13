#!/usr/bin/env node
/**
 * Builds the header logo (black-background use) from a newly supplied
 * reference (rs-logo-header-source.jpg): ROSALES and Sport both drawn white
 * fill / black outline, exported over a checkerboard "transparency" preview
 * pattern (16px cells, ~255 light / ~198 dark) instead of real alpha - a
 * flattened JPEG export. This removes that checkerboard using its known,
 * position-based pattern (not just color matching, since white fill content
 * is the same color as the light checker cells) and restores real alpha.
 */
const path = require("path");
const sharp = require("sharp");

const ROOT = path.join(__dirname, "..");
const ASSETS = path.join(ROOT, "demo", "assets");
const SOURCE = path.join(ASSETS, "rs-logo-header-source.jpg");
const OUT_HEADER = path.join(ASSETS, "rs-logo.png");
const PAD = 48;

const BLACK_CEILING = 95;

function isGrayscale(r, g, b) {
  return Math.max(r, g, b) - Math.min(r, g, b) <= 12;
}

/**
 * Position-based checker prediction turned out unreliable: JPEG
 * recompression adds grid-aligned brightness ripple throughout the WHOLE
 * image (visible even inside solid white fills), so nearly every pixel
 * matched the predicted 16px checker pattern - the flood was actually being
 * stopped correctly by the black outline everywhere, EXCEPT one quadrant
 * where the source export has plain solid white instead of the checker
 * pattern, which failed the strict position match and was left un-removed
 * (confirmed by rendering the raw candidate mask - see debug session).
 *
 * Since the black outline fully encloses every white/red content region,
 * a much simpler rule is both sufficient and safe: anything grayscale that
 * is not near-black (outline) is removable background, regardless of
 * whether the source behind it is checkered or solid. The outline itself
 * blocks the flood before it can ever reach interior white content.
 */
function isRemovableCandidate(data, width, x, y) {
  const p = (y * width + x) * 4;
  const r = data[p], g = data[p + 1], b = data[p + 2];
  if (!isGrayscale(r, g, b)) return false;
  return r > BLACK_CEILING;
}

function removeCheckerboard(data, width, height) {
  const total = width * height;
  const bg = new Uint8Array(total);
  const queue = [];
  function tryPush(x, y) {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const i = y * width + x;
    if (bg[i]) return;
    if (!isRemovableCandidate(data, width, x, y)) return;
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
      if (!isRemovableCandidate(data, width, nx, ny)) continue;
      bg[ni] = 1;
      queue.push(ni);
    }
  }
  for (let i = 0; i < total; i++) {
    if (!bg[i]) continue;
    data[i * 4 + 3] = 0;
  }
  return bg;
}

/**
 * Letter counters (the enclosed holes in "o", "p", "S", etc.) are
 * topologically isolated from the image border, so the border-seeded flood
 * above can never reach them - they're left showing the original checker/
 * solid-white fill. Any pixel still opaque after that pass which is itself
 * a removable-candidate color must belong to one of these enclosed pockets
 * (by construction, everything border-reachable was already cleared), so
 * flood-fill each one from where it stands instead of from the border. This
 * stays safely contained by the same black outline ring that encloses it.
 *
 * Crucially, the letter/ball FILL itself is also fully enclosed by the
 * outline and matches the same candidate color test, so it survives step 1
 * too - clearing every remaining candidate component indiscriminately wiped
 * the whole logo down to bare outlines (confirmed in debug run). Measured
 * component sizes showed a clean gap: real fill chunks were all >= 9163px,
 * genuine holes/counters were all <= 3013px. Only clear components under
 * this threshold.
 */
const ENCLOSED_HOLE_MAX_SIZE = 5000;

function removeEnclosedHoles(data, width, height) {
  const total = width * height;
  const visited = new Uint8Array(total);
  for (let start = 0; start < total; start++) {
    if (visited[start]) continue;
    if (data[start * 4 + 3] === 0) continue;
    if (!isRemovableCandidate(data, width, start % width, Math.floor(start / width))) continue;
    const component = [start];
    visited[start] = 1;
    let head = 0;
    while (head < component.length) {
      const i = component[head++];
      const x = i % width;
      const y = (i - x) / width;
      for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
        if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
        const ni = ny * width + nx;
        if (visited[ni] || data[ni * 4 + 3] === 0) continue;
        if (!isRemovableCandidate(data, width, nx, ny)) continue;
        visited[ni] = 1;
        component.push(ni);
      }
    }
    if (component.length <= ENCLOSED_HOLE_MAX_SIZE) {
      for (const i of component) data[i * 4 + 3] = 0;
    }
  }
}

/** JPEG re-compression softens the checker/content boundary into a band of
 * in-between gray pixels that neither match the checker prediction nor read
 * as solid content. Flood further from pixels we now know are transparent
 * into any remaining low-alpha-looking gray neighbor within a tighter band,
 * so no halo of stray gray survives around the letterforms. */
function cleanupFringe(data, width, height) {
  const total = width * height;
  const queue = [];
  for (let i = 0; i < total; i++) if (data[i * 4 + 3] === 0) queue.push(i);
  while (queue.length) {
    const i = queue.pop();
    const x = i % width;
    const y = (i - x) / width;
    for (const [nx, ny] of [[x - 1, y], [x + 1, y], [x, y - 1], [x, y + 1]]) {
      if (nx < 0 || ny < 0 || nx >= width || ny >= height) continue;
      const ni = ny * width + nx;
      const np = ni * 4;
      if (data[np + 3] === 0) continue;
      const r = data[np], g = data[np + 1], b = data[np + 2];
      if (!isGrayscale(r, g, b)) continue;
      // Only mid-gray fringe (neither near-black outline nor near-white fill).
      if (r <= 90 || r >= 235) continue;
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

async function main() {
  const { data, info } = await sharp(SOURCE).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const width = info.width, height = info.height;
  const buf = Buffer.from(data);

  removeCheckerboard(buf, width, height);
  removeEnclosedHoles(buf, width, height);
  cleanupFringe(buf, width, height);
  removeSpeckle(buf, width, height, 20);

  const padded = addPadding(buf, width, height, PAD);
  await sharp(padded.data, { raw: { width: padded.width, height: padded.height, channels: 4 } })
    .png()
    .toFile(OUT_HEADER);

  const meta = await sharp(OUT_HEADER).metadata();
  console.log("Source:", SOURCE, `${width}x${height}`);
  console.log("Header (from new reference):", OUT_HEADER, `${meta.width}x${meta.height}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
