(function () {
  var G = window.GOLD;

  // mobile menu
  var btn = document.querySelector(".menu-btn");
  var nav = document.querySelector(".nav");
  btn.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    btn.setAttribute("aria-expanded", open);
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") nav.classList.remove("open");
  });

  function unit(i) { return i.unit === "$" ? "دلار" : "تومان"; }
  function dir(i) { return i.change >= 0 ? "up" : "down"; }

  G.loadPrices().then(function (p) {
    document.getElementById("updated").textContent = G.timeFa(p.updatedAt);

    G.renderPrices(document.getElementById("price-grid"), function (i) {
      return '<article class="price">' +
        '<h3>' + i.title + '</h3>' +
        '<p class="price__val">' + G.money(i.price) + ' <small>' + unit(i) + '</small></p>' +
        '<p class="chg ' + dir(i) + '">' + (i.change >= 0 ? "▲ " : "▼ ") + G.percent(i.change) + '</p>' +
        '</article>';
    });

    var tick = p.items.map(function (i) {
      return '<span>' + i.title + ' <b>' + G.money(i.price) + '</b> <i class="' + dir(i) + '">' + G.percent(i.change) + '</i></span>';
    }).join("");
    document.getElementById("ticker").innerHTML = tick + tick; // duplicated for seamless loop

    var featured = G.products.filter(function (x) { return [1, 3, 5, 7, 4, 11].indexOf(x.id) > -1; });
    document.getElementById("products").innerHTML = featured.map(function (x) {
      return '<article class="card">' +
        '<div class="card__img"><img src="' + G.imgPath("../shared/", x.img) + '" alt="' + x.name + '" loading="lazy"></div>' +
        '<h3>' + x.name + '</h3>' +
        '<p class="muted">' + G.toFa(x.weight) + ' گرم · ۱۸ عیار</p>' +
        '<p class="card__price">' + G.money(G.productPrice(x)) + ' <small>تومان</small></p>' +
        '<a class="btn btn--sm btn--ghost" href="https://wa.me/989000000000?text=' + encodeURIComponent("سلام، درباره «" + x.name + "» سوال دارم") + '">استعلام</a>' +
        '</article>';
    }).join("");

    G.bindCalculator(document.getElementById("calc-form"));
  });
})();
