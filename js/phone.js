/* 전화 */
R.ph=function(){D.missed=0;A.innerHTML=hd('최근 통화','home()')+`<div class="body">${D.calls.map(x=>`<div class="row">${av(x.n)}<div class="m"><div class="n ${x.ty=='miss'?'miss':''}">${E(x.n)}<small>${E(x.time)}</small></div><div class="s ${x.ty=='miss'?'miss':''}">${E(x.c)}</div></div></div>`).join('')}</div>`};
