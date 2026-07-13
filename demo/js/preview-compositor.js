/**
 * Jersey preview compositor (demo).
 * Layered PNG packs in /assets/mockups/{slug}/ when present; else photo approx.
 */
(function () {
  "use strict";

  var imageCache = {};
  var packProbeCache = {};
  var packMetaCache = {};

  var TEMPLATE_PHOTOS = {
    "classic-button": "/images/jersey1.webp",
    "pro-pinstripe": "/images/jersey5.jpg",
    "mexico-stars": "/images/jersey2.jpg",
    "pants-classic": "/images/jersey3.webp",
  };

  var MOCKUP_PACKS = {
    "classic-button": {
      zones: {
        front: ["body", "sleeve", "collar"],
        back: ["body", "sleeve"],
      },
      files: {
        front: {
          base: "front-base.png",
          shadow: "front-shadow.png",
          masks: {
            body: "front-mask-body.png",
            sleeve: "front-mask-sleeve.png",
            collar: "front-mask-collar.png",
          },
        },
        back: {
          base: "back-base.png",
          shadow: "back-shadow.png",
          masks: {
            body: "back-mask-body.png",
            sleeve: "back-mask-sleeve.png",
          },
        },
      },
      placement: "placement.json",
    },
    "pants-classic": {
      zones: {
        front: ["pants", "pants_stripe"],
        back: ["pants"],
      },
      files: {
        front: {
          base: "front-base.png",
          shadow: "front-shadow.png",
          masks: {
            pants: "front-mask-pants.png",
            pants_stripe: "front-mask-pants_stripe.png",
          },
        },
        back: {
          base: "back-base.png",
          shadow: "back-shadow.png",
          masks: {
            pants: "back-mask-pants.png",
          },
        },
      },
      placement: "placement.json",
    },
  };

  var WHITE_DEFAULT_COLORS = {
    body: "#FFFFFF",
    sleeve: "#FFFFFF",
    collar: "#FFFFFF",
  };

  var VECTEEZY_DEFAULT_COLORS = {
    body: "#F2F2F2",
    sleeve: "#1D2E54",
    collar: "#1D2E54",
  };

  var ZONES_FRONT = [
    { id: "body", shape: "roundRect", x: 0.2, y: 0.22, w: 0.6, h: 0.58, r: 0.04, alpha: 0.52 },
    { id: "sleeve", shape: "ellipse", cx: 0.11, cy: 0.38, rx: 0.09, ry: 0.2, alpha: 0.58 },
    { id: "sleeve", shape: "ellipse", cx: 0.89, cy: 0.38, rx: 0.09, ry: 0.2, alpha: 0.58 },
    { id: "collar", shape: "roundRect", x: 0.36, y: 0.14, w: 0.28, h: 0.1, r: 0.02, alpha: 0.65 },
  ];

  var ZONES_BACK = [
    { id: "body", shape: "roundRect", x: 0.2, y: 0.22, w: 0.6, h: 0.58, r: 0.04, alpha: 0.52 },
    { id: "sleeve", shape: "ellipse", cx: 0.11, cy: 0.38, rx: 0.09, ry: 0.2, alpha: 0.58 },
    { id: "sleeve", shape: "ellipse", cx: 0.89, cy: 0.38, rx: 0.09, ry: 0.2, alpha: 0.58 },
  ];

  function loadImage(src) {
    if (imageCache[src]) return imageCache[src];
    imageCache[src] = new Promise(function (resolve, reject) {
      var img = new Image();
      img.onload = function () { resolve(img); };
      img.onerror = reject;
      img.src = src;
    });
    return imageCache[src];
  }

  function packBase(slug) {
    return "/assets/mockups/" + slug + "/";
  }

  function probePack(slug) {
    if (packProbeCache[slug] !== undefined) return packProbeCache[slug];
    var pack = MOCKUP_PACKS[slug];
    if (!pack) {
      packProbeCache[slug] = Promise.resolve(false);
      return packProbeCache[slug];
    }
    packProbeCache[slug] = loadImage(packBase(slug) + pack.files.front.base)
      .then(function () { return true; })
      .catch(function () { return false; });
    return packProbeCache[slug];
  }

  function loadPackMeta(slug) {
    if (packMetaCache[slug] !== undefined) return packMetaCache[slug];
    var pack = MOCKUP_PACKS[slug];
    if (!pack) {
      packMetaCache[slug] = Promise.resolve({ baseType: "photo" });
      return packMetaCache[slug];
    }
    packMetaCache[slug] = fetch(packBase(slug) + pack.placement)
      .then(function (r) { return r.ok ? r.json() : {}; })
      .catch(function () { return {}; });
    return packMetaCache[slug];
  }

  function roundRect(ctx, x, y, w, h, r) {
    var rad = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + rad, y);
    ctx.lineTo(x + w - rad, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
    ctx.lineTo(x + w, y + h - rad);
    ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
    ctx.lineTo(x + rad, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
    ctx.lineTo(x, y + rad);
    ctx.quadraticCurveTo(x, y, x + rad, y);
    ctx.closePath();
  }

  function applyZone(ctx, zone, color, rect) {
    var alpha = zone.alpha || 0.5;
    ctx.save();
    if (zone.shape === "roundRect") {
      roundRect(
        ctx,
        rect.x + zone.x * rect.w,
        rect.y + zone.y * rect.h,
        zone.w * rect.w,
        zone.h * rect.h,
        zone.r * rect.w
      );
    } else if (zone.shape === "ellipse") {
      ctx.beginPath();
      ctx.ellipse(
        rect.x + zone.cx * rect.w,
        rect.y + zone.cy * rect.h,
        zone.rx * rect.w,
        zone.ry * rect.h,
        0,
        0,
        Math.PI * 2
      );
    }
    ctx.clip();
    ctx.globalCompositeOperation = "multiply";
    ctx.fillStyle = color;
    ctx.globalAlpha = alpha;
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function parseHex(hex) {
    var h = normalizeHex(hex).slice(1);
    return {
      r: parseInt(h.slice(0, 2), 16),
      g: parseInt(h.slice(2, 4), 16),
      b: parseInt(h.slice(4, 6), 16),
    };
  }

  function rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    var max = Math.max(r, g, b);
    var min = Math.min(r, g, b);
    var h = 0;
    var s = 0;
    var l = (max + min) / 2;
    if (max !== min) {
      var d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r:
          h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
          break;
        case g:
          h = ((b - r) / d + 2) / 6;
          break;
        default:
          h = ((r - g) / d + 4) / 6;
      }
    }
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  function hslToRgb(h, s, l) {
    h /= 360;
    s /= 100;
    l /= 100;
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

  function applyMaskTint(ctx, baseImg, maskImg, color, rect, alpha) {
    var w = Math.max(1, Math.round(rect.w));
    var h = Math.max(1, Math.round(rect.h));
    var strength = alpha == null ? 0.92 : alpha;

    var baseCanvas = document.createElement("canvas");
    baseCanvas.width = w;
    baseCanvas.height = h;
    var bctx = baseCanvas.getContext("2d");
    bctx.drawImage(baseImg, 0, 0, w, h);
    var baseData = bctx.getImageData(0, 0, w, h);

    var maskCanvas = document.createElement("canvas");
    maskCanvas.width = w;
    maskCanvas.height = h;
    var mctx = maskCanvas.getContext("2d");
    mctx.drawImage(maskImg, 0, 0, w, h);
    var maskData = mctx.getImageData(0, 0, w, h);

    var target = parseHex(color);
    var th = rgbToHsl(target.r, target.g, target.b);
    var pixels = baseData.data;
    var maskPixels = maskData.data;

    for (var i = 0; i < pixels.length; i += 4) {
      var ma = maskPixels[i + 3] > 0 ? maskPixels[i + 3] : maskPixels[i];
      if (ma < 8) continue;
      var t = (ma / 255) * strength;
      var src = rgbToHsl(pixels[i], pixels[i + 1], pixels[i + 2]);
      var mixed = {
        h: th.h,
        s: th.s * t + src.s * (1 - t),
        l: src.l,
      };
      var rgb = hslToRgb(mixed.h, mixed.s, mixed.l);
      pixels[i] = rgb.r;
      pixels[i + 1] = rgb.g;
      pixels[i + 2] = rgb.b;
    }

    bctx.putImageData(baseData, 0, 0);
    ctx.drawImage(baseCanvas, rect.x, rect.y, w, h);
  }

  function fitImage(img, cw, ch, padding, fullBleed) {
    if (fullBleed) {
      var scale = Math.min(cw / img.width, ch / img.height);
      var w = img.width * scale;
      var h = img.height * scale;
      return {
        x: (cw - w) / 2,
        y: (ch - h) / 2,
        w: w,
        h: h,
      };
    }
    var pad = padding || 24;
    var maxW = cw - pad * 2;
    var maxH = ch - pad * 2;
    var scale2 = Math.min(maxW / img.width, maxH / img.height);
    var w2 = img.width * scale2;
    var h2 = img.height * scale2;
    return {
      x: (cw - w2) / 2,
      y: (ch - h2) / 2 + 8,
      w: w2,
      h: h2,
    };
  }

  function drawBackdrop(ctx, cw, ch, style) {
    if (style === "photo-base") {
      ctx.fillStyle = "#e8e8e8";
      ctx.fillRect(0, 0, cw, ch);
      return;
    }
    if (style === "photo-3d") {
      var grd = ctx.createRadialGradient(cw / 2, ch * 0.42, 20, cw / 2, ch / 2, cw * 0.72);
      grd.addColorStop(0, "#6a6a6a");
      grd.addColorStop(1, "#2e2e2e");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, cw, ch);
      return;
    }
    if (style === "layered-flat") {
      ctx.fillStyle = "#f4f4f4";
      ctx.fillRect(0, 0, cw, ch);
      return;
    }
    var grd2 = ctx.createLinearGradient(0, 0, 0, ch);
    grd2.addColorStop(0, "#f0f0f0");
    grd2.addColorStop(1, "#e2e2e2");
    ctx.fillStyle = grd2;
    ctx.fillRect(0, 0, cw, ch);

    ctx.save();
    ctx.fillStyle = "rgba(0,0,0,0.08)";
    ctx.beginPath();
    ctx.ellipse(cw / 2, ch - 28, cw * 0.32, 14, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  function getPlacement(pack, view, key) {
    if (!pack || !pack._placement) return null;
    var side = pack._placement[view];
    return side ? side[key] : null;
  }

  function normalizeHex(hex) {
    if (!hex) return "";
    return String(hex).toUpperCase();
  }

  var PANTS_DEFAULT_COLORS = {
    pants: "#E8E8E8",
    pants_stripe: "#C8C8C8",
  };

  function matchesPackDefaults(colors, baseType, placement) {
    var d = placement && placement.defaultColors
      ? placement.defaultColors
      : baseType === "rs-photo" || baseType === "white-3d"
        ? WHITE_DEFAULT_COLORS
        : VECTEEZY_DEFAULT_COLORS;

    if (placement && placement.defaultColors && placement.defaultColors.pants !== undefined) {
      return (
        normalizeHex(colors.pants) === normalizeHex(d.pants) &&
        normalizeHex(colors.pants_stripe) === normalizeHex(d.pants_stripe)
      );
    }

    return (
      normalizeHex(colors.body) === d.body &&
      normalizeHex(colors.sleeve) === d.sleeve &&
      normalizeHex(colors.collar) === d.collar
    );
  }

  function drawBackText(ctx, rect, roster, teamName, placement) {
    var first = (roster || []).find(function (r) { return r.name || r.number; }) || (roster || [])[0] || {};
    var number = first.number || "12";
    var name = first.name ? first.name.split(" ")[0].toUpperCase() : (teamName || "EQUIPO").split(" ")[0].toUpperCase();

    // Name sits above the number on the back, like a real baseball jersey.
    // Number font size scales off rect.w (numBox.maxW) while these mockup
    // photos are landscape (rect.w ~1.5x rect.h), so the number glyph is much
    // taller relative to rect.h than maxW alone suggests - keep a large y gap
    // between the two boxes so the number's ascent never reaches the name.
    var numBox = placement && placement.number
      ? placement.number
      : { x: 0.5, y: 0.58, maxW: 0.26, maxH: 0.18 };
    var nameBox = placement && placement.name
      ? placement.name
      : { x: 0.5, y: 0.24, maxW: 0.5, maxH: 0.07 };

    ctx.save();
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,0,0,0.88)";

    var numSize = Math.round(rect.w * numBox.maxW * 0.85);
    ctx.font = "bold " + numSize + "px Helvetica, Arial, sans-serif";
    ctx.fillText(number, rect.x + rect.w * numBox.x, rect.y + rect.h * numBox.y);

    var nameSize = Math.round(rect.w * nameBox.maxH * 0.95);
    ctx.font = "600 " + nameSize + "px Helvetica, Arial, sans-serif";
    ctx.fillText(name, rect.x + rect.w * nameBox.x, rect.y + rect.h * nameBox.y);
    ctx.restore();
  }

  function drawLogo(ctx, rect, dataUrl, placement) {
    if (!dataUrl) return Promise.resolve();
    var box = placement && placement.chest_center
      ? placement.chest_center
      : { x: 0.5, y: 0.36, maxW: 0.2, maxH: 0.12 };

    return new Promise(function (resolve) {
      var logo = new Image();
      logo.onload = function () {
        var lw = rect.w * box.maxW;
        var lh = Math.min(rect.h * box.maxH, lw * (logo.height / logo.width));
        var lx = rect.x + rect.w * box.x - lw / 2;
        var ly = rect.y + rect.h * box.y - lh / 2;
        ctx.save();
        ctx.shadowColor = "rgba(0,0,0,0.2)";
        ctx.shadowBlur = 4;
        ctx.drawImage(logo, lx, ly, lw, lh);
        ctx.restore();
        resolve();
      };
      logo.onerror = resolve;
      logo.src = dataUrl;
    });
  }

  function loadPackAssets(slug, view) {
    var pack = MOCKUP_PACKS[slug];
    var base = packBase(slug);
    var vf = pack.files[view];
    var loads = [
      loadImage(base + vf.base),
      fetch(base + pack.placement)
        .then(function (r) { return r.ok ? r.json() : {}; })
        .catch(function () { return {}; }),
    ];

    if (vf.shadow) {
      loads.push(
        loadImage(base + vf.shadow).catch(function () { return null; })
      );
    }

    var zoneIds = pack.zones[view] || [];
    zoneIds.forEach(function (zoneId) {
      var maskFile = vf.masks[zoneId];
      if (maskFile) {
        loads.push(
          loadImage(base + maskFile).then(function (img) {
            return { zoneId: zoneId, img: img };
          })
        );
      }
    });

    return Promise.all(loads).then(function (results) {
      var masks = {};
      var shadow = vf.shadow ? results[2] : null;
      var maskStart = vf.shadow ? 3 : 2;
      results.slice(maskStart).forEach(function (entry) {
        if (entry && entry.zoneId) masks[entry.zoneId] = entry.img;
      });
      return {
        base: results[0],
        placement: results[1],
        shadow: shadow,
        masks: masks,
      };
    });
  }

  function isProductionPack(placement) {
    if (!placement) return false;
    if (placement.tintEnabled === true) return true;
    return placement.baseType === "rs-photo";
  }

  function applyShadowLayer(ctx, shadowImg, rect) {
    if (!shadowImg) return;
    ctx.save();
    ctx.globalAlpha = 0.65;
    ctx.globalCompositeOperation = "multiply";
    ctx.drawImage(shadowImg, rect.x, rect.y, rect.w, rect.h);
    ctx.restore();
  }

  function applyMaskColors(ctx, baseImg, rect, colors, masks, defaults) {
    var order = ["body", "sleeve", "collar", "pants", "pants_stripe"];
    order.forEach(function (zoneId) {
      if (!masks[zoneId]) return;
      var color = colors[zoneId];
      var def = defaults && defaults[zoneId];
      if (!color) return;
      if (def && normalizeHex(color) === normalizeHex(def)) return;
      applyMaskTint(ctx, baseImg, masks[zoneId], color, rect, 0.9);
    });
  }

  function renderLayered(canvas, options) {
    var ctx = canvas.getContext("2d");
    var cw = canvas.width;
    var ch = canvas.height;
    var slug = options.templateSlug || "classic-button";
    var colors = options.colors || {};
    var view = options.view || "front";

    return loadPackAssets(slug, view).then(function (assets) {
      var production = isProductionPack(assets.placement);
      var defaults = assets.placement.defaultColors || null;

      drawBackdrop(ctx, cw, ch, "photo-base");
      var rect = fitImage(assets.base, cw, ch, 8, true);

      ctx.drawImage(assets.base, rect.x, rect.y, rect.w, rect.h);

      if (production && !matchesPackDefaults(colors, "rs-photo", assets.placement)) {
        if (Object.keys(assets.masks).length) {
          applyMaskColors(ctx, assets.base, rect, colors, assets.masks, defaults);
        }
      }

      if (production && assets.shadow && assets.placement.shadowEnabled) {
        ctx.save();
        ctx.globalAlpha = 0.18;
        ctx.globalCompositeOperation = "multiply";
        ctx.drawImage(assets.shadow, rect.x, rect.y, rect.w, rect.h);
        ctx.restore();
      }

      if (view === "back") {
        drawBackText(ctx, rect, options.roster, options.teamName, assets.placement.back);
      }

      if (view === "front" && options.logoDataUrl) {
        return drawLogo(ctx, rect, options.logoDataUrl, assets.placement.front);
      }
    });
  }

  function renderPhotoApprox(canvas, options) {
    var ctx = canvas.getContext("2d");
    var cw = canvas.width;
    var ch = canvas.height;
    var slug = options.templateSlug || "classic-button";
    var src = TEMPLATE_PHOTOS[slug] || TEMPLATE_PHOTOS["classic-button"];
    var colors = options.colors || {};
    var view = options.view || "front";
    var zones = view === "back" ? ZONES_BACK : ZONES_FRONT;

    return loadImage(src).then(function (img) {
      drawBackdrop(ctx, cw, ch, "approx");
      var rect = fitImage(img, cw, ch, 20, false);

      ctx.save();
      if (view === "back") {
        ctx.translate(rect.x + rect.w, rect.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, rect.w, rect.h);
        ctx.restore();
      } else {
        ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
        ctx.restore();
      }

      zones.forEach(function (zone) {
        var color = colors[zone.id];
        if (color) applyZone(ctx, zone, color, rect);
      });

      ctx.save();
      ctx.globalAlpha = 0.28;
      ctx.globalCompositeOperation = "multiply";
      if (view === "back") {
        ctx.translate(rect.x + rect.w, rect.y);
        ctx.scale(-1, 1);
        ctx.drawImage(img, 0, 0, rect.w, rect.h);
      } else {
        ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);
      }
      ctx.restore();

      if (view === "back") {
        drawBackText(ctx, rect, options.roster, options.teamName, null);
      }

      if (view === "front" && options.logoDataUrl) {
        return drawLogo(ctx, rect, options.logoDataUrl, null);
      }
    });
  }

  var JERSEY_TEMPLATE_SLUGS = ["classic-button", "pro-pinstripe", "mexico-stars"];
  var PANTS_TEMPLATE_SLUGS = ["pants-classic"];

  // Curated AI photos only exist for these exact model slugs (see
  // images/variant-bank-colors.json). "pro-pinstripe" and "mexico-stars" are
  // jerseys too (isJerseyPreview), but they must NOT alias to the
  // classic-button bank: that bank's photos show the classic-button
  // silhouette, which would suddenly appear in place of the pinstripe/stars
  // template for the handful of curated color combos while every other
  // combo kept showing the pinstripe/stars tint - inconsistent behavior.
  var CURATED_BANK_SLUGS = ["classic-button", "pants-classic"];

  function isJerseyPreview(slug) {
    return JERSEY_TEMPLATE_SLUGS.indexOf(slug) !== -1;
  }

  function isPantsPreview(slug) {
    return PANTS_TEMPLATE_SLUGS.indexOf(slug) !== -1;
  }

  function hasCuratedBank(slug) {
    return CURATED_BANK_SLUGS.indexOf(slug) !== -1;
  }

  function renderVariantBank(canvas, options) {
    if (!window.RSVariantBank) return Promise.reject(new Error("no variant bank"));

    var slug = options.templateSlug || "classic-button";
    var bankSlug = slug;

    return window.RSVariantBank.loadManifest(bankSlug).then(function (manifest) {
      if (!manifest || !manifest.variants) return Promise.reject(new Error("no manifest"));
      var resolved = window.RSVariantBank.resolveVariantKey(slug, options.colors || {}, manifest);
      var view = options.view || "front";
      var src = window.RSVariantBank.variantImageUrl(bankSlug, manifest, resolved.key, view);
      if (!src) return Promise.reject(new Error("no variant url"));

      return loadImage(src).then(function (img) {
        var ctx = canvas.getContext("2d");
        var cw = canvas.width;
        var ch = canvas.height;
        drawBackdrop(ctx, cw, ch, "photo-base");
        var rect = fitImage(img, cw, ch, 8, true);
        ctx.drawImage(img, rect.x, rect.y, rect.w, rect.h);

        if (view === "back") {
          drawBackText(ctx, rect, options.roster, options.teamName, {
            number: { x: 0.5, y: 0.58, maxW: 0.26, maxH: 0.2 },
            name: { x: 0.5, y: 0.24, maxW: 0.55, maxH: 0.07 },
          });
        }

        if (view === "front" && options.logoDataUrl) {
          return drawLogo(ctx, rect, options.logoDataUrl, {
            chest_center: { x: 0.5, y: 0.4, maxW: 0.2, maxH: 0.11 },
          });
        }
      });
    });
  }

  function render(canvas, options) {
    if (!canvas) return Promise.resolve();
    options = options || {};
    var slug = options.templateSlug || "classic-button";

    function tryVariantBank() {
      var curated = hasCuratedBank(slug);
      if (!window.RSVariantBank || !curated) {
        return Promise.reject();
      }
      return window.RSVariantBank.hasBank(slug).then(function (ok) {
        if (!ok) return Promise.reject();
        return renderVariantBank(canvas, options);
      });
    }

    return tryVariantBank().catch(function () {
      if (isJerseyPreview(slug)) {
        return probePack("classic-button").then(function (hasPack) {
          if (hasPack && MOCKUP_PACKS["classic-button"]) {
            var layeredOpts = Object.assign({}, options, { templateSlug: "classic-button" });
            return renderLayered(canvas, layeredOpts);
          }
          return Promise.reject(new Error("jersey preview unavailable"));
        });
      }
      if (slug === "pants-classic") {
        return probePack(slug).then(function (hasPack) {
          if (hasPack && MOCKUP_PACKS[slug]) {
            return renderLayered(canvas, options);
          }
          return renderPhotoApprox(canvas, options);
        });
      }
      return renderPhotoApprox(canvas, options);
    }).catch(function () {
      if (isJerseyPreview(slug)) {
        var ctx = canvas.getContext("2d");
        drawBackdrop(ctx, canvas.width, canvas.height, "approx");
        ctx.fillStyle = "#737373";
        ctx.font = "14px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText("Vista previa no disponible. Recarga la pagina.", canvas.width / 2, canvas.height / 2);
        return;
      }
      return renderPhotoApprox(canvas, options);
    });
  }

  function toDataURL(canvas, options) {
    return render(canvas, options).then(function () {
      return canvas.toDataURL("image/png");
    });
  }

  function getPreviewMode(slug) {
    return probePack(slug || "classic-button");
  }

  function getPackStatus(slug) {
    slug = slug || "classic-button";
    if (window.RSVariantBank && hasCuratedBank(slug)) {
      return window.RSVariantBank.hasBank(slug).then(function (ok) {
        if (ok) return "variant-bank";
        return probePack(slug).then(function (hasPack) {
          if (!hasPack) return "none";
          return loadPackMeta(slug).then(function (meta) {
            return isProductionPack(meta) ? "production" : "placeholder";
          });
        });
      });
    }
    return probePack(slug).then(function (hasPack) {
      if (!hasPack) return "none";
      return loadPackMeta(slug).then(function (meta) {
        return isProductionPack(meta) ? "production" : "placeholder";
      });
    });
  }

  window.RSPreview = {
    render: render,
    toDataURL: toDataURL,
    getPreviewMode: getPreviewMode,
    getPackStatus: getPackStatus,
    loadPackMeta: loadPackMeta,
  };
})();
