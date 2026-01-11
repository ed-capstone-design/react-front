// 날짜/시간 유틸: 서버에서 전달된 타임스탬프를 UTC로 해석하여 로컬 `Date` 객체로 반환합니다.
// - 서버가 ISO with timezone(Z or ±hh:mm)을 보내면 그대로 파싱합니다.
// - 서버가 `YYYY-MM-DD HH:mm:ss(.sss)?` 또는 `YYYY-MM-DDTHH:mm:ss(.sss)?` 처럼
//   timezone 정보가 없을 경우 UTC로 간주하도록 'Z'를 추가합니다.
export function toDateAssumeUTC(v) {
  if (v == null) return null;
  const s = String(v).trim();
  if (s === '') return null;

  // 이미 timezone 정보가 포함되어 있는 경우 (Z 또는 ±hh:mm) 그대로 파싱
  if (/[Zz]|[+\-]\d{2}:?\d{2}$/.test(s)) {
    const d = new Date(s);
    return isNaN(d.getTime()) ? null : d;
  }

  // 공백으로 구분된 'YYYY-MM-DD HH:mm:ss' 형태이면 T로 바꿔주고 Z 추가
  let candidate = s;
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(s) && !s.includes('T')) {
    candidate = s.replace(' ', 'T') + 'Z';
  } else if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?$/.test(s)) {
    candidate = s + 'Z';
  } else {
    // 기본 시도: append Z
    candidate = s + 'Z';
  }

  const d = new Date(candidate);
  if (!isNaN(d.getTime())) return d;

  // 마지막 보루: 원본 문자열로 파싱 시도
  const d2 = new Date(s);
  return isNaN(d2.getTime()) ? null : d2;
}

export default { toDateAssumeUTC };
