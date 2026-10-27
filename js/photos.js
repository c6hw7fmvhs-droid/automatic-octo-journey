// 사진 앱: 날짜별 그리드와 상세 보기.
(function () {
  window.SP = window.SP || {};
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function ampm(d) { var h = d.getHours(), m = d.getMinutes(); return (h < 12 ? "오전" : "오후") + " " + (h % 12 || 12) + ":" + (m < 10 ? "0" : "") + m; }

  function render() {
    var box = document.getElementById("photo-list"); box.innerHTML = "";
    var day = "", grid;
    (SP.data.photos || []).filter(function (p) { return p && p.date && !isNaN(new Date(p.date)); })
      .sort(function (a, b) { return new Date(b.date) - new Date(a.date); })
      .forEach(function (p) {
        var d = new Date(p.date), k = d.toDateString();
        if (k !== day) { day = k; box.append(el("h2", "phead", (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + WD[d.getDay()] + "요일")); grid = el("div", "pgrid"); box.append(grid); }
        var b = el("button", "pcell"); SP.pic(b, p); b.setAttribute("aria-label", p.caption || "사진");
        b.onclick = function () { detail(p); };
        grid.append(b);
      });
  }
  function detail(p) {
    var d = new Date(p.date), pic = document.getElementById("pd-pic"), info = document.getElementById("pd-info");
    SP.pic(pic, p); info.innerHTML = "";
    info.append(el("b", "", d.getFullYear() + "년 " + (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + WD[d.getDay()] + "요일 " + ampm(d)));
    if (p.caption) info.append(document.createTextNode(p.caption));
    document.getElementById("photo-detail").hidden = false;
  }
  SP.photos = {
    init: function () { render(); document.getElementById("pd-close").onclick = function () { document.getElementById("photo-detail").hidden = true; }; },
    open: function () { document.getElementById("photo-detail").hidden = true; }
  };
})();
