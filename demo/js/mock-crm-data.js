/**
 * Simulated CRM data for the Stage D admin demo (no backend).
 *
 * Generates a deterministic (seeded) 6-month operating history for the
 * workshop: customers, quotes, and orders, plus a per-order fulfillment
 * pipeline (Cotizacion aceptada -> Pago recibido -> Pedido en progreso ->
 * Preparando envio -> Enviado -> Entregado). Numbers are seeded so they stay
 * the same across page loads/refreshes instead of reshuffling every visit.
 *
 * Exposes window.RS_CRM = { customers, quotes, orders, months, monthly,
 * totals, today, formatMXN, formatPct }.
 */
(function () {
  "use strict";

  var TODAY = new Date(2026, 6, 4); // Jul 4, 2026 (months are 0-indexed)
  var PIPELINE_STAGES = [
    "accepted",
    "payment_received",
    "in_progress",
    "preparing_shipment",
    "shipped",
    "delivered",
  ];

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  var rand = mulberry32(999999);

  function randInt(min, max) {
    return Math.floor(rand() * (max - min + 1)) + min;
  }

  function randFloat(min, max) {
    return rand() * (max - min) + min;
  }

  function pick(list) {
    return list[randInt(0, list.length - 1)];
  }

  function addDays(date, days) {
    var d = new Date(date.getTime());
    d.setDate(d.getDate() + days);
    return d;
  }

  function toISODate(date) {
    return date.toISOString().slice(0, 10);
  }

  function clampDate(date, max) {
    return date.getTime() > max.getTime() ? max : date;
  }

  var TEAM_CUSTOMERS = [
    { name: "Liga Norte CDMX", type: "equipo", city: "Ciudad de Mexico" },
    { name: "Diablos Rojos Sub-15", type: "equipo", city: "Ciudad de Mexico" },
    { name: "Escuela Primaria Juarez", type: "escuela", city: "Toluca" },
    { name: "Bravos de Naucalpan", type: "equipo", city: "Naucalpan" },
    { name: "Tigres Junior Monterrey", type: "equipo", city: "Monterrey" },
    { name: "Aguilas Metropolitanas", type: "equipo", city: "Ciudad de Mexico" },
    { name: "Deportiva San Angel", type: "escuela", city: "Ciudad de Mexico" },
    { name: "Club Atletico Toluca", type: "equipo", city: "Toluca" },
    { name: "Liga Infantil Guadalajara", type: "equipo", city: "Guadalajara" },
    { name: "Piratas de Veracruz Academy", type: "equipo", city: "Veracruz" },
    { name: "Sultanes Academy Puebla", type: "escuela", city: "Puebla" },
    { name: "Rieleros Youth Saltillo", type: "equipo", city: "Saltillo" },
    { name: "Uniformes Express Reventa", type: "revendedor", city: "Queretaro" },
    { name: "Deportes Martinez Mayoreo", type: "revendedor", city: "San Luis Potosi" },
    { name: "Secundaria 12 Queretaro", type: "escuela", city: "Queretaro" },
  ];

  var PERSON_CUSTOMERS = [
    { name: "Roberto M.", type: "individual", city: "Ciudad de Mexico" },
    { name: "Ana G.", type: "individual", city: "Guadalajara" },
    { name: "Jose Hernandez", type: "individual", city: "Monterrey" },
    { name: "Maria Fernanda Lopez", type: "individual", city: "Puebla" },
    { name: "Carlos Ramirez", type: "individual", city: "Toluca" },
    { name: "Laura Torres", type: "individual", city: "Ciudad de Mexico" },
    { name: "Miguel Angel Sanchez", type: "individual", city: "Saltillo" },
    { name: "Fernanda Castillo", type: "individual", city: "Veracruz" },
    { name: "Luis Gutierrez", type: "individual", city: "Naucalpan" },
    { name: "Patricia Morales", type: "individual", city: "Queretaro" },
  ];

  var CUSTOMERS = TEAM_CUSTOMERS.concat(PERSON_CUSTOMERS).map(function (c, i) {
    var domain = c.type === "individual" ? "gmail.com" : "clubdeportivo.mx";
    var slug = c.name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, ".")
      .replace(/(^\.|\.$)/g, "");
    return {
      id: "CUS-" + (100 + i),
      name: c.name,
      type: c.type,
      city: c.city,
      email: slug + "@" + domain,
    };
  });

  // Six months of operating history (Jan-Jun 2026). The last bucket's range
  // extends through "today" (instead of stopping at Jun 30) so the most
  // recent week still has open, unresolved quotes for the "this week" KPIs.
  var MONTHS = [];
  for (var m = 0; m < 6; m++) {
    var isLast = m === 5;
    var start = new Date(2026, m, 1);
    var end = isLast ? TODAY : new Date(2026, m + 1, 0);
    MONTHS.push({
      key: "2026-" + String(m + 1).padStart(2, "0"),
      index: m,
      start: start,
      end: end,
      isCurrent: isLast,
    });
  }

  var quotes = [];
  var orders = [];
  var quoteSeq = 1041; // continues from the existing static COT-1042 sample
  var orderSeq = 2200;
  var DECORATION_TYPES = ["embroidery", "dtf", "tpu", "3d_dtf"];

  MONTHS.forEach(function (month) {
    var acceptedTarget = randInt(4, 6);
    var quoteTarget = Math.round(acceptedTarget * 2.5);
    var nonAcceptedTarget = Math.max(quoteTarget - acceptedTarget, 0);

    var statusPool = [];
    for (var a = 0; a < acceptedTarget; a++) statusPool.push("accepted");

    if (month.isCurrent) {
      // Recent quotes: a chunk is still open (draft/sent), the rest already resolved.
      var openCount = Math.round(nonAcceptedTarget * 0.4);
      for (var o = 0; o < openCount; o++) statusPool.push(o % 3 === 0 ? "draft" : "sent");
      for (var r = 0; r < nonAcceptedTarget - openCount; r++) {
        statusPool.push(rand() < 0.55 ? "rejected" : "expired");
      }
    } else {
      for (var n = 0; n < nonAcceptedTarget; n++) {
        statusPool.push(rand() < 0.55 ? "rejected" : "expired");
      }
    }

    var rangeMs = month.end.getTime() - month.start.getTime();

    statusPool.forEach(function (status) {
      var createdDate = new Date(month.start.getTime() + rand() * rangeMs);
      var customer = pick(CUSTOMERS);
      var units = status === "accepted" ? randInt(20, 30) : randInt(5, 24);
      var unitPrice = Math.round(randFloat(1800, 2800) / 10) * 10;
      var amount = units * unitPrice;
      var quoteId = "COT-" + quoteSeq++;
      var decorationType = DECORATION_TYPES[quoteSeq % DECORATION_TYPES.length];

      var quote = {
        id: quoteId,
        customerId: customer.id,
        monthKey: month.key,
        createdAt: toISODate(createdDate),
        validUntil: toISODate(addDays(createdDate, 14)),
        units: units,
        unitPrice: unitPrice,
        amount: amount,
        status: status, // draft | sent | accepted | rejected | expired
        decorationType: decorationType, // embroidery | dtf | tpu | 3d_dtf
      };
      quotes.push(quote);

      if (status === "accepted") {
        var acceptedDate = clampDate(addDays(createdDate, randInt(1, 5)), TODAY);
        var marginPct = randFloat(0.17, 0.25);
        var revenue = amount;
        var cost = Math.round(revenue * (1 - marginPct));
        var profit = revenue - cost;

        // Bulk/custom uniform timeline: payment is quick, but embroidery/DTF
        // production and roster QA make "preparing_shipment" the longest
        // step, and national shipping across Mexico adds several more days.
        var stageDates = {};
        stageDates.accepted = acceptedDate;
        stageDates.payment_received = addDays(stageDates.accepted, randInt(1, 3));
        stageDates.in_progress = addDays(stageDates.payment_received, randInt(2, 6));
        stageDates.preparing_shipment = addDays(stageDates.in_progress, randInt(10, 20));
        stageDates.shipped = addDays(stageDates.preparing_shipment, randInt(2, 5));
        stageDates.delivered = addDays(stageDates.shipped, randInt(3, 8));

        var currentStatus = "accepted";
        var currentStatusDate = stageDates.accepted;
        PIPELINE_STAGES.forEach(function (stage) {
          if (stageDates[stage].getTime() <= TODAY.getTime()) {
            currentStatus = stage;
            currentStatusDate = stageDates[stage];
          }
        });

        var statusHistory = PIPELINE_STAGES.map(function (stage) {
          return {
            stage: stage,
            date: toISODate(stageDates[stage]),
            reached: stageDates[stage].getTime() <= TODAY.getTime(),
          };
        });

        orders.push({
          id: "PED-" + orderSeq++,
          quoteId: quoteId,
          customerId: customer.id,
          monthKey: month.key,
          units: units,
          unitPrice: unitPrice,
          revenue: revenue,
          cost: cost,
          profit: profit,
          marginPct: marginPct,
          acceptedAt: toISODate(stageDates.accepted),
          currentStatus: currentStatus,
          currentStatusAt: toISODate(currentStatusDate),
          statusHistory: statusHistory,
        });
      }
    });
  });

  quotes.sort(function (a, b) {
    return a.createdAt < b.createdAt ? 1 : -1;
  });
  orders.sort(function (a, b) {
    return a.acceptedAt < b.acceptedAt ? 1 : -1;
  });

  var monthly = MONTHS.map(function (month) {
    var monthQuotes = quotes.filter(function (q) {
      return q.monthKey === month.key;
    });
    var monthOrders = orders.filter(function (o) {
      return o.monthKey === month.key;
    });
    var revenue = monthOrders.reduce(function (sum, o) {
      return sum + o.revenue;
    }, 0);
    var cost = monthOrders.reduce(function (sum, o) {
      return sum + o.cost;
    }, 0);
    var profit = revenue - cost;
    return {
      key: month.key,
      index: month.index,
      quotesCount: monthQuotes.length,
      acceptedCount: monthOrders.length,
      revenue: revenue,
      cost: cost,
      profit: profit,
      marginPct: revenue > 0 ? profit / revenue : 0,
    };
  });

  var totals = monthly.reduce(
    function (acc, m) {
      acc.quotesCount += m.quotesCount;
      acc.acceptedCount += m.acceptedCount;
      acc.revenue += m.revenue;
      acc.cost += m.cost;
      acc.profit += m.profit;
      return acc;
    },
    { quotesCount: 0, acceptedCount: 0, revenue: 0, cost: 0, profit: 0 }
  );
  totals.marginPct = totals.revenue > 0 ? totals.profit / totals.revenue : 0;
  totals.units = orders.reduce(function (sum, o) {
    return sum + o.units;
  }, 0);

  var openQuotes = quotes.filter(function (q) {
    return q.status === "draft" || q.status === "sent";
  });
  totals.pipelineAmount = openQuotes.reduce(function (sum, q) {
    return sum + q.amount;
  }, 0);
  totals.followUpCount = quotes.filter(function (q) {
    return q.status === "sent";
  }).length;

  var weekAgo = addDays(TODAY, -6);
  totals.quotesThisWeek = quotes.filter(function (q) {
    var d = new Date(q.createdAt + "T00:00:00");
    return d.getTime() >= weekAgo.getTime() && d.getTime() <= TODAY.getTime();
  }).length;

  var currentMonthKey = MONTHS[MONTHS.length - 1].key;
  totals.acceptedThisMonth = orders.filter(function (o) {
    return o.monthKey === currentMonthKey;
  }).length;

  function customerById(id) {
    for (var i = 0; i < CUSTOMERS.length; i++) {
      if (CUSTOMERS[i].id === id) return CUSTOMERS[i];
    }
    return null;
  }

  var customersWithStats = CUSTOMERS.map(function (c) {
    var custQuotes = quotes.filter(function (q) {
      return q.customerId === c.id;
    });
    var custOrders = orders.filter(function (o) {
      return o.customerId === c.id;
    });
    var lifetimeValue = custOrders.reduce(function (sum, o) {
      return sum + o.revenue;
    }, 0);
    return Object.assign({}, c, {
      quotesCount: custQuotes.length,
      ordersCount: custOrders.length,
      lifetimeValue: lifetimeValue,
    });
  });

  function formatMXN(amount) {
    return new Intl.NumberFormat("es-MX", {
      style: "currency",
      currency: "MXN",
      maximumFractionDigits: 0,
    }).format(Math.round(amount || 0));
  }

  function formatPct(value) {
    return Math.round((value || 0) * 100) + "%";
  }

  window.RS_CRM = {
    today: toISODate(TODAY),
    pipelineStages: PIPELINE_STAGES,
    customers: customersWithStats,
    quotes: quotes,
    orders: orders,
    months: MONTHS.map(function (m) {
      return { key: m.key, index: m.index, isCurrent: m.isCurrent };
    }),
    monthly: monthly,
    totals: totals,
    customerById: customerById,
    orderById: function (id) {
      for (var i = 0; i < orders.length; i++) {
        if (orders[i].id === id) return orders[i];
      }
      return null;
    },
    quoteById: function (id) {
      for (var i = 0; i < quotes.length; i++) {
        if (quotes[i].id === id) return quotes[i];
      }
      return null;
    },
    formatMXN: formatMXN,
    formatPct: formatPct,
  };
})();
