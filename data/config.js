// 무료 규칙 기반 대화 설정. aiEndpoint를 비워 두면 외부 AI API를 호출하지 않고 미리 작성된 답장 로직을 사용합니다.
// API 키는 절대 이 파일에 넣지 마세요. 키는 Worker의 비밀 변수에만 둡니다.
// useRealTime: true 이면 잠금/홈 화면과 문자 시간이 기기의 실제 현재 시간을 따릅니다. false 이면 이야기 속 시간(10월 22일 밤 9:25에서 시작)을 씁니다.
window.SP = window.SP || {};
SP.config = { aiEndpoint: "", useRealTime: true };
