// 잠금 화면 알림. 위에서부터 보이는 순서입니다.
// screen: 누르면 열리는 화면 id, mod: 그 화면의 JS 모듈 이름, chat: 문자 앱에서 바로 열 대화 id
window.SP = window.SP || {};
SP.data = SP.data || {};
SP.data.notifications = [
  { app: "messages", screen: "messages", mod: "messages", chat: "jiwoo", title: "이지우", body: "하윤아 전화 왜 안 받아?", time: "오후 9:18", ts: "2026-10-22T21:18:00" },
  { app: "phone", screen: "phone-app", mod: "phone", title: "이지우", body: "부재중 전화 2통", time: "오후 9:15", ts: "2026-10-22T21:15:00" }
];
