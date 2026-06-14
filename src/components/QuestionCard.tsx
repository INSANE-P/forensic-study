// ──────────────────────────────────────────────────────────────────────────
// 하이브리드 문제 카드
//  - choice : 보기 선택 → 정답 확인(자동 채점) → 정답/오답 표시 + 해설
//  - essay  : 답안 입력 → 답 확인 → 모범답안 펼침 + 셀프 채점(키워드 보조 채점)
//  - scenario(과제): essay + 상단 '사건 브리핑' 스토리 박스
// ──────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import type { Question } from "@/data/types";
import { useProgress } from "@/lib/progressStore";
import { TYPE_LABEL, FORMAT_LABEL, GRADE_DOT, GRADE_LABEL, circled, sameSet } from "@/lib/ui";
import { gradeAnswer } from "@/lib/autograde";
import { weekTitle } from "@/data/weeks";
import Markdown, { Inline } from "./Markdown";
import SelfGrade from "./SelfGrade";

function Star({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinejoin="round">
      <path d="M12 3l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 18.6 5.9 21.4l1.4-6.8L2.2 9.9l6.9-.8z" />
    </svg>
  );
}

export default function QuestionCard({ q, index }: { q: Question; index: number }) {
  const { progress, submit, saveAnswer, gradeEssay, clearOne, toggleBookmark } = useProgress();
  const p = progress[q.id];

  // 객관식 상태
  const checked = !!p?.checked;
  const [sel, setSel] = useState<number[]>(p?.selected ?? []);
  const shown = checked ? p?.selected ?? [] : sel;

  // 서술형 상태
  const [answer, setAnswer] = useState(p?.answer ?? "");
  const [revealed, setRevealed] = useState(false);
  const grade_ = revealed ? gradeAnswer(q, answer) : null;

  function toggle(i: number) {
    if (checked) return;
    if (q.type === "single") setSel([i]);
    else setSel((s) => (s.includes(i) ? s.filter((x) => x !== i) : [...s, i]));
  }
  function check() {
    if (sel.length === 0) return;
    submit(q.id, sel, sameSet(sel, q.answers ?? []));
  }
  function retry() {
    clearOne(q.id);
    setSel([]);
  }

  const isCorrect = checked && p?.correct;
  const formatBadge =
    q.format === "essay"
      ? "bg-brand-amber-bg text-brand-amber"
      : "bg-brand-blue/10 text-brand-blue";

  return (
    <article className="card-soft rounded-3xl bg-surface p-5 sm:p-6">
      {/* 헤더 */}
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="rounded-lg bg-brand-blue/10 px-2 py-0.5 text-sm font-extrabold text-brand-blue">Q{index}</span>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-bold text-muted-strong">{q.week}주차 · {weekTitle(q.week)}</span>
          <span className="rounded-md bg-surface-2 px-2 py-0.5 text-xs font-medium text-muted">{q.topic}</span>
          <span className={`rounded-md px-2 py-0.5 text-xs font-bold ${formatBadge}`}>
            {FORMAT_LABEL[q.format]}
            {q.format === "choice" && q.type ? ` · ${TYPE_LABEL[q.type]}` : ""}
          </span>
        </div>
        <div className="flex shrink-0 items-center gap-2.5">
          {q.format === "essay" && p?.grade && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-muted-strong">
              <span className={`h-2 w-2 rounded-full ${GRADE_DOT[p.grade]}`} />
              {GRADE_LABEL[p.grade]}
            </span>
          )}
          <button
            onClick={() => toggleBookmark(q.id)}
            aria-label="즐겨찾기"
            className={`transition-colors ${p?.bookmark ? "text-brand-amber" : "text-muted hover:text-brand-amber"}`}
          >
            <Star filled={!!p?.bookmark} />
          </button>
        </div>
      </div>

      {/* 시나리오(사건 브리핑) 박스 */}
      {q.scenario && (
        <div className="mb-4 rounded-2xl border border-brand-blue/30 bg-brand-blue-bg/60 p-4 dark:bg-brand-blue/10">
          <div className="mb-1.5 flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-brand-blue">
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6" /></svg>
            사건 브리핑
          </div>
          <div className="prose-answer text-foreground"><Markdown content={q.scenario} /></div>
        </div>
      )}

      {/* 발문 */}
      <div className="prose-answer text-foreground">
        <Markdown content={q.prompt} />
      </div>

      {/* ───────────── 객관식 ───────────── */}
      {q.format === "choice" && (
        <>
          {q.type === "multi" && <p className="mt-1 text-xs font-bold text-brand-blue">복수 정답 — 해당하는 보기를 모두 고르세요</p>}
          <ul className="mt-4 space-y-2">
            {(q.options ?? []).map((opt, i) => {
              const picked = shown.includes(i);
              const isAns = (q.answers ?? []).includes(i);
              let cls = "border-border bg-surface hover:border-brand-blue/50";
              let mark: string | null = null;
              if (checked) {
                if (isAns) {
                  cls = "border-brand-green bg-brand-green-bg dark:bg-brand-green/10";
                  mark = "정답";
                } else if (picked) {
                  cls = "border-brand-red bg-brand-red-bg dark:bg-brand-red/10";
                  mark = "오답";
                } else {
                  cls = "border-border bg-surface opacity-70";
                }
              } else if (picked) {
                cls = "border-brand-blue bg-brand-blue/5";
              }
              return (
                <li key={i}>
                  <button
                    onClick={() => toggle(i)}
                    disabled={checked}
                    className={`flex w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-medium text-foreground transition-colors ${cls} ${checked ? "cursor-default" : ""}`}
                  >
                    <span className={`shrink-0 text-base font-bold ${picked && !checked ? "text-brand-blue" : "text-muted-strong"}`}>{circled(i)}</span>
                    <span className="flex-1"><Inline content={opt} /></span>
                    {mark && (
                      <span className={`shrink-0 rounded-md px-1.5 py-0.5 text-xs font-extrabold ${mark === "정답" ? "bg-brand-green text-white" : "bg-brand-red text-white"}`}>{mark}</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>

          {!checked ? (
            <button
              onClick={check}
              disabled={sel.length === 0}
              className="mt-4 w-full rounded-2xl bg-brand-blue py-3 text-sm font-extrabold text-white transition active:translate-y-0.5 disabled:opacity-50"
            >
              정답 확인
            </button>
          ) : (
            <div className="mt-4">
              <div className={`flex items-center gap-2 rounded-2xl px-4 py-2.5 text-sm font-extrabold ${isCorrect ? "bg-brand-green-bg text-brand-green dark:bg-brand-green/10" : "bg-brand-red-bg text-brand-red dark:bg-brand-red/10"}`}>
                {isCorrect ? "정답입니다! 🎉" : "오답이에요"}
                <span className="ml-auto text-xs font-bold text-muted-strong">정답: {(q.answers ?? []).map(circled).join(" ")}</span>
              </div>
              {q.explanation && (
                <div className="prose-answer mt-3 rounded-2xl bg-surface-2 p-4 text-foreground">
                  <div className="mb-1 text-xs font-bold text-muted-strong">해설</div>
                  <Markdown content={q.explanation} />
                </div>
              )}
              <button onClick={retry} className="mt-3 text-sm font-semibold text-muted underline-offset-4 hover:text-brand-blue hover:underline">
                다시 풀기
              </button>
            </div>
          )}
        </>
      )}

      {/* ───────────── 서술형 ───────────── */}
      {q.format === "essay" && (
        <>
          <textarea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onBlur={() => answer !== (p?.answer ?? "") && saveAnswer(q.id, answer)}
            placeholder="여기에 답을 작성해 보세요 · 자동 저장됩니다"
            rows={q.scenario ? 7 : 4}
            className="mt-4 w-full resize-y rounded-2xl bg-surface-2 px-4 py-3.5 text-[0.95rem] leading-relaxed text-foreground outline-none transition-all placeholder:text-muted focus:bg-surface focus:ring-2 focus:ring-brand-blue/30"
          />

          <div className="mt-3.5 flex flex-wrap items-center gap-3">
            <button
              onClick={() => setRevealed((v) => !v)}
              className="inline-flex items-center gap-2 rounded-2xl bg-brand-blue px-5 py-2.5 text-sm font-bold text-white transition-all hover:bg-brand-blue-light active:scale-[0.98]"
            >
              {revealed ? "답 접기" : "답 확인하기"}
            </button>
            {answer.trim() && (
              <button
                onClick={() => {
                  setAnswer("");
                  saveAnswer(q.id, "");
                }}
                className="inline-flex items-center gap-1.5 rounded-2xl bg-surface-2 px-4 py-2.5 text-sm font-bold text-muted-strong transition-all hover:text-brand-red active:scale-[0.98]"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2m2 0v14a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V6" /></svg>
                답 지우기
              </button>
            )}
            {revealed && <SelfGrade value={p?.grade} onChange={(g) => gradeEssay(q.id, g)} />}
          </div>

          {/* 보조 채점 — 키워드 체크리스트 */}
          {revealed && grade_ && answer.trim() && (
            <div className="animate-fade-up mt-4 rounded-2xl bg-surface-2 p-4">
              <div className="mb-2.5 flex flex-wrap items-center gap-2">
                <span className="text-xs font-extrabold text-muted-strong">키워드 체크 (참고용)</span>
                <span className="text-xs font-bold text-muted">필수 {grade_.mustHit}/{grade_.mustTotal}</span>
                {grade_.allMust && (
                  <span className="rounded-full bg-brand-green px-2 py-0.5 text-[0.7rem] font-extrabold text-white">맞음 추천</span>
                )}
              </div>
              <div className="flex flex-wrap gap-1.5">
                {grade_.must.map((k) => (
                  <span
                    key={k.label}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold ${
                      k.hit ? "bg-brand-green-bg text-brand-green dark:bg-brand-green/15" : "bg-brand-red-bg text-brand-red dark:bg-brand-red/15"
                    }`}
                  >
                    {k.hit ? "✓" : "✗"} {k.label}
                  </span>
                ))}
                {grade_.bonus.filter((b) => b.hit).map((k) => (
                  <span key={k.label} className="inline-flex items-center gap-1 rounded-full bg-brand-blue-bg px-2.5 py-1 text-xs font-bold text-brand-blue dark:bg-brand-blue/15 dark:text-brand-blue-lighter">
                    ＋ {k.label}
                  </span>
                ))}
              </div>
              <p className="mt-2 text-[0.7rem] text-muted">* 키워드 포함만 본 참고 결과예요. 서술 내용은 모범답안과 비교해 직접 채점하세요.</p>
            </div>
          )}

          {/* 모범답안 */}
          {revealed && q.modelAnswer && (
            <div className="animate-fade-up mt-4 rounded-2xl bg-brand-blue-bg/50 p-5 dark:bg-brand-blue/10">
              <div className="mb-2.5 flex items-center gap-1.5 text-xs font-extrabold tracking-wide text-brand-blue">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5" /></svg>
                모범답안
              </div>
              <Markdown content={q.modelAnswer} />
              {q.explanation && (
                <div className="mt-3 border-t border-border/60 pt-3">
                  <Markdown content={q.explanation} />
                </div>
              )}
              {q.tags && q.tags.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5 border-t border-border/60 pt-3">
                  {q.tags.map((t) => (
                    <span key={t} className="text-xs font-medium text-muted">#{t}</span>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}
    </article>
  );
}
