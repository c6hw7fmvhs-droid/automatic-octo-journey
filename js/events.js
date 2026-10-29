/* 알림 배너와 이벤트 */
let liveDone=0;
function fireLive(){if(liveDone||!D.live2)return;liveDone=1;const th=D.kk[0],L=D.live2;
 L.msgs.forEach((m,i)=>setTimeout(()=>{
  const inRoom=()=>view.app=='kk'&&view.room===0&&$('#ch');
  const put=()=>{if(i==0)th.msgs.push({date:L.date});th.msgs.push(m);th.at=m.at;
   if(inRoom()){const c=$('#ch');if(i==0)bub(c,{date:L.date},'kk');bub(c,m,'kk')}
   else{th.unread=(th.unread|0)+1;badges();banner('카카오톡',th.name,m.t)}};
  if(inRoom()){const ch=$('#ch'),ty=document.createElement('div');ty.className='ty';ty.innerHTML='<span></span><span></span><span></span>';ch.append(ty);ch.parentNode.scrollTop=1e5;setTimeout(()=>{ty.remove();put()},1100)}else put()
 },3000+i*3200))}
function banner(a,n,t){const b=$('#ban');b.innerHTML=`<div style="font-size:30px">${a=='카카오톡'?'💛':'💬'}</div><div><b>${n}</b>${E(t)}</div>`;b.classList.add('on');b.onclick=()=>{b.classList.remove('on');if(!lockOn){if(a=='카카오톡'){openApp('kk');room('kk',0)}else openApp('sms')}};setTimeout(()=>b.classList.remove('on'),3800)}
function startEvents(){const L=D.live;if(!L)return;setTimeout(()=>{const th=D[L.kind][L.room];L.msgs.forEach((t,i)=>setTimeout(()=>{const m={t};th.msgs.push(m);
  if(view.app==L.kind&&view.room==L.room){const ch=$('#ch');if(ch){const ty=document.createElement('div');ty.className='ty';ty.innerHTML='<span></span><span></span><span></span>';ch.append(ty);ch.parentNode.scrollTop=1e5;setTimeout(()=>{ty.remove();const b=document.createElement('div');b.className='b';b.textContent=t;ch.append(b);ch.parentNode.scrollTop=1e5},1100)}}
  else{th.unread=(th.unread|0)+1;badges();if(i==L.msgs.length-1||i==0)banner(L.banner[0],L.banner[1],t)}},i*2500))},L.at-2500)}
