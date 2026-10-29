/* 사용자 이름: 처음 접속할 때 입력받아 저장하고, 대화 속 {이름}을 그 이름으로 바꿔 보여 줍니다.
   예) data 안의 메시지에 "{이름}아 어디야?"라고 쓰면 "민지아 어디야?"처럼 표시됩니다.
   주소 뒤에 ?reset 을 붙여 접속하면 저장된 이름을 지우고 다시 입력받습니다. */
const NAME_KEY='phone-site-user-name';
function N(s){return String(s).replace(/\{(?:이름|name)\}/g,()=>D.userName||'')}
(function(){
 if(/[?&]reset\b/.test(location.search)){try{localStorage.removeItem(NAME_KEY)}catch(e){}}
 try{D.userName=localStorage.getItem(NAME_KEY)||''}catch(e){D.userName=''}
 if(D.userName)return;
 const m=document.createElement('div');m.id='nm';
 m.innerHTML='<div class="cd"><h3>이름을 알려 주세요</h3><p>이 이름으로 불러 드릴게요.</p><input maxlength="10" placeholder="이름 입력" autocomplete="off"><button disabled>확인</button></div>';
 document.querySelector('#phone').append(m);
 const i=m.querySelector('input'),b=m.querySelector('button');
 const ok=()=>{const v=i.value.trim();if(!v)return;D.userName=v;try{localStorage.setItem(NAME_KEY,v)}catch(e){}m.remove()};
 i.oninput=()=>{b.disabled=!i.value.trim()};b.onclick=ok;
 i.onkeydown=e=>{if(e.key==='Enter'){e.preventDefault();ok()}};
 setTimeout(()=>i.focus(),300);
})();
