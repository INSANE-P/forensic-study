// 진행상황 통계 (객관식 자동채점 + 서술형 셀프채점 통합)
import type { Question } from "@/data/types";
import type { Progress } from "./storage";

type Store = Record<string, Progress>;

export type Stats = {
  total: number;
  /** 채점한(객관식: 정답확인 / 서술형: 셀프채점) 문제 수 */
  attempted: number;
  correct: number;
  wrong: number;
  /** 정답률 = correct / attempted */
  accuracy: number;
};

/** 한 문제가 '채점됨' 상태인지 (양식별로 판단) */
export function isGraded(q: Question, p?: Progress): boolean {
  if (!p) return false;
  return q.format === "choice" ? !!p.checked : !!p.grade;
}

/** 한 문제가 '맞음'인지 (객관식: correct / 서술형: grade==='correct') */
export function isCorrect(q: Question, p?: Progress): boolean {
  if (!p) return false;
  return q.format === "choice" ? !!p.correct : p.grade === "correct";
}

export function computeStats(questions: Question[], store: Store): Stats {
  let attempted = 0,
    correct = 0,
    wrong = 0;
  for (const q of questions) {
    const p = store[q.id];
    if (!isGraded(q, p)) continue;
    attempted++;
    if (isCorrect(q, p)) correct++;
    else wrong++;
  }
  return {
    total: questions.length,
    attempted,
    correct,
    wrong,
    accuracy: attempted === 0 ? 0 : Math.round((correct / attempted) * 100),
  };
}

export function byWeek(questions: Question[], week: number): Question[] {
  return questions.filter((q) => q.week === week);
}
