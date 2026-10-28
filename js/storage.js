// localStorage 래퍼. 실패하거나 잘못된 JSON이어도 기본값을 돌려주어 앱이 멈추지 않습니다.
(function () {
  window.SP = window.SP || {};
  var P = "storyphone:v1:";
  SP.storage = {
    get: function (k, d) {
      try { var r = localStorage.getItem(P + k); return r == null ? d : JSON.parse(r); } catch (e) { return d; }
    },
    set: function (k, v) {
      try { localStorage.setItem(P + k, JSON.stringify(v)); return true; } catch (e) { return false; }
    },
    reset: function () {
      try { Object.keys(localStorage).forEach(function (k) { if (k.indexOf(P) === 0) localStorage.removeItem(k); }); } catch (e) {}
    }
  };
})();
