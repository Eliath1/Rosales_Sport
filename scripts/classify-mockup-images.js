#!/usr/bin/env node
/**
 * Classify Gemini mockup images by pixel analysis (not filename guessing).
 * Outputs images/mockup-manifest.json for review before ingest.
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const IMAGES = path.join(__dirname, "..", "images");
const OUT = path.join(IMAGES, "mockup-manifest.json");

function lum(r, g, b) {
  return 0.299 * r + 0.587 * g + 0.114 * b;
}

async function analyze(filePath) {
  var name = path.basename(filePath);
  var { data, info } = await sharp(filePath)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });

  var w = info.width;
  var h = info.height;
  var black = 0;
  var white = 0;
  var mid = 0;
  var sumLum = 0;
  var whitePixels = [];

  for (var y = 0; y < h; y++) {
    for (var x = 0; x < w; x++) {
      var i = (y * w + x) * info.channels;
      var r = data[i];
      var g = data[i + 1];
      var b = data[i + 2];
      var l = lum(r, g, b);
      sumLum += l;
      if (l < 25) black++;
      else if (l > 230) white++;
      else mid++;

      if (l > 200) whitePixels.push({ x: x / w, y: y / h });
    }
  }

  var total = w * h;
  var blackRatio = black / total;
  var whiteRatio = white / total;
  var midRatio = mid / total;
  var avgLum = sumLum / total;

  var isMask = blackRatio > 0.45 && whiteRatio > 0.02 && midRatio < 0.35;

  var cx = 0;
  var cy = 0;
  var minX = 1;
  var maxX = 0;
  var minY = 1;
  var maxY = 0;
  if (whitePixels.length) {
    whitePixels.forEach(function (p) {
      cx += p.x;
      cy += p.y;
      if (p.x < minX) minX = p.x;
      if (p.x > maxX) maxX = p.x;
      if (p.y < minY) minY = p.y;
      if (p.y > maxY) maxY = p.y;
    });
    cx /= whitePixels.length;
    cy /= whitePixels.length;
  }

  var boxW = maxX - minX;
  var boxH = maxY - minY;
  var whiteRatioOfBright = whitePixels.length / total;

  var maskRole = null;
  if (isMask) {
    var topWhite = whitePixels.filter(function (p) { return p.y < 0.25; }).length;
    var leftWhite = whitePixels.filter(function (p) { return p.x < 0.35; }).length;
    var rightWhite = whitePixels.filter(function (p) { return p.x > 0.65; }).length;
    var centerWhite = whitePixels.filter(function (p) { return p.x > 0.35 && p.x < 0.65; }).length;

    if (boxH > 0.45 && boxW > 0.25 && boxW < 0.55 && cy > 0.35) {
      maskRole = "body";
    } else if (leftWhite > 5000 && rightWhite > 5000 && centerWhite < leftWhite * 0.5) {
      maskRole = "sleeve";
    } else if (topWhite > 3000 && boxH < 0.5 && cy < 0.35) {
      maskRole = "collar";
    } else if (boxW > 0.2 && boxH > 0.5) {
      maskRole = "body";
    } else {
      maskRole = "unknown-mask";
    }
  }

  var photoRole = null;
  if (!isMask) {
    var centerCol = 0;
    for (var y2 = Math.floor(h * 0.25); y2 < Math.floor(h * 0.75); y2++) {
      var xi = (y2 * w + Math.floor(w * 0.5)) * info.channels;
      if (lum(data[xi], data[xi + 1], data[xi + 2]) < avgLum - 15) centerCol++;
    }
    var hasPlacket = centerCol > h * 0.15;
    photoRole = hasPlacket ? "front-base" : "back-base";
  }

  return {
    file: name,
    width: w,
    height: h,
    type: isMask ? "mask" : "photo",
    role: isMask ? maskRole : photoRole,
    stats: {
      blackRatio: Number(blackRatio.toFixed(3)),
      whiteRatio: Number(whiteRatio.toFixed(3)),
      midRatio: Number(midRatio.toFixed(3)),
      avgLum: Number(avgLum.toFixed(1)),
      whiteArea: Number(whiteRatioOfBright.toFixed(3)),
    },
    bbox: whitePixels.length
      ? { minX, maxX, minY, maxY, cx: Number(cx.toFixed(2)), cy: Number(cy.toFixed(2)) }
      : null,
  };
}

async function main() {
  if (!fs.existsSync(IMAGES)) {
    console.error("Missing folder:", IMAGES);
    process.exit(1);
  }

  var files = fs
    .readdirSync(IMAGES)
    .filter(function (f) {
      return /^Gemini.*\.(png|jpg|webp)$/i.test(f);
    });

  if (!files.length) {
    console.error("No Gemini images in", IMAGES);
    process.exit(1);
  }

  var results = [];
  for (var i = 0; i < files.length; i++) {
    results.push(await analyze(path.join(IMAGES, files[i])));
  }

  var pack = {
    generatedAt: new Date().toISOString(),
    sourceDir: IMAGES,
    files: results,
    proposed: {
      "classic-button": {},
    },
  };

  var photos = results.filter(function (r) { return r.type === "photo"; });
  var masks = results.filter(function (r) { return r.type === "mask"; });

  var front = photos.find(function (r) { return r.role === "front-base"; });
  var back = photos.find(function (r) { return r.role === "back-base"; });
  if (front) pack.proposed["classic-button"]["front-base.png"] = front.file;
  if (back) pack.proposed["classic-button"]["back-base.png"] = back.file;

  ["body", "sleeve", "collar"].forEach(function (zone) {
    var m = masks.find(function (r) { return r.role === zone; });
    if (m) pack.proposed["classic-button"]["front-mask-" + zone + ".png"] = m.file;
  });

  var backBody = masks.filter(function (r) { return r.role === "body"; });
  if (backBody.length > 1 && back) {
    pack.proposed["classic-button"]["back-mask-body.png"] = backBody[1].file;
  }
  var sleeveMasks = masks.filter(function (r) { return r.role === "sleeve"; });
  if (sleeveMasks.length > 1) {
    pack.proposed["classic-button"]["back-mask-sleeve.png"] = sleeveMasks[1].file;
  }

  fs.writeFileSync(OUT, JSON.stringify(pack, null, 2));

  console.log("Classified", results.length, "images ->", OUT);
  console.log("\nProposed classic-button pack:");
  Object.keys(pack.proposed["classic-button"]).forEach(function (k) {
    console.log(" ", k, "<-", pack.proposed["classic-button"][k]);
  });
  console.log("\nReview manifest, then: npm run demo:mockups:gemini");
}

main().catch(function (e) {
  console.error(e);
  process.exit(1);
});
