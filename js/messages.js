/* 카카오톡, 문자메시지 */
R.sms=function(){A.innerHTML=`<div class="sh"><span class="pill" onclick="home()">‹ 홈</span><span class="pill">☰</span></div><div class="big">메시지</div><div class="body" style="top:150px;padding-bottom:110px">${D.sms.map((x,i)=>`<div class="sr" onclick="room('sms',${i})">${x.unread?'<i class="ud"></i>':''}<div class="n">${E(x.name)}<small>${E(x.at)} ›</small></div><div class="s">${E(x.msgs.at(-1).t)}</div></div>`).join('')}</div><div class="sbar"><div>🔍 검색</div><span>✎</span></div>`};
R.kk=function(){const c=['#ffe0b2','#c8e6c9','#bbdefb','#f8bbd0'];A.innerHTML=`<div class="kh"><b><s onclick="home()" style="text-decoration:none;color:#007aff;font-weight:400;cursor:pointer;margin-right:12px">‹</s>채팅</b><span>🔍 💬 ⚙️</span></div><div class="pills"><u class="on">전체</u><u>안읽음</u><u>ChatGPT</u></div><div class="body" style="top:165px;padding-bottom:90px">${D.kk.map((x,i)=>`<div class="kr" ${i?'style="cursor:default"':`onclick="room('kk',${i})"`}><div class="ka" style="background:${c[i%4]}">${E(x.name[0])}</div><div class="m"><div class="n">${E(x.name)}${x.pin?' 📌':''}<small>${E(x.at)}</small></div><div class="s">${E(x.msgs.at(-1).t)}</div></div>${x.unread?`<em>${x.unread}</em>`:''}</div>`).join('')}</div><div class="tab"><span>👤</span><span>💬</span><span>▶</span><span>🛍</span><span>⋯</span></div>`};
function room(k,i){const th=D[k][i];th.unread=0;view={app:k,room:i};const my=++tk,key=k+i;
 A.innerHTML=hd(E(th.name),`R.${k}()`)+`<div class="body ${k}" style="${k=='kk'?'background:#abc1d1':''}"><div class="chat ${k}" id="ch"></div></div><div class="ro"><div>${k=='kk'?'메시지 입력':'문자 메시지'}</div></div>`;
 const ch=$('#ch');ch.parentNode.onclick=()=>{};
 const add=m=>bub(ch,m,k);
 th.msgs.forEach(add)}
function bub(ch,m,k){if(m.date||(m.time&&k!='kk')){const t=document.createElement('div');t.className='tm';t.textContent=m.date||m.time;ch.append(t)}
 if(!m.date){const b=document.createElement('div');b.className='b'+(m.me?' me':'');b.textContent=N(m.t);
  if(k=='kk'&&m.at){const r=document.createElement('div');r.className='kb'+(m.me?' me':'');const sm=document.createElement('small');sm.textContent=m.at;r.append(b,sm);ch.append(r)}else ch.append(b)}
 ch.parentNode.scrollTop=1e5}
