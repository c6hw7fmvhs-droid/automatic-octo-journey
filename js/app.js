/* 공통 기능, 홈화면, 잠금화면 */
const $=s=>document.querySelector(s),A=$('#app');
let view={},tk=0,seen={},lockOn=true;
const E=s=>N(s).replace(/</g,'&lt;');
const apps=[["메시지","💬","#34c759","sms"],["카카오톡","💛","#fee500","kk"],["메일","✉️","#1e90ff","mail"],["캘린더","📅","#fff","cal"],["전화","📞","#34c759","ph"],["메모","📝","#ffd60a","note"],["사진","🌸","#fff","photo"],["Safari","🧭","#fff","safari"]];
const dummy=[["카메라","cam"],["설정","set"],["시계","clock"],["Instagram","ig"]];
function unreadOf(k){if(k=='ph')return D.missed|0;const l=k=='sms'||k=='kk'?D[k]:k=='mail'?D.mail:[];return l.reduce((a,x)=>a+(x.unread|0),0)}
function badges(){document.querySelectorAll('.ic[data-k]').forEach(e=>{const n=unreadOf(e.dataset.k),b=e.querySelector('.bd');b.textContent=n;b.style.display=n?'grid':'none'})}
function mk(a,dk){return `<div class="ic" data-k="${a[3]}" onclick="openApp('${a[3]}')"><i>${ICON[a[3]]}</i>${dk?'':a[0]}<span class="bd"></span></div>`}
$('#grid').innerHTML=[apps[3],apps[5],apps[6],apps[7]].map(a=>mk(a)).join('')+dummy.map(d=>`<div class="ic"><i>${ICON[d[1]]}</i>${d[0]}</div>`).join('');
$('#dock').innerHTML=[apps[4],apps[0],apps[2],apps[1]].map(a=>mk(a,1)).join('');
function setDark(d){$('#sb').classList.toggle('dark',d);$('#ind').classList.toggle('dark',d)}
function openApp(k){view={app:k};tk++;A.classList.add('on');R[k]();setDark(true)}
function home(){tk++;view={};A.classList.remove('on');setDark(false);badges()}
$('#ind').onclick=()=>lockOn?unlock():home();
const hd=(t,back)=>`<div class="hd">${back?`<b onclick="${back}">‹ 뒤로</b>`:''}<span>${t}</span></div>`;
const av=n=>`<div class="av">${E(n[0])}</div>`;
const R={};
function unlock(){if(!lockOn)return;lockOn=false;$('#lock').classList.add('up');setDark(false);setTimeout(startEvents,2500)}
$('#lock').onclick=unlock;
badges();
function fit(){const v=window.visualViewport,w=v?v.width:innerWidth,h=v?v.height:innerHeight;$('#phone').style.setProperty('--s',Math.max(.2,Math.min((w-24)/419,(h-24)/878,1.4)))}
addEventListener('resize',fit);addEventListener('orientationchange',fit);if(window.visualViewport)visualViewport.addEventListener('resize',fit);fit();
