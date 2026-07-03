(function () {
  "use strict";

  var STORAGE_KEY = "rs-demo-lang";
  var DEFAULT_LANG = "es";

  function getLangFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var lang = params.get("lang");
    if (lang === "en" || lang === "es") return lang;
    return null;
  }

  function getLang() {
    return getLangFromUrl() || localStorage.getItem(STORAGE_KEY) || DEFAULT_LANG;
  }

  function t(lang, key, vars) {
    var bag = window.RS_MESSAGES && window.RS_MESSAGES[lang];
    if (!bag) return key;
    var str = bag[key] || window.RS_MESSAGES.es[key] || key;
    if (vars) {
      Object.keys(vars).forEach(function (k) {
        str = str.replace("{" + k + "}", vars[k]);
      });
    }
    return str;
  }

  function applyLocale(lang) {
    if (!window.RS_MESSAGES || !window.RS_MESSAGES[lang]) lang = DEFAULT_LANG;
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang === "en" ? "en" : "es-MX";

    document.querySelectorAll("[data-i18n]").forEach(function (el) {
      var key = el.getAttribute("data-i18n");
      var vars = {};
      if (el.hasAttribute("data-i18n-n")) {
        vars.n = el.getAttribute("data-i18n-n");
      }
      el.textContent = t(lang, key, vars);
    });

    document.querySelectorAll("[data-i18n-placeholder]").forEach(function (el) {
      el.placeholder = t(lang, el.getAttribute("data-i18n-placeholder"));
    });

    document.querySelectorAll("[data-i18n-aria]").forEach(function (el) {
      el.setAttribute("aria-label", t(lang, el.getAttribute("data-i18n-aria")));
    });

    document.querySelectorAll("[data-i18n-title]").forEach(function (el) {
      document.title = t(lang, el.getAttribute("data-i18n-title"));
    });

    document.querySelectorAll("option[data-i18n]").forEach(function (el) {
      el.textContent = t(lang, el.getAttribute("data-i18n"));
    });

    document.querySelectorAll("[data-i18n-toast]").forEach(function (el) {
      el.setAttribute("data-demo-icon", t(lang, el.getAttribute("data-i18n-toast")));
      el.setAttribute("data-demo-action", t(lang, el.getAttribute("data-i18n-toast")));
    });

    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      var btnLang = btn.getAttribute("data-lang");
      btn.classList.toggle("active", btnLang === lang);
      btn.setAttribute("aria-pressed", btnLang === lang ? "true" : "false");
    });

    document.querySelectorAll("[data-i18n-content]").forEach(function (el) {
      el.setAttribute("content", t(lang, el.getAttribute("data-i18n-content")));
    });

    window.RS_CURRENT_LANG = lang;
    document.dispatchEvent(new CustomEvent("rs:locale", { detail: { lang: lang } }));
  }

  function switchLang(lang) {
    applyLocale(lang);
    var url = new URL(window.location.href);
    url.searchParams.set("lang", lang);
    window.history.replaceState({}, "", url.toString());
  }

  function initLangSwitcher() {
    document.querySelectorAll(".lang-btn").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        switchLang(btn.getAttribute("data-lang"));
      });
    });
  }

  function appendLangToLinks() {
    var lang = getLang();
    document.querySelectorAll("a[href]").forEach(function (a) {
      var href = a.getAttribute("href");
      if (!href || href.indexOf("#") === 0 || href.indexOf("mailto:") === 0) return;
      if (href.indexOf("http") === 0) return;
      try {
        var url = new URL(href, window.location.origin);
        if (url.origin === window.location.origin) {
          url.searchParams.set("lang", lang);
          a.setAttribute("href", url.pathname + url.search + url.hash);
        }
      } catch (err) { /* ignore */ }
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyLocale(getLang());
    initLangSwitcher();
    appendLangToLinks();
  });

  window.rsI18n = { getLang: getLang, t: t, applyLocale: applyLocale, switchLang: switchLang };
})();
