/**
 * Curated variant bank lookup (demo).
 * Maps a garment's zone colors (jersey: body/sleeve/collar, pants: pants/pants_stripe)
 * to a real AI-generated product photo when the combination is curated. Combos not
 * present in the manifest return null so callers can fall back to live tint.
 */
(function () {
  "use strict";

  var manifestCache = {};

  // Curated photo banks exist only for these exact model slugs, one bank per
  // physical garment. Do not alias other jersey templates (e.g. pro-pinstripe,
  // mexico-stars) here: their silhouette differs from classic-button's curated
  // photos, so callers must not request a bank for slugs outside this map.
  var GARMENT_ZONES = {
    "classic-button": ["body", "sleeve", "collar"],
    "pants-classic": ["pants", "pants_stripe"],
  };

  function zonesFor(templateSlug) {
    return GARMENT_ZONES[templateSlug] || ["body", "sleeve", "collar"];
  }

  function bankBase(bankSlug) {
    return "/assets/variant-bank/" + bankSlug + "/";
  }

  function normalizeHex(hex) {
    if (!hex) return "";
    var h = String(hex).trim().toUpperCase();
    if (h.charAt(0) !== "#") h = "#" + h;
    return h;
  }

  function hexDistance(a, b) {
    function parse(h) {
      h = h.replace("#", "");
      return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
    }
    var pa = parse(a);
    var pb = parse(b);
    return Math.sqrt(
      Math.pow(pa[0] - pb[0], 2) + Math.pow(pa[1] - pb[1], 2) + Math.pow(pa[2] - pb[2], 2)
    );
  }

  function resolveColorId(hex, manifest) {
    hex = normalizeHex(hex);
    if (manifest.paletteMap && manifest.paletteMap[hex]) {
      return manifest.paletteMap[hex];
    }
    var best = null;
    var bestDist = Infinity;
    (manifest.bank || []).forEach(function (c) {
      var d = hexDistance(hex, c.hex);
      if (d < bestDist) {
        bestDist = d;
        best = c.id;
      }
    });
    return best || "wht";
  }

  function comboKey(ids) {
    return ids.join("_");
  }

  function loadManifest(bankSlug) {
    if (manifestCache[bankSlug] !== undefined) return manifestCache[bankSlug];
    manifestCache[bankSlug] = fetch(bankBase(bankSlug) + "manifest.json?v=3")
      .then(function (r) {
        if (!r.ok) throw new Error("manifest fetch failed");
        return r.json();
      })
      .catch(function () {
        manifestCache[bankSlug] = undefined;
        return null;
      });
    return manifestCache[bankSlug];
  }

  function hasBank(bankSlug) {
    return loadManifest(bankSlug).then(function (m) {
      return !!(m && m.variants && Object.keys(m.variants).length > 0);
    });
  }

  function resolveVariantKey(templateSlug, colors, manifest) {
    colors = colors || {};
    var zones = zonesFor(templateSlug);
    var ids = zones.map(function (zone) {
      return resolveColorId(colors[zone] || "#FFFFFF", manifest);
    });
    var key = comboKey(ids);
    return { key: key, zones: zones, ids: ids };
  }

  function variantImageUrl(bankSlug, manifest, key, view) {
    var entry = manifest.variants[key];
    if (!entry) return null;
    var rel = view === "back" ? entry.back : entry.front;
    return rel ? bankBase(bankSlug) + rel + "?v=3" : null;
  }

  window.RSVariantBank = {
    loadManifest: loadManifest,
    hasBank: hasBank,
    resolveVariantKey: resolveVariantKey,
    resolveColorId: resolveColorId,
    variantImageUrl: variantImageUrl,
    bankBase: bankBase,
  };
})();
