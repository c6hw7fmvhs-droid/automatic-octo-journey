/* 현재 시간과 날짜: 상태바와 잠금화면에 실제 시간을 표시합니다 */
function tick(){const d=new Date(),t=(d.getHours()%12||12)+':'+String(d.getMinutes()).padStart(2,'0');
 document.querySelector('#clk').textContent=t;
 document.querySelector('#lock .t').textContent=t;
 document.querySelector('#lock .d').textContent=(d.getMonth()+1)+'월 '+d.getDate()+'일 '+'일월화수목금토'[d.getDay()]+'요일'}
tick();setInterval(tick,1000);
