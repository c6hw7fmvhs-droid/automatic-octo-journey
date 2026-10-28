// AI 자유 대화 설정. aiEndpoint에 worker/worker.js 를 올린 주소(예: "https://story-phone.내계정.workers.dev")를 넣으면
// 이지우가 AI로 자유롭게 답장합니다. 비워 두면 규칙 기반 답장을 사용합니다.
// API 키는 절대 이 파일에 넣지 마세요. 키는 Worker의 비밀 변수에만 둡니다.
// useRealTime: true 이면 잠금/홈 화면과 문자 시간이 기기의 실제 현재 시간을 따릅니다. false 이면 이야기 속 시간(10월 22일 밤 9:25에서 시작)을 씁니다.
window.SP = window.SP || {};
SP.config = { aiEndpoint: "", useRealTime: true };
