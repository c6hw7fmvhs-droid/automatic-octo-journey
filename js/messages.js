// 문자 메시지 앱: 목록, 대화, 전송/오류 처리, 읽음 표시, 입력 중 표시, 답장 흐름, 사진·링크, 임시 저장, 도착 알림.
(function () {
  window.SP = window.SP || {};
  var $ = function (s) { return document.querySelector(s); };
  var WD = ["일", "월", "화", "수", "목", "금", "토"];
  var HASURL = /(https?:\/\/|www\.)\S+/;
  var convs = {}, brains = {}, drafts = {}, current = null;
  var busy = {}, playing = {}, unreplied = {}, timers = {}, shown = {};

  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function pad(n) { return (n < 10 ? "0" : "") + n; }
  function ampm(d) { var h = d.getHours(); return (h < 12 ? "오전" : "오후") + " " + (h % 12 || 12) + ":" + pad(d.getMinutes()); }
  function sod(d) { return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime(); }
  function listLabel(ts) {
    var d = new Date(ts), dd = Math.round((sod(SP.clock.now()) - sod(d)) / 864e5);
    if (dd <= 0) return ampm(d);
    if (dd === 1) return "어제";
    if (dd < 7) return WD[d.getDay()] + "요일";
    return d.getFullYear() + ". " + (d.getMonth() + 1) + ". " + d.getDate() + ".";
  }
  function sepLabel(d) { return (d.getMonth() + 1) + "월 " + d.getDate() + "일 (" + WD[d.getDay()] + ") " + ampm(d); }
  function readLabel() { var n = SP.clock.now(); return "읽음: " + n.getFullYear() + ". " + (n.getMonth() + 1) + ". " + n.getDate() + "."; }
  function uid() { return "m" + Date.now().toString(36) + Math.random().toString(36).slice(2, 6); }
  function valid(m) {
    return m && (m.from === "me" || m.from === "them") && typeof m.ts === "string" && !isNaN(new Date(m.ts)) &&
      (m.type === "photo" ? typeof m.img === "string" : typeof m.text === "string");
  }
  function charOf(id) { return SP.data.characters.filter(function (c) { return c.id === id; })[0]; }
  function replyable(ch) { return !!(ch && (ch.bank || ch.firstReply || ch.keywords)); }
  function pv(m) { return m.type === "photo" ? "사진" : String(m.text).replace(/\s+/g, " "); }
  function unreadOf(id) { return (convs[id] || []).filter(function (m) { return m.from === "them" && m.read === false; }).length; }
  function total() { return SP.data.characters.reduce(function (n, c) { return n + unreadOf(c.id); }, 0); }
  function emit() { if (SP.messages && typeof SP.messages.onChange === "function") SP.messages.onChange(total()); }

  function newBrain(ch) { return { mood: ch.mood || "normal", since: 0, plans: [], likes: [], dislikes: [], meal: null, recent: {}, reminded: 0, dismissive: 0, first: false }; }
  function brain(id) { if (!brains[id]) brains[id] = newBrain(charOf(id)); return brains[id]; }

  function load() {
    var c = SP.storage.get("messages4", null);
    convs = (c && typeof c === "object" && !Array.isArray(c)) ? c : {};
    var b = SP.storage.get("brain4", null); brains = (b && typeof b === "object") ? b : {};
    var d = SP.storage.get("drafts4", null); drafts = (d && typeof d === "object") ? d : {};
    SP.data.characters.forEach(function (ch) {
      var seeded = !Array.isArray(convs[ch.id]);
      var base = seeded ? (SP.data.conversations[ch.id] || []) : convs[ch.id];
      convs[ch.id] = base.filter(valid).map(function (m, i) {
        var x = Object.assign({}, m);
        if (!x.id) x.id = ch.id + ":" + i;
        if (!x.type) x.type = HASURL.test(x.text || "") ? "link" : "text";
        if (!x.origin) x.origin = seeded ? "seed" : "live";   // seed: 기존 기록, live: 앱에서 새로 생긴 대화
        return x;
      });
    });
    save();
  }
  function save() { var ok = SP.storage.set("messages4", convs); SP.storage.set("brain4", brains); return ok; }
  function saveDrafts() { SP.storage.set("drafts4", drafts); }

  /* ---------- 화면 ---------- */
  function renderList() {
    var ul = $("#msg-list"); ul.innerHTML = "";
    SP.data.characters.map(function (ch) { var m = convs[ch.id] || []; return { ch: ch, last: m[m.length - 1] }; })
      .filter(function (x) { return x.last; })
      .sort(function (a, b) { return new Date(b.last.ts) - new Date(a.last.ts); })
      .forEach(function (it) {
        var row = el("button", "row" + (unreadOf(it.ch.id) ? " unread" : "")), top = el("div", "rowtop");
        top.append(el("b", "", it.ch.name), el("span", "rowtime", listLabel(it.last.ts) + "  ›"));
        row.append(top, el("div", "rowprev", pv(it.last)));
        row.onclick = function () { openChat(it.ch.id); };
        ul.append(row);
      });
  }
  function addText(box, text) {
    String(text).split(/((?:https?:\/\/|www\.)\S+)/g).forEach(function (part, i) {
      if (i % 2 === 1) {
        var a = el("a", "", part); a.href = /^www\./.test(part) ? "https://" + part : part; a.target = "_blank"; a.rel = "noopener noreferrer"; box.append(a);
      } else if (part) box.append(document.createTextNode(part));
    });
  }
  function host(text) { var m = String(text).match(/(?:https?:\/\/|www\.)[^\s]+/); try { return new URL(/^www\./.test(m[0]) ? "https://" + m[0] : m[0]).hostname; } catch (e) { return ""; } }

  function bubble(m) {
    var w = el("div", "mw " + m.from), b;
    if (m.type === "photo") { b = el("div", "bubble photo"); var im = el("img"); im.alt = "사진"; im.src = m.img; b.append(im); }
    else { b = el("div", "bubble"); addText(b, m.text); }
    w.append(b);
    if (m.type === "link" && host(m.text)) w.append(el("div", "linkcard", "🔗 " + host(m.text)));
    function tstamp() { return el("div", "mtime", ampm(new Date(m.ts))); }
    if (shown[m.id]) w.append(tstamp());
    b.onclick = function (e) {
      if (e.target.tagName === "A") return;
      var t = w.querySelector(".mtime");
      if (t) { t.remove(); shown[m.id] = false; } else { w.append(tstamp()); shown[m.id] = true; }
    };
    return w;
  }

  function renderChat() {
    var box = $("#chat-body"); box.innerHTML = "";
    var list = convs[current] || [], prev = 0, lastMine = -1;
    list.forEach(function (m, i) { if (m.from === "me") lastMine = i; });
    list.forEach(function (m, i) {
      var d = new Date(m.ts), t = d.getTime();
      if (!prev || t - prev > 36e5 || sod(new Date(prev)) !== sod(d)) box.append(el("div", "sep", sepLabel(d)));
      prev = t; box.append(bubble(m));
      if (m.from === "me" && m.status === "failed") {
        var f = el("button", "status fail", "전송 실패 · 탭하여 다시 보내기"); f.onclick = function () { retry(current, m); }; box.append(f);
      } else if (i === lastMine && m.status) box.append(el("div", "status", m.status));
    });
    if (busy[current]) { var ty = el("div", "typing"); ty.append(el("b"), el("b"), el("b")); box.append(ty); }
    box.scrollTop = box.scrollHeight;
  }
  function renderIf(id) {
    if (SP.nav.current() !== "messages") return;
    if (current === id) renderChat(); else if (current === null) renderList();
  }
  function sys(t) {
    var box = $("#chat-body"), s = el("div", "sys", t); box.append(s); box.scrollTop = box.scrollHeight;
    setTimeout(function () { if (s.parentNode) s.remove(); }, 3000);
  }

  function syncInput() {
    var v = $("#msg-input").value;
    $("#msg-send").disabled = !v.trim(); $("#msg-clear").hidden = !v;
    var i = $("#msg-input"); i.style.height = "auto"; i.style.height = Math.min(i.scrollHeight, 110) + "px";
  }
  function openChat(id) {
    current = id; $("#chat-name").textContent = charOf(id).name;
    (convs[id] || []).forEach(function (m) { if (m.from === "them") m.read = true; });
    save(); emit(); if (SP.banner) SP.banner.hide();
    $("#msg-listview").hidden = true; $("#msg-chatview").hidden = false;
    $("#msg-input").value = drafts[id] || ""; syncInput(); renderChat();
  }
  function showList() {
    current = null; $("#msg-chatview").hidden = true; $("#msg-listview").hidden = false; renderList();
  }

  /* ---------- 보내기 ---------- */
  function sendMsg(p) {
    var id = current; if (!id) return;
    var m = Object.assign({ id: uid(), from: "me", ts: SP.iso(SP.clock.now()), origin: "live", status: "전송 중..." }, p);
    convs[id].push(m); renderChat();
    setTimeout(function () { finishSend(id, m); }, 350);
  }
  function finishSend(id, m) {
    var ok = navigator.onLine !== false;           // 기기가 오프라인이면 전송 실패
    if (ok) { m.status = "전송됨"; ok = save(); }   // 저장 공간 오류도 실패로 처리
    if (!ok) m.status = "failed";
    renderIf(id);
    if (ok) queueReply(id, m);
  }
  function retry(id, m) { m.status = "전송 중..."; renderIf(id); setTimeout(function () { finishSend(id, m); }, 350); }

  function send() {
    var inp = $("#msg-input"), text = inp.value.trim();
    if (!text || !current) return;                   // 빈 메시지 차단
    inp.value = ""; delete drafts[current]; saveDrafts(); syncInput();
    sendMsg({ type: HASURL.test(text) ? "link" : "text", text: text });
  }
  function shrink(file, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, 640 / Math.max(img.width, img.height)), cv = document.createElement("canvas");
      cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      var out = cv.toDataURL("image/jpeg", 0.7); if (out.length > 350000) out = cv.toDataURL("image/jpeg", 0.45);
      URL.revokeObjectURL(url); cb(out);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  }

  /* ---------- 답장 ---------- */
  function queueReply(id, m) {
    if (!replyable(charOf(id))) return;
    (unreplied[id] = unreplied[id] || []).push(m);
    if (playing[id]) return;                          // 답장 중이면 끝난 뒤 한꺼번에 처리
    clearTimeout(timers[id]); timers[id] = setTimeout(function () { respond(id); }, 900);   // 연속으로 보낸 메시지는 묶어서 한 번에 답장
  }
  function scripted(ch, msgs) {
    var t = msgs.map(function (m) { return m.text || ""; }).join(" ").toLowerCase();
    for (var i = 0; i < (ch.keywords || []).length; i++) {
      var r = ch.keywords[i];
      if ((r.words || []).some(function (w) { return t.indexOf(w.toLowerCase()) !== -1; }) && SP.events.met(r.requires)) {
        if (r.unlocks) SP.events.unlock(r.unlocks);
        if (r.silent) return { parts: [] };
        return { parts: r.parts ? r.parts.slice() : [Array.isArray(r.reply) ? r.reply[Math.floor(Math.random() * r.reply.length)] : r.reply] };
      }
    }
  }
  function recentThem(id) { return convs[id].filter(function (m) { return m.from === "them"; }).slice(-6).map(function (m) { return m.text; }); }
  function ruleReply(ch, id, msgs, b) { return ch.bank ? SP.replies.compose(ch, msgs, b, recentThem(id)) : null; }
  function factsOf(b) {
    var f = [];
    b.plans.forEach(function (p) { f.push("약속: " + p.when + (p.time ? " " + p.time : "") + " (" + p.text + ")"); });
    if (b.likes.length) f.push("좋아하는 것: " + b.likes.join(", "));
    if (b.dislikes.length) f.push("싫어하는 것: " + b.dislikes.join(", "));
    if (b.meal) f.push("먹었다고 한 것: " + b.meal);
    return f.join("\n");
  }
  function finishPlay(id) {
    playing[id] = false;
    if ((unreplied[id] || []).length) timers[id] = setTimeout(function () { respond(id); }, 600);
  }
  function respond(id) {
    var ch = charOf(id), msgs = unreplied[id] || []; unreplied[id] = [];
    if (!msgs.length || !replyable(ch)) return;
    var b = brain(id), res;
    playing[id] = true;
    setTimeout(function () {                           // 읽음 표시
      msgs.forEach(function (m) { if (m.status !== "failed") m.status = readLabel(); });
      save(); renderIf(id);
    }, 600 + Math.random() * 400);
    if (ch.firstReply && !b.first) { b.first = true; res = { parts: ch.firstReply.parts.slice() }; }
    else res = scripted(ch, msgs);
    if (!res && ch.persona && SP.ai && SP.ai.ready) { askAI(ch, id, msgs, b); return; }   // AI 자유 대화
    if (!res) res = ruleReply(ch, id, msgs, b);                                           // 규칙 기반 답장
    if (!res || !res.parts.length) { finishPlay(id); return; }                            // 읽고 답장하지 않음
    play(ch, res.parts, 0, false);
  }
  function askAI(ch, id, msgs, b) {
    setTimeout(function () { if (playing[id]) { busy[id] = true; renderIf(id); } }, 1000);   // 입력 중 표시
    SP.ai.reply(ch, convs[id].slice(-30), factsOf(b)).then(function (parts) {
      msgs.forEach(function (m) { if (m.type !== "photo") SP.replies.learn((m.text || "").toLowerCase(), b); });
      return parts;
    }, function () {                                   // AI 실패(오프라인, 시간 초과, 권한 없음) 시 규칙 답장으로 대신
      var r = ruleReply(ch, id, msgs, b); return r ? r.parts : [];
    }).then(function (parts) {
      busy[id] = false;
      if (!parts.length) { renderIf(id); finishPlay(id); return; }
      play(ch, parts, 0, true);
    });
  }
  function play(ch, parts, i, fast) {
    var id = ch.id, first = i === 0, instant = first && fast;
    var wait = first ? (fast ? 0 : 900 + Math.random() * 500) : 350, ty = instant ? 0 : Math.min(2200, 500 + parts[i].length * 70);
    setTimeout(function () {
      if (ty) { busy[id] = true; renderIf(id); }       // 입력 중 표시
      setTimeout(function () {
        busy[id] = false; arrive(ch, parts[i]);
        if (i + 1 < parts.length) play(ch, parts, i + 1, fast); else finishPlay(id);
      }, ty);
    }, wait);
  }
  function arrive(ch, text) {
    var id = ch.id, here = SP.nav.current() === "messages", viewing = here && current === id, listShown = here && current === null;
    convs[id].push({ id: uid(), from: "them", text: text, ts: SP.iso(SP.clock.now()), type: HASURL.test(text) ? "link" : "text", origin: "live", read: viewing });
    save();
    if (viewing) renderChat(); else if (listShown) renderList();
    if (!viewing && !listShown && SP.banner) SP.banner.show(ch.name, text, id);   // 다른 화면에 있을 때만 알림
    emit();
  }

  function init() {
    load(); renderList();
    $("#msg-home").onclick = function () { SP.nav.show("home"); };
    $("#msg-back").onclick = showList;
    $("#msg-form").addEventListener("submit", function (e) { e.preventDefault(); send(); });
    var inp = $("#msg-input");
    inp.addEventListener("keydown", function (e) { if (e.key === "Enter" && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
    inp.addEventListener("input", function () {
      if (current) { if (inp.value) drafts[current] = inp.value; else delete drafts[current]; saveDrafts(); }
      syncInput();
    });
    $("#msg-clear").onclick = function () { inp.value = ""; if (current) { delete drafts[current]; saveDrafts(); } syncInput(); inp.focus(); };   // 입력 취소
    $("#msg-file").onchange = function () {
      var f = this.files && this.files[0]; this.value = "";
      if (!f || !current) return;
      if (!/^image\//.test(f.type)) { sys("사진 파일만 보낼 수 있어요."); return; }
      shrink(f, function (url) { if (url) sendMsg({ type: "photo", img: url, text: "" }); else sys("사진을 불러오지 못했어요."); });
    };
    syncInput();
  }
  SP.messages = { init: init, unread: total, open: function (id) { if (id && charOf(id)) openChat(id); else showList(); } };
})();
