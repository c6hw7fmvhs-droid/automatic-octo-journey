// 세션 메모리 저장소: 새로고침하거나 페이지를 다시 열면 모든 상태가 초기화됩니다.
(function () {
  window.SP = window.SP || {};
  var values = Object.create(null);
  SP.storage = {
    get: function (k, d) { return Object.prototype.hasOwnProperty.call(values, k) ? values[k] : d; },
    set: function (k, v) { values[k] = v; return true; },
    reset: function () { values = Object.create(null); }
  };
})();
