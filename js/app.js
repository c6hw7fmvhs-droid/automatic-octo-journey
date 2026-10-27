// 시작점: 시계, 잠금 해제, 홈 화면. 앱을 추가하려면 GRID/DOCK에 넣고 화면(section)과 JS를 만든 뒤 screen을 지정하세요.
// screen이 없는 앱 아이콘은 눌러도 아무 일도 일어나지 않습니다.
(function () {
  window.SP = window.SP || {};
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  var petals = ["#f5c542", "#f0944d", "#ec5f6a", "#c565b8", "#7f78e0", "#4fa9e8", "#4ec6a4", "#8ed25a"];
  var ICONS = {
    notes: "<i></i><i></i>",
    photos: '<svg viewBox="-50 -50 100 100">' + petals.map(function (c, i) { return '<ellipse cx="0" cy="-17" rx="12" ry="19" transform="rotate(' + i * 45 + ')" fill="' + c + '" fill-opacity=".8"/>'; }).join("") + "</svg>",
    safari: '<svg viewBox="-50 -50 100 100"><circle r="40" fill="#2f8cf3"/><g transform="rotate(45)"><polygon points="0,-28 8,0 0,28 -8,0" fill="#fff"/><polygon points="0,-28 8,0 -8,0" fill="#ff453a"/></g></svg>',
    camera: '<span class="lens"></span>',
    settings: "⚙︎",
    clock: '<svg viewBox="-50 -50 100 100"><circle r="44" fill="#fff" stroke="#e5e5ea" stroke-width="2"/><line x1="0" y1="0" x2="-8" y2="-24" stroke="#111" stroke-width="5" stroke-linecap="round"/><line x1="0" y1="0" x2="24" y2="8" stroke="#ff9500" stroke-width="3" stroke-linecap="round"/><circle r="4" fill="#111"/></svg>',
    phone: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>',
    messages: '<svg viewBox="0 0 24 24"><path fill="#fff" d="M12 4C6.8 4 3 7.2 3 11.2c0 2.2 1.2 4.2 3.2 5.5-.2 1.1-.8 2.1-1.6 2.8 1.6-.1 3-.7 4-1.5.8.2 1.6.3 2.4.3 5.2 0 9-3.2 9-7.2S17.2 4 12 4z"/></svg>',
    mail: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="5.5" width="18" height="13" rx="2"/><path d="M3.5 7l8.5 6 8.5-6"/></svg>',
    instagram: '<svg viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><rect x="3.5" y="3.5" width="17" height="17" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.2" cy="6.8" r=".8" fill="#fff"/></svg>',
    kakao: '<svg viewBox="0 0 24 24"><path fill="#3c1e1e" d="M12 3C6.5 3 2 6.5 2 10.8c0 2.8 1.8 5.2 4.6 6.6l-.9 3.5 4.1-2.4c.7.1 1.4.2 2.2.2 5.5 0 10-3.5 10-7.9S17.5 3 12 3z"/></svg>' 
  };
  var GRID = [
    { id: "calendar", label: "캘린더", screen: "calendar-app", mod: "calendar" }, { id: "notes", label: "메모" },
    { id: "photos", label: "사진" }, { id: "safari", label: "Safari" },
    { id: "instagram", label: "Instagram", screen: "instagram", mod: "instagram" }, { id: "settings", label: "설정", mod: "settings" }, { id: "clock", label: "시계" }, { id: "camera", label: "카메라", screen: "camera-app", mod: "camera" }
  ];
  var DOCK = [
    { id: "phone", label: "전화", screen: "phone-app", mod: "phone" }, { id: "messages", label: "메시지", screen: "messages" },
    { id: "mail", label: "메일" }, { id: "kakao", label: "카카오톡", screen: "kakao", mod: "kakao" }
  ];

  function iconHtml(id) {
    var d = SP.clock.now();
    var inner = id === "calendar" ? "<small>" + WD[d.getDay()] + "요일</small><b>" + d.getDate() + "</b>" : ICONS[id];
    return '<div class="ic ic-' + id + '">' + inner + "</div>";
  }
  function build(host, list, labels) {
    list.forEach(function (a) {
      var b = document.createElement("button"); b.className = "app-icon"; b.setAttribute("aria-label", a.label);
      b.innerHTML = iconHtml(a.id) + (labels ? "<span>" + a.label + "</span>" : "");
      b.onclick = function () {
        if (a.id === "settings") { var oldName = SP.profile.getName(); var nextName = window.prompt("지우가 부를 이름을 입력해 줘.", oldName || ""); if (nextName != null && nextName.trim()) { SP.profile.setName(nextName.trim()); window.alert("이름을 저장했어."); } return; }
        if (!a.screen) return;
        SP.nav.show(a.screen);
        var m = SP[a.mod || a.screen];
        if (m && m.open) m.open();
      };
      host.append(b);
    });
  }

  function buildNotifs() {
    var host = document.getElementById("notifs");
    (SP.data.notifications || []).forEach(function (n) {
      var b = document.createElement("button"); b.className = "notif";
      b.innerHTML = '<div class="ic ic-' + n.app + '">' + (ICONS[n.app] || "") + '</div><div class="nt"><b></b><span class="nb"></span></div><span class="ntime"></span>';
      b.querySelector("b").textContent = n.title;
      var body = n.body;
      b.querySelector(".nb").textContent = body; b.querySelector(".ntime").textContent = n.ts ? SP.fmt.label(n.ts) : n.time;
      b.onclick = function (e) {
        e.stopPropagation(); SP.nav.show(n.screen);
        var m = SP[n.mod || n.screen]; if (m && m.open) m.open(n.chat);
      };
      host.append(b);
    });
  }

  function tick() {
    var d = SP.clock.now(), t = (d.getHours() % 12 || 12) + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
    document.getElementById("sb-time").textContent = t;
    document.getElementById("lock-time").textContent = t;
    var cs = document.querySelector(".ic-calendar small"), cb = document.querySelector(".ic-calendar b");
    if (cs) { cs.textContent = WD[d.getDay()] + "요일"; cb.textContent = d.getDate(); }
    document.getElementById("lock-date").textContent = (d.getMonth() + 1) + "월 " + d.getDate() + "일 " + WD[d.getDay()] + "요일";
  }

  function start() {
    if (/[?&]reset=1/.test(location.search)) SP.storage.reset();
    SP.profile = {
      getName: function () { return SP.storage.get("user-name", ""); },
      setName: function (name) { SP.storage.set("user-name", String(name || "").trim().slice(0, 20)); }
    };
    var welcome = document.getElementById("welcome"), welcomeName = document.getElementById("welcome-name");
    var savedName = "";
    welcome.hidden = false; document.getElementById("lock").hidden = true; document.getElementById("home").hidden = true;
    document.getElementById("welcome-form").addEventListener("submit", function (e) {
      e.preventDefault(); var name = welcomeName.value.trim(); if (!name) return;
      SP.profile.setName(name);
      var jiwoo = (SP.data.characters || []).filter(function(c){return c.id === "jiwoo";})[0];
      if (jiwoo) { jiwoo.call = name; jiwoo.persona = String(jiwoo.persona || "").replace(/상대는 하윤이며/g, "상대는 " + name + "이며").replace(/하윤아/g, name + "아"); }
      welcome.hidden = true; document.getElementById("lock").hidden = false;
    });
    tick(); setInterval(tick, 5000);
    build(document.getElementById("home-grid"), GRID, true);
    build(document.getElementById("dock"), DOCK, false);
    try { SP.ai.init(); } catch (e) { console.error(e); }
    ["messages", "instagram", "kakao", "phone", "camera", "calendar"].forEach(function (k) { try { SP[k].init(); } catch (e) { console.error(k, e); } });
    var bn = document.createElement("button"), bt = null, lastB = {};
    bn.id = "banner"; bn.hidden = true;
    bn.innerHTML = '<div class="ic ic-messages">' + ICONS.messages + '</div><div class="nt"><b></b><span class="nb"></span></div>';
    document.getElementById("phone").append(bn);
    SP.banner = {
      show: function (title, body, chat) {
        var now = Date.now();
        if (bn.hidden && lastB[chat] && now - lastB[chat] < 8000) return;   // 과도한 알림 방지: 같은 상대는 8초에 한 번만
        lastB[chat] = now;
        bn.querySelector("b").textContent = title; bn.querySelector(".nb").textContent = body; bn.hidden = false;
        bn.onclick = function () { bn.hidden = true; SP.nav.show("messages"); SP.messages.open(chat); };
        clearTimeout(bt); bt = setTimeout(function () { bn.hidden = true; }, 4000);
      },
      hide: function () { bn.hidden = true; }
    };
    var mb = document.querySelector('#dock .app-icon[aria-label="메시지"]'), bd = document.createElement("i");
    bd.className = "bdg"; bd.hidden = true; mb.append(bd);
    function badge(n) { bd.hidden = !n; bd.textContent = n > 99 ? "99+" : String(n); }
    SP.messages.onChange = badge; badge(SP.messages.unread());
    buildNotifs();
    var y0 = null, lock = document.getElementById("lock");
    lock.onclick = function () { SP.nav.show("home"); };
    lock.addEventListener("touchstart", function (e) { y0 = e.touches[0].clientY; }, { passive: true });
    lock.addEventListener("touchend", function (e) { if (y0 != null && y0 - e.changedTouches[0].clientY > 60) SP.nav.show("home"); y0 = null; });
    document.getElementById("homebar").onclick = function () { SP.nav.show("home"); };
  }
  document.addEventListener("DOMContentLoaded", start);
})();
