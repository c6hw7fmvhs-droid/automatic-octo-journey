// Instagram 앱: 프로필 화면, 게시물 상세(사진 넘기기), 좋아요, 댓글. 상태는 localStorage "ig"에 저장.
(function () {
  window.SP = window.SP || {};
  var st = { liked: {}, comments: {} }, open = {}, idx = {}, det, postBody;
  function sv(inner, extra) { return '<svg viewBox="0 0 24 24" fill="none" stroke="#111" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" ' + (extra || "") + ">" + inner + "</svg>"; }
  var S = {
    plus: sv('<path d="M12 4v16M4 12h16"/>', 'stroke-width="2.4"'),
    menu: sv('<path d="M3 6h18M3 12h18M3 18h18"/>', 'stroke-width="2.4"'),
    lock: sv('<rect x="5" y="10" width="14" height="10" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>', 'stroke-width="2.4"'),
    home: sv('<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>'),
    reels: sv('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M10 8.5l5 3.5-5 3.5z"/>'),
    send: sv('<path d="M21 3L3 10.5l7 3 3 7z"/><path d="M10 13.5L21 3"/>'),
    search: sv('<circle cx="11" cy="11" r="7"/><path d="M20 20l-4-4"/>'),
    add: sv('<circle cx="10" cy="8" r="4"/><path d="M3 20c.5-4 3.5-6 7-6M18 8v6M15 11h6"/>'),
    grid: '<svg viewBox="0 0 24 24" fill="#111">' + [0, 1, 2].map(function (r) { return [0, 1, 2].map(function (c) { return '<rect x="' + (3 + c * 7) + '" y="' + (3 + r * 7) + '" width="4.5" height="4.5" rx="1"/>'; }).join(""); }).join("") + "</svg>",
    repost: sv('<path d="M17 3l3 3-3 3M4 11V9a3 3 0 0 1 3-3h13M7 21l-3-3 3-3M20 13v2a3 3 0 0 1-3 3H4"/>').replace(/#111/g, "#8e8e93"),
    tag: sv('<rect x="4" y="3" width="16" height="18" rx="4"/><circle cx="12" cy="10" r="3"/><path d="M6.5 19c.8-3 3-4 5.5-4s4.7 1 5.5 4"/>').replace(/#111/g, "#8e8e93"),
    multi: '<svg viewBox="0 0 24 24" fill="#fff"><rect x="8" y="3" width="13" height="13" rx="3"/><rect x="3" y="8" width="13" height="13" rx="3" opacity=".8"/></svg>'
  };
  function el(t, c, x) { var e = document.createElement(t); if (c) e.className = c; if (x != null) e.textContent = x; return e; }
  function ic(name, cls) { var e = el("span", cls || "igi"); e.innerHTML = S[name]; return e; }
  function load() {
    var s = SP.storage.get("ig", null);
    if (s && typeof s === "object") {
      if (s.liked && typeof s.liked === "object") st.liked = s.liked;
      if (s.comments && typeof s.comments === "object") st.comments = s.comments;
    }
  }
  function save() { SP.storage.set("ig", st); }
  function dlabel(ts) { var d = new Date(ts); return isNaN(d) ? "" : (d.getMonth() + 1) + "월 " + d.getDate() + "일"; }
  function allComments(p) { return (Array.isArray(p.comments) ? p.comments : []).concat(Array.isArray(st.comments[p.id]) ? st.comments[p.id] : []); }
  function slides(p) { var a = Array.isArray(p.images) && p.images.length ? p.images : [p.img || ""]; return a.map(function (x) { return { img: x, color: p.color }; }); }
  function sorted() { return (SP.data.posts || []).filter(function (p) { return p && p.id && !isNaN(new Date(p.ts)); }).sort(function (a, b) { return new Date(b.ts) - new Date(a.ts); }); }
  function prof() { var n = (SP.profile && SP.profile.getName ? SP.profile.getName() : "");
    return Object.assign({}, SP.data.profile || {}, {user:n, username:n}); }

  function fmtN(n) { return n >= 10000 ? String(Math.round(n / 1000) / 10).replace(/\.0$/, "") + "만" : String(n); }
  function card(p) {
    var P = prof(), c = el("article", "post"), h = el("div", "ph"), av = el("div", "av", P.avatar ? "" : String(p.user || "?").charAt(0).toUpperCase());
    SP.pic(av, { img: P.avatar, color: P.color || "#c7c7cc" }); h.append(av, el("b", "", p.user));
    var sl = slides(p), car = el("div", "car"), wrap = el("div", "carwrap"), cnt = null;
    sl.forEach(function (s) { var d = el("div", "slide"); SP.pic(d, s); car.append(d); });
    wrap.append(car);
    if (sl.length > 1) {
      cnt = el("span", "carcnt", ((idx[p.id] || 0) + 1) + "/" + sl.length); wrap.append(cnt);
      car.addEventListener("scroll", function () { var i = Math.round(car.scrollLeft / (car.clientWidth || 1)); idx[p.id] = i; cnt.textContent = (i + 1) + "/" + sl.length; });
    }
    setTimeout(function () { car.scrollLeft = (idx[p.id] || 0) * car.clientWidth; }, 0);
    var liked = !!st.liked[p.id], act = el("div", "pact");
    var lk = el("button", "ico" + (liked ? " on" : ""), liked ? "♥" : "♡"); lk.setAttribute("aria-label", "좋아요");
    lk.onclick = function () { if (st.liked[p.id]) delete st.liked[p.id]; else st.liked[p.id] = true; save(); c.replaceWith(card(p)); };
    act.append(lk);
    var n = (p.likes || 0) + (liked ? 1 : 0);
    c.append(h, wrap, act);
    if (n > 0) c.append(el("div", "likes", "좋아요 " + n + "개"));
    var cap = el("div", "cap"); cap.append(el("b", "", p.user), document.createTextNode(" " + (p.caption || ""))); c.append(cap);
    c.append(el("div", "pdate", dlabel(p.ts)));
    return c;
  }
  function openPost(p) { postBody.innerHTML = ""; postBody.append(card(p)); det.hidden = false; }

  function build() {
    var root = document.getElementById("instagram"); root.innerHTML = "";
    var P = prof(), posts = sorted();
    var view = el("div", "view"), top = el("div", "igtop"), nm = el("span", "igname");
    nm.append(document.createTextNode(" " + (P.user || "")));
    top.append(ic("plus"), nm, ic("menu"));
    var body = el("div", "body"), head = el("div", "ighead"), ring = el("div", "ring");
    var av = el("div", "igav", "");
    av.style.background = "#eceef2";
    av.innerHTML = '<svg viewBox="0 0 64 64" aria-hidden="true"><circle cx="32" cy="22" r="12" fill="#858c99"/><path d="M9 58c1-14 10-22 23-22s22 8 23 22" fill="#858c99"/></svg>';
    ring.append(av, el("i", "plusb", "+"));
    var stats = el("div", "stats");
    [["게시물", posts.length], ["팔로워", P.followers || 0], ["팔로잉", P.following || 0]].forEach(function (s) {
      var d = el("div"); d.append(el("b", "", fmtN(s[1])), el("span", "", s[0])); stats.append(d);
    });
    head.append(ring, stats);
    var btns = el("div", "igbtns"), add = el("span", "igbtn sm"); add.innerHTML = S.add;
    btns.append(el("span", "igbtn", "프로필 편집"), el("span", "igbtn", "프로필 공유"), add);
    var hls = el("div", "hls"), nw = el("div", "hl"); nw.append(el("div", "hlc", "+"), el("span", "", "New")); hls.append(nw);
    (P.highlights || []).forEach(function (h) { var d = el("div", "hl"), cc = el("div", "hlc"); SP.pic(cc, h); d.append(cc, el("span", "", h.label || "")); hls.append(d); });
    var tabs = el("div", "igtabs");
    [["grid", "on"], ["repost", ""], ["tag", ""]].forEach(function (t) { var s = el("span", t[1]); s.innerHTML = S[t[0]]; tabs.append(s); });
    var grid = el("div", "tgrid");
    posts.forEach(function (p) {
      var t = el("button", "tile"), sl = slides(p); SP.pic(t, sl[0]); t.setAttribute("aria-label", "게시물");
      if (sl.length > 1) { var m = el("span", "multi"); m.innerHTML = S.multi; t.append(m); }
      t.onclick = function () { openPost(p); }; grid.append(t);
    });
    body.append(head, btns, tabs, grid);
    var nav = el("div", "ignav"), navItems = [];
    ["home", "reels", "send", "search"].forEach(function (n) { var item=ic(n); item.setAttribute("role","button"); item.tabIndex=0; navItems.push(item); nav.append(item); });
    var me = el("span", "igi on"), mini = el("span", "mini"); SP.pic(mini, { img: P.avatar, color: P.color || "#c7c7cc" }); me.append(mini); me.setAttribute("role","button"); me.tabIndex=0; navItems.push(me); nav.append(me);
    function mode(which){
      body.innerHTML="";
      if(which==="profile"){ body.append(head,btns,tabs,grid); }
      else if(which==="home"){
        var stories=el("div","igstories"); ["내 스토리","yubamabm","jubini","chaeyeon4"].forEach(function(n){var st=el("div","igstory");st.append(el("span","mini",n.charAt(0)),el("small","",n));stories.append(st);});
        body.append(stories); posts.forEach(function(p){body.append(card(p));});
      } else if(which==="reels"){
        var rh=el("div","igmodehead reels-title","릴스");
        var reel=el("div","igreel-player");
        var video=el("video","igreel-video");
        video.src="assets/videos/instagram-reel.mp4";
        video.poster="assets/videos/instagram-reel-poster.jpg";
        video.controls=false; video.playsInline=true; video.autoplay=true; video.muted=true; video.loop=true; video.preload="auto";
        video.setAttribute("autoplay", ""); video.setAttribute("muted", ""); video.setAttribute("loop", "");
        video.play().catch(function(){}); video.setAttribute("aria-label","릴스 영상 재생"); reel.append(video);
        var actions=el("div","igreel-actions");
        [{icon:"♡",label:"좋아요"},{icon:"○",label:"댓글"},{icon:"➤",label:"공유"},{icon:"▱",label:"저장"}].forEach(function(a){var b=el("button","igreel-action");b.innerHTML='<span>'+a.icon+'</span><small>'+a.label+'</small>';b.setAttribute("aria-label",a.label);b.onclick=function(){if(a.label==="좋아요"){b.classList.toggle("liked");b.querySelector("span").textContent=b.classList.contains("liked")?"♥":"♡";}};actions.append(b);});
        var caption=el("div","igreel-caption"); caption.append(el("b","","Stonelee"),el("span","","릴스")); reel.append(actions,caption);
        body.append(rh,reel);
      } else if(which==="search"){
        var sh=el("div","igsearchwrap"), searchField=el("div","igsearchfield"), searchIcon=ic("search","igsearch-icon"), input=el("input","igsearch");
        input.placeholder="검색"; input.setAttribute("aria-label","검색"); searchField.append(searchIcon,input); sh.append(searchField);
        var recent=el("section","ig-recent-searches"), recentHead=el("div","ig-recent-heading"), recentTitle=el("b","","최근 검색"), clearRecent=el("button","","모두 보기");
        clearRecent.type="button"; clearRecent.onclick=function(){recentList.innerHTML="";}; recentHead.append(recentTitle,clearRecent);
        var recentList=el("div","ig-recent-list"); recent.append(recentHead,recentList); body.append(sh,recent);
        input.addEventListener("input",function(){
          var q=input.value.trim(); recentList.innerHTML="";
          if(!q)return;
          var matches=posts.filter(function(p){return ((p.user||"")+" "+(p.caption||"")).toLowerCase().includes(q.toLowerCase());}).slice(0,6);
          matches.forEach(function(p){var row=el("button","ig-recent-item"), icon=ic("search","ig-recent-icon");row.append(icon,el("span","",p.user||p.caption||"검색 결과"));row.onclick=function(){openPost(p);};recentList.append(row);});
          if(!matches.length)recentList.append(el("div","ig-recent-empty","검색 결과가 없습니다."));
        });
        setTimeout(function(){input.focus();},50);
      } else if(which==="send"){
        var dh=el("div","igmodehead","메시지");
        var dmWrap=el("div","igdm-list");
        var search=el("div","igdm-search");search.append(el("span","","⌕"),el("span","","검색"));
        var chips=el("div","igdm-chips");
        ["홀딱 반함...","🔖 최근 저장 2회"].forEach(function(t){chips.append(el("span","igdm-chip",t));});
        var stories=el("div","igdm-stories");
        ["내 메모","yubamabm","jubini","chaeyeon4"].forEach(function(n){
          var st=el("div","igdm-story"),av=el("div","igdm-avatar");
          st.append(av,el("span","",n));stories.append(st);
        });
        var title=el("div","igdm-section-title","메시지");
        dmWrap.append(search,chips,stories,title);
        [
          {name:"이지우",preview:"방금 일어났어...",time:"방금",open:true},
          {name:"주빈",preview:"",time:"",open:false},
          {name:"채연",preview:"",time:"",open:false}
        ].forEach(function(item){
          var row=el("button","igdm-item"),av=el("div","igdm-avatar"),info=el("div");
          info.append(el("b","",item.name),el("small","",item.preview));
          row.append(av,info);
          if(item.open)row.append(el("span","igdm-unread"));
          row.onclick=function(){
            if(!item.open)return;
            var panel=el("div","igdm");panel.append(el("h3","",item.name));
            ["일어났어?","오늘 뭐 해?","밥 먹었어?"].forEach(function(t){panel.append(el("p","igdm-bubble",t));});
            var form=el("form","igdmform"),inp=el("input");inp.placeholder="메시지 보내기";
            var send=el("button","","전송");form.append(inp,send);
            form.onsubmit=function(e){e.preventDefault();if(inp.value.trim()){panel.append(el("p","igdm-mine",inp.value.trim()));inp.value="";}};
            body.innerHTML="";body.append(el("div","igmodehead","‹　"+item.name),panel);
          };
          dmWrap.append(row);
        });
        body.append(dh,dmWrap);
      }
      navItems.forEach(function(n,i){n.classList.toggle("on",(which==="home"&&i===0)||(which==="reels"&&i===1)||(which==="send"&&i===2)||(which==="search"&&i===3)||(which==="profile"&&i===4));});
    }
    navItems.forEach(function(n,i){var names=["home","reels","send","search","profile"];n.onclick=function(){mode(names[i]);};n.onkeydown=function(e){if(e.key==="Enter"||e.key===" "){e.preventDefault();mode(names[i]);}};});
    view.append(top, body, nav);
    det = el("div", "detail"); det.hidden = true;
    var tb = el("div", "topbtns"), bk = el("button", "pill", "‹ 프로필"); bk.onclick = function () { det.hidden = true; };
    tb.append(bk); postBody = el("div", "body"); det.append(tb, postBody);
    root.append(view, det);
  }
  SP.instagram = { init: function () { load(); build(); }, open: function () { if (det) det.hidden = true; } };
})();
