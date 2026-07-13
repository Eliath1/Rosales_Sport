/**
 * Renders the simulated CRM data (window.RS_CRM, from mock-crm-data.js)
 * into the admin demo pages. Each page only needs the DOM containers below
 * (by id) - this script no-ops for containers that are not present, so one
 * shared file can run on every admin page.
 *
 * Re-renders on the "rs:locale" event (fired by i18n.js on ES/EN toggle) so
 * dynamically-built rows stay translated without needing data-i18n on every
 * generated cell.
 */
(function () {
  "use strict";

  var MONTH_LABELS = {
    es: ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"],
    en: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
  };

  function lang() {
    return (window.rsI18n && window.rsI18n.getLang()) || "es";
  }

  function t(key, vars) {
    return window.rsI18n ? window.rsI18n.t(lang(), key, vars) : key;
  }

  function monthLabel(monthKey) {
    var m = parseInt(monthKey.split("-")[1], 10) - 1;
    return MONTH_LABELS[lang() === "en" ? "en" : "es"][m];
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    var locale = lang() === "en" ? "en-US" : "es-MX";
    return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short" }).format(d);
  }

  function el(tag, className, html) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (html !== undefined) node.innerHTML = html;
    return node;
  }

  function quoteStatusClass(status) {
    return "status status-" + status;
  }

  function quoteStatusLabel(status) {
    return t("admin.status." + status);
  }

  function orderStageClass(stage) {
    return "status status-" + stage.replace(/_/g, "-");
  }

  function orderStageLabel(stage) {
    return t("order.stage." + stage);
  }

  function customerTypeLabel(type) {
    return t("admin.customer.type." + type);
  }

  function customerName(crm, id) {
    var c = crm.customerById(id);
    return c ? c.name : id;
  }

  // ---- Dashboard (admin/index.html) ----------------------------------

  function renderKpiValue(id, value) {
    var el2 = document.getElementById(id);
    if (el2) el2.textContent = value;
  }

  function renderDashboardKpis(crm) {
    if (!document.getElementById("kpi-quotes-week")) return;
    var totals = crm.totals;
    renderKpiValue("kpi-quotes-week", String(totals.quotesThisWeek));
    renderKpiValue("kpi-pipeline", crm.formatMXN(totals.pipelineAmount));
    renderKpiValue("kpi-followup", String(totals.followUpCount));
    renderKpiValue("kpi-accepted", String(totals.acceptedThisMonth));
    renderKpiValue("kpi-revenue", crm.formatMXN(totals.revenue));
    renderKpiValue("kpi-cost", crm.formatMXN(totals.cost));
    renderKpiValue("kpi-profit", crm.formatMXN(totals.profit));
    renderKpiValue("kpi-margin", crm.formatPct(totals.marginPct));
    renderKpiValue("kpi-units", String(totals.units));
  }

  function renderFinanceChart(crm) {
    var container = document.getElementById("finance-chart");
    if (!container) return;
    container.innerHTML = "";

    var maxValue = crm.monthly.reduce(function (max, m) {
      return Math.max(max, m.revenue);
    }, 1);

    crm.monthly.forEach(function (m) {
      var group = el("div", "bar-chart-group");
      var bars = el("div", "bar-chart-bars");
      bars.title =
        monthLabel(m.key) +
        ": " +
        crm.formatMXN(m.revenue) +
        " / " +
        crm.formatMXN(m.cost) +
        " / " +
        crm.formatMXN(m.profit);

      var revenueBar = el("div", "bar-chart-bar bar-revenue");
      revenueBar.style.height = Math.max(6, Math.round((m.revenue / maxValue) * 100)) + "%";
      var costBar = el("div", "bar-chart-bar bar-cost");
      costBar.style.height = Math.max(6, Math.round((m.cost / maxValue) * 100)) + "%";
      var profitBar = el("div", "bar-chart-bar bar-profit");
      profitBar.style.height = Math.max(6, Math.round((m.profit / maxValue) * 100)) + "%";

      bars.appendChild(revenueBar);
      bars.appendChild(costBar);
      bars.appendChild(profitBar);

      group.appendChild(bars);
      group.appendChild(el("div", "bar-chart-label", monthLabel(m.key)));
      container.appendChild(group);
    });
  }

  function renderPipelineSummary(crm) {
    var container = document.getElementById("pipeline-summary");
    if (!container) return;
    container.innerHTML = "";

    crm.pipelineStages.forEach(function (stage) {
      var count = crm.orders.filter(function (o) {
        return o.currentStatus === stage;
      }).length;
      var card = el("a", "pipeline-card pipeline-card-" + stage.replace(/_/g, "-"));
      card.href = "/admin/orders.html";
      card.innerHTML =
        '<div class="count">' +
        count +
        '</div><div class="label">' +
        orderStageLabel(stage) +
        "</div>";
      container.appendChild(card);
    });
  }

  function renderRecentQuotes(crm) {
    var body = document.getElementById("recent-quotes-body");
    if (!body) return;
    body.innerHTML = "";

    crm.quotes.slice(0, 6).forEach(function (q) {
      var row = el("tr");
      row.innerHTML =
        '<td><a href="/admin/quotes.html">' +
        customerName(crm, q.customerId) +
        "</a></td>" +
        "<td>" +
        crm.formatMXN(q.amount) +
        "</td>" +
        "<td><span class=\"" +
        quoteStatusClass(q.status) +
        '">' +
        quoteStatusLabel(q.status) +
        "</span></td>" +
        "<td>" +
        formatDate(q.createdAt) +
        "</td>";
      body.appendChild(row);
    });
  }

  // ---- Quotes list (admin/quotes.html) -------------------------------

  function renderQuotesTable(crm) {
    var body = document.getElementById("quotes-table-body");
    if (!body) return;
    body.innerHTML = "";

    crm.quotes.forEach(function (q) {
      var row = el("tr");
      row.innerHTML =
        '<td><a href="/admin/quotes/detail.html?id=' +
        q.id +
        '">' +
        q.id +
        "</a></td>" +
        "<td>" +
        customerName(crm, q.customerId) +
        "</td>" +
        "<td>" +
        crm.formatMXN(q.amount) +
        "</td>" +
        "<td><span class=\"" +
        quoteStatusClass(q.status) +
        '">' +
        quoteStatusLabel(q.status) +
        "</span></td>" +
        "<td>" +
        formatDate(q.validUntil) +
        "</td>";
      body.appendChild(row);
    });

    var note = document.getElementById("quotes-count-note");
    if (note) {
      note.textContent = t("admin.quotes.count_note", { n: String(crm.quotes.length) });
    }
  }

  // ---- Customers (admin/customers.html) ------------------------------

  function renderCustomersTable(crm) {
    var body = document.getElementById("customers-table-body");
    if (!body) return;
    body.innerHTML = "";

    var sorted = crm.customers.slice().sort(function (a, b) {
      return b.lifetimeValue - a.lifetimeValue;
    });

    sorted.forEach(function (c) {
      var row = el("tr");
      row.innerHTML =
        "<td>" +
        c.name +
        "</td>" +
        "<td>" +
        customerTypeLabel(c.type) +
        "</td>" +
        "<td>" +
        c.city +
        "</td>" +
        "<td>" +
        c.email +
        "</td>" +
        "<td>" +
        c.quotesCount +
        "</td>" +
        "<td>" +
        c.ordersCount +
        "</td>" +
        "<td>" +
        crm.formatMXN(c.lifetimeValue) +
        "</td>";
      body.appendChild(row);
    });

    var note = document.getElementById("customers-count-note");
    if (note) {
      note.textContent = t("admin.customers.count_note", { n: String(crm.customers.length) });
    }
  }

  // ---- Orders / pipeline (admin/orders.html) -------------------------

  function renderOrdersPipeline(crm) {
    var stageContainer = document.getElementById("pipeline-stage-cards");
    var body = document.getElementById("orders-table-body");
    if (!stageContainer && !body) return;

    if (stageContainer) {
      stageContainer.innerHTML = "";
      crm.pipelineStages.forEach(function (stage) {
        var stageOrders = crm.orders.filter(function (o) {
          return o.currentStatus === stage;
        });
        var amount = stageOrders.reduce(function (sum, o) {
          return sum + o.revenue;
        }, 0);
        var card = el("div", "pipeline-card pipeline-card-" + stage.replace(/_/g, "-"));
        card.innerHTML =
          '<div class="count">' +
          stageOrders.length +
          '</div><div class="label">' +
          orderStageLabel(stage) +
          '</div><div class="amount">' +
          crm.formatMXN(amount) +
          "</div>";
        stageContainer.appendChild(card);
      });
    }

    if (body) {
      body.innerHTML = "";
      crm.orders.forEach(function (o) {
        var row = el("tr");
        row.innerHTML =
          '<td><a href="/admin/orders/detail.html?id=' +
          o.id +
          '">' +
          o.id +
          "</a></td>" +
          "<td>" +
          customerName(crm, o.customerId) +
          "</td>" +
          "<td>" +
          o.units +
          "</td>" +
          "<td>" +
          crm.formatMXN(o.revenue) +
          "</td>" +
          "<td>" +
          crm.formatMXN(o.profit) +
          "</td>" +
          "<td>" +
          crm.formatPct(o.marginPct) +
          "</td>" +
          "<td><span class=\"" +
          orderStageClass(o.currentStatus) +
          '">' +
          orderStageLabel(o.currentStatus) +
          "</span></td>" +
          "<td>" +
          formatDate(o.acceptedAt) +
          "</td>";
        body.appendChild(row);
      });
    }
  }

  // ---- Order detail (admin/orders/detail.html) -----------------------

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function renderOrderDetail(crm) {
    var root = document.getElementById("order-detail-root");
    if (!root) return;

    var id = getQueryParam("id");
    var order = (id && crm.orderById(id)) || crm.orders[0];
    if (!order) return;

    var customer = crm.customerById(order.customerId);

    var titleEl = document.getElementById("order-title");
    if (titleEl) {
      titleEl.textContent = order.id + " - " + (customer ? customer.name : order.customerId);
    }
    var breadcrumbEl = document.getElementById("order-breadcrumb-current");
    if (breadcrumbEl) breadcrumbEl.textContent = order.id;

    var metaEl = document.getElementById("order-meta");
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="' +
        orderStageClass(order.currentStatus) +
        '">' +
        orderStageLabel(order.currentStatus) +
        "</span> " +
        t("admin.order.detail.units_summary", { n: String(order.units) }) +
        " - " +
        t("admin.order.detail.accepted_on") +
        " " +
        formatDate(order.acceptedAt);
    }

    var stepperEl = document.getElementById("order-stepper");
    if (stepperEl) {
      stepperEl.innerHTML = "";
      var currentIndex = crm.pipelineStages.indexOf(order.currentStatus);
      crm.pipelineStages.forEach(function (stage, i) {
        var stateClass = i < currentIndex ? "done" : i === currentIndex ? "current" : "upcoming";
        var step = el("div", "order-step " + stateClass);
        step.innerHTML =
          '<div class="line"></div><div class="dot">' +
          (i + 1) +
          '</div><div class="label">' +
          orderStageLabel(stage) +
          "</div>";
        stepperEl.appendChild(step);
      });
    }

    var timelineBody = document.getElementById("order-timeline-body");
    if (timelineBody) {
      timelineBody.innerHTML = "";
      order.statusHistory.forEach(function (entry) {
        var row = el("tr", entry.reached ? "" : "row-upcoming");
        row.innerHTML =
          "<td><span class=\"" +
          orderStageClass(entry.stage) +
          '">' +
          orderStageLabel(entry.stage) +
          "</span></td>" +
          "<td>" +
          formatDate(entry.date) +
          "</td>" +
          "<td>" +
          (entry.reached ? t("admin.order.detail.done") : t("admin.order.detail.pending")) +
          "</td>";
        timelineBody.appendChild(row);
      });
    }

    var financeEl = document.getElementById("order-finance-grid");
    if (financeEl) {
      financeEl.innerHTML =
        '<div class="kpi-card kpi-revenue"><div class="value">' +
        crm.formatMXN(order.revenue) +
        '</div><div class="label">' +
        t("admin.kpi.revenue") +
        '</div></div><div class="kpi-card kpi-cost"><div class="value">' +
        crm.formatMXN(order.cost) +
        '</div><div class="label">' +
        t("admin.kpi.cost") +
        '</div></div><div class="kpi-card kpi-profit"><div class="value">' +
        crm.formatMXN(order.profit) +
        '</div><div class="label">' +
        t("admin.kpi.profit") +
        '</div></div><div class="kpi-card kpi-margin"><div class="value">' +
        crm.formatPct(order.marginPct) +
        '</div><div class="label">' +
        t("admin.kpi.margin") +
        "</div></div>";
    }

    var customerEl = document.getElementById("order-customer");
    if (customerEl && customer) {
      customerEl.innerHTML =
        "<strong>" +
        customer.name +
        "</strong> &middot; " +
        customerTypeLabel(customer.type) +
        " &middot; " +
        customer.city +
        " &middot; " +
        customer.email;
    }
  }

  // ---- Quote detail (admin/quotes/detail.html) -----------------------

  function decorationLabel(type) {
    return t("admin.custom.deco." + type);
  }

  function renderQuoteDetail(crm) {
    var root = document.getElementById("quote-detail-root");
    if (!root) return;

    var id = getQueryParam("id");
    var quote = (id && crm.quoteById(id)) || crm.quotes[0];
    if (!quote) return;

    var customer = crm.customerById(quote.customerId);

    var titleEl = document.getElementById("quote-title");
    if (titleEl) {
      titleEl.textContent = quote.id + " - " + (customer ? customer.name : quote.customerId);
    }
    var breadcrumbEl = document.getElementById("quote-breadcrumb-current");
    if (breadcrumbEl) breadcrumbEl.textContent = quote.id;

    var metaEl = document.getElementById("quote-meta");
    if (metaEl) {
      metaEl.innerHTML =
        '<span class="' +
        quoteStatusClass(quote.status) +
        '">' +
        quoteStatusLabel(quote.status) +
        "</span> " +
        t("admin.order.detail.units_summary", { n: String(quote.units) }) +
        " - " +
        t("admin.col.valid") +
        " " +
        formatDate(quote.validUntil);
    }

    var customerEl = document.getElementById("quote-customer");
    if (customerEl && customer) {
      customerEl.innerHTML =
        "<strong>" +
        customer.name +
        "</strong> &middot; " +
        customerTypeLabel(customer.type) +
        " &middot; " +
        customer.city +
        " &middot; " +
        customer.email;
    }

    var customEl = document.getElementById("quote-custom-detail");
    if (customEl) {
      customEl.innerHTML =
        '<dt style="font-weight:700;" data-i18n="admin.custom.decoration">' +
        t("admin.custom.decoration") +
        "</dt><dd>" +
        decorationLabel(quote.decorationType) +
        '</dd><dt style="font-weight:700;" data-i18n="admin.custom.sizes">' +
        t("admin.custom.sizes") +
        "</dt><dd>" +
        t("admin.order.detail.units_summary", { n: String(quote.units) }) +
        '</dd><dt style="font-weight:700;" data-i18n="admin.custom.roster">' +
        t("admin.custom.roster") +
        "</dt><dd>" +
        t("admin.custom.roster.generic") +
        "</dd>";
    }

    var lineItemsBody = document.getElementById("quote-line-items-body");
    if (lineItemsBody) {
      lineItemsBody.innerHTML =
        "<tr><td>" +
        t("admin.custom.line_item") +
        " - " +
        decorationLabel(quote.decorationType) +
        "</td><td>" +
        quote.units +
        "</td><td>" +
        crm.formatMXN(quote.unitPrice) +
        "</td><td>" +
        crm.formatMXN(quote.amount) +
        "</td></tr>";
    }

    var totalEl = document.getElementById("quote-total");
    if (totalEl) {
      totalEl.textContent = crm.formatMXN(quote.amount) + " MXN";
    }
  }

  function renderAll() {
    var crm = window.RS_CRM;
    if (!crm) return;
    renderDashboardKpis(crm);
    renderFinanceChart(crm);
    renderPipelineSummary(crm);
    renderRecentQuotes(crm);
    renderQuotesTable(crm);
    renderCustomersTable(crm);
    renderOrdersPipeline(crm);
    renderOrderDetail(crm);
    renderQuoteDetail(crm);
  }

  document.addEventListener("DOMContentLoaded", renderAll);
  document.addEventListener("rs:locale", renderAll);
})();
