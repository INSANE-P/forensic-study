// 주차 메타데이터 (교안 커리큘럼 기준). 콘텐츠와 함께 검증됨.
// 디지털 포렌식: 1~7, 9~14주차 (8주차 없음 — 중간고사 주)
import type { WeekMeta } from "./types";

export const WEEKS: WeekMeta[] = [
  { week: 1, title: "디지털 포렌식 개관", subtitle: "포렌식의 정의·법과학과의 관계·중요성·관련 진로" },
  { week: 2, title: "디지털 증거", subtitle: "디지털 증거의 개념·특성 · 법적 허용성(증거능력·증명력·전문법칙)" },
  { week: 3, title: "저장매체 이미징", subtitle: "실습 환경 구성 · 비트 단위 이미징 · FTK Imager 분석" },
  { week: 4, title: "스테가노그래피", subtitle: "데이터 은닉의 원리와 이미지 속 메시지 은닉 실습" },
  { week: 5, title: "디지털 데이터 해석", subtitle: "데이터 파싱 · 16진수(Hex) · 파일 시그니처 해석" },
  { week: 6, title: "데이터 해석 과제", subtitle: "파일 시그니처·파싱 실습 과제로 분석 능력 다지기" },
  { week: 7, title: "컴퓨터 시스템과 기억장치", subtitle: "DF 관점의 컴퓨터 시스템 이해 · 기억장치(메모리) 분류" },
  { week: 9, title: "윈도우 아티팩트", subtitle: "부팅 과정 · BIOS/UEFI · 레지스트리 등 윈도우 흔적 분석" },
  { week: 10, title: "활성 시스템 분석", subtitle: "전원이 켜진 시스템의 휘발성 데이터 수집·분석" },
  { week: 11, title: "증거 분석 기술", subtitle: "시스템 로그 분석과 안티 포렌식(흔적 은폐) 대응" },
  { week: 12, title: "파일시스템 이해 I", subtitle: "디스크 파티션 · MBR/GPT · FAT 파일시스템 구조" },
  { week: 13, title: "파일시스템 이해 II", subtitle: "NTFS 파일시스템 · 삭제 파일 복구" },
  { week: 14, title: "정리와 마무리", subtitle: "전체 내용 정리 · QA · 디지털 포렌식 필드의 히어로" },
];

export function weekTitle(w: number): string {
  return WEEKS.find((x) => x.week === w)?.title ?? `${w}주차`;
}
