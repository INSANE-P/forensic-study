// ──────────────────────────────────────────────────────────────────────────
// 디지털 포렌식 문제/콘텐츠 공통 타입
//
// ⚠️ 콘텐츠(문제·개념·정리)는 전부 src/data 안에서만 관리한다.
// 시험 형식이 미정인 첫 강좌라 세 가지 형식을 모두 지원한다:
//   - choice : 객관식(단일/복수) → 자동 채점
//   - essay  : 서술형 → 모범답안 + 셀프 채점(키워드 보조 채점)
//   - 시나리오 과제는 essay + scenario 필드(스토리 박스)로 표현
// ──────────────────────────────────────────────────────────────────────────

/** 문제 형식 */
export type QFormat = "choice" | "essay";

/** 객관식 세부 유형 */
export type QChoiceType = "single" | "multi";

/** 서술형 셀프 채점 결과 */
export type Grade = "correct" | "unsure" | "wrong";

/** 보조(키워드) 채점 설정 — 서술형 전용 */
export type Grading = {
  /** 반드시 포함되어야 하는 핵심 키워드 */
  must: string[];
  /** 있으면 가산되는 보너스 키워드 */
  bonus?: string[];
  /** 키워드별 동의어(영문 병기 등) */
  synonyms?: Record<string, string[]>;
};

export type Question = {
  /** 예: "w01-q03" (주차+번호) */
  id: string;
  /** 주차 (1~14, 8주차 없음) */
  week: number;
  /** 주제 태그 (필터/약점 분석용) 예: "증거능력", "FAT", "MAC times" */
  topic: string;
  /** 추가 태그(검색용, 선택) */
  tags?: string[];
  /** 문제 형식 */
  format: QFormat;
  /** 발문 */
  prompt: string;

  // ── 객관식(choice) 전용 ──
  /** 단일/복수 정답 */
  type?: QChoiceType;
  /** 보기 (순서대로) */
  options?: string[];
  /** 정답 보기 인덱스(0-base). single이면 1개, multi면 여러 개 */
  answers?: number[];

  // ── 서술형(essay) 전용 ──
  /** 시나리오 과제 스토리(있으면 카드 상단 스토리 박스로 렌더) */
  scenario?: string;
  /** 모범답안 (Markdown) */
  modelAnswer?: string;
  /** 보조(키워드) 채점 설정 */
  grading?: Grading;

  // ── 공통 ──
  /** 해설 — 객관식의 정/오답 풀이 (Markdown) */
  explanation?: string;
};

/** 주차 메타데이터 (필터/정리 라벨) */
export type WeekMeta = {
  week: number;
  /** 예: "디지털 포렌식 개관" */
  title: string;
  /** 한 줄 부제 */
  subtitle: string;
};
