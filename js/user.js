// 사용자 이름: 처음 잠금 해제할 때 입력하고, 앱 속 사용자 이름에 사용됩니다.
(function () {
  window.SP = window.SP || {};
  SP.user = {
    name: function () {
      var u = SP.storage.get("user", null);
      return u && typeof u.name === "string" ? u.name : "";
    },
    set: function (n) {
      return SP.storage.set("user", { name: String(n).trim().slice(0, 10) });
    }
  };
})();
