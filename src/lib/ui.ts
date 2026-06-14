// UI 상수/헬퍼
import type { QChoiceType, QFormat, Grade } from "@/data/types";

export const TYPE_LABEL: Record<QChoiceType, string> = {
  single: "단일정답",
  multi: "복수정답",
};

export const FORMAT_LABEL: Record<QFormat, string> = {
  choice: "객관식",
  essay: "서술형",
};

export const GRADE_LABEL: Record<Grade, string> = {
  correct: "맞음",
  unsure: "애매",
  wrong: "틀림",
};

export const GRADE_DOT: Record<Grade, string> = {
  correct: "bg-brand-green",
  unsure: "bg-brand-amber",
  wrong: "bg-brand-red",
};

/** 정답 인덱스 배열을 보기 번호 문자열로 (예: [0,2] → "①, ③") */
const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧"];
export function circled(i: number): string {
  return CIRCLED[i] ?? `${i + 1}`;
}

/** 두 인덱스 집합이 같은지 (순서 무관) */
export function sameSet(a: number[], b: number[]): boolean {
  if (a.length !== b.length) return false;
  const s = new Set(a);
  return b.every((x) => s.has(x));
}
