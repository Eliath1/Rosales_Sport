#!/usr/bin/env node
/**
 * Copy mockup source PNGs from demo/assets/mockups into images/ when missing.
 * See docs/architecture/mockup-asset-pipeline.md
 */
const fs = require("fs");
const path = require("path");

const REPO = path.join(__dirname, "..");
const IMAGES = path.join(REPO, "images");

var COPIES = [
  {
    dest: "mockup-classic-front-base.png",
    src: path.join(REPO, "demo", "assets", "mockups", "classic-button", "source", "mockup-classic-front-base.png"),
    fallback: path.join(REPO, "demo", "assets", "mockups", "classic-button", "front-base.png"),
  },
  {
    dest: "mockup-classic-back-base.png",
    src: path.join(REPO, "demo", "assets", "mockups", "classic-button", "source", "mockup-classic-back-base.png"),
    fallback: path.join(REPO, "demo", "assets", "mockups", "classic-button", "back-base.png"),
  },
  {
    dest: "mockup-pants-front-base.png",
    src: path.join(REPO, "demo", "assets", "mockups", "pants-classic", "source", "Gemini_Generated_Image_rir9werir9werir9.png"),
    fallback: path.join(REPO, "demo", "assets", "mockups", "pants-classic", "front-base.png"),
  },
  {
    dest: "mockup-pants-back-base.png",
    src: path.join(REPO, "demo", "assets", "mockups", "pants-classic", "source", "Gemini_Generated_Image_6hdxyd6hdxyd6hdx.png"),
    fallback: path.join(REPO, "demo", "assets", "mockups", "pants-classic", "back-base.png"),
  },
];

function copyOne(entry) {
  var destPath = path.join(IMAGES, entry.dest);
  if (fs.existsSync(destPath)) {
    console.log("[skip]", entry.dest, "(already in images/)");
    return;
  }
  var src = fs.existsSync(entry.src) ? entry.src : entry.fallback;
  if (!fs.existsSync(src)) {
    console.warn("[warn] Missing source for", entry.dest, ":", src);
    return;
  }
  fs.mkdirSync(IMAGES, { recursive: true });
  fs.copyFileSync(src, destPath);
  console.log("[bootstrap]", entry.dest, "<-", path.relative(REPO, src));
}

function main() {
  COPIES.forEach(copyOne);
  console.log("\nBootstrap complete. Run: npm run demo:assets:sync");
}

main();
