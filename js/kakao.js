// 읽기 전용 예시 대화와 클릭 가능한 빠른 답장. 새로고침하면 메모리 상태가 초기화됩니다.
(function(){
  window.SP=window.SP||{}; var $=function(s){return document.querySelector(s);};
  var history=[{from:'them',text:'일어났어?',time:'12:00'}], currentName='이지우';
  function userName(){return SP.profile&&SP.profile.getName?SP.profile.getName():'';}
  function callName(){var n=userName(); if(!n)return ''; var last=n.slice(-1); return /[가-힣]/.test(last)&&/[가-힣]/.test(n)?n+(/[은는이가을를과와로]$/.test(last)?'':'아'):n;}
  function drawList(){var host=$('#kakao-list');host.innerHTML='';var b=document.createElement('button');b.className='kakao-room';b.innerHTML='<div class="kakao-avatar">♥</div><div class="kakao-room-main"><b>이지우</b><span>일어났어?</span></div><time>12:00</time>';b.onclick=openChat;host.append(b);}
  function drawChat(){var host=$('#kakao-chat-body');host.innerHTML='';var date=document.createElement('div');date.className='kakao-date';date.textContent='2026년 10월 24일 토요일';host.append(date);history.forEach(function(m){var row=document.createElement('div');row.className='kakao-msg '+m.from;var bubble=document.createElement('div');bubble.className='kakao-bubble';bubble.textContent=m.text;row.append(bubble);var tm=document.createElement('span');tm.className='kakao-time';tm.textContent=m.time||'12:00';row.append(tm);host.append(row);});host.scrollTop=host.scrollHeight;drawSuggestions();}
  function drawSuggestions(){var box=$('#kakao-suggestions');box.innerHTML='';var texts=history.length&&history[history.length-1].from==='them'&&/일어났어/.test(history[history.length-1].text)?['방금 일어났어 ㅋㅋ','응 이제 일어났어','응, 너는?']:[];texts.forEach(function(t){var b=document.createElement('button');b.className='kakao-suggestion';b.textContent='💬 “'+t+'”';b.onclick=function(){send(t);};box.append(b);});}
  function openChat(){currentName='이지우';$('#kakao-chat-title').textContent=currentName;$('#kakao-listview').hidden=true;$('#kakao-chatview').hidden=false;drawChat();}
  function send(text){if(!text.trim())return;history.push({from:'me',text:text,time:'12:01'});$('#kakao-input').value='';drawChat();setTimeout(function(){var response='응응 ㅎㅎ';if(/일어났어/.test(text))response='잘 잤어?';else if(/방금 일어났어/.test(text))response='ㅋㅋ 잘 잤어?';history.push({from:'them',text:response,time:'12:02'});drawChat();},650);}
  function init(){drawList();$('#kakao-back').onclick=function(){$('#kakao-chatview').hidden=true;$('#kakao-listview').hidden=false;drawList();};$('#kakao-form').onsubmit=function(e){e.preventDefault();send($('#kakao-input').value);};}
  SP.kakao={init:init,open:function(){ $('#kakao-chatview').hidden=true;$('#kakao-listview').hidden=false;drawList();}};
})();
