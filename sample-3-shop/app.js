(function () {
  var G = window.GOLD;
  var WHATSAPP = "989000000000";
  var $ = function (id) { return document.getElementById(id); };

  var state = { q: "", cats: [], maxw: 13, sort: "new" };
  var cart = load();

  function load() {
    try { return JSON.parse(localStorage.getItem("zarrin-cart")) || {}; } catch (e) { return {}; }
  }
  function save() {
    try { localStorage.setItem("zarrin-cart", JSON.stringify(cart)); } catch (e) { /* ignore */ }
  }

  // ---------- filters ----------
  $("cats").innerHTML = Object.keys(G.categories).filter(function (k) { return k !== "all"; }).map(function (k) {
    var n = G.products.filter(function (p) { return p.cat === k; }).length;
    return '<label class="check"><input type="checkbox" value="' + k + '"> ' + G.categories[k] + ' <small>(' + G.toFa(n) + ')</small></label>';
  }).join("");

  $("cats").addEventListener("change", function () {
    state.cats = Array.prototype.map.call(this.querySelectorAll("input:checked"), function (i) { return i.value; });
    render();
  });
  $("maxw").addEventListener("input", function () { state.maxw = +this.value; render(); });
  $("sort").addEventListener("change", function () { state.sort = this.value; render(); });
  $("q").addEventListener("input", function () { state.q = this.value.trim(); render(); });
  $("reset").addEventListener("click", function () {
    state = { q: "", cats: [], maxw: 13, sort: "new" };
    $("q").value = ""; $("maxw").value = 13; $("sort").value = "new";
    $("cats").querySelectorAll("input").forEach(function (i) { i.checked = false; });
    render();
  });
  $("toggle-filters").addEventListener("click", function () { $("filters").classList.toggle("open"); });

  function render() {
    $("wlabel").textContent = G.toFa(state.maxw);
    var list = G.products.filter(function (p) {
      return (!state.cats.length || state.cats.indexOf(p.cat) > -1) &&
        p.weight <= state.maxw &&
        (!state.q || p.name.indexOf(state.q) > -1 || G.categories[p.cat].indexOf(state.q) > -1);
    });
    var sorters = {
      new: function (a, b) { return b.id - a.id; },
      cheap: function (a, b) { return G.productPrice(a) - G.productPrice(b); },
      exp: function (a, b) { return G.productPrice(b) - G.productPrice(a); },
      light: function (a, b) { return a.weight - b.weight; }
    };
    list.sort(sorters[state.sort]);
    $("result-count").textContent = G.toFa(list.length) + " محصول";

    $("catalog").innerHTML = list.length ? list.map(function (p) {
      return '<article class="prod">' +
        (p.wage <= 10 ? '<span class="ribbon">اجرت کم</span>' : "") +
        '<div class="prod__img"><img src="' + G.imgPath("../shared/", p.img) + '" alt="' + p.name + '" loading="lazy"></div>' +
        '<p class="prod__cat">' + G.categories[p.cat] + '</p>' +
        '<h3>' + p.name + '</h3>' +
        '<ul class="specs"><li>وزن: ' + G.toFa(p.weight) + ' گرم</li><li>اجرت: ' + G.toFa(p.wage) + '٪</li></ul>' +
        '<div class="prod__foot"><b>' + G.money(G.productPrice(p)) + ' <small>تومان</small></b>' +
        '<button class="add" data-id="' + p.id + '" aria-label="افزودن به سبد">+</button></div>' +
        '</article>';
    }).join("") : '<p class="empty">محصولی با این فیلترها پیدا نشد.</p>';
  }

  $("catalog").addEventListener("click", function (e) {
    var b = e.target.closest(".add");
    if (!b) return;
    var id = b.dataset.id;
    cart[id] = (cart[id] || 0) + 1;
    save(); renderCart();
    toast("به سبد خرید اضافه شد");
  });

  // ---------- cart ----------
  function byId(id) { return G.products.filter(function (p) { return p.id === +id; })[0]; }

  function renderCart() {
    var ids = Object.keys(cart);
    var count = 0, total = 0;
    $("cart-list").innerHTML = ids.length ? ids.map(function (id) {
      var p = byId(id), qty = cart[id], price = G.productPrice(p) * qty;
      count += qty; total += price;
      return '<li><img src="' + G.imgPath("../shared/", p.img) + '" alt="">' +
        '<div><b>' + p.name + '</b><small>' + G.money(price) + ' تومان</small></div>' +
        '<div class="qty"><button data-d="-1" data-id="' + id + '">−</button><span>' + G.toFa(qty) + '</span><button data-d="1" data-id="' + id + '">+</button></div></li>';
    }).join("") : '<li class="empty">سبد خرید خالی است.</li>';
    $("count").textContent = G.toFa(count);
    $("cart-total").textContent = G.money(total) + " تومان";

    var msg = "سلام، سفارش من از زرین‌شاپ:\n" + ids.map(function (id) {
      var p = byId(id);
      return "• " + p.name + " (" + p.weight + " گرم) × " + cart[id];
    }).join("\n") + "\nجمع تقریبی: " + G.money(total) + " تومان";
    $("checkout").href = "https://wa.me/" + WHATSAPP + "?text=" + encodeURIComponent(msg);
    $("checkout").classList.toggle("disabled", !ids.length);
  }

  $("cart-list").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    var id = b.dataset.id;
    cart[id] += +b.dataset.d;
    if (cart[id] <= 0) delete cart[id];
    save(); renderCart();
  });

  function openCart(open) {
    $("drawer").classList.toggle("open", open);
    $("drawer").setAttribute("aria-hidden", !open);
    $("overlay").hidden = !open;
  }
  $("open-cart").addEventListener("click", function () { openCart(true); });
  $("close-cart").addEventListener("click", function () { openCart(false); });
  $("overlay").addEventListener("click", function () { openCart(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") openCart(false); });

  var t;
  function toast(text) {
    $("toast").textContent = text;
    $("toast").classList.add("show");
    clearTimeout(t);
    t = setTimeout(function () { $("toast").classList.remove("show"); }, 1800);
  }

  // ---------- prices strip ----------
  G.loadPrices().then(function (p) {
    var pick = ["gold18", "mesghal", "emami", "nim", "rob", "ons"];
    $("strip").innerHTML = p.items.filter(function (i) { return pick.indexOf(i.key) > -1; }).map(function (i) {
      return '<span>' + i.title.replace(/ \(.+\)/, "") + ': <b>' + G.money(i.price) + '</b> <i class="' + (i.change >= 0 ? "up" : "down") + '">' + G.percent(i.change) + '</i></span>';
    }).join("") + '<span class="sample">اعداد نمونه</span>';
    render();
    renderCart();
  });
})();
