// ──────────────────────────────────────────────────────────────────────────
// 캐릭터 육성 — 문제 풀이를 경험치(XP)로 환산해 등급(티어)을 계산.
//  - 정답에 가장 큰 보상, 틀려도 시도하면 보상(학습은 시도에서), 주차·전체 정복 보너스.
//  - 객관식(checked)과 서술형(grade) 모두 반영한다.
//  - 진행상황(store)에서 결정론적으로 재계산 → 조작·중복 적립 없음.
// ──────────────────────────────────────────────────────────────────────────
import type { Question } from "@/data/types";
import { isCorrect, isGraded } from "./stats";
import type { Progress } from "./storage";

type Store = Record<string, Progress>;

export const XP = {
  correct: 20, // 정답
  attemptWrong: 8, // 틀렸어도 시도(채점)
  weekClear: 30, // 한 주차 전 문제 채점
  allClear: 150, // 전 범위 채점
} as const;

export type Tier = {
  level: number;
  name: string;
  minXp: number;
  color: string;
  accent: string;
  blurb: string;
};

export const TIERS: Tier[] = [
  { level: 1, name: "수습 조사관", minXp: 0, color: "#64748b", accent: "#94a3b8", blurb: "이제 막 수사를 시작했어요" },
  { level: 2, name: "현장 요원", minXp: 80, color: "#12a594", accent: "#2dd4bf", blurb: "본격적으로 단서를 쫓는 중" },
  { level: 3, name: "분석관", minXp: 280, color: "#6d5cf0", accent: "#8b7bf3", blurb: "실력이 단단해졌어요" },
  { level: 4, name: "수사관", minXp: 650, color: "#8b5cf6", accent: "#c4b5fd", blurb: "웬만한 사건은 거뜬해요" },
  { level: 5, name: "프로파일러", minXp: 1200, color: "#f97316", accent: "#fb923c", blurb: "시험이 두렵지 않아요" },
  { level: 6, name: "포렌식 레전드", minXp: 2200, color: "#e0a200", accent: "#fcd34d", blurb: "디지털 포렌식 정복!" },
];

export function tierAt(level: number): Tier {
  const lv = Math.min(6, Math.max(1, Math.round(level)));
  return TIERS.find((t) => t.level === lv) ?? TIERS[0];
}

export type XpSource = { label: string; detail: string; xp: number };
export type Growth = {
  xp: number;
  level: number;
  tier: Tier;
  nextTier?: Tier;
  toNext: number;
  pctInStage: number;
  isMax: boolean;
  counts: { attempted: number; correct: number; wrong: number; weeksDone: number; total: number };
  sources: XpSource[];
};

export function computeGrowth(questions: Question[], store: Store): Growth {
  let correct = 0,
    wrong = 0,
    attempted = 0;
  const weeks = new Map<number, { tot: number; done: number }>();

  for (const q of questions) {
    const c = weeks.get(q.week) ?? { tot: 0, done: 0 };
    c.tot++;
    const p = store[q.id];
    // 객관식(checked)과 서술형(grade) 모두 '채점됨' 기준으로 집계
    if (isGraded(q, p)) {
      attempted++;
      c.done++;
      if (isCorrect(q, p)) correct++;
      else wrong++;
    }
    weeks.set(q.week, c);
  }

  let weeksDone = 0;
  weeks.forEach((c) => {
    if (c.tot > 0 && c.done === c.tot) weeksDone++;
  });
  const allDone = questions.length > 0 && attempted === questions.length ? 1 : 0;

  const xp = correct * XP.correct + wrong * XP.attemptWrong + weeksDone * XP.weekClear + allDone * XP.allClear;

  let idx = 0;
  for (let i = 0; i < TIERS.length; i++) if (xp >= TIERS[i].minXp) idx = i;
  const tier = TIERS[idx];
  const nextTier = TIERS[idx + 1];

  const sources: XpSource[] = [
    { label: "정답", detail: `${correct} × ${XP.correct}`, xp: correct * XP.correct },
    { label: "도전 (오답도 시도)", detail: `${wrong} × ${XP.attemptWrong}`, xp: wrong * XP.attemptWrong },
    { label: "주차 정복", detail: `${weeksDone} × ${XP.weekClear}`, xp: weeksDone * XP.weekClear },
    { label: "전 범위 정복", detail: `${allDone} × ${XP.allClear}`, xp: allDone * XP.allClear },
  ];
  const counts = { attempted, correct, wrong, weeksDone, total: questions.length };

  if (!nextTier) {
    return { xp, level: tier.level, tier, toNext: 0, pctInStage: 100, isMax: true, counts, sources };
  }
  const span = nextTier.minXp - tier.minXp;
  const into = xp - tier.minXp;
  return {
    xp,
    level: tier.level,
    tier,
    nextTier,
    toNext: nextTier.minXp - xp,
    pctInStage: Math.max(0, Math.min(100, Math.round((into / span) * 100))),
    isMax: false,
    counts,
    sources,
  };
}
