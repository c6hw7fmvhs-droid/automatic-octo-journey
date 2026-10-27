// 카메라 앱: getUserMedia로 실시간 미리보기와 촬영. 사용할 수 없으면 촬영 버튼이 기기 카메라(파일 선택)를 엽니다.
// 찍은 사진은 이 브라우저(localStorage)에 최근 20장까지 저장됩니다.
(function () {
  window.SP = window.SP || {};
  var $ = function (s) { return document.querySelector(s); };
  var stream = null, facing = "environment", shots = [], idx = 0, live = false;

  function load() {
    var s = SP.storage.get("camera4", []);
    shots = Array.isArray(s) ? s.filter(function (x) { return x && typeof x.img === "string" && typeof x.ts === "string"; }) : [];
  }
  function msg(t, ms) {
    var m = $("#cam-msg"); m.textContent = t || ""; m.hidden = !t;
    if (ms) setTimeout(function () { if (m.textContent === t) m.hidden = true; }, ms);
  }
  function save() {
    var ok = SP.storage.set("camera4", shots);
    while (!ok && shots.length > 1) { shots.pop(); ok = SP.storage.set("camera4", shots); msg("저장 공간이 부족해 오래된 사진을 지웠어요.", 2500); }
    if (!ok) msg("사진을 저장하지 못했어요.", 2500);
  }
  function thumb() {
    var t = $("#cam-thumb"); t.style.background = ""; t.style.backgroundImage = "";
    if (shots[0]) SP.pic(t, { img: shots[0].img });
  }
  function stop() {
    if (stream) { stream.getTracks().forEach(function (t) { t.stop(); }); stream = null; }
    live = false; $("#cam-video").srcObject = null;
  }
  function start() {
    stop();
    var md = navigator.mediaDevices;
    if (!md || !md.getUserMedia) { msg("카메라를 바로 쓸 수 없어요. 촬영 버튼을 누르면 기기 카메라가 열려요."); return; }
    md.getUserMedia({ video: { facingMode: facing }, audio: false }).then(function (s) {
      if (SP.nav.current() !== "camera-app") { s.getTracks().forEach(function (t) { t.stop(); }); return; }
      stream = s; live = true; msg("");
      var v = $("#cam-video"); v.srcObject = s; v.className = facing === "user" ? "front" : ""; v.play().catch(function () {});
    }, function () { msg("카메라 권한이 없거나 사용할 수 없어요. 촬영 버튼을 누르면 기기 카메라가 열려요."); });
  }
  function add(img) { shots.unshift({ img: img, ts: SP.iso(SP.clock.now()) }); shots = shots.slice(0, 20); save(); thumb(); }
  function shoot() {
    if (!live) { $("#cam-file").click(); return; }
    var v = $("#cam-video"); if (!v.videoWidth) return;
    var s = Math.min(1, 1000 / Math.max(v.videoWidth, v.videoHeight)), cv = document.createElement("canvas");
    cv.width = Math.round(v.videoWidth * s); cv.height = Math.round(v.videoHeight * s);
    cv.getContext("2d").drawImage(v, 0, 0, cv.width, cv.height);
    var f = $("#cam-flash"); f.classList.remove("on"); void f.offsetWidth; f.classList.add("on");
    add(cv.toDataURL("image/jpeg", 0.78));
  }
  function showView() {
    var s = shots[idx]; if (!s) { $("#cam-view").hidden = true; return; }
    $("#cv-img").src = s.img; $("#cv-count").textContent = (idx + 1) + " / " + shots.length;
  }

  SP.camera = {
    init: function () {
      load(); thumb();
      $("#cam-shutter").onclick = shoot;
      $("#cam-flip").onclick = function () { facing = facing === "user" ? "environment" : "user"; start(); };
      $("#cam-thumb").onclick = function () { if (!shots.length) return; idx = 0; $("#cam-view").hidden = false; showView(); };
      $("#cv-close").onclick = function () { $("#cam-view").hidden = true; };
      $("#cv-prev").onclick = function () { if (shots.length) { idx = (idx - 1 + shots.length) % shots.length; showView(); } };
      $("#cv-next").onclick = function () { if (shots.length) { idx = (idx + 1) % shots.length; showView(); } };
      $("#cv-del").onclick = function () {
        shots.splice(idx, 1); save(); thumb(); if (idx >= shots.length) idx = shots.length - 1; showView();
      };
      $("#cam-file").onchange = function () {
        var f = this.files && this.files[0]; this.value = ""; if (!f) return;
        SP.shrink(f, 1000, function (url) { if (url) add(url); else msg("사진을 불러오지 못했어요.", 2500); });
      };
      SP.nav.leave["camera-app"] = stop;
      document.addEventListener("visibilitychange", function () {
        if (SP.nav.current() !== "camera-app") return;
        if (document.hidden) stop(); else start();
      });
    },
    open: function () { $("#cam-view").hidden = true; msg(""); start(); }
  };
})();
