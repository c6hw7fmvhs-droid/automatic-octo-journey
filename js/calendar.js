// 캘린더 앱: 월 보기, 날짜 선택, 그날의 일정 목록 (일정은 data/calendar.js).
(function () {
  window.SP = window.SP || {};
  var $ = function (s) { return document.querySelector(s); };
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  var view = { y: 2026, m: 9 }, sel = "";
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function key(y, m, d) { return y + "-" + pad(m + 1) + "-" + pad(d); }
  function evOn(y, m, d) {
    var k = key(y, m, d);
    return (SP.data.calendar || []).filter(function (e) {
      if (!e || typeof e.date !== "string") return false;
      if (e.yearly) return e.date.slice(5) === k.slice(5) && y >= Number(e.date.slice(0, 4));
      return e.date === k;
    });
  }
  function goToday() { var n = SP.clock.now(); view = { y: n.getFullYear(), m: n.getMonth() }; sel = key(n.getFullYear(), n.getMonth(), n.getDate()); render(); }

  function render() {
    var y = view.y, m = view.m, first = new Date(y, m, 1).getDay(), days = new Date(y, m + 1, 0).getDate(), prevDays = new Date(y, m, 0).getDate();
    var n = SP.clock.now(), todayKey = key(n.getFullYear(), n.getMonth(), n.getDate());
    $("#cal-title").textContent = y + "년 " + (m + 1) + "월";
    var g = $("#cal-grid"); g.innerHTML = "";
    for (var i = 0, cells = Math.ceil((first + days) / 7) * 7; i < cells; i++) {
      var dn = i - first + 1, b;
      if (dn < 1 || dn > days) { b = el("span", "cday other"); b.append(el("span", "n", String(dn < 1 ? prevDays + dn : dn - days))); }
      else {
        var k = key(y, m, dn);
        b = el("button", "cday" + (i % 7 === 0 ? " sun" : "") + (k === todayKey ? " today" : "") + (k === sel ? " sel" : ""));
        b.append(el("span", "n", String(dn)));
        if (evOn(y, m, dn).length) b.append(el("i"));
        b.onclick = (function (kk) { return function () { sel = kk; render(); }; })(k);
      }
      g.append(b);
    }
    var box = $("#cal-events"); box.innerHTML = "";
    var p = sel.split("-").map(Number); if (p.length !== 3) return;
    box.append(el("h2", "", p[1] + "월 " + p[2] + "일 " + WD[new Date(p[0], p[1] - 1, p[2]).getDay()] + "요일"));
    var list = evOn(p[0], p[1] - 1, p[2]);
    if (!list.length) box.append(el("div", "noevt", "일정 없음"));
    list.forEach(function (e) {
      var row = el("div", "evt"), bar = el("i", "ebar"), t = el("div", "etext");
      bar.style.background = e.color || "#ff3b30";
      t.append(el("b", "", (e.emoji ? e.emoji + " " : "") + e.title), el("span", "", e.allDay ? "종일" : (e.time || "")));
      row.append(bar, t); box.append(row);
    });
  }
  function shift(d) { view.m += d; if (view.m < 0) { view.m = 11; view.y--; } if (view.m > 11) { view.m = 0; view.y++; } render(); }

  SP.calendar = {
    init: function () {
      $("#cal-home").onclick = function () { SP.nav.show("home"); };
      $("#cal-today").onclick = goToday;
      $("#cal-prev").onclick = function () { shift(-1); };
      $("#cal-next").onclick = function () { shift(1); };
      goToday();
    },
    open: goToday
  };
})();
