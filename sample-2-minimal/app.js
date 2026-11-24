(function () {
  var G = window.GOLD;
  var grid = document.getElementById("grid");
  var chips = document.getElementById("chips");
  var current = "all";

  function renderGrid() {
    var list = G.products.filter(function (p) { return current === "all" || p.cat === current; });
    grid.innerHTML = list.map(function (p) {
      return '<a class="item" href="https://wa.me/989000000000?text=' + encodeURIComponent("سلام، «" + p.name + "» موجود است؟") + '">' +
        '<div class="item__img"><img src="' + G.imgPath("../shared/", p.img) + '" alt="' + p.name + '" loading="lazy"></div>' +
        '<div class="item__meta"><h3>' + p.name + '</h3><span>' + G.toFa(p.weight) + ' گرم</span></div>' +
        '<p class="item__price">' + G.money(G.productPrice(p)) + ' تومان</p>' +
        '</a>';
    }).join("");
  }

  chips.innerHTML = Object.keys(G.categories).map(function (k) {
    return '<button type="button" data-cat="' + k + '"' + (k === "all" ? ' class="on"' : "") + '>' + G.categories[k] + '</button>';
  }).join("");
  chips.addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    current = b.dataset.cat;
    chips.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
    renderGrid();
  });

  // karat segmented control
  var form = document.getElementById("calc-form");
  var karat = document.getElementById("karat");
  form.querySelector(".seg").addEventListener("click", function (e) {
    var b = e.target.closest("button");
    if (!b) return;
    karat.value = b.dataset.k;
    this.querySelectorAll("button").forEach(function (x) { x.classList.toggle("on", x === b); });
    form.dispatchEvent(new Event("input"));
  });

  G.loadPrices().then(function (p) {
    document.getElementById("updated").textContent = G.timeFa(p.updatedAt);
    G.renderPrices(document.getElementById("rate-rows"), function (i) {
      var cls = i.change >= 0 ? "up" : "down";
      return '<tr><td>' + i.title + '</td><td>' + G.money(i.price) + ' <small>' + (i.unit === "$" ? "دلار" : "تومان") + '</small></td>' +
        '<td class="' + cls + '">' + G.percent(i.change) + '</td></tr>';
    });
    renderGrid();
    G.bindCalculator(form);
  });
})();
