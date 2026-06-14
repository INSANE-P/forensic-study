import { Link } from "react-router-dom";
import { ALL_QUESTIONS } from "@/data/questions";
import { weekTitle } from "@/data/weeks";
import { useProgress } from "@/lib/progressStore";
import { byWeek, computeStats } from "@/lib/stats";
import ProgressBar from "@/components/ProgressBar";
import GrowthWidget from "@/components/GrowthWidget";

function QuickLink({ to, title, desc }: { to: string; title: string; desc: string }) {
  return (
    <Link to={to} className="card-soft card-hover flex items-center gap-3 rounded-2xl bg-surface p-4">
      <div className="min-w-0">
        <div className="text-sm font-extrabold text-foreground">{title}</div>
        <div className="truncate text-xs font-medium text-muted">{desc}</div>
      </div>
      <svg viewBox="0 0 24 24" className="ml-auto h-5 w-5 shrink-0 text-muted" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6" /></svg>
    </Link>
  );
}

export default function HomePage() {
  const { progress, resetAll } = useProgress();
  const all = computeStats(ALL_QUESTIONS, progress);
  const pct = all.total === 0 ? 0 : Math.round((all.attempted / all.total) * 100);
  const wrongCount = all.wrong;

  const weeksPresent = [...new Set(ALL_QUESTIONS.map((q) => q.week))].sort((a, b) => a - b);
  const weekStats = weeksPresent
    .map((c) => ({ week: c, ...computeStats(byWeek(ALL_QUESTIONS, c), progress) }))
    .filter((c) => c.attempted > 0)
    .sort((a, b) => a.accuracy - b.accuracy);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-[1.7rem] font-extrabold leading-tight tracking-tight text-foreground sm:text-3xl">디지털 포렌식 시험 공부</h1>
        <p className="mt-1 text-muted-strong">한 학기 전 범위를 기출 문제로. 풀고 바로 채점하고, 핵심 개념까지.</p>
      </header>

      {/* 성장 캐릭터 */}
      <GrowthWidget />

      {/* 전체 진행률 */}
      <section className="card-soft rounded-3xl bg-surface p-6 sm:p-7">
        <div className="mb-3.5 flex items-end justify-between">
          <div>
            <h2 className="text-lg font-extrabold text-foreground">전체 진행률</h2>
            <p className="text-sm font-medium text-muted">{all.attempted} / {all.total} 문제 풀이 · 정답률 {all.accuracy}%</p>
          </div>
          <div className="text-4xl font-extrabold text-brand-blue">{pct}%</div>
        </div>
        <ProgressBar value={all.attempted} total={all.total} />
        <div className="mt-5 grid grid-cols-2 gap-3 text-center">
          <div className="rounded-2xl bg-brand-green-bg py-4 dark:bg-brand-green/10">
            <div className="text-2xl font-extrabold text-brand-green">{all.correct}</div>
            <div className="text-xs font-bold text-muted-strong">정답</div>
          </div>
          <div className="rounded-2xl bg-brand-red-bg py-4 dark:bg-brand-red/10">
            <div className="text-2xl font-extrabold text-brand-red">{all.wrong}</div>
            <div className="text-xs font-bold text-muted-strong">오답</div>
          </div>
        </div>
      </section>

      {/* 바로가기 */}
      <section className="grid gap-3 sm:grid-cols-2">
        <QuickLink to="/study" title="문제 풀이" desc="기출 문제 · 객관식/서술형 채점" />
        <QuickLink to="/weeks" title="주차 정리" desc="주차별 핵심 요약" />
        <QuickLink to="/concepts" title="개념 정리" desc="용어 · 비교표 암기" />
        <QuickLink to="/wrong" title={`오답노트 (${wrongCount})`} desc="틀린 문제 모아보기" />
      </section>

      {/* 주차별 정답률 */}
      {weekStats.length > 0 && (
        <section className="card-soft rounded-3xl bg-surface p-6">
          <h2 className="text-lg font-extrabold text-foreground">주차별 정답률</h2>
          <p className="mb-4 text-sm text-muted">푼 문제 기준 · 정답률 낮은 주차부터</p>
          <div className="space-y-3">
            {weekStats.map((t) => {
              const weak = t.accuracy < 60;
              return (
                <Link key={t.week} to={`/study?week=${t.week}`} className="flex items-center gap-3">
                  <span className="w-32 shrink-0 truncate text-sm font-bold text-foreground">{t.week}. {weekTitle(t.week)}</span>
                  <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-border">
                    <div className={`h-full rounded-full ${weak ? "bg-brand-red" : "bg-brand-green"}`} style={{ width: `${t.accuracy}%` }} />
                  </div>
                  <span className={`w-20 shrink-0 text-right text-sm font-bold ${weak ? "text-brand-red" : "text-muted-strong"}`}>{t.accuracy}% <span className="font-medium text-muted">({t.correct}/{t.attempted})</span></span>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      <section className="flex justify-end">
        <button
          onClick={() => { if (confirm("모든 학습 기록을 초기화할까요?")) resetAll(); }}
          className="text-sm font-semibold text-muted underline-offset-4 hover:text-brand-red hover:underline"
        >
          학습 기록 전체 초기화
        </button>
      </section>
    </div>
  );
}
