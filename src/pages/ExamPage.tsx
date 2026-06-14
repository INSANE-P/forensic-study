// ──────────────────────────────────────────────────────────────────────────
// 모의고사 — 진입 전 유형(객관식/서술형/혼합)을 고르고, 주차 비중에 비례해
// 매번 랜덤 출제한다. "새 문제 세트"로 다시 뽑는다.
// 전체 문항은 '문제 풀이'에서 볼 수 있다.
// ──────────────────────────────────────────────────────────────────────────
import { useMemo, useState } from "react";
import { ALL_QUESTIONS } from "@/data/questions";
import { useProgress } from "@/lib/progressStore";
import { isCorrect, isGraded } from "@/lib/stats";
import QuestionCard from "@/components/QuestionCard";
import type { Question } from "@/data/types";

type Mode = "choice" | "essay" | "mix";

// 유형별 출제 수 (서술형은 직접 써야 해 적게)
const SET_SIZE: Record<Mode, number> = { choice: 20, essay: 8, mix: 20 };

const MATCH: Record<Mode, (q: Question) => boolean> = {
  choice: (q) => q.format === "choice",
  essay: (q) => q.format === "essay",
  mix: () => true,
};

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffle<T>(arr: T[], rnd: () => number): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// 주차별 풀 크기에 비례한 할당(최대잉여법)으로 size문제 구성
function pickSet(seed: number, mode: Mode): Question[] {
  const rnd = mulberry32(seed + 1);
  const pool = ALL_QUESTIONS.filter(MATCH[mode]);
  const size = Math.min(SET_SIZE[mode], pool.length);
  const byCh = new Map<number, Question[]>();
  for (const q of pool) {
    if (!byCh.has(q.week)) byCh.set(q.week, []);
    byCh.get(q.week)!.push(q);
  }
  const total = pool.length;
  const chs = [...byCh.keys()].sort((a, b) => a - b);
  const exact = chs.map((c) => ({ c, v: (size * byCh.get(c)!.length) / total }));
  const quota = new Map<number, number>(exact.map((e) => [e.c, Math.floor(e.v)]));
  let used = [...quota.values()].reduce((s, v) => s + v, 0);
  exact.sort((a, b) => b.v - Math.floor(b.v) - (a.v - Math.floor(a.v)));
  let i = 0;
  while (used < size && exact.length) {
    const c = exact[i % exact.length].c;
    if (quota.get(c)! < byCh.get(c)!.length) {
      quota.set(c, quota.get(c)! + 1);
      used++;
    }
    i++;
    if (i > 500) break;
  }
  const picked: Question[] = [];
  for (const c of chs) {
    const n = Math.min(quota.get(c) ?? 0, byCh.get(c)!.length);
    picked.push(...shuffle(byCh.get(c)!, rnd).slice(0, n));
  }
  return shuffle(picked, rnd).slice(0, size);
}

const CHOICE_TOTAL = ALL_QUESTIONS.filter((q) => q.format === "choice").length;
const ESSAY_TOTAL = ALL_QUESTIONS.filter((q) => q.format === "essay").length;

export default function ExamPage() {
  const { progress } = useProgress();
  const [mode, setMode] = useState<Mode | null>(null);
  const [seed, setSeed] = useState(1);

  const set = useMemo(() => (mode ? pickSet(seed, mode) : []), [seed, mode]);
  const answered = set.filter((q) => isGraded(q, progress[q.id])).length;
  const correct = set.filter((q) => isCorrect(q, progress[q.id])).length;

  // ── 유형 선택 화면 ─────────────────────────────────────────
  if (!mode) {
    const OPTS: { key: Mode; title: string; sub: string; pool: number }[] = [
      { key: "choice", title: "객관식 모의고사", sub: `자동 채점 · 매번 랜덤 ${SET_SIZE.choice}문제`, pool: CHOICE_TOTAL },
      { key: "essay", title: "서술형 모의고사", sub: `모범답안·셀프 채점 · 매번 ${SET_SIZE.essay}문제`, pool: ESSAY_TOTAL },
      { key: "mix", title: "혼합 모의고사", sub: `객관식+서술형 섞어 ${SET_SIZE.mix}문제`, pool: CHOICE_TOTAL + ESSAY_TOTAL },
    ];
    return (
      <div className="space-y-6">
        <header>
          <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">모의고사</h1>
          <p className="mt-1.5 text-muted-strong">어떤 유형으로 풀어볼까요? 주차 비중에 맞춰 골고루 출제돼요.</p>
        </header>

        <div className="space-y-4">
          {OPTS.map((o) => (
            <button
              key={o.key}
              onClick={() => { setMode(o.key); setSeed((s) => s + 1); window.scrollTo({ top: 0 }); }}
              className="card-soft card-hover block w-full rounded-3xl bg-surface p-6 text-left"
            >
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-extrabold text-foreground">{o.title}</h2>
                  <p className="mt-0.5 text-sm font-medium text-muted">{o.sub}</p>
                </div>
                <span className="shrink-0 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-muted-strong">
                  문제 풀 {o.pool}
                </span>
              </div>
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted">전체 문항은 ‘문제 풀이’에서 주차·형식별로 볼 수 있어요.</p>
      </div>
    );
  }

  // ── 모의고사 진행 화면 ─────────────────────────────────────
  const modeLabel = mode === "choice" ? "객관식" : mode === "essay" ? "서술형" : "혼합";
  return (
    <div className="space-y-5">
      <button
        onClick={() => setMode(null)}
        className="inline-flex items-center gap-1.5 text-sm font-bold text-muted-strong transition-colors hover:text-brand-blue"
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
        유형 선택으로
      </button>

      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">
            모의고사 <span className="text-brand-blue">· {modeLabel}</span>
          </h1>
          <p className="mt-1 text-muted-strong">실제 시험처럼 매번 랜덤 출제. 주차 비중에 맞춰 골고루 나와요.</p>
        </div>
        <button onClick={() => setSeed((s) => s + 1)} className="rounded-2xl bg-brand-blue px-4 py-2.5 text-sm font-extrabold text-white transition active:translate-y-0.5">
          새 문제 세트 🎲
        </button>
      </header>

      <section className="card-soft sticky top-2 z-10 flex items-center justify-between rounded-2xl bg-surface/95 px-5 py-3 backdrop-blur">
        <span className="text-sm font-bold text-foreground">진행 {answered} / {set.length}</span>
        <span className="text-sm font-extrabold text-brand-blue">점수 {correct} / {answered || 0}</span>
      </section>

      <div className="space-y-4">
        {set.map((q, i) => (
          <QuestionCard key={`${mode}-${seed}-${q.id}`} q={q} index={i + 1} />
        ))}
      </div>

      <div className="flex justify-center pt-2">
        <button onClick={() => { setSeed((s) => s + 1); window.scrollTo({ top: 0, behavior: "smooth" }); }} className="rounded-2xl bg-surface-2 px-6 py-3 text-sm font-bold text-muted-strong hover:text-brand-blue">
          새 문제 세트로 다시 풀기
        </button>
      </div>
    </div>
  );
}
