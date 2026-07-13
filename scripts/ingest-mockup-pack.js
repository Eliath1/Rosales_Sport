#!/usr/bin/env node
/**
 * Ingest RS photographer mockup pack into demo/assets/mockups/{slug}/.
 * Validates file names and dimensions per docs/specs/uniform-mockup-asset-brief-photographer.md
 */
const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const REPO = path.join(__dirname, "..");
const SLUG = process.env.MOCKUP_SLUG || "classic-button";
const SRC =
  process.env.MOCKUP_SRC ||
  path.join(REPO, "incoming", "mockup-packs", SLUG);
const OUT = path.join(REPO, "demo", "assets", "mockups", SLUG);

const REQUIRED = [
  "front-base.png",
  "back-base.png",
  "front-mask-body.png",
  "front-mask-sleeve.png",
  "front-mask-collar.png",
  "back-mask-body.png",
  "back-mask-sleeve.png",
  "front-shadow.png",
  "back-shadow.png",
];

const OPTIONAL = ["placement.json", "README.txt"];

async function imageSize(filePath) {
  var meta = await sharp(filePath).metadata();
  return { width: meta.width, height: meta.height };
}

function fail(msg) {
  console.error("INGEST FAILED:", msg);
  process.exit(1);
}

async function main() {
  if (!fs.existsSync(SRC)) {
    fail(
      "Source folder not found: " +
        SRC +
        "\nDrop your pack at incoming/mockup-packs/" +
        SLUG +
        "/ or set MOCKUP_SRC."
    );
  }

  var missing = REQUIRED.filter(function (name) {
    return !fs.existsSync(path.join(SRC, name));
  });
  if (missing.length) {
    fail("Missing required files in " + SRC + ":\n  - " + missing.join("\n  - "));
  }

  var frontBase = path.join(SRC, "front-base.png");
  var backBase = path.join(SRC, "back-base.png");
  var frontSize = await imageSize(frontBase);
  var backSize = await imageSize(backBase);

  if (frontSize.width !== backSize.width || frontSize.height !== backSize.height) {
    fail(
      "front-base and back-base must match dimensions. Got front " +
        frontSize.width +
        "x" +
        frontSize.height +
        " vs back " +
        backSize.width +
        "x" +
        backSize.height
    );
  }

  var longSide = Math.max(frontSize.width, frontSize.height);
  if (longSide < 2000) {
    console.warn(
      "WARN: long side is " +
        longSide +
        "px (brief recommends >= 2000). Ingesting anyway."
    );
  }

  for (var i = 0; i < REQUIRED.length; i++) {
    var name = REQUIRED[i];
    if (name.indexOf("-base.png") === -1 && name.indexOf("placement") === -1) {
      var maskPath = path.join(SRC, name);
      var maskSize = await imageSize(maskPath);
      var expectW = name.indexOf("front-") === 0 ? frontSize.width : backSize.width;
      var expectH = name.indexOf("front-") === 0 ? frontSize.height : backSize.height;
      if (maskSize.width !== expectW || maskSize.height !== expectH) {
        fail(
          name +
            " must be " +
            expectW +
            "x" +
            expectH +
            " but is " +
            maskSize.width +
            "x" +
            maskSize.height
        );
      }
    }
  }

  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(OUT, "source"), { recursive: true });

  for (var j = 0; j < REQUIRED.length; j++) {
    var req = REQUIRED[j];
    fs.copyFileSync(path.join(SRC, req), path.join(OUT, req));
    console.log("Copied", req);
  }

  OPTIONAL.forEach(function (opt) {
    var optPath = path.join(SRC, opt);
    if (fs.existsSync(optPath)) {
      fs.copyFileSync(optPath, path.join(OUT, opt));
      console.log("Copied", opt);
    }
  });

  var placementPath = path.join(OUT, "placement.json");
  var placement = {};
  if (fs.existsSync(placementPath)) {
    placement = JSON.parse(fs.readFileSync(placementPath, "utf8"));
  }

  placement.baseType = "rs-photo";
  placement.tintEnabled = true;
  placement.ingestedAt = new Date().toISOString();
  placement.sourceDimensions = { width: frontSize.width, height: frontSize.height };

  if (!placement.front) {
    placement.front = {
      chest_center: { x: 0.5, y: 0.42, maxW: 0.22, maxH: 0.12 },
    };
  }
  if (!placement.back) {
    placement.back = {
      number: { x: 0.5, y: 0.38, maxW: 0.28, maxH: 0.22 },
      name: { x: 0.5, y: 0.52, maxW: 0.55, maxH: 0.08 },
    };
  }

  fs.writeFileSync(placementPath, JSON.stringify(placement, null, 2));

  fs.writeFileSync(
    path.join(OUT, "SOURCE.txt"),
    [
      "RS photographer mockup pack - " + SLUG,
      "Ingested from: " + SRC,
      "Dimensions: " + frontSize.width + "x" + frontSize.height,
      "baseType: rs-photo (color tint enabled)",
      "Ingested: " + new Date().toISOString(),
    ].join("\n")
  );

  console.log("\nIngest OK:", OUT);
  console.log("Test: npm run demo -> http://localhost:3456/custom/uniform/builder.html");
}

main().catch(function (err) {
  fail(err.message || String(err));
});
