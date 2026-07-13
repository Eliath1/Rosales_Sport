(function () {
  "use strict";

  var STORAGE_KEY = "rs_design_requests";
  var SESSION_KEY = "rs_design_request";
  var TOTAL_STEPS = 4;

  var BRAND_COLORS = {
    red: "#ED090D",
    black: "#000000",
    white: "#FFFFFF",
  };

  var TEMPLATES = [
    { slug: "classic-button", thumb: "/assets/variant-bank/classic-button/front/wht_wht_wht.png", categories: ["jersey", "uniform", "set"], nameKey: "builder.template.classic" },
    { slug: "pro-pinstripe", thumb: "/images/jersey5.jpg", categories: ["jersey", "uniform", "set"], nameKey: "builder.template.pinstripe" },
    { slug: "mexico-stars", thumb: "/images/jersey2.jpg", categories: ["jersey", "uniform", "set"], nameKey: "builder.template.stars" },
    { slug: "pants-classic", thumb: "/images/catalog-pants-blanco-front.png", categories: ["pants", "uniform", "set"], nameKey: "builder.template.pants" },
  ];

  // Only these have a curated real-photo bank (see variant-bank.js GARMENT_ZONES).
  // The rest fall back to approximate live tinting, which we hide for this DEMO
  // to avoid showing a visibly different rendering technique side by side.
  var DISABLED_TEMPLATE_SLUGS = ["pro-pinstripe", "mexico-stars"];

  // Only single-garment flows (jersey-only, pants-only) are fully wired to the
  // curated photo preview for this DEMO. Combined flows are disabled for now.
  var DISABLED_PRODUCT_TYPES = ["uniform", "set", "cap"];

  var COLOR_ZONES = [
    { id: "body", labelKey: "builder.color.body", default: BRAND_COLORS.white },
    { id: "sleeve", labelKey: "builder.color.sleeve", default: BRAND_COLORS.red },
    { id: "collar", labelKey: "builder.color.collar", default: BRAND_COLORS.black },
    { id: "pants", labelKey: "builder.color.pants", default: BRAND_COLORS.white },
    { id: "pants_stripe", labelKey: "builder.color.pants_stripe", default: BRAND_COLORS.red },
  ];

  var FABRIC_GROUPS = [
    {
      labelKey: "builder.fabric.group.neutral",
      colors: [
        { hex: "#FFFFFF", key: "builder.fabric.white" },
        { hex: "#000000", key: "builder.fabric.black" },
        { hex: "#525252", key: "builder.fabric.gray" },
        { hex: "#d4d4d4", key: "builder.fabric.light_gray" },
      ],
    },
    {
      labelKey: "builder.fabric.group.red",
      colors: [
        { hex: "#ED090D", key: "builder.fabric.rs_red" },
        { hex: "#8B0000", key: "builder.fabric.tinto" },
        { hex: "#ea580c", key: "builder.fabric.orange" },
      ],
    },
    {
      labelKey: "builder.fabric.group.blue",
      colors: [
        { hex: "#1e3a8a", key: "builder.fabric.navy" },
        { hex: "#2563eb", key: "builder.fabric.royal" },
        { hex: "#38bdf8", key: "builder.fabric.sky" },
      ],
    },
    {
      labelKey: "builder.fabric.group.green",
      colors: [
        { hex: "#4a5d23", key: "builder.fabric.military" },
        { hex: "#166534", key: "builder.fabric.flag_green" },
      ],
    },
  ];

  var PRODUCT_TYPES = [
    { id: "uniform", key: "custom.product_type.uniform", subKey: "builder.v2.ptype.uniform_sub" },
    { id: "jersey", key: "custom.product_type.jersey", subKey: "builder.v2.ptype.jersey_sub" },
    { id: "pants", key: "builder.product.pants", subKey: "builder.v2.ptype.pants_sub" },
    { id: "set", key: "custom.product_type.set", subKey: "builder.v2.ptype.set_sub" },
    { id: "cap", key: "custom.product_type.cap", subKey: "builder.v2.ptype.cap_sub" },
  ];

  var CURATED_BANK_SLUGS = ["classic-button", "pants-classic"];

  var BANK_ID_LABEL_KEY = {
    wht: "builder.fabric.white",
    blk: "builder.fabric.black",
    gry: "builder.fabric.gray",
    red: "builder.fabric.rs_red",
    nav: "builder.fabric.navy",
    roy: "builder.fabric.royal",
    grn: "builder.fabric.military",
  };

  var curatedManifests = {};
  var curatedManifestPromises = {};

  var MOCKUP_TEMPLATE_COLORS = {
    "classic-button": {
      body: "#E8E8E8",
      sleeve: "#E8E8E8",
      collar: "#E8E8E8",
    },
    "pants-classic": {
      pants: "#E8E8E8",
      pants_stripe: "#C8C8C8",
    },
  };

  var state = {
    step: 1,
    orderMode: "team",
    gender: "unisex",
    productType: "",
    templateSlug: "",
    colors: {},
    logoZone: "chest",
    logoDataUrl: null,
    logoFileName: "",
    teamName: "",
    sizeBreakdown: {},
    roster: [],
    decoration: "embroidery",
    quantity: 12,
    contact: { name: "", email: "", phone: "" },
    notes: "",
    previewView: "front",
    activeColorZone: "body",
  };

  var previewTimer = null;

  function getPreviewOptions() {
    return {
      templateSlug: state.templateSlug,
      colors: state.colors,
      view: state.previewView,
      logoDataUrl: state.previewView === "front" ? state.logoDataUrl : null,
      roster: state.roster,
      teamName: state.teamName,
    };
  }

  function supportsPhotoPreview() {
    if (state.productType === "cap") return false;
    if (state.templateSlug === "pants-classic") return showPants();
    return showJersey();
  }

  function showPreviewPlaceholder(messageKey) {
    var canvas = $("#preview-canvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#f0f0f0";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = "#666";
    ctx.font = "14px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(t(messageKey || "builder.v2.preview.soon"), canvas.width / 2, canvas.height / 2);
  }

  function isDisabledTemplate(slug) {
    return DISABLED_TEMPLATE_SLUGS.indexOf(slug) !== -1;
  }

  function isDisabledProductType(id) {
    return DISABLED_PRODUCT_TYPES.indexOf(id) !== -1;
  }

  function syncTemplateForProductType() {
    if (!state.productType) return;
    var filtered = TEMPLATES.filter(function (tpl) {
      return tpl.categories.indexOf(state.productType) >= 0;
    });
    if (!filtered.length) return;
    var valid = filtered.some(function (tpl) { return tpl.slug === state.templateSlug && !isDisabledTemplate(tpl.slug); });
    if (valid) return;
    var enabled = filtered.filter(function (tpl) { return !isDisabledTemplate(tpl.slug); });
    state.templateSlug = (enabled[0] || filtered[0]).slug;
    applyTemplateColors(state.templateSlug);
    ensureActiveColorZone();
  }

  function renderPhotoPreview() {
    var canvas = $("#preview-canvas");
    if (!canvas || !window.RSPreview) return;
    if (!supportsPhotoPreview()) {
      showPreviewPlaceholder("builder.v2.preview.soon");
      return;
    }
    window.RSPreview.render(canvas, getPreviewOptions()).then(function () {
      updatePreviewModeNote();
    }).catch(function () {
      updatePreviewModeNote();
    });
  }

  function updatePreviewModeNote() {
    var note = $("#preview-mode-note");
    if (!note || !window.RSPreview) return;
    var layeredSlugs = ["classic-button", "pro-pinstripe", "mexico-stars", "pants-classic"];
    if (layeredSlugs.indexOf(state.templateSlug) === -1) {
      note.hidden = true;
      return;
    }
    var getStatus = window.RSPreview.getPackStatus || window.RSPreview.getPreviewMode;
    getStatus(state.templateSlug).then(function (status) {
      if (status === "production" || status === "variant-bank") {
      note.hidden = true;
      return;
    }
      if (status === "placeholder") {
        note.hidden = false;
        note.textContent = t("builder.v2.preview.pending_assets");
        return;
      }
      note.hidden = false;
      note.textContent = t("builder.v2.preview.approx");
    });
  }

  function schedulePreviewRender() {
    if (previewTimer) clearTimeout(previewTimer);
    previewTimer = setTimeout(renderPhotoPreview, 50);
  }

  function t(key) {
    if (!window.rsI18n) return key;
    return window.rsI18n.t(window.rsI18n.getLang(), key);
  }

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }

  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function defaultColors() {
    var c = {};
    COLOR_ZONES.forEach(function (z) {
      c[z.id] = z.default;
    });
    return c;
  }

  function applyTemplateColors(slug) {
    state.colors = defaultColors();
    var mockup = MOCKUP_TEMPLATE_COLORS[slug];
    if (mockup) {
      Object.keys(mockup).forEach(function (key) {
        state.colors[key] = mockup[key];
      });
    }
  }

  function showPants() {
    return state.productType === "pants" || state.productType === "uniform" || state.productType === "set";
  }

  function showJersey() {
    return state.productType !== "pants" && state.productType !== "cap";
  }

  function templateName() {
    var tpl = TEMPLATES.find(function (x) { return x.slug === state.templateSlug; });
    return tpl ? t(tpl.nameKey) : state.templateSlug;
  }

  function productTypeName() {
    var pt = PRODUCT_TYPES.find(function (x) { return x.id === state.productType; });
    return pt ? t(pt.key) : state.productType;
  }

  function updatePreviewSummary() {
    var el = $("#preview-mini-summary");
    if (!el) return;
    var deco = (document.querySelector('input[name="decoration"]:checked') || {}).value || state.decoration;
    var decoLabel = deco === "embroidery" ? t("custom.deco.embroidery") : deco.toUpperCase();
    var colorBits = [];
    if (showJersey()) colorBits.push(t("builder.color.body") + ": " + (state.colors.body || ""));
    if (showPants()) colorBits.push(t("builder.color.pants") + ": " + (state.colors.pants || ""));
    el.textContent =
      (state.quantity || 0) + " " + t("builder.v2.pieces") +
      " · " + decoLabel +
      (colorBits.length ? " · " + colorBits.join(", ") : "");
  }

  function updatePreview() {
    schedulePreviewRender();
    updatePreviewSummary();
  }

  function updatePreviewStepHint() {
    var hint = $("#preview-step-hint");
    if (!hint) return;
    if (state.step === 1 && showJersey()) {
      hint.hidden = false;
      hint.textContent = t("builder.v2.preview.step1_hint");
    } else {
      hint.hidden = true;
    }
  }

  function setStep(n) {
    state.step = n;
    $$(".wizard-step-dot").forEach(function (dot, i) {
      dot.classList.toggle("active", i + 1 === n);
      dot.classList.toggle("done", i + 1 < n);
    });
    $$(".wizard-panel").forEach(function (panel) {
      panel.classList.toggle("active", parseInt(panel.getAttribute("data-step"), 10) === n);
    });
    var label = $("[data-step-label]");
    if (label) label.textContent = t("builder.v2.step." + n);
    var prevBtn = $("#wizard-prev");
    var nextBtn = $("#wizard-next");
    var submitBtn = $("#wizard-submit");
    if (prevBtn) prevBtn.style.display = n > 1 ? "inline-flex" : "none";
    if (nextBtn) nextBtn.style.display = n < TOTAL_STEPS ? "inline-flex" : "none";
    if (submitBtn) submitBtn.style.display = n === TOTAL_STEPS ? "inline-flex" : "none";
    if (n === 3) recomputeSizeBreakdown();
    if (n === TOTAL_STEPS) renderReview();
    updatePreviewStepHint();
    updatePreview();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function validateStep(n) {
    if (n === 1) {
      if (!state.productType) {
        window.demoShowToast(t("builder.error.product"));
        return false;
      }
      if (!state.templateSlug) {
        window.demoShowToast(t("builder.error.template"));
        return false;
      }
    }
    if (n === 3) {
      recomputeSizeBreakdown();
      var total = state.quantity;
      if (total < 1) {
        window.demoShowToast(t("builder.error.sizes"));
        return false;
      }
      if (total < 6) {
        window.demoShowToast(t("builder.v2.error.min_order"));
        return false;
      }
      if (state.orderMode === "team" && total < 12) {
        window.demoShowToast(t("builder.v2.error.team_min"));
        return false;
      }
    }
    if (n === TOTAL_STEPS) {
      state.contact.name = ($("#contact-name") || {}).value ? $("#contact-name").value.trim() : "";
      state.contact.email = ($("#contact-email") || {}).value ? $("#contact-email").value.trim() : "";
      if (!state.contact.name || !state.contact.email) {
        window.demoShowToast(t("builder.error.contact"));
        return false;
      }
      if (!$("#builder-consent") || !$("#builder-consent").checked) {
        window.demoShowToast(t("builder.error.consent"));
        return false;
      }
      if (!$("#builder-review-ok") || !$("#builder-review-ok").checked) {
        window.demoShowToast(t("builder.v2.error.review"));
        return false;
      }
    }
    return true;
  }

  function renderProductTypes() {
    var grid = $("#product-type-grid");
    if (!grid) return;
    grid.innerHTML = "";
    PRODUCT_TYPES.forEach(function (type) {
      var disabled = isDisabledProductType(type.id);
      var card = document.createElement("label");
      card.className = "product-type-card" +
        (state.productType === type.id ? " selected" : "") +
        (disabled ? " disabled" : "");
      card.innerHTML =
        '<input type="radio" name="product-type" value="' + type.id + '"' +
        (state.productType === type.id ? " checked" : "") +
        (disabled ? " disabled" : "") + ">" +
        "<span>" + t(type.key) + "</span>" +
        '<span class="ptype-sub">' + t(type.subKey) + "</span>" +
        (disabled ? '<span class="ptype-note">' + t("builder.v2.not_available_demo") + "</span>" : "");
      if (!disabled) {
        card.addEventListener("click", function () {
          state.productType = type.id;
          $$(".product-type-card").forEach(function (c) { c.classList.remove("selected"); });
          card.classList.add("selected");
          syncTemplateForProductType();
          renderTemplates();
          renderColorFields();
          updatePreview();
        });
      }
      grid.appendChild(card);
    });
  }

  function renderTemplates() {
    var grid = $("#template-grid");
    if (!grid) return;
    grid.innerHTML = "";
    var filtered = TEMPLATES.filter(function (tpl) {
      return !state.productType || tpl.categories.indexOf(state.productType) >= 0;
    });
    filtered.forEach(function (tpl) {
      var disabled = isDisabledTemplate(tpl.slug);
      var card = document.createElement("div");
      card.className = "template-card" +
        (state.templateSlug === tpl.slug ? " selected" : "") +
        (disabled ? " disabled" : "");
      card.innerHTML =
        '<img src="' + tpl.thumb + '" alt="">' +
        (disabled ? '<span class="template-card-note">' + t("builder.v2.not_available_demo") + "</span>" : "") +
        "<span>" + t(tpl.nameKey) + "</span>";
      if (!disabled) {
        card.addEventListener("click", function () {
          state.templateSlug = tpl.slug;
          applyTemplateColors(tpl.slug);
          $$(".template-card").forEach(function (c) { c.classList.remove("selected"); });
          card.classList.add("selected");
          renderColorFields();
          updatePreview();
        });
      }
      grid.appendChild(card);
    });
  }

  function visibleColorZones() {
    return COLOR_ZONES.filter(function (zone) {
      if (zone.id.indexOf("pants") === 0 && !showPants()) return false;
      if (zone.id.indexOf("pants") !== 0 && !showJersey()) return false;
      return true;
    });
  }

  function ensureActiveColorZone() {
    var zones = visibleColorZones();
    if (!zones.length) return;
    var found = zones.some(function (z) { return z.id === state.activeColorZone; });
    if (!found) state.activeColorZone = zones[0].id;
  }

  function setActiveColorZone(zoneId) {
    state.activeColorZone = zoneId;
    renderColorPanel();
    updatePreview();
  }

  function allFabricColors() {
    var list = [];
    FABRIC_GROUPS.forEach(function (group) {
      group.colors.forEach(function (fc) {
        if (!list.some(function (x) { return x.hex === fc.hex; })) {
          list.push(fc);
        }
      });
    });
    return list;
  }

  function isCuratedTemplate(slug) {
    return CURATED_BANK_SLUGS.indexOf(slug) !== -1;
  }

  function fabricLabel(bankId) {
    return t(BANK_ID_LABEL_KEY[bankId] || bankId);
  }

  function curatedComboLabel(zones, combo) {
    var allSame = zones.every(function (z) { return combo[z] === combo[zones[0]]; });
    if (allSame) {
      return t("builder.v2.combo_solid").replace("{color}", fabricLabel(combo[zones[0]]));
    }
    if (zones.indexOf("pants_stripe") !== -1) {
      return t("builder.v2.combo_stripe")
        .replace("{pants}", fabricLabel(combo.pants))
        .replace("{stripe}", fabricLabel(combo.pants_stripe));
    }
    return t("builder.v2.combo_trim")
      .replace("{body}", fabricLabel(combo.body))
      .replace("{trim}", fabricLabel(combo.sleeve));
  }

  function comboMatchesState(zones, combo, manifest) {
    return zones.every(function (z) {
      var currentId = window.RSVariantBank.resolveColorId(state.colors[z] || "#FFFFFF", manifest);
      return currentId === combo[z];
    });
  }

  function ensureCuratedManifest(slug, onReady) {
    if (curatedManifests[slug]) {
      onReady(curatedManifests[slug]);
      return;
    }
    if (!window.RSVariantBank) return;
    if (!curatedManifestPromises[slug]) {
      curatedManifestPromises[slug] = window.RSVariantBank.loadManifest(slug).then(function (manifest) {
        if (manifest) curatedManifests[slug] = manifest;
        return manifest;
      });
    }
    curatedManifestPromises[slug].then(function (manifest) {
      if (manifest && state.templateSlug === slug) onReady(manifest);
    });
  }

  function renderCuratedPresets(manifest) {
    var wrap = $("#color-curated-presets");
    var hint = $("#color-curated-hint");
    if (!wrap) return;
    if (hint) hint.hidden = false;
    var zones = manifest.zones || [];
    wrap.innerHTML = "";
    Object.keys(manifest.variants || {}).forEach(function (key) {
      var combo = manifest.variants[key];
      var btn = document.createElement("button");
      btn.type = "button";
      var active = comboMatchesState(zones, combo, manifest);
      btn.className = "combo-preset" + (active ? " selected" : "");
      btn.setAttribute("role", "option");
      btn.setAttribute("aria-selected", active ? "true" : "false");
      var dotsHtml = zones.map(function (z) {
        return '<span class="combo-preset-dot" style="background:' + combo[z + "Hex"] + '"></span>';
      }).join("");
      btn.innerHTML =
        '<span class="combo-preset-dots">' + dotsHtml + "</span>" +
        '<span class="combo-preset-label">' + curatedComboLabel(zones, combo) + "</span>";
      btn.addEventListener("click", function () {
        zones.forEach(function (z) {
          state.colors[z] = combo[z + "Hex"];
        });
        renderColorPanel();
        updatePreview();
      });
      wrap.appendChild(btn);
    });
  }

  function renderColorPanel() {
    var curated = isCuratedTemplate(state.templateSlug);
    var wrap = $("#color-compact");
    var curatedWrap = $("#color-curated-presets");
    var hint = $("#color-curated-hint");

    if (curatedWrap) curatedWrap.hidden = !curated;
    if (hint) hint.hidden = !curated;
    if (wrap) wrap.hidden = curated;

    if (curated) {
      if (curatedWrap && !curatedWrap.childElementCount) {
        curatedWrap.innerHTML = '<p class="form-hint">' + t("builder.v2.colors_curated_loading") + "</p>";
      }
      ensureCuratedManifest(state.templateSlug, renderCuratedPresets);
      return;
    }

    var select = $("#color-zone-select");
    var picker = $("#color-zone-picker");
    var swatchRow = $("#color-swatches-row");
    var chips = $("#color-zone-chips");
    var pill = $("#color-current-pill");
    var hexLabel = $("#color-current-hex");
    if (!wrap || !select || !picker || !swatchRow) return;

    ensureActiveColorZone();
    var zones = visibleColorZones();
    var active = zones.find(function (z) { return z.id === state.activeColorZone; }) || zones[0];
    if (!active) return;

    select.innerHTML = "";
    zones.forEach(function (zone) {
      var opt = document.createElement("option");
      opt.value = zone.id;
      opt.textContent = t(zone.labelKey);
      if (zone.id === active.id) opt.selected = true;
      select.appendChild(opt);
    });

    var val = state.colors[active.id] || active.default;
    picker.value = val;
    if (pill) pill.style.background = val;
    if (hexLabel) hexLabel.textContent = val.toUpperCase();

    swatchRow.innerHTML = "";
    allFabricColors().forEach(function (fc) {
      var btn = document.createElement("button");
      btn.type = "button";
      btn.className = "color-swatch" + (val === fc.hex ? " selected" : "");
      btn.style.background = fc.hex;
      btn.title = t(fc.key);
      btn.setAttribute("aria-label", t(fc.key));
      btn.addEventListener("click", function () {
        state.colors[active.id] = fc.hex;
        renderColorPanel();
        updatePreview();
      });
      swatchRow.appendChild(btn);
    });

    if (chips) {
      chips.innerHTML = "";
      zones.forEach(function (zone) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "color-zone-chip" + (zone.id === active.id ? " selected" : "");
        var c = state.colors[zone.id] || zone.default;
        chip.innerHTML =
          '<span class="color-zone-chip-dot" style="background:' + c + '"></span>' +
          "<span>" + t(zone.labelKey) + "</span>";
        chip.addEventListener("click", function () {
          setActiveColorZone(zone.id);
        });
        chips.appendChild(chip);
      });
    }
  }

  function initColorPanel() {
    var select = $("#color-zone-select");
    var picker = $("#color-zone-picker");
    if (select) {
      select.addEventListener("change", function () {
        setActiveColorZone(select.value);
      });
    }
    if (picker) {
      picker.addEventListener("input", function () {
        ensureActiveColorZone();
        state.colors[state.activeColorZone] = picker.value;
        renderColorPanel();
        updatePreview();
      });
    }
    renderColorPanel();
  }

  function renderColorFields() {
    renderColorPanel();
  }

  var ROSTER_SIZES = ["XS", "S", "M", "L", "XL", "XXL"];

  // Roster rows are the source of truth: the client fills Name/Numero/Talla
  // per player, and "Cantidad por talla" is a read-only summary computed from
  // those rows (see recomputeSizeBreakdown).
  function defaultRosterRows() {
    var counts = { XS: 0, S: 2, M: 4, L: 4, XL: 2, XXL: 0 };
    var rows = [];
    ROSTER_SIZES.forEach(function (sz) {
      for (var i = 0; i < counts[sz]; i++) rows.push({ name: "", number: "", size: sz });
    });
    return rows;
  }

  function recomputeSizeBreakdown() {
    var counts = {};
    ROSTER_SIZES.forEach(function (sz) { counts[sz] = 0; });
    state.roster.forEach(function (row) {
      if (row.size && counts.hasOwnProperty(row.size)) counts[row.size] += 1;
    });

    var breakdown = {};
    ROSTER_SIZES.forEach(function (sz) {
      if (counts[sz] > 0) breakdown[sz] = counts[sz];
    });
    state.sizeBreakdown = breakdown;
    state.quantity = state.roster.length;

    ROSTER_SIZES.forEach(function (sz) {
      var el = $("#size-count-" + sz.toLowerCase());
      if (el) el.textContent = String(counts[sz]);
    });
    var totalEl = $("#size-total");
    if (totalEl) totalEl.textContent = String(state.quantity);
    updatePreviewSummary();
  }

  function rosterSizeOptionsHtml(selected) {
    var opts = '<option value="">-</option>';
    opts += ROSTER_SIZES.map(function (sz) {
      return '<option value="' + sz + '"' + (selected === sz ? " selected" : "") + ">" + sz + "</option>";
    }).join("");
    return opts;
  }

  function escapeAttr(value) {
    return String(value || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;");
  }

  function renderRosterTable() {
    var tbody = $("#roster-tbody");
    if (!tbody) return;
    tbody.innerHTML = "";
    state.roster.forEach(function (row, i) {
      var tr = document.createElement("tr");
      tr.innerHTML =
        "<td>" + (i + 1) + "</td>" +
        '<td><input type="text" data-roster="name" data-i="' + i + '" value="' + escapeAttr(row.name) + '"></td>' +
        '<td><input type="text" data-roster="number" data-i="' + i + '" value="' + escapeAttr(row.number) + '"></td>' +
        '<td><select data-roster="size" data-i="' + i + '">' + rosterSizeOptionsHtml(row.size) + "</select></td>" +
        '<td><button type="button" class="roster-remove-btn" data-i="' + i + '" aria-label="' + t("builder.roster.remove") + '">&times;</button></td>';
      tbody.appendChild(tr);
    });

    $$("#roster-tbody input").forEach(function (input) {
      input.addEventListener("input", function () {
        var idx = parseInt(input.getAttribute("data-i"), 10);
        state.roster[idx][input.getAttribute("data-roster")] = input.value;
        schedulePreviewRender();
      });
    });
    $$("#roster-tbody select").forEach(function (select) {
      select.addEventListener("change", function () {
        var idx = parseInt(select.getAttribute("data-i"), 10);
        state.roster[idx].size = select.value;
        recomputeSizeBreakdown();
      });
    });
    $$(".roster-remove-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = parseInt(btn.getAttribute("data-i"), 10);
        state.roster.splice(idx, 1);
        renderRosterTable();
        recomputeSizeBreakdown();
      });
    });
    schedulePreviewRender();
  }

  function addRosterRow() {
    state.roster.push({ name: "", number: "", size: "" });
    renderRosterTable();
    recomputeSizeBreakdown();
  }

  function buildSpec() {
    return {
      version: "1",
      id: "DR-" + Date.now(),
      submittedAt: new Date().toISOString(),
      orderMode: state.orderMode,
      gender: state.gender,
      templateSlug: state.templateSlug,
      productType: state.productType,
      teamName: state.teamName,
      colors: Object.assign({}, state.colors),
      logos: state.logoDataUrl
        ? [{ zone: state.logoZone, fileName: state.logoFileName, dataUrl: state.logoDataUrl }]
        : [],
      sizeBreakdown: Object.assign({}, state.sizeBreakdown),
      roster: state.roster.slice(),
      decoration: state.decoration,
      quantity: state.quantity,
      contact: Object.assign({}, state.contact),
      notes: state.notes,
    };
  }

  function renderSummaryCards() {
    var container = $("#review-summary-cards");
    if (!container) return;
    recomputeSizeBreakdown();
    state.teamName = ($("#team-name") || {}).value ? $("#team-name").value.trim() : state.teamName;
    state.decoration = (document.querySelector('input[name="decoration"]:checked') || {}).value || "embroidery";

    var sizes = Object.keys(state.sizeBreakdown).map(function (k) {
      return k + ": " + state.sizeBreakdown[k];
    }).join(", ");

    var rosterLines = state.roster
      .filter(function (r) { return r.name || r.number; })
      .slice(0, 5)
      .map(function (r) { return (r.name || "-") + " #" + (r.number || "-") + " (" + (r.size || "-") + ")"; });

    var swatchHtml = COLOR_ZONES.filter(function (z) {
      if (z.id.indexOf("pants") === 0 && !showPants()) return false;
      if (z.id.indexOf("pants") !== 0 && !showJersey()) return false;
      return true;
    }).map(function (z) {
      return '<span class="summary-swatch" style="background:' + state.colors[z.id] + '" title="' + t(z.labelKey) + '"></span>';
    }).join("");

    var genderKey = state.gender === "dama" ? "gender.dama" : state.gender === "caballero" ? "gender.caballero" : "gender.unisex";

    container.innerHTML =
      '<div class="summary-card"><h4>' + t("builder.v2.summary.order") + "</h4><p>" +
      productTypeName() + " · " + templateName() + " · " + t(genderKey) + "<br>" +
      t("builder.v2.total_pieces") + " " + state.quantity + "</p></div>" +
      '<div class="summary-card"><h4>' + t("builder.v2.summary.look") + "</h4><p>" +
      (state.teamName || "-") + '</p><div class="summary-swatches">' + swatchHtml + "</div></div>" +
      '<div class="summary-card"><h4>' + t("builder.v2.summary.team") + "</h4><p>" +
      t("builder.v2.summary.sizes") + " " + (sizes || "-") + "</p><ul>" +
      rosterLines.map(function (l) { return "<li>" + l + "</li>"; }).join("") +
      (state.roster.length > 5 ? "<li>+" + (state.roster.length - 5) + " ...</li>" : "") +
      "</ul><p>" + t("custom.section.decoration") + ": " + state.decoration + "</p></div>";
  }

  function renderReview() {
    renderSummaryCards();
    var spec = buildSpec();
    var pre = $("#review-spec");
    if (pre) {
      var display = Object.assign({}, spec);
      if (display.logos && display.logos[0]) {
        display.logos = [{ zone: display.logos[0].zone, fileName: display.logos[0].fileName }];
      }
      pre.textContent = JSON.stringify(display, null, 2);
    }
    updatePreview();
  }

  function generatePreviewDataUrl() {
    var canvas = $("#preview-canvas");
    if (!canvas || !window.RSPreview) {
      return Promise.resolve("");
    }
    return window.RSPreview.toDataURL(canvas, getPreviewOptions());
  }

  function saveDesign(spec, previewDataUrl) {
    spec.previewDataUrl = previewDataUrl;
    try {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(spec));
      var list = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
      list.unshift(spec);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(list.slice(0, 50)));
    } catch (e) {
      console.warn("Storage save failed", e);
    }
  }

  function handleLogoFile(file) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      window.demoShowToast(t("builder.error.file_size"));
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      state.logoDataUrl = reader.result;
      state.logoFileName = file.name;
      var nameEl = $("#logo-file-name");
      if (nameEl) nameEl.textContent = file.name;
      updatePreview();
    };
    reader.readAsDataURL(file);
  }

  function initLogoUpload() {
    var input = $("#logo-upload");
    var dropzone = $("#logo-dropzone");
    if (!input || !dropzone) return;

    dropzone.addEventListener("click", function () { input.click(); });
    input.addEventListener("change", function () { handleLogoFile(input.files && input.files[0]); });

    dropzone.addEventListener("dragover", function (e) {
      e.preventDefault();
      dropzone.classList.add("dragover");
    });
    dropzone.addEventListener("dragleave", function () { dropzone.classList.remove("dragover"); });
    dropzone.addEventListener("drop", function (e) {
      e.preventDefault();
      dropzone.classList.remove("dragover");
      if (e.dataTransfer.files[0]) handleLogoFile(e.dataTransfer.files[0]);
    });

    $$(".logo-zone-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.logoZone = btn.getAttribute("data-zone");
        $$(".logo-zone-btn").forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
      });
    });
  }

  function initOrderMode() {
    $$(".order-chip").forEach(function (chip) {
      chip.addEventListener("click", function () {
        state.orderMode = chip.getAttribute("data-mode");
        $$(".order-chip").forEach(function (c) { c.classList.remove("selected"); });
        chip.classList.add("selected");
      });
    });
  }

  function initGenderSelector() {
    var group = document.getElementById("gender-options");
    if (!group) return;
    group.querySelectorAll("[data-gender]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.gender = btn.getAttribute("data-gender");
      });
    });
  }

  function initViewToggle() {
    $$(".view-toggle-btn").forEach(function (btn) {
      btn.addEventListener("click", function () {
        state.previewView = btn.getAttribute("data-view");
        $$(".view-toggle-btn").forEach(function (b) { b.classList.remove("active"); });
        btn.classList.add("active");
        updatePreview();
      });
    });
  }

  function initMobilePreview() {
    var toggle = $("#preview-mobile-toggle");
    var body = $("#preview-panel-body");
    if (!toggle || !body) return;
    toggle.addEventListener("click", function () {
      var collapsed = body.classList.toggle("collapsed");
      toggle.setAttribute("aria-expanded", collapsed ? "false" : "true");
    });
  }

  function initWizardNav() {
    $("#wizard-next") && $("#wizard-next").addEventListener("click", function () {
      if (!validateStep(state.step)) return;
      setStep(Math.min(TOTAL_STEPS, state.step + 1));
    });
    $("#wizard-prev") && $("#wizard-prev").addEventListener("click", function () {
      setStep(Math.max(1, state.step - 1));
    });
    $("#builder-form") && $("#builder-form").addEventListener("submit", function (e) {
      e.preventDefault();
      if (!validateStep(TOTAL_STEPS)) return;
      recomputeSizeBreakdown();
      state.contact.phone = $("#contact-phone").value.trim();
      state.notes = $("#contact-notes").value.trim();
      state.teamName = $("#team-name").value.trim();
      state.decoration = (document.querySelector('input[name="decoration"]:checked') || {}).value || "embroidery";

      generatePreviewDataUrl().then(function (preview) {
        var spec = buildSpec();
        saveDesign(spec, preview);
        var success = $(".builder-success");
        if (success) {
          success.classList.add("visible");
          success.innerHTML =
            t("builder.v2.success") +
            ' <a href="/admin/designs/detail.html?id=' + encodeURIComponent(spec.id) + '">' +
            t("builder.success.admin") + "</a>";
        }
        $("#builder-form").style.display = "none";
        window.scrollTo({ top: 0, behavior: "smooth" });
      });
    });
  }

  function init() {
    if (!state.productType) state.productType = "jersey";
    if (!state.templateSlug) state.templateSlug = TEMPLATES[0].slug;
    syncTemplateForProductType();
    applyTemplateColors(state.templateSlug);

    renderProductTypes();
    renderTemplates();
    initColorPanel();
    initLogoUpload();
    initOrderMode();
    initGenderSelector();
    initViewToggle();
    initMobilePreview();
    initWizardNav();

    if (!state.roster.length) state.roster = defaultRosterRows();
    renderRosterTable();

    $("#roster-add-btn") && $("#roster-add-btn").addEventListener("click", addRosterRow);

    $$('input[name="decoration"]').forEach(function (radio) {
      radio.addEventListener("change", updatePreviewSummary);
    });

    var teamInput = $("#team-name");
    if (teamInput) {
      teamInput.addEventListener("input", function () {
        state.teamName = teamInput.value;
        schedulePreviewRender();
      });
    }

    recomputeSizeBreakdown();
    setStep(1);
    renderPhotoPreview();
  }

  document.addEventListener("DOMContentLoaded", init);
  document.addEventListener("rs:locale", function () {
    renderProductTypes();
    renderTemplates();
    renderColorPanel();
    var label = $("[data-step-label]");
    if (label) label.textContent = t("builder.v2.step." + state.step);
    if (state.step === TOTAL_STEPS) renderSummaryCards();
    updatePreviewSummary();
    schedulePreviewRender();
  });
})();
