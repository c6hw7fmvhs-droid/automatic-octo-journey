// 화면 전환과 공통 도구. 화면은 index.html의 <section class="screen"> 하나가 앱 하나입니다.
(function () {
  window.SP = window.SP || {};
  var cur = "lock", DARK = { messages: 1, photos: 1, instagram: 1, "phone-app": 1, "calendar-app": 1 };
  SP.nav = {
    show: function (id) {
      if (!document.getElementById(id)) return;
      if (id !== cur && SP.nav.leave[cur]) SP.nav.leave[cur]();
      document.querySelectorAll(".screen").forEach(function (s) { s.hidden = s.id !== id; });
      document.getElementById("homebar").hidden = (id === "lock" || id === "home");
      document.getElementById("phone").dataset.theme = DARK[id] ? "dark" : "light";
      cur = id;
    },
    leave: {},   // 화면을 떠날 때 실행할 함수 (예: 카메라 끄기)
    current: function () { return cur; }
  };
  // 이야기 속 시계: 10월 22일 목요일 9:25(PM)에서 시작해 흘러갑니다.
  SP.clock = {
    base: new Date("2026-10-22T21:25:00").getTime(), t0: Date.now(),
    real: !(SP.config && SP.config.useRealTime === false),
    now: function () { return this.real ? new Date() : new Date(this.base + Date.now() - this.t0); }
  };
  SP.iso = function (d) {
    function p(n) { return (n < 10 ? "0" : "") + n; }
    return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + "T" + p(d.getHours()) + ":" + p(d.getMinutes()) + ":" + p(d.getSeconds());
  };
  SP.fmt = {
    label: function (ts) {
      var WD = ["일", "월", "화", "수", "목", "금", "토"], d = new Date(ts); if (isNaN(d)) return "";
      function sod(x) { return new Date(x.getFullYear(), x.getMonth(), x.getDate()).getTime(); }
      var dd = Math.round((sod(SP.clock.now()) - sod(d)) / 864e5), h = d.getHours();
      if (dd <= 0) return (h < 12 ? "오전" : "오후") + " " + (h % 12 || 12) + ":" + (d.getMinutes() < 10 ? "0" : "") + d.getMinutes();
      if (dd === 1) return "어제";
      if (dd < 7) return WD[d.getDay()] + "요일";
      return d.getFullYear() + ". " + (d.getMonth() + 1) + ". " + d.getDate() + ".";
    }
  };
  SP.shrink = function (file, max, cb) {
    var url = URL.createObjectURL(file), img = new Image();
    img.onload = function () {
      var s = Math.min(1, max / Math.max(img.width, img.height)), cv = document.createElement("canvas");
      cv.width = Math.round(img.width * s); cv.height = Math.round(img.height * s);
      cv.getContext("2d").drawImage(img, 0, 0, cv.width, cv.height);
      var out = cv.toDataURL("image/jpeg", 0.75); if (out.length > 350000) out = cv.toDataURL("image/jpeg", 0.5);
      URL.revokeObjectURL(url); cb(out);
    };
    img.onerror = function () { URL.revokeObjectURL(url); cb(null); };
    img.src = url;
  };
  SP.pic = function (e, item) {
    if (item.img) { e.style.backgroundImage = "url(" + item.img + ")"; e.style.backgroundSize = "cover"; e.style.backgroundPosition = "center"; }
    else e.style.background = item.color || "#c7c7cc";
  };
})();
