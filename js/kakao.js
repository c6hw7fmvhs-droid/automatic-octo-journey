// 카카오톡 프로토타입: 지우 방만 열 수 있으며 새로고침하면 초기화됩니다.
(function(){
  window.SP=window.SP||{}; var $=function(s){return document.querySelector(s);};
  var history=[{from:'them',text:'일어났어?',time:'12:00'}], currentName='이지우';
  var names=[
    ['이지우','일어났어?','12:00',true],
    ['2026 총학','과제 공지 확인 부탁드립니다','11:42',false],
    ['서연언니','오늘 뭐 해?','10:58',false],
    ['유빈이','ㅋㅋㅋㅋ 사진 보냈어','09:30',false],
    ['카카오페이','결제가 완료되었어요.','08:12',false],
    ['가족단톡방','밥은 꼭 챙겨 먹고 다녀','어제',false],
    ['엄마','집에 올 때 연락해','어제',false],
    ['주빈이','다음에 같이 가자','월요일',false]
  ];
  function userName(){return SP.profile&&SP.profile.getName?SP.profile.getName():'';}
  function callName(){var n=userName(); if(!n)return ''; var last=n.slice(-1); return /[가-힣]/.test(last)?n+(/[은는이가을를과와로]$/.test(last)?'':'아'):n;}
  function avatar(cls){var a=document.createElement('div');a.className=cls+' kakao-avatar';a.textContent='';return a;}
  function drawList(){
    var host=$('#kakao-list');host.innerHTML='';
    names.forEach(function(item,i){
      var b=document.createElement('button');b.className='kakao-room'+(i===0?' jiwoo-room':' disabled-room');
      var groupRoom = /단톡|단체|가족|총학/.test(item[0]);
      b.innerHTML=(groupRoom
        ? '<div class="kakao-group-avatar"><i></i><i></i><i></i><i></i></div>'
        : '<div class="kakao-avatar"><i></i></div>')+'<div class="kakao-room-main"><b></b><span></span></div><time></time>';
      if (!groupRoom && i !== 0) {
        var colors = ['#b6a9ed','#a7ddd5','#9cdbd2','#c6baf3'];
        var seed = (item[0].split('').reduce(function(a,c){return a+c.charCodeAt(0);},0)) % colors.length;
        b.querySelector('.kakao-avatar').style.background = colors[seed];
      }
      b.querySelector('b').textContent=item[0];
      if(i===0){var pin=document.createElement('span');pin.className='kakao-pin';pin.textContent='📌';b.querySelector('b').appendChild(pin);}
      b.querySelector('span').textContent=item[1];b.querySelector('time').textContent=item[2];
      if(item[3]) b.onclick=openChat; else {b.disabled=false;b.setAttribute('aria-disabled','true');b.onclick=function(e){e.preventDefault();};}
      host.append(b);
    });
  }
  function drawChat(){
    var host=$('#kakao-chat-body');host.innerHTML='';
    var date=document.createElement('div');date.className='kakao-date';date.textContent='2026년 10월 24일 토요일';host.append(date);
    history.forEach(function(m){
      var row=document.createElement('div');row.className='kakao-msg '+m.from;
      if(m.from==='them'){var av=avatar('');row.append(av);}
      var bubble=document.createElement('div');bubble.className='kakao-bubble';bubble.textContent=m.text;row.append(bubble);
      var tm=document.createElement('span');tm.className='kakao-time';tm.textContent=m.time||'12:00';row.append(tm);host.append(row);
    });
    host.scrollTop=host.scrollHeight;drawSuggestions();
  }
  function drawSuggestions(){
    var box=$('#kakao-suggestions');box.innerHTML='';
    var texts=history.length&&history[history.length-1].from==='them'&&/일어났어/.test(history[history.length-1].text)?['방금 일어났어 ㅋㅋ','응 이제 일어났어','응, 너는?']:[];
    texts.forEach(function(t){var b=document.createElement('button');b.className='kakao-suggestion';b.textContent='💬 “'+t+'”';b.onclick=function(){send(t);};box.append(b);});
  }
  function openChat(){currentName='이지우';$('#kakao-chat-title').textContent=currentName;$('#kakao-listview').hidden=true;$('#kakao-chatview').hidden=false;drawChat();}
  function send(text){if(!text.trim())return;history.push({from:'me',text:text,time:'12:01'});$('#kakao-input').value='';drawChat();setTimeout(function(){var response='응응 ㅎㅎ';if(/일어났어/.test(text))response='잘 잤어?';else if(/방금 일어났어/.test(text))response='잘 잤어? 밥은 먹었어?';history.push({from:'them',text:response,time:'12:02'});drawChat();},450);}
  function init(){
    drawList();$('#kakao-back').onclick=function(){$('#kakao-chatview').hidden=true;$('#kakao-listview').hidden=false;drawList();};
    $('#kakao-form').onsubmit=function(e){e.preventDefault();send($('#kakao-input').value);};
  }
  SP.kakao={init:init,open:function(){ $('#kakao-chatview').hidden=true;$('#kakao-listview').hidden=false;drawList();}};
})();
