// 전화 앱: 최근 통화 목록 (가상 기록이며 실제로 전화를 걸지 않습니다).
(function () {
  window.SP = window.SP || {};
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function sod(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  function label(ts) {
    var d = new Date(ts), dd = Math.round((sod(SP.clock.now()) - sod(d)) / 864e5), h = d.getHours();
    if (dd <= 0) return (h < 12 ? "오전" : "오후") + " " + (h % 12 || 12) + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    if (dd === 1) return "어제";
    if (dd < 7) return WD[d.getDay()] + "요일";
    return d.getFullYear() + ". " + (d.getMonth() + 1) + ". " + d.getDate() + ".";
  }
  function render() {
    var ul = document.getElementById("call-list"); ul.innerHTML = "";
    (SP.data.calls || []).filter(function (c) { return c && c.name && !isNaN(new Date(c.ts)); })
      .sort(function (a, b) { return new Date(b.ts) - new Date(a.ts); })
      .forEach(function (c) {
        var row = el("div", "crow"), t = el("div", "ctext");
        t.append(el("b", "cname" + (c.type === "missed" ? " missed" : ""), c.name), el("span", "cline", c.line || "휴대전화"));
        row.append(t, el("span", "ctime", label(c.ts)), el("span", "cinfo", "ⓘ"));
        ul.append(row);
      });
  }
  SP.phone = {
    init: function () { render(); document.getElementById("call-home").onclick = function () { SP.nav.show("home"); }; },
    open: function () { render(); }
  };
})();
