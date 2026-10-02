/*
 * Regroupe les services de la page de status par catégorie.
 * Catégorie = préfixe du nom avant " · " (ex. "API · Auth" -> section "API").
 * Servi à la racine du site (le dossier assets/ est copié tel quel).
 */
(function () {
  var SEP = " · ";
  var LABELS = { up: "Opérationnel", degraded: "Dégradé", down: "Panne" };
  var RANK = { up: 0, degraded: 1, down: 2 };

  var style = document.createElement("style");
  style.textContent =
    ".rk-cat{display:flex;align-items:center;gap:.75rem;margin:2rem 0 .75rem}" +
    ".rk-cat:first-child{margin-top:0}" +
    ".rk-cat h3{margin:0;font-size:1.15rem}" +
    ".rk-badge{font-size:.72rem;font-weight:600;color:#fff;padding:.15rem .6rem;border-radius:999px}" +
    ".rk-badge.up{background:#2ecc71}.rk-badge.degraded{background:#f39c12}.rk-badge.down{background:#e74c3c}";
  document.head.appendChild(style);

  function statusOf(article) {
    var c = article.className || "";
    return c.indexOf("down") > -1 ? "down" : c.indexOf("degraded") > -1 ? "degraded" : "up";
  }

  function group(section) {
    if (section.getAttribute("data-rk-cats")) return;
    var articles = Array.prototype.filter.call(section.children, function (n) {
      return n.tagName === "ARTICLE";
    });
    if (!articles.length) return;
    section.setAttribute("data-rk-cats", "1");

    var groups = [];
    var cur = null;
    articles.forEach(function (art) {
      var link = art.querySelector("h4 a");
      if (!link) return;
      var text = link.textContent;
      var i = text.indexOf(SEP);
      if (i > 0) {
        var cat = text.slice(0, i).trim();
        link.textContent = text.slice(i + SEP.length).trim();
        if (!cur || cur.name !== cat) {
          cur = { name: cat, first: art, worst: "up" };
          groups.push(cur);
        }
      }
      if (cur) {
        var s = statusOf(art);
        if (RANK[s] > RANK[cur.worst]) cur.worst = s;
      }
    });

    groups.forEach(function (g) {
      var head = document.createElement("div");
      head.className = "rk-cat";
      var h = document.createElement("h3");
      h.textContent = g.name;
      var badge = document.createElement("span");
      badge.className = "rk-badge " + g.worst;
      badge.textContent = LABELS[g.worst];
      head.appendChild(h);
      head.appendChild(badge);
      section.insertBefore(head, g.first);
    });
  }

  function scan() {
    var section = document.querySelector("section.live-status");
    if (section) group(section);
  }

  new MutationObserver(scan).observe(document.documentElement, { childList: true, subtree: true });
  scan();
})();
