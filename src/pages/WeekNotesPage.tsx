import { useState } from "react";
import { Link } from "react-router-dom";
import { WEEKS } from "@/data/weeks";
import { weekNote } from "@/data/weekNotes";
import { ALL_QUESTIONS } from "@/data/questions";
import Markdown, { Inline } from "@/components/Markdown";

export default function WeekNotesPage() {
  // 여러 주차를 동시에 펼쳐둘 수 있도록 열린 주차 집합으로 관리 (첫 주차는 기본 열림)
  const [openSet, setOpenSet] = useState<Set<number>>(
    () => new Set(WEEKS[0] ? [WEEKS[0].week] : []),
  );
  const toggleWeek = (week: number) =>
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(week)) next.delete(week);
      else next.add(week);
      return next;
    });

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">주차 정리</h1>
        <p className="mt-1 text-muted-strong">주차를 펼쳐 핵심을 훑고, 바로 그 주차 문제로 넘어가요.</p>
      </header>

      <div className="space-y-3">
        {WEEKS.map((c) => {
          const note = weekNote(c.week);
          const isOpen = openSet.has(c.week);
          const qCount = ALL_QUESTIONS.filter((q) => q.week === c.week).length;
          const topicCount = note?.topics.length ?? 0;
          return (
            <section key={c.week} className="card-soft overflow-hidden rounded-3xl bg-surface">
              <button
                onClick={() => toggleWeek(c.week)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left sm:px-6"
                aria-expanded={isOpen}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-blue/10 text-sm font-extrabold text-brand-blue">{c.week}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-base font-extrabold text-foreground">{c.title}</span>
                  <span className="block truncate text-xs font-medium text-muted">{c.subtitle}</span>
                </span>
                <span className="hidden shrink-0 text-xs font-bold text-muted sm:block">정리 {topicCount} · 문제 {qCount}</span>
                <svg viewBox="0 0 24 24" className={`h-5 w-5 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
              </button>

              {isOpen && (
                <div className="border-t border-border px-5 pb-6 pt-4 sm:px-6">
                  <div className="space-y-5">
                    {note?.topics.map((t, i) => (
                      <div key={i}>
                        <div className="mb-1.5 flex items-center gap-2">
                          <h3 className="text-base font-extrabold text-foreground"><Inline content={t.title} /></h3>
                          {t.stars ? <span className="text-xs text-brand-amber">{"★".repeat(t.stars)}</span> : null}
                        </div>
                        <div className="prose-answer text-foreground">
                          <Markdown content={t.body} />
                        </div>
                      </div>
                    ))}
                  </div>

                  {qCount > 0 && (
                    <Link
                      to={`/study?week=${c.week}`}
                      className="mt-6 flex items-center justify-center gap-2 rounded-2xl bg-brand-blue py-3 text-sm font-extrabold text-white transition active:translate-y-0.5"
                    >
                      이 주차 문제 풀러가기 ({qCount}문제)
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
                    </Link>
                  )}
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}
