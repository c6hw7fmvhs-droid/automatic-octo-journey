// 발견한 단서/이벤트 상태. 답장 규칙의 unlocks / requires / events가 이 값을 사용합니다.
(function () {
  window.SP = window.SP || {};
  var KEY = "events";
  var E = SP.events = {
    list: function () { var v = SP.storage.get(KEY, []); return Array.isArray(v) ? v : []; },
    has: function (id) { return E.list().indexOf(id) !== -1; },
    unlock: function (id) { if (!id || E.has(id)) return; var l = E.list(); l.push(id); SP.storage.set(KEY, l); },
    met: function (req) { return !req || req.every(function (id) { return E.has(id); }); }
  };
})();
