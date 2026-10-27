// 규칙 기반 답장 엔진. 실제 언어 모델이 아니라, 입력에서 의도·약속·취향을 찾아 data/characters.js의 문장 은행에서 골라 답합니다.
//  - 의도 판별(정규식) → 기분(mood)에 맞는 후보에서 최근에 쓰지 않은 문장 선택
//  - 약속(plans), 좋아하는 것(likes), 싫어하는 것(dislikes), 먹은 것(meal)을 brain에 기억하고 이후 답장에 사용
(function () {
  window.SP = window.SP || {};
  var WHEN = /(오늘|내일|모레|이번\s?주말|주말|다음\s?주|[월화수목금토일]요일|이따가?|저녁|아침|점심)/;
  var TIME = /(오전|오후|아침|저녁|밤|새벽)?\s*(\d{1,2})\s*시\s*(반)?/;
  var VERB = /(보자|볼까|만나|갈게|가자|할게|올게|있어|약속|예약|출발|기다릴게)/;
  var GENERIC = /^(밥|저녁|점심|아침|뭐|뭘|것|거)$/;
  var PRON = /^(나|난|내가|저|전|저는|나는|나도)$/;
  var RX = {
    sorry: /미안|죄송|잘못했/, bday: /생일|축하/, bdwhen: /생일\s*(이|은|가)?\s*(언제|며칠|몇)|언제\s*(가|야)?\s*생일/, excuse: /자고|잠들|잠이|자느라|샤워|씻|운전|회의|수업|방전|꺼져|무음|진동|못\s?들|못\s?봤|몰랐|깜빡/, thanks: /고마워|고맙|감사|땡큐|ㄱㅅ/,
    love: /사랑|보고\s?싶|그리웠|(너|니가|네가)\s*(진짜|너무|완전)?\s*좋아/,
    call: /전화|못\s?받|안\s?받|폰|연락/, bye: /잘\s?자|자러|굿나잇|바이|ㅂㅂ|이만|내일\s?봐/,
    greet: /안녕|하이|ㅎㅇ|헬로|hello|굿모닝/, tired: /피곤|졸려|졸리|지쳤|지친|힘들|피로|바빴|바빠/,
    sad: /우울|슬퍼|속상|짜증|화나|눈물|외로/, where: /어디(야|있|갔|냐|니|에)/,
    food: /밥|먹었|먹을|점심|저녁|아침|배고|배불|야식|뭐\s?먹|맛있/, howru: /뭐\s?해|뭐하|뭐\s?했|잘\s?지내|어떻게\s?지내|오늘\s?어때|요즘\s?어때/,
    laugh: /ㅋㅋ|ㅎㅎ|웃기|웃겨/, agree: /^(응+|웅+|ㅇㅇ+|ㅇㅋ|넹|네+|그래+|알겠어|알았어|오케이|ok|okay|그렇구나)[\s.!~]*$/i,
    dismiss: /됐어|몰라|상관없|신경\s?쓰지|귀찮|냅둬|알아서/, Q: /[?？]|뭐|왜|어떻게|무슨|누구|언제|몇|어디|할까|볼까/,
    compliment: /예쁘|귀엽|멋있|잘했|최고|대단|잘생|좋은 사람|고생했/, invite: /같이|놀러|데이트|만나자|보러 가|갈래|갈까|하자/, work: /학교|수업|과제|공부|시험|알바|회사|일하|출근|퇴근/, media: /영화|드라마|애니|게임|노래|음악|책|만화|유튜브/, reassurance: /괜찮아\??$|괜찮을까|내 편|옆에 있어|믿어도|싫어하지|사랑해\??$/
  };
  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function fmt(s, v) { return s.replace(/\{(\w+)\}/g, function (_, k) { return v[k] != null ? v[k] : ""; }).replace(/\s{2,}/g, " ").trim(); }
  function strip(w) { return w.length > 2 ? w.replace(/(을|를|은|는)$/, "") : w; }
  function isQ(t) { return /[?？]|뭐|뭘|무엇/.test(t); }

  function planOf(t) {
    var w = t.match(WHEN);
    if (!w || !VERB.test(t) || /[?？]|몇\s?시|언제/.test(t)) return null;
    var tm = t.match(TIME);
    return { when: w[1].replace(/\s/g, ""), time: tm ? (tm[1] ? tm[1] + " " : "") + tm[2] + "시" + (tm[3] ? " 반" : "") : "", text: t.slice(0, 60) };
  }
  function objOf(t, re) {
    var m = t.match(re); if (!m) return null;
    var tok = m[1].split(/\s+/).filter(function (x) { return !PRON.test(x); }).map(strip);
    var o = tok.join(" ").trim();
    return (!o || /너|니가|네가|우리/.test(o)) ? null : o;
  }
  function learn(t, b) {
    var out = {}, pl = planOf(t), x;
    if (pl) { b.plans.unshift(pl); b.plans = b.plans.slice(0, 3); out.plan = pl; }
    if ((x = objOf(t, /(\S+(?:\s\S+)?)\s*(?:진짜|완전|엄청|너무)?\s*좋아(?:해|하는데|한다|함|하거든|하지)/))) {
      if (b.likes.indexOf(x) === -1) b.likes.unshift(x); b.likes = b.likes.slice(0, 5); out.like = x;
    }
    if ((x = objOf(t, /(\S+(?:\s\S+)?)\s*(?:진짜|완전|엄청|너무)?\s*싫어(?:해|하는데|함|하거든)/))) {
      if (b.dislikes.indexOf(x) === -1) b.dislikes.unshift(x); b.dislikes = b.dislikes.slice(0, 5); out.dislike = x;
    }
    var m = t.match(/(\S{1,8}?)(?:을|를)?\s*(?:방금|아까)?\s*먹었/);
    if (m && !isQ(t) && !GENERIC.test(m[1])) { b.meal = m[1]; out.meal = m[1]; }
    return out;
  }

  function detect(msgs, text, b, L) {
    var f = [], t = text;
    if (msgs.some(function (m) { return m.type === "photo"; })) f.push("photo");
    if (msgs.some(function (m) { return m.type === "link"; })) f.push("link");
    // 구체적인 의도를 먼저 판별해 일반 질문 답장으로 빠지는 일을 줄입니다.
    if (RX.sorry.test(t)) f.push("sorry");
    if (RX.excuse.test(t)) f.push("excuse");
    if (RX.reassurance.test(t)) f.push("reassurance");
    if (RX.compliment.test(t)) f.push("compliment");
    if (RX.invite.test(t)) f.push("invite");
    if (RX.work.test(t)) f.push("work");
    if (RX.media.test(t)) f.push("media");
    if (RX.bdwhen.test(t)) f.push("birthday_when"); else if (RX.bday.test(t)) f.push("birthday");
    if (L.plan) f.push("plan_set");
    if (L.like) f.push("like_set");
    if (L.dislike) f.push("dislike_set");
    if (RX.love.test(t)) f.push("love");
    if (RX.thanks.test(t)) f.push("thanks");
    if (RX.call.test(t)) f.push("call");
    if (RX.bye.test(t)) f.push("bye");
    if (RX.greet.test(t)) f.push("greet");
    if (RX.tired.test(t)) f.push("tired");
    if (RX.sad.test(t)) f.push("sad");
    if (RX.where.test(t)) f.push("where");
    if (!L.plan && /(약속|언제|몇\s?시|시간\s?(돼|있))/.test(t) || (!L.plan && WHEN.test(t) && /뭐\s?해|있어\?/.test(t))) f.push(b.plans.length ? "plan_has" : "plan_none");
    if (L.meal) f.push("meal_set");
    if (RX.food.test(t) && !L.meal && !L.plan) f.push(b.meal && Math.random() < 0.4 ? "food_meal" : (b.likes.length && Math.random() < 0.5 ? "food_like" : "food"));
    if (RX.howru.test(t)) f.push("howru");
    if (RX.laugh.test(t)) f.push("laugh");
    if (!f.length) f.push(RX.agree.test(t) ? "agree" : (RX.Q.test(t) ? "question" : "general"));
    return f;
  }

  function variant(ch, key, b, v) {
    var bank = (ch.bank || {})[key]; if (!bank) return null;
    var mk = { normal: "n", warm: "w", upset: "u" }[b.mood] || "n", list = bank[mk] && bank[mk].length ? bank[mk] : bank.n; if (!list || !list.length) return null;
    var rk = key + ":" + b.mood, rec = b.recent[rk] || [];
    var ids = list.map(function (_, i) { return i; }).filter(function (i) { return rec.indexOf(i) === -1; });
    if (!ids.length) ids = list.map(function (_, i) { return i; });
    var i = rand(ids); rec.push(i); b.recent[rk] = rec.slice(-Math.max(1, Math.min(2, list.length - 1)));
    var s = list[i]; return (Array.isArray(s) ? s : [s]).map(function (x) { return fmt(x, v); });
  }

  function updateMood(b, f, text) {
    b.since = (b.since || 0) + 1;
    var old = b.mood;
    if (RX.dismiss.test(text) || (RX.agree.test(text) && (b.dismissive = (b.dismissive || 0) + 1) >= 3)) { b.mood = "upset"; b.dismissive = 0; }
    else if (!RX.agree.test(text)) b.dismissive = 0;
    if (f.indexOf("sorry") > -1 && old === "upset") b.mood = "normal";
    if (f.indexOf("love") > -1) b.mood = old === "upset" ? "normal" : "warm";
    if (b.mood === old && ((old === "upset" && b.since > 6) || (old === "warm" && b.since > 8))) b.mood = "normal";
    if (b.mood !== old) b.since = 0;
  }

  // msgs: [{type, text}] / 반환: { parts:[...] } 또는 null(읽고 무응답)
  function compose(ch, msgs, b, recentTexts) {
    var text = msgs.map(function (m) { return m.text || ""; }).join(" ").toLowerCase().trim();
    // 사용자가 지우를 부르면 일반 인사·질문 분류보다 먼저 짧게 반응합니다.
    // 단독 호칭 또는 문장 첫머리의 "지우야/이지우/야" 등을 인식합니다.
    if (ch && ch.name === "이지우" && /^(?:야+|이지우(?:야|아)?|지우(?:야|아)?)(?:[\s,.!?~ㅋㅎ]|$)/i.test(text)) {
      return { parts: [rand(["응?", "왜 불러?", "왜?", "무슨 일 있어?"])] };
    }
    var L = {}; msgs.forEach(function (m) { if (m.type !== "photo") { var r = learn((m.text || "").toLowerCase(), b); for (var k in r) L[k] = r[k]; } });
    var f = detect(msgs, text, b, L), plan = b.plans[0] || {};
    // 한 메시지에 여러 표현이 섞여도 서로 어색한 답장이 이어지지 않도록 우선순위를 적용합니다.
    var priority = ["sorry", "excuse", "sad", "reassurance", "love", "birthday_when", "birthday", "plan_set", "plan_has", "plan_none", "like_set", "dislike_set", "meal_set", "food_meal", "food_like", "food", "call", "where", "tired", "compliment", "invite", "work", "media", "thanks", "bye", "greet", "howru", "laugh", "photo", "link", "agree", "question", "general"];
    f.sort(function (a, c) { return priority.indexOf(a) - priority.indexOf(c); });
    var v = { name: ch.call || "", like: L.like || b.likes[0] || "", dislike: L.dislike || "", meal: b.meal || "", when: plan.when || "", time_s: plan.time ? " " + plan.time : "" };
    if (f.length === 1 && f[0] === "agree" && Math.random() < 0.2) { updateMood(b, f, text); return null; }
    var parts = [], tries = 0;
    do {
      parts = []; f.slice(0, 2).forEach(function (k) { var p = variant(ch, k, b, v); if (p) parts = parts.concat(p); });
      tries++;
    } while (parts.length && recentTexts.indexOf(parts[0]) > -1 && tries < 3);
    if (b.plans.length && b.reminded < 2 && /^(bye|greet|howru)$/.test(f[0]) && Math.random() < 0.45) {
      parts.push(fmt(rand(["참, {when}{time_s} 약속 안 잊었지?", "아 맞다 {when}{time_s} 약속 있는 거 알지?"]), v)); b.reminded++;
    }
    updateMood(b, f, text);
    // 지우의 답장 일부에 사용자가 입력한 이름을 자연스럽게 넣습니다.
    var userName = SP.profile && SP.profile.getName ? SP.profile.getName() : "";
    if (parts.length && userName && ch.name === "이지우" && Math.random() < 0.35) {
      var last = userName.charAt(userName.length - 1), code = last.charCodeAt(0), vocative = userName;
      if (code >= 0xAC00 && code <= 0xD7A3) vocative += ((code - 0xAC00) % 28 === 0) ? "야" : "아";
      else vocative += "아";
      parts[0] = vocative + ", " + parts[0].charAt(0).toLowerCase() + parts[0].slice(1);
    }
    return parts.length ? { parts: parts.slice(0, 3) } : null;
  }
  SP.replies = { compose: compose, learn: learn };
})();
