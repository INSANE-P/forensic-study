// ──────────────────────────────────────────────────────────────────────────
// 서술형 보조(키워드) 채점 — 참고용 체크리스트일 뿐, 최종 판정은 사용자 셀프 채점.
// 답안에 핵심 키워드가 포함됐는지만 본다(공백·대소문자 무시, 동의어 허용).
// ──────────────────────────────────────────────────────────────────────────
import type { Question } from "@/data/types";

export type KeywordHit = { label: string; hit: boolean };
export type GradeResult = {
  must: KeywordHit[];
  bonus: KeywordHit[];
  mustHit: number;
  mustTotal: number;
  /** 필수 키워드를 모두 충족 → "맞음 추천" */
  allMust: boolean;
};

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, "");
}

export function gradeAnswer(q: Question, answer: string): GradeResult | null {
  if (!q.grading) return null;
  const a = norm(answer);
  const syn = q.grading.synonyms ?? {};
  const check = (kw: string): boolean => {
    const variants = [kw, ...(syn[kw] ?? [])];
    return variants.some((v) => a.includes(norm(v)));
  };
  const must = q.grading.must.map((k) => ({ label: k, hit: check(k) }));
  const bonus = (q.grading.bonus ?? []).map((k) => ({ label: k, hit: check(k) }));
  const mustHit = must.filter((m) => m.hit).length;
  return {
    must,
    bonus,
    mustHit,
    mustTotal: must.length,
    allMust: must.length > 0 && mustHit === must.length,
  };
}
