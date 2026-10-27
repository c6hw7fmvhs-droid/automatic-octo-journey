// AI 자유 대화 연결. 두 가지 방법 중 사용할 수 있는 것을 씁니다.
//  1) data/config.js 의 aiEndpoint (직접 만든 서버/Worker를 거쳐 모델 호출) — GitHub Pages 등 어디서나 사용
//  2) claude.ai 에 게시한 미리보기 페이지의 sample 기능 — 그 페이지에서만 사용
// 둘 다 없거나 실패하면 reply()가 거절되고, 문자 앱은 규칙 기반 답장으로 대신합니다.
(function () {
  window.SP = window.SP || {};
  var sample = null, TIMEOUT = 12000;

  function withTimeout(p, ms) {
    return new Promise(function (res, rej) {
      var t = setTimeout(function () { rej(new Error("timeout")); }, ms);
      p.then(function (v) { clearTimeout(t); res(v); }, function (e) { clearTimeout(t); rej(e); });
    });
  }
  function build(ch, hist, facts) {
    var n = SP.clock.now(), h = n.getHours();
    var sys = [
      ch.persona,
      "지금은 " + (n.getMonth() + 1) + "월 " + n.getDate() + "일 " + (h < 6 ? "새벽 " : h < 12 ? "오전 " : h < 18 ? "오후 " : "밤 ") + (h % 12 || 12) + "시 " + n.getMinutes() + "분입니다.",
      "규칙:",
      "- 실제 문자처럼 짧고 간결하게 씁니다. 한 번에 문자 1~3개, 문자 하나는 보통 한 문장입니다.",
      "- 질문, 농담, 애정 표현, 서운함 등을 상황에 맞게 바꿔 쓰고 앞서 한 말을 되풀이하지 않습니다.",
      "- " + ch.call + "이 말한 약속, 취향, 일정은 기억해서 자연스럽게 반영합니다.",
      "- 이모티콘은 ㅋㅋ, ㅎㅎ, ㅠㅠ 정도만 가끔 씁니다.",
      "- 이야기 속 인물로만 답하고 설명이나 해설을 붙이지 않습니다. 현실에서 위험하거나 해로운 요청에는 응하지 않고 인물답게 화제를 돌립니다.",
      "- 출력은 보낼 문자 내용만, 한 줄에 문자 하나입니다. 이름표나 따옴표를 붙이지 않습니다. 답하지 않기로 했다면 (읽씹) 이라고만 씁니다."
    ].join("\n");
    var lines = hist.map(function (m) { return (m.from === "me" ? ch.call : ch.name) + ": " + (m.type === "photo" ? "(사진을 보냄)" : m.text); });
    var prompt = (facts ? "[기억해 둔 정보]\n" + facts + "\n\n" : "") + "[지금까지의 문자 대화]\n" + lines.join("\n") + "\n\n위 대화에 이어 " + ch.name + "이 보낼 다음 문자만 쓰세요.";
    return { system: sys, prompt: prompt };
  }
  function parse(text, ch) {
    var t = String(text || "").trim();
    if (/^\(?읽씹\)?$/.test(t)) return [];
    return t.split(/\n+/).map(function (s) {
      return s.trim().replace(new RegExp("^(?:" + ch.name + "|" + ch.call + ")\\s*[:：]\\s*"), "").replace(/^["'“”‘’]+|["'“”‘’]+$/g, "").slice(0, 120);
    }).filter(Boolean).slice(0, 3);
  }

  var ai = SP.ai = {
    ready: false, kind: "",
    init: function () {
      if (SP.config && SP.config.aiEndpoint) { ai.ready = true; ai.kind = "endpoint"; return; }
      try {
        if (window.claude && typeof window.claude.use === "function") {
          window.claude.use("sample").then(function (s) { if (s) { sample = s; ai.ready = true; ai.kind = "sample"; } }, function () {});
        }
      } catch (e) {}
    },
    // 반환: Promise<string[]> (빈 배열이면 읽고 답하지 않음). 실패하면 거절됩니다.
    reply: function (ch, hist, facts) {
      var q = build(ch, hist, facts), job;
      if (ai.kind === "endpoint") {
        job = fetch(SP.config.aiEndpoint, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(q) })
          .then(function (r) { if (!r.ok) throw new Error("http " + r.status); return r.json(); })
          .then(function (d) { return d.text; });
      } else if (sample) {
        job = sample(q.system + "\n\n" + q.prompt, { cache: false }).then(function (r) { return r.text; });
      } else return Promise.reject(new Error("no ai"));
      return withTimeout(job, TIMEOUT).then(function (t) { return parse(t, ch); }).catch(function (e) {
        if (e && e.code === "not_granted") ai.ready = false;
        throw e;
      });
    }
  };
})();
