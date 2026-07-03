(function () {
  "use strict";

  function showToast(message) {
    var existing = document.querySelector(".toast");
    if (existing) existing.remove();
    var toast = document.createElement("div");
    toast.className = "toast";
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.classList.add("visible"); });
    setTimeout(function () {
      toast.classList.remove("visible");
      setTimeout(function () { toast.remove(); }, 200);
    }, 4000);
  }

  function initMobileMenu() {
    var toggle = document.querySelector(".menu-toggle");
    var mobile = document.querySelector(".nav-mobile");
    if (!toggle || !mobile) return;
    toggle.addEventListener("click", function () {
      mobile.classList.toggle("open");
    });
  }

  function initFilterSidebar() {
    var openBtn = document.querySelector("[data-open-filters]");
    var sidebar = document.querySelector(".filters-sidebar");
    var closeBtn = document.querySelector(".filter-close");
    if (openBtn && sidebar) {
      openBtn.addEventListener("click", function () { sidebar.classList.add("open"); });
    }
    if (closeBtn && sidebar) {
      closeBtn.addEventListener("click", function () { sidebar.classList.remove("open"); });
    }
  }

  function initCollectionFilters() {
    var inputs = document.querySelectorAll(".filters-sidebar input[type=checkbox], .filters-sidebar input[type=radio]");
    var cards = document.querySelectorAll(".product-card[data-team], .product-card[data-liga]");

    function applyFilters() {
      var teams = [];
      var ligas = [];
      document.querySelectorAll(".filters-sidebar input[data-filter-team]:checked").forEach(function (el) {
        teams.push(el.value);
      });
      document.querySelectorAll(".filters-sidebar input[data-filter-liga]:checked").forEach(function (el) {
        ligas.push(el.value);
      });

      var count = 0;
      cards.forEach(function (card) {
        var team = card.getAttribute("data-team");
        var liga = card.getAttribute("data-liga");
        var teamOk = !teams.length || teams.indexOf(team) >= 0;
        var ligaOk = !ligas.length || ligas.indexOf(liga) >= 0;
        if (teamOk && ligaOk) {
          card.classList.remove("hidden");
          count++;
        } else {
          card.classList.add("hidden");
        }
      });

      var countEl = document.querySelector("[data-product-count]");
      if (countEl) {
        countEl.setAttribute("data-i18n-n", String(count));
        if (window.rsI18n) {
          countEl.textContent = window.rsI18n.t(window.rsI18n.getLang(), "collection.count", { n: count });
        }
      }
    }

    inputs.forEach(function (input) {
      input.addEventListener("change", applyFilters);
    });
  }

  function initSort() {
    var select = document.querySelector("[data-sort]");
    var grid = document.querySelector(".product-grid");
    if (!select || !grid) return;

    select.addEventListener("change", function () {
      var cards = Array.prototype.slice.call(grid.querySelectorAll(".product-card"));
      cards.sort(function (a, b) {
        var pa = parseFloat(a.getAttribute("data-price") || "0");
        var pb = parseFloat(b.getAttribute("data-price") || "0");
        if (select.value === "price-asc") return pa - pb;
        if (select.value === "price-desc") return pb - pa;
        return 0;
      });
      cards.forEach(function (c) { grid.appendChild(c); });
    });
  }

  function initSizeSelector() {
    var buttons = document.querySelectorAll(".size-btn:not(:disabled)");
    buttons.forEach(function (btn) {
      btn.addEventListener("click", function () {
        buttons.forEach(function (b) { b.classList.remove("selected"); });
        btn.classList.add("selected");
      });
    });
  }

  function initGallery() {
    var main = document.querySelector(".pdp-gallery-main");
    var thumbs = document.querySelectorAll(".pdp-thumb");
    if (!main || !thumbs.length) return;
    thumbs.forEach(function (thumb, i) {
      thumb.addEventListener("click", function () {
        thumbs.forEach(function (t) { t.classList.remove("active"); });
        thumb.classList.add("active");
        var key = thumb.getAttribute("data-i18n-key");
        var label = key && window.rsI18n
          ? window.rsI18n.t(window.rsI18n.getLang(), key)
          : (thumb.getAttribute("data-label") || "View " + (i + 1));
        var ph = main.querySelector(".placeholder-jersey");
        if (ph) ph.textContent = label;
      });
    });
  }

  function initForms() {
    document.querySelectorAll("[data-demo-form]").forEach(function (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var success = form.querySelector(".form-success");
        if (success) {
          success.classList.add("visible");
          form.reset();
        } else {
          showToast("Demo: en produccion esto crea un lead en el CRM.");
        }
      });
    });
  }

  function initDemoActions() {
    document.querySelectorAll("[data-demo-action]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showToast(el.getAttribute("data-demo-action") || "Disponible en la siguiente etapa.");
      });
    });

    document.querySelectorAll("[data-demo-icon]").forEach(function (el) {
      el.addEventListener("click", function (e) {
        e.preventDefault();
        showToast(el.getAttribute("data-demo-icon"));
      });
    });
  }

  function prefillQuoteFromProduct() {
    var params = new URLSearchParams(window.location.search);
    var sku = params.get("sku");
    var name = params.get("name");
    var productInput = document.querySelector("#product-interest");
    if (productInput && (sku || name)) {
      productInput.value = (name || "") + (sku ? " (" + sku + ")" : "");
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    initMobileMenu();
    initFilterSidebar();
    initCollectionFilters();
    initSort();
    initSizeSelector();
    initGallery();
    initForms();
    initDemoActions();
    prefillQuoteFromProduct();
  });

  document.addEventListener("rs:locale", function () {
    var cards = document.querySelectorAll(".product-card[data-team], .product-card[data-liga]");
    if (!cards.length) return;
    var count = 0;
    cards.forEach(function (card) {
      if (!card.classList.contains("hidden")) count++;
    });
    var countEl = document.querySelector("[data-product-count]");
    if (countEl && window.rsI18n) {
      countEl.setAttribute("data-i18n-n", String(count));
      countEl.textContent = window.rsI18n.t(window.rsI18n.getLang(), "collection.count", { n: count });
    }
  });

  window.demoShowToast = showToast;
})();
