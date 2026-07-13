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

  /* Cart - localStorage-backed, shared across PDP, cart, and checkout pages.
     Stage D is a static demo: no server order is created, but the cart/checkout
     UI is fully interactive so a client can click through the real flow. */
  var CART_KEY = "rs_demo_cart_v1";
  var MIN_ORDER_QTY = 6;

  function lang() {
    return window.rsI18n ? window.rsI18n.getLang() : "es";
  }

  function tt(key, vars) {
    return window.rsI18n ? window.rsI18n.t(lang(), key, vars) : key;
  }

  function formatMoney(amount) {
    var n = Number(amount) || 0;
    return "$ " + n.toLocaleString("es-MX", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " MXN";
  }

  function getCart() {
    try {
      var raw = localStorage.getItem(CART_KEY);
      var items = raw ? JSON.parse(raw) : [];
      return Array.isArray(items) ? items : [];
    } catch (e) {
      return [];
    }
  }

  function setCart(items) {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
    updateCartBadge();
    document.dispatchEvent(new CustomEvent("rs:cart-change", { detail: { items: items } }));
  }

  function addToCart(item) {
    var cart = getCart();
    var existing = cart.filter(function (i) { return i.sku === item.sku; })[0];
    if (existing) {
      existing.qty += item.qty;
    } else {
      cart.push(item);
    }
    setCart(cart);
    return cart;
  }

  function removeFromCart(sku) {
    setCart(getCart().filter(function (i) { return i.sku !== sku; }));
  }

  function setItemQty(sku, qty) {
    qty = Math.max(1, parseInt(qty, 10) || 1);
    var cart = getCart().map(function (i) {
      if (i.sku === sku) i.qty = qty;
      return i;
    });
    setCart(cart);
  }

  function cartTotals(cart) {
    cart = cart || getCart();
    var totalQty = 0;
    var subtotal = 0;
    cart.forEach(function (i) {
      totalQty += i.qty;
      subtotal += i.qty * i.price;
    });
    return { totalQty: totalQty, subtotal: subtotal };
  }

  function computeSplit(subtotal, totalQty) {
    if (totalQty >= MIN_ORDER_QTY) {
      var deposit = Math.round(subtotal * 0.5 * 100) / 100;
      return { plan: "deposit_50", deposit: deposit, balance: Math.round((subtotal - deposit) * 100) / 100 };
    }
    return { plan: "full", deposit: subtotal, balance: 0 };
  }

  function updateCartBadge() {
    var totals = cartTotals();
    document.querySelectorAll("[data-cart-badge]").forEach(function (el) {
      el.textContent = String(totals.totalQty);
      el.classList.toggle("badge-empty", totals.totalQty === 0);
    });
  }

  function initAddToCart() {
    document.querySelectorAll("[data-add-to-cart], [data-buy-now]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.preventDefault();
        var qtyInputSelector = btn.getAttribute("data-qty-input");
        var qtyInput = qtyInputSelector ? document.querySelector(qtyInputSelector) : null;
        var qty = qtyInput ? parseInt(qtyInput.value, 10) : parseInt(btn.getAttribute("data-qty") || String(MIN_ORDER_QTY), 10);
        if (!qty || qty < 1) qty = MIN_ORDER_QTY;

        var item = {
          sku: btn.getAttribute("data-sku"),
          name: btn.getAttribute("data-name") || btn.getAttribute("data-sku"),
          price: parseFloat(btn.getAttribute("data-price")) || 0,
          image: btn.getAttribute("data-image") || "",
          qty: qty
        };
        if (!item.sku) return;

        addToCart(item);

        if (btn.hasAttribute("data-buy-now")) {
          window.location.href = withLang("/checkout/");
        } else {
          showToast(tt("toast.added_to_cart", { name: item.name, qty: item.qty }));
        }
      });
    });
  }

  function withLang(path) {
    try {
      var url = new URL(path, window.location.origin);
      url.searchParams.set("lang", lang());
      return url.pathname + url.search;
    } catch (e) {
      return path;
    }
  }

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function renderCartPage() {
    var root = document.getElementById("cart-root");
    if (!root) return;
    var cart = getCart();
    var totals = cartTotals(cart);

    if (!cart.length) {
      root.innerHTML =
        '<div class="form-card" style="text-align:center;">' +
        "<p>" + escapeHtml(tt("cart.empty")) + "</p>" +
        '<a href="' + withLang("/collections/jerseys.html") + '" class="btn btn-primary">' + escapeHtml(tt("cart.empty.cta")) + "</a>" +
        "</div>";
      return;
    }

    var rows = cart.map(function (item) {
      return (
        '<tr data-cart-row="' + escapeHtml(item.sku) + '">' +
        "<td>" + escapeHtml(item.name) + '<br><span class="pdp-sku">SKU: ' + escapeHtml(item.sku) + "</span></td>" +
        '<td><input type="number" min="1" value="' + item.qty + '" class="cart-qty-input" data-cart-qty="' + escapeHtml(item.sku) + '" style="width:70px;padding:0.4rem;border:1px solid var(--gray-200);"></td>' +
        "<td>" + formatMoney(item.price) + "</td>" +
        "<td>" + formatMoney(item.price * item.qty) + "</td>" +
        '<td><button type="button" class="btn btn-outline" data-cart-remove="' + escapeHtml(item.sku) + '" style="padding:0.4rem 0.75rem;font-size:11px;">' + escapeHtml(tt("cart.remove")) + "</button></td>" +
        "</tr>"
      );
    }).join("");

    var warning = "";
    if (totals.totalQty < MIN_ORDER_QTY) {
      warning =
        '<p class="checkout-deposit-note">' +
        escapeHtml(tt("cart.min_warning", { n: MIN_ORDER_QTY - totals.totalQty })) +
        "</p>";
    }

    root.innerHTML =
      '<table class="table" style="width:100%;border-collapse:collapse;margin-bottom:1.5rem;">' +
      "<thead><tr>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("cart.col.product")) + "</th>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("cart.col.qty")) + "</th>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("cart.col.price")) + "</th>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("cart.col.total")) + "</th>" +
      "<th style=\"border-bottom:2px solid var(--rs-black);\"></th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table>" +
      warning +
      '<div class="checkout-line checkout-total"><span>' + escapeHtml(tt("cart.subtotal")) + '</span><span>' + formatMoney(totals.subtotal) + "</span></div>" +
      '<div class="pdp-actions" style="max-width:320px;margin-left:auto;">' +
      '<a href="' + withLang("/checkout/") + '" class="btn btn-primary' + (totals.totalQty < MIN_ORDER_QTY ? " btn-disabled" : "") + '"' + (totals.totalQty < MIN_ORDER_QTY ? ' aria-disabled="true" onclick="return false;"' : "") + ">" + escapeHtml(tt("cart.checkout")) + "</a>" +
      '<a href="' + withLang("/collections/jerseys.html") + '" class="btn btn-outline">' + escapeHtml(tt("cart.continue_shopping")) + "</a>" +
      "</div>";

    root.querySelectorAll("[data-cart-remove]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        removeFromCart(btn.getAttribute("data-cart-remove"));
        renderCartPage();
      });
    });
    root.querySelectorAll("[data-cart-qty]").forEach(function (input) {
      input.addEventListener("change", function () {
        setItemQty(input.getAttribute("data-cart-qty"), input.value);
        renderCartPage();
      });
    });
  }

  function renderCheckoutSummary() {
    var summaryRoot = document.getElementById("checkout-summary-root");
    var formRoot = document.getElementById("checkout-form-root");
    if (!summaryRoot) return null;
    var cart = getCart();
    var totals = cartTotals(cart);

    if (!cart.length) {
      summaryRoot.innerHTML =
        '<div class="form-card" style="text-align:center;">' +
        "<p>" + escapeHtml(tt("checkout.empty")) + "</p>" +
        '<a href="' + withLang("/collections/jerseys.html") + '" class="btn btn-primary">' + escapeHtml(tt("checkout.empty.cta")) + "</a>" +
        "</div>";
      if (formRoot) formRoot.style.display = "none";
      return null;
    }

    var split = computeSplit(totals.subtotal, totals.totalQty);
    var lines = cart.map(function (item) {
      return (
        '<div class="checkout-line"><span>' + escapeHtml(item.name) + " x" + item.qty + "</span><span>" +
        formatMoney(item.price * item.qty) + "</span></div>"
      );
    }).join("");

    var depositMsg = split.plan === "deposit_50"
      ? tt("checkout.deposit.split", { deposit: formatMoney(split.deposit), balance: formatMoney(split.balance) })
      : tt("checkout.deposit.full", { amount: formatMoney(split.deposit) });

    summaryRoot.innerHTML =
      '<div class="checkout-summary">' +
      "<h2>" + escapeHtml(tt("checkout.summary.title")) + "</h2>" +
      lines +
      '<div class="checkout-line checkout-total"><span>' + escapeHtml(tt("cart.subtotal")) + "</span><span>" + formatMoney(totals.subtotal) + "</span></div>" +
      '<p class="checkout-deposit-note" style="margin-top:1rem;">' + escapeHtml(depositMsg) + "</p>" +
      "</div>";

    if (formRoot) formRoot.style.display = "";
    return { cart: cart, totals: totals, split: split };
  }

  function initCheckoutForm() {
    var form = document.getElementById("checkout-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var success = form.querySelector(".form-success");
      setCart([]);
      if (success) {
        form.reset();
        form.querySelectorAll("input, select, button").forEach(function (el) { el.disabled = true; });
        success.textContent = tt("checkout.success");
        success.classList.add("visible");
      } else {
        showToast(tt("checkout.success"));
      }
    });
  }

  function initCart() {
    updateCartBadge();
    initAddToCart();
    renderCartPage();
    renderCheckoutSummary();
    initCheckoutForm();
  }

  window.addEventListener("storage", function (e) {
    if (e.key === CART_KEY) updateCartBadge();
  });

  document.addEventListener("rs:locale", function () {
    renderCartPage();
    renderCheckoutSummary();
  });

  window.rsCart = {
    get: getCart,
    add: addToCart,
    remove: removeFromCart,
    setQty: setItemQty,
    totals: cartTotals,
    computeSplit: computeSplit,
    formatMoney: formatMoney
  };

  /* Customer session - localStorage-backed, same pattern as the cart module
     above. Stage D is a static demo: /mi-cuenta/login/ and /mi-cuenta/registro/
     accept any input and "log in" by just saving a fake session - there is no
     server, no password hashing, and no real auth check. */
  var CUSTOMER_KEY = "rs_demo_customer_v1";

  // Status strings match Order.status in app/prisma/schema.prisma (OrderStatus
  // enum) so this demo's copy/labels stay consistent with the real backend if
  // ever compared side-by-side. Static seed data only - not tied to the cart.
  var ORDER_PIPELINE = ["pending_payment", "payment_received", "in_progress", "preparing_shipment", "shipped", "delivered"];
  var DEMO_ORDERS = [
    {
      id: "RS-0001042",
      createdAt: "2026-06-02",
      status: "delivered",
      totalMXN: 5400,
      items: [{ name: "Jersey RS Manga Normal", qty: 6, sku: "RS-JER-CUS-BLANCO" }]
    },
    {
      id: "RS-0001078",
      createdAt: "2026-06-20",
      status: "shipped",
      totalMXN: 8100,
      items: [{ name: "Uniforme Equipo Halcones (jersey + pantalon)", qty: 9, sku: "RS-JER-CUS-BOR-NEG" }]
    },
    {
      id: "RS-0001101",
      createdAt: "2026-07-08",
      status: "in_progress",
      totalMXN: 2700,
      items: [{ name: "Jersey RS Navy Pinstripe", qty: 6, sku: "RS-JER-CUS-NAV-PIN" }]
    },
    {
      id: "RS-0001114",
      createdAt: "2026-07-09",
      status: "pending_payment",
      totalMXN: 3150,
      items: [{ name: "Pantalon RS Classic Blanco", qty: 7, sku: "RS-PAN-CUS-BLANCO" }]
    }
  ];

  function getCustomer() {
    try {
      var raw = localStorage.getItem(CUSTOMER_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setCustomer(obj) {
    localStorage.setItem(CUSTOMER_KEY, JSON.stringify(obj));
    document.dispatchEvent(new CustomEvent("rs:customer-change", { detail: { customer: obj } }));
  }

  function logoutCustomer() {
    localStorage.removeItem(CUSTOMER_KEY);
    document.dispatchEvent(new CustomEvent("rs:customer-change", { detail: { customer: null } }));
  }

  function firstName(name) {
    var trimmed = String(name || "").trim();
    return trimmed ? trimmed.split(/\s+/)[0] : trimmed;
  }

  function renderAccountLinks() {
    var customer = getCustomer();
    document.querySelectorAll("[data-account-link]").forEach(function (el) {
      var label = el.querySelector("[data-account-link-label]") || el;
      if (customer) {
        el.setAttribute("href", withLang("/mi-cuenta/"));
        label.textContent = firstName(customer.name) || customer.email;
      } else {
        el.setAttribute("href", withLang("/mi-cuenta/login/"));
        label.textContent = tt("account.nav.login");
      }
    });
  }

  function renderAccountPage() {
    var root = document.getElementById("account-root");
    if (!root) return;
    var customer = getCustomer();

    if (!customer) {
      root.innerHTML =
        '<div class="form-card" style="text-align:center;">' +
        "<p>" + escapeHtml(tt("mycuenta.guest.intro")) + "</p>" +
        '<div class="pdp-actions" style="max-width:320px;margin:0 auto;">' +
        '<a href="' + withLang("/mi-cuenta/login/") + '" class="btn btn-primary">' + escapeHtml(tt("mycuenta.guest.cta")) + "</a>" +
        '<a href="' + withLang("/mi-cuenta/registro/") + '" class="btn btn-outline">' + escapeHtml(tt("mycuenta.guest.register_cta")) + "</a>" +
        "</div></div>";
      return;
    }

    var distributorBlock = customer.isDistributor
      ? '<div class="form-card" style="margin-top:1.5rem;">' +
        "<h2 style=\"font-size:1rem;text-transform:uppercase;margin:0 0 0.75rem;color:var(--rs-red);\">" +
        escapeHtml(tt("mycuenta.distributor.title")) + "</h2>" +
        "<p>" + escapeHtml(tt("mycuenta.distributor.body")) + "</p>" +
        "</div>"
      : "";

    root.innerHTML =
      '<div class="form-card">' +
      "<h2 style=\"margin-top:0;\">" + escapeHtml(tt("mycuenta.welcome", { name: firstName(customer.name) })) + "</h2>" +
      "<p><strong>" + escapeHtml(tt("mycuenta.email_label")) + ":</strong> " + escapeHtml(customer.email) + "</p>" +
      (customer.phone ? "<p><strong>" + escapeHtml(tt("mycuenta.phone_label")) + ":</strong> " + escapeHtml(customer.phone) + "</p>" : "") +
      '<div class="pdp-actions" style="max-width:320px;">' +
      '<a href="' + withLang("/mi-cuenta/pedidos/") + '" class="btn btn-primary">' + escapeHtml(tt("mycuenta.orders_link")) + "</a>" +
      '<button type="button" class="btn btn-outline" data-logout-btn>' + escapeHtml(tt("mycuenta.logout")) + "</button>" +
      "</div></div>" +
      distributorBlock;

    var logoutBtn = root.querySelector("[data-logout-btn]");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", function () {
        logoutCustomer();
        renderAccountPage();
        renderAccountLinks();
      });
    }
  }

  function renderOrdersListPage() {
    var root = document.getElementById("orders-root");
    if (!root) return;
    var customer = getCustomer();

    if (!customer) {
      root.innerHTML =
        '<div class="form-card" style="text-align:center;">' +
        "<p>" + escapeHtml(tt("mycuenta.orders.guest_prompt")) + "</p>" +
        '<a href="' + withLang("/mi-cuenta/login/") + '" class="btn btn-primary">' + escapeHtml(tt("mycuenta.guest.cta")) + "</a>" +
        "</div>";
      return;
    }

    var rows = DEMO_ORDERS.map(function (order) {
      var statusClass = "status-" + order.status.replace(/_/g, "-");
      return (
        "<tr>" +
        "<td>" + escapeHtml(order.id) + "</td>" +
        "<td>" + escapeHtml(order.createdAt) + "</td>" +
        "<td>" + formatMoney(order.totalMXN) + "</td>" +
        "<td><span class=\"status " + statusClass + "\">" + escapeHtml(tt("order.stage." + order.status)) + "</span></td>" +
        "<td><a href=\"" + withLang("/mi-cuenta/pedidos/detail.html?id=" + encodeURIComponent(order.id)) + "\" class=\"btn btn-outline\" style=\"padding:0.4rem 0.75rem;font-size:11px;\">" +
        escapeHtml(tt("mycuenta.orders.view")) + "</a></td>" +
        "</tr>"
      );
    }).join("");

    root.innerHTML =
      '<table class="table" style="width:100%;border-collapse:collapse;">' +
      "<thead><tr>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("mycuenta.orders.col.order")) + "</th>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("mycuenta.orders.col.date")) + "</th>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("mycuenta.orders.col.total")) + "</th>" +
      "<th style=\"text-align:left;padding:0.5rem;border-bottom:2px solid var(--rs-black);\">" + escapeHtml(tt("mycuenta.orders.col.status")) + "</th>" +
      "<th style=\"border-bottom:2px solid var(--rs-black);\"></th>" +
      "</tr></thead><tbody>" + rows + "</tbody></table>";
  }

  function renderOrderDetailPage() {
    var root = document.getElementById("order-detail-root");
    if (!root) return;
    var customer = getCustomer();

    if (!customer) {
      root.innerHTML =
        '<div class="form-card" style="text-align:center;">' +
        "<p>" + escapeHtml(tt("mycuenta.orders.guest_prompt")) + "</p>" +
        '<a href="' + withLang("/mi-cuenta/login/") + '" class="btn btn-primary">' + escapeHtml(tt("mycuenta.guest.cta")) + "</a>" +
        "</div>";
      return;
    }

    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    var order = DEMO_ORDERS.filter(function (o) { return o.id === id; })[0] || DEMO_ORDERS[0];
    var currentIndex = ORDER_PIPELINE.indexOf(order.status);

    var steps = ORDER_PIPELINE.map(function (stage, i) {
      var stateClass = currentIndex < 0 ? "" : (i < currentIndex ? "done" : (i === currentIndex ? "current" : ""));
      return (
        '<div class="order-step ' + stateClass + '">' +
        '<div class="line"></div>' +
        '<div class="dot">' + (i + 1) + "</div>" +
        '<div class="label">' + escapeHtml(tt("order.stage." + stage)) + "</div>" +
        "</div>"
      );
    }).join("");

    var itemRows = order.items.map(function (item) {
      return "<li>" + escapeHtml(item.name) + " x" + item.qty + ' <span class="pdp-sku">SKU: ' + escapeHtml(item.sku) + "</span></li>";
    }).join("");

    root.innerHTML =
      '<nav class="breadcrumb"><a href="' + withLang("/mi-cuenta/pedidos/") + '">' + escapeHtml(tt("mycuenta.orders.title")) + "</a> / <span>" + escapeHtml(order.id) + "</span></nav>" +
      "<h1 style=\"margin:0.5rem 0;color:var(--rs-red);\">" + escapeHtml(order.id) + "</h1>" +
      "<p style=\"margin:0 0 1.5rem;font-size:13px;color:var(--gray-600);\">" + escapeHtml(order.createdAt) + " &middot; " + formatMoney(order.totalMXN) + "</p>" +
      '<div class="order-stepper">' + steps + "</div>" +
      '<div class="form-card" style="max-width:100%;margin-top:1.5rem;">' +
      "<h2 style=\"font-size:1rem;text-transform:uppercase;margin:0 0 1rem;color:var(--rs-red);\">" + escapeHtml(tt("mycuenta.orders.items_title")) + "</h2>" +
      '<ul style="margin:0;padding-left:1.25rem;">' + itemRows + "</ul>" +
      "</div>" +
      "<p style=\"margin-top:1.5rem;\"><a href=\"" + withLang("/mi-cuenta/pedidos/") + "\" class=\"btn btn-outline\">" + escapeHtml(tt("mycuenta.orders.back")) + "</a></p>";
  }

  function initAccountForm(formId, redirectTo, successMsgKey) {
    var form = document.getElementById(formId);
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var nameInput = form.querySelector("#account-name");
      var emailInput = form.querySelector("#account-email");
      var phoneInput = form.querySelector("#account-phone");
      var email = emailInput ? emailInput.value.trim() : "";
      var name = nameInput ? nameInput.value.trim() : "";

      setCustomer({
        name: name || (email ? email.split("@")[0] : "Cliente RS"),
        email: email,
        phone: phoneInput ? phoneInput.value.trim() : "",
        isDistributor: false
      });

      showToast(tt(successMsgKey));
      setTimeout(function () {
        window.location.href = withLang(redirectTo);
      }, 500);
    });
  }

  function initCustomerSession() {
    renderAccountLinks();
    renderAccountPage();
    renderOrdersListPage();
    renderOrderDetailPage();
    initAccountForm("register-form", "/mi-cuenta/", "mycuenta.register.success");
    initAccountForm("login-form", "/mi-cuenta/", "mycuenta.login.success");
  }

  document.addEventListener("rs:locale", function () {
    renderAccountLinks();
    renderAccountPage();
    renderOrdersListPage();
    renderOrderDetailPage();
  });

  window.rsCustomer = {
    get: getCustomer,
    set: setCustomer,
    logout: logoutCustomer,
    orders: DEMO_ORDERS
  };

  /* Staff session - localStorage-backed, same fake-auth pattern as the
     customer session above. /admin/login/ accepts any input and "logs in" by
     saving a fake session; admin pages (anything rendering the
     .admin-sidebar layout) redirect unauthenticated visitors there. This is
     a client-side-only demo gate - no server, no real access control. */
  var STAFF_KEY = "rs_demo_staff_v1";

  function getStaff() {
    try {
      var raw = localStorage.getItem(STAFF_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  }

  function setStaff(obj) {
    localStorage.setItem(STAFF_KEY, JSON.stringify(obj));
  }

  function logoutStaff() {
    localStorage.removeItem(STAFF_KEY);
  }

  function renderStaffLogout() {
    var nav = document.querySelector(".admin-nav");
    if (!nav || nav.querySelector("[data-staff-logout]")) return;
    var li = document.createElement("li");
    li.innerHTML = '<a href="#" data-staff-logout data-i18n="admin.logout">' + escapeHtml(tt("admin.logout")) + "</a>";
    nav.appendChild(li);
    li.querySelector("[data-staff-logout]").addEventListener("click", function (e) {
      e.preventDefault();
      logoutStaff();
      window.location.href = "/admin/login/";
    });
  }

  function initStaffGate() {
    var sidebar = document.querySelector(".admin-sidebar");
    if (!sidebar) return;
    if (!getStaff()) {
      var next = encodeURIComponent(window.location.pathname);
      window.location.replace("/admin/login/?next=" + next);
      return;
    }
    renderStaffLogout();
  }

  function initStaffLoginForm() {
    var form = document.getElementById("staff-login-form");
    if (!form) return;
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var emailInput = form.querySelector("#staff-email");
      var email = emailInput ? emailInput.value.trim() : "";
      setStaff({ email: email, name: email ? email.split("@")[0] : "Staff RS" });
      showToast(tt("admin.login.success"));
      var params = new URLSearchParams(window.location.search);
      var next = params.get("next") || "/admin/";
      setTimeout(function () {
        window.location.href = next;
      }, 500);
    });
  }

  window.rsStaff = {
    get: getStaff,
    set: setStaff,
    logout: logoutStaff
  };

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

  function initFeaturedCarousel() {
    document.querySelectorAll("[data-carousel]").forEach(initCarousel);
  }

  function initCarousel(root) {
    var viewport = root.querySelector("[data-carousel-viewport]");
    var track = root.querySelector(".carousel-track");
    var prevBtn = root.querySelector("[data-carousel-prev]");
    var nextBtn = root.querySelector("[data-carousel-next]");
    if (!viewport || !track || !prevBtn || !nextBtn) return;

    var slides = track.querySelectorAll(".carousel-slide");
    if (!slides.length) return;

    var autoplayMs = parseInt(root.getAttribute("data-carousel-autoplay") || "0", 10);
    var timer = null;
    var paused = false;
    var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    function slideStep() {
      var slide = slides[0];
      if (!slide) return viewport.clientWidth;
      var gap = parseFloat(getComputedStyle(track).gap) || 0;
      return slide.offsetWidth + gap;
    }

    function maxScroll() {
      return Math.max(0, track.scrollWidth - viewport.clientWidth);
    }

    function updateButtons() {
      var left = viewport.scrollLeft;
      var max = maxScroll();
      prevBtn.disabled = left <= 1;
      nextBtn.disabled = left >= max - 1;
    }

    function scrollByStep(direction) {
      var step = slideStep();
      var target = viewport.scrollLeft + direction * step;
      var max = maxScroll();
      if (target > max + 1) target = 0;
      if (target < 0) target = max;
      viewport.scrollTo({ left: target, behavior: reduceMotion ? "auto" : "smooth" });
    }

    function stopAutoplay() {
      if (timer) {
        clearInterval(timer);
        timer = null;
      }
    }

    function startAutoplay() {
      stopAutoplay();
      if (!autoplayMs || reduceMotion || paused) return;
      timer = setInterval(function () {
        if (nextBtn.disabled) {
          viewport.scrollTo({ left: 0, behavior: reduceMotion ? "auto" : "smooth" });
        } else {
          scrollByStep(1);
        }
      }, autoplayMs);
    }

    prevBtn.addEventListener("click", function () {
      scrollByStep(-1);
      startAutoplay();
    });

    nextBtn.addEventListener("click", function () {
      scrollByStep(1);
      startAutoplay();
    });

    viewport.addEventListener("scroll", updateButtons, { passive: true });

    root.addEventListener("mouseenter", function () {
      paused = true;
      stopAutoplay();
    });

    root.addEventListener("mouseleave", function () {
      paused = false;
      startAutoplay();
    });

    root.addEventListener("focusin", function () {
      paused = true;
      stopAutoplay();
    });

    root.addEventListener("focusout", function () {
      if (!root.contains(document.activeElement)) {
        paused = false;
        startAutoplay();
      }
    });

    window.addEventListener("resize", function () {
      updateButtons();
    });

    updateButtons();
    startAutoplay();
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
    // Scoped per group container so a page with both a size selector and a
    // gender selector (two independent .size-btn groups) does not let one
    // group's click clear the other's selection.
    document.querySelectorAll(".size-options, .gender-options").forEach(function (group) {
      var buttons = group.querySelectorAll(".size-btn:not(:disabled)");
      buttons.forEach(function (btn) {
        btn.addEventListener("click", function () {
          buttons.forEach(function (b) { b.classList.remove("selected"); });
          btn.classList.add("selected");
        });
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
        var imageSrc = thumb.getAttribute("data-image");
        var ph = main.querySelector(".placeholder-jersey");
        if (ph) {
          if (imageSrc) {
            ph.style.backgroundImage = "url('" + imageSrc + "')";
            ph.classList.add("has-photo");
            ph.textContent = "";
          } else {
            ph.textContent = label;
          }
        }
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
    initStaffGate();
    initStaffLoginForm();
    initMobileMenu();
    initFeaturedCarousel();
    initFilterSidebar();
    initCollectionFilters();
    initSort();
    initSizeSelector();
    initGallery();
    initForms();
    initDemoActions();
    initCart();
    initCustomerSession();
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
