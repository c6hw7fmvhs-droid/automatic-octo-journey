// 메일·메모·Safari 시작 화면. 기존 story-phone 데이터와 대화 기능은 별도 모듈로 유지합니다.
(function () {
  window.SP = window.SP || {};
  var $ = function (s, root) { return (root || document).querySelector(s); };
  var esc = function (s) { return String(s == null ? "" : s); };
  function el(tag, cls, text) { var n = document.createElement(tag); if (cls) n.className = cls; if (text != null) n.textContent = text; return n; }
  function head(title, back) {
    var h = el("div", "extra-head");
    var b = el("button", "pill", "‹ 홈"); b.type = "button"; b.onclick = function () { SP.nav.show("home"); };
    h.append(b, el("b", "", title));
    if (back) { var r = el("button", "pill", back); r.type = "button"; r.onclick = function () { if (title === "메일") mailOpen(); else if (title === "메모") notesOpen(); }; h.append(r); }
    return h;
  }
  function openMail(i) {
    var root = $("#mail-app"), x = SP.data.mail[i]; if (!x) return;
    root.innerHTML = ""; root.append(head("메일", "받은 편지함"));
    var body = el("div", "body extra-body"), card = el("div", "mail-detail");
    card.append(el("h2", "", x.subj), el("div", "mail-meta", "보낸 사람: " + x.from + " · " + x.time), el("p", "", x.body));
    body.append(card); root.append(body);
  }
  function mailOpen() {
    var root = $("#mail-app"); root.innerHTML = ""; root.append(head("받은 편지함"));
    var body = el("div", "body extra-body");
    SP.data.mail.forEach(function (x, i) {
      var row = el("button", "extra-row"); row.type = "button";
      var top = el("div", "extra-rowtop"); top.append(el("b", "", x.from), el("small", "", x.time));
      row.append(top, el("strong", "", x.subj), el("span", "extra-preview", x.body.replace(/\n/g, " ")));
      row.onclick = function () { openMail(i); }; body.append(row);
    }); root.append(body);
  }
  function noteOpen(i) {
    var root = $("#notes-app"), x = SP.data.notes[i]; if (!x) return;
    root.innerHTML = ""; root.append(head("메모", "편집"));
    var body = el("div", "body extra-body note-detail");
    body.append(el("div", "note-date", x.full || (x.d + " · " + x.m)), el("h2", "", x.t));
    if (x.b) body.append(el("p", "", x.b)); root.append(body);
  }
  function notesOpen() {
    var root = $("#notes-app"); root.innerHTML = ""; root.append(head("메모"));
    var count = el("div", "note-count", SP.data.notes.length + "개의 메모"); root.append(count);
    var body = el("div", "body extra-body");
    var groups = {};
    SP.data.notes.forEach(function (x, i) { (groups[x.m] = groups[x.m] || []).push({ item: x, index: i }); });
    Object.keys(groups).forEach(function (month) {
      body.append(el("h3", "note-month", month)); var box = el("div", "note-list");
      groups[month].forEach(function (v) {
        var row = el("button", "note-row"); row.type = "button";
        row.append(el("b", "", v.item.t), el("small", "", v.item.d + "  " + (v.item.b ? v.item.b.split("\n")[0].replace(/^– /, "") : "추가 텍스트 없음")));
        row.onclick = function () { noteOpen(v.index); }; box.append(row);
      }); body.append(box);
    }); root.append(body);
  }
  function safariOpen() {
    var root = $("#safari-app"); root.innerHTML = "";
    var top = el("div", "safari-top"); var back = el("button", "pill", "‹ 홈"); back.type = "button"; back.onclick = function () { SP.nav.show("home"); }; top.append(back); root.append(top);
    root.append(el("h1", "safari-title", "즐겨찾기"));
    var fav = el("div", "safari-favs");
    (SP.data.safari.fav || []).forEach(function (x) { fav.append(el("div", "safari-fav", (x.ic || x.name.charAt(0)) + "\n" + x.name)); });
    if (!fav.children.length) fav.append(el("div", "safari-empty", "즐겨찾기가 없습니다")); root.append(fav);
    var search = el("button", "safari-search", "⌕  웹사이트 검색 또는 입력"); search.type = "button";
    search.onclick = function () { safariHistory(root); }; root.append(search);
    var history = el("div", "safari-history"); (SP.data.safari.recent || []).forEach(function (q) {
      var r = el("button", "safari-query", "⌕  " + q + "  ↙"); r.type = "button"; r.onclick = function () { safariHistory(root, q); }; history.append(r);
    }); root.append(history);
  }
  function safariHistory(root, selected) {
    root.innerHTML = ""; var top = el("div", "safari-top"); var back = el("button", "pill", "‹"); back.type = "button"; back.onclick = safariOpen; top.append(back, el("b", "", "검색")); root.append(top);
    var input = document.createElement("input"); input.className = "safari-input"; input.placeholder = "검색 또는 웹사이트 이름 입력"; input.value = selected || ""; input.setAttribute("aria-label", "검색어"); root.append(input);
    var hint = el("div", "safari-hint", "저장된 검색 기록"); root.append(hint);
    (SP.data.safari.recent || []).forEach(function (q) { var r = el("button", "safari-query", "⌕  " + q); r.type = "button"; r.onclick = function () { input.value = q; }; root.append(r); });
  }
  SP.mail = { init: function () {}, open: mailOpen };
  SP.notes = { init: function () {}, open: notesOpen };
  SP.safari = { init: function () {}, open: safariOpen };
})();
