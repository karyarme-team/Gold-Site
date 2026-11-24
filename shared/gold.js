/*
 * Shared logic for all gold-shop samples.
 * - Sample prices (replace with a real API later — see README)
 * - Persian number formatting
 * - Gold price calculator (common Iranian formula)
 * - Product catalogue (sample data)
 */
(function () {
  "use strict";

  // ---------- Sample prices (Toman) ----------
  // NOTE: these are sample numbers for demo only.
  // To go live, set GOLD.priceSource to a URL returning the same JSON shape.
  var SAMPLE_PRICES = {
    updatedAt: new Date().toISOString(),
    items: [
      { key: "gold18", title: "طلای ۱۸ عیار (هر گرم)", price: 7450000, change: 0.8 },
      { key: "gold24", title: "طلای ۲۴ عیار (هر گرم)", price: 9930000, change: 0.7 },
      { key: "mesghal", title: "مثقال طلا", price: 32270000, change: 0.6 },
      { key: "emami", title: "سکه امامی", price: 81500000, change: -0.4 },
      { key: "bahar", title: "سکه بهار آزادی", price: 76200000, change: -0.3 },
      { key: "nim", title: "نیم سکه", price: 43900000, change: 1.1 },
      { key: "rob", title: "ربع سکه", price: 25800000, change: 0.9 },
      { key: "gerami", title: "سکه گرمی", price: 13100000, change: 0.2 },
      { key: "ons", title: "انس جهانی (دلار)", price: 2685, change: 0.3, unit: "$" }
    ]
  };

  var FA_DIGITS = "۰۱۲۳۴۵۶۷۸۹";

  function toFa(input) {
    return String(input).replace(/\d/g, function (d) { return FA_DIGITS[d]; });
  }

  function toEn(input) {
    return String(input)
      .replace(/[۰-۹]/g, function (d) { return FA_DIGITS.indexOf(d); })
      .replace(/[٠-٩]/g, function (d) { return "٠١٢٣٤٥٦٧٨٩".indexOf(d); })
      .replace(/[,٬،]/g, "");
  }

  function money(n) {
    var rounded = Math.round(n);
    return toFa(rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, "٬"));
  }

  function percent(n) {
    var sign = n > 0 ? "+" : n < 0 ? "−" : "";
    return sign + toFa(Math.abs(n).toFixed(1)) + "٪";
  }

  /*
   * Iranian jewellery price formula:
   *   base   = weight × gramPrice(karat)
   *   wage   = base × wage%            (اجرت ساخت)
   *   profit = (base + wage) × profit% (سود فروشنده)
   *   tax    = (wage + profit) × tax%  (مالیات بر ارزش افزوده)
   *   total  = base + wage + profit + tax
   */
  function calculate(opts) {
    var weight = +opts.weight || 0;
    var karat = +opts.karat || 18;
    var gram18 = +opts.gram18 || getPrice("gold18");
    var gramPrice = gram18 * (karat / 18);
    var base = weight * gramPrice;
    var wage = base * ((+opts.wagePct || 0) / 100);
    var profit = (base + wage) * ((opts.profitPct == null ? 7 : +opts.profitPct) / 100);
    var tax = (wage + profit) * ((opts.taxPct == null ? 10 : +opts.taxPct) / 100);
    return { base: base, wage: wage, profit: profit, tax: tax, total: base + wage + profit + tax };
  }

  var prices = SAMPLE_PRICES;

  function getPrice(key) {
    for (var i = 0; i < prices.items.length; i++) {
      if (prices.items[i].key === key) return prices.items[i].price;
    }
    return 0;
  }

  function loadPrices() {
    if (!GOLD.priceSource) return Promise.resolve(prices);
    return fetch(GOLD.priceSource, { cache: "no-store" })
      .then(function (r) { return r.json(); })
      .then(function (data) { prices = data; return prices; })
      .catch(function () { return prices; }); // keep last known values
  }

  function timeFa(iso) {
    try {
      return new Date(iso).toLocaleString("fa-IR", { dateStyle: "medium", timeStyle: "short" });
    } catch (e) { return ""; }
  }

  // ---------- Sample product catalogue ----------
  var PRODUCTS = [
    { id: 1, name: "انگشتر سولیتر کلاسیک", cat: "ring", weight: 3.2, wage: 18, img: "ring" },
    { id: 2, name: "انگشتر رینگ ساده", cat: "ring", weight: 2.1, wage: 12, img: "ring" },
    { id: 3, name: "گردنبند قلب", cat: "necklace", weight: 5.4, wage: 20, img: "necklace" },
    { id: 4, name: "گردنبند زنجیر ونیزی", cat: "necklace", weight: 7.8, wage: 14, img: "necklace" },
    { id: 5, name: "دستبند کارتیه", cat: "bracelet", weight: 9.5, wage: 16, img: "bracelet" },
    { id: 6, name: "النگو ساده", cat: "bracelet", weight: 12.3, wage: 8, img: "bracelet" },
    { id: 7, name: "گوشواره حلقه‌ای", cat: "earring", weight: 2.6, wage: 22, img: "earring" },
    { id: 8, name: "گوشواره میخی نگین‌دار", cat: "earring", weight: 1.8, wage: 25, img: "earring" },
    { id: 9, name: "سکه پارسیان ۱ گرمی", cat: "coin", weight: 1, wage: 4, img: "coin" },
    { id: 10, name: "آویز اسم سفارشی", cat: "necklace", weight: 3.9, wage: 28, img: "necklace" },
    { id: 11, name: "انگشتر مردانه", cat: "ring", weight: 6.7, wage: 15, img: "ring" },
    { id: 12, name: "دستبند بچگانه", cat: "bracelet", weight: 2.4, wage: 18, img: "bracelet" }
  ];

  var CATEGORIES = {
    all: "همه",
    ring: "انگشتر",
    necklace: "گردنبند",
    bracelet: "دستبند و النگو",
    earring: "گوشواره",
    coin: "سکه و شمش"
  };

  function productPrice(p) {
    return calculate({ weight: p.weight, karat: 18, wagePct: p.wage }).total;
  }

  var GOLD = {
    priceSource: null, // e.g. "/api/prices.json"
    toFa: toFa,
    toEn: toEn,
    money: money,
    percent: percent,
    calculate: calculate,
    getPrice: getPrice,
    loadPrices: loadPrices,
    getPrices: function () { return prices; },
    timeFa: timeFa,
    products: PRODUCTS,
    categories: CATEGORIES,
    productPrice: productPrice,
    imgPath: function (base, name) { return base + "img/" + name + ".svg"; },

    // Wire up a calculator form. Expects inputs with data-calc="weight|karat|wage|profit|tax"
    // and outputs with data-out="base|wage|profit|tax|total".
    bindCalculator: function (root) {
      if (!root) return;
      function val(name) {
        var el = root.querySelector('[data-calc="' + name + '"]');
        return el ? toEn(el.value) : "";
      }
      function run() {
        var r = calculate({
          weight: parseFloat(val("weight")) || 0,
          karat: parseFloat(val("karat")) || 18,
          wagePct: parseFloat(val("wage")) || 0,
          profitPct: val("profit") === "" ? 7 : parseFloat(val("profit")),
          taxPct: val("tax") === "" ? 10 : parseFloat(val("tax"))
        });
        Object.keys(r).forEach(function (k) {
          var out = root.querySelector('[data-out="' + k + '"]');
          if (out) out.textContent = money(r[k]);
        });
      }
      root.addEventListener("input", run);
      run();
    },

    // Render price list into a container. tpl(item) returns HTML.
    renderPrices: function (el, tpl) {
      if (!el) return;
      el.innerHTML = prices.items.map(tpl).join("");
    }
  };

  window.GOLD = GOLD;
})();
