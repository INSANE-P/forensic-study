import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { ALL_QUESTIONS } from "@/data/questions";
import { weekTitle } from "@/data/weeks";
import { useProgress } from "@/lib/progressStore";
import { computeStats, isGraded } from "@/lib/stats";
import { FORMAT_LABEL } from "@/lib/ui";
import type { QFormat } from "@/data/types";
import QuestionCard from "@/components/QuestionCard";

const WEEKS_PRESENT = [...new Set(ALL_QUESTIONS.map((q) => q.week))].sort((a, b) => a - b);

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={`rounded-xl px-3 py-1.5 text-sm font-bold transition-colors ${active ? "bg-brand-blue text-white" : "bg-surface-2 text-muted-strong hover:text-brand-blue"}`}
    >
      {children}
    </button>
  );
}

export default function StudyPage() {
  const { progress } = useProgress();
  const [params, setParams] = useSearchParams();
  const initialWeek = Number(params.get("week")) || null;

  const [week, setWeek] = useState<number | null>(initialWeek);
  const [format, setFormat] = useState<QFormat | null>(null);
  const [bookmarkOnly, setBookmarkOnly] = useState(false);
  const [hideSolved, setHideSolved] = useState(false);
  const [shuffleSeed, setShuffleSeed] = useState(0);

  function pickWeek(c: number | null) {
    setWeek(c);
    if (c) setParams({ week: String(c) });
    else setParams({});
  }

  const filtered = useMemo(() => {
    let list = ALL_QUESTIONS.filter((q) => {
      if (week && q.week !== week) return false;
      if (format && q.format !== format) return false;
      if (bookmarkOnly && !progress[q.id]?.bookmark) return false;
      // 객관식·서술형 모두 '채점됨' 기준으로 숨김 처리
      if (hideSolved && isGraded(q, progress[q.id])) return false;
      return true;
    });
    if (shuffleSeed) {
      const hash = (id: string) => {
        let h = (2166136261 ^ shuffleSeed) >>> 0;
        for (let i = 0; i < id.length; i++) {
          h ^= id.charCodeAt(i);
          h = Math.imul(h, 16777619) >>> 0;
        }
        h ^= h >>> 13;
        h = Math.imul(h, 0x5bd1e995) >>> 0;
        h ^= h >>> 15;
        return h >>> 0;
      };
      list = [...list].sort((a, b) => hash(a.id) - hash(b.id));
    }
    return list;
  }, [week, format, bookmarkOnly, hideSolved, shuffleSeed, progress]);

  const stats = computeStats(filtered, progress);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">문제 풀이</h1>
        <p className="mt-1 text-muted-strong">기출 문제를 풀고 바로 채점해요. 틀려도 경험치는 쌓여요.</p>
      </header>

      {/* 필터 */}
      <section className="card-soft space-y-3 rounded-2xl bg-surface p-4">
        <div>
          <div className="mb-1.5 text-xs font-bold text-muted">주차</div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={week === null} onClick={() => pickWeek(null)}>전체</Chip>
            {WEEKS_PRESENT.map((c) => (
              <Chip key={c} active={week === c} onClick={() => pickWeek(c)}>{c}. {weekTitle(c)}</Chip>
            ))}
          </div>
        </div>
        <div>
          <div className="mb-1.5 text-xs font-bold text-muted">형식</div>
          <div className="flex flex-wrap gap-1.5">
            <Chip active={format === null} onClick={() => setFormat(null)}>전체</Chip>
            {(["choice", "essay"] as QFormat[]).map((t) => (
              <Chip key={t} active={format === t} onClick={() => setFormat(t)}>{FORMAT_LABEL[t]}</Chip>
            ))}
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 border-t border-border pt-3 text-sm">
          <span className="font-bold text-foreground">{stats.total}문제</span>
          <span className="text-muted">· 푼 {stats.attempted} · 정답률 {stats.accuracy}%</span>
          <div className="ml-auto flex gap-2">
            <button onClick={() => setBookmarkOnly((v) => !v)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${bookmarkOnly ? "bg-brand-amber text-white" : "bg-surface-2 text-muted-strong"}`}>즐겨찾기</button>
            <button onClick={() => setHideSolved((v) => !v)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${hideSolved ? "bg-brand-blue text-white" : "bg-surface-2 text-muted-strong"}`}>푼 문제 숨기기</button>
            <button onClick={() => setShuffleSeed(shuffleSeed ? 0 : (Date.now() & 0xffff) || 1)} className={`rounded-xl px-3 py-1.5 text-xs font-bold ${shuffleSeed ? "bg-brand-blue text-white" : "bg-surface-2 text-muted-strong"}`}>{shuffleSeed ? "다시 섞기" : "섞기"}</button>
          </div>
        </div>
      </section>

      {/* 문제 목록 */}
      {filtered.length === 0 ? (
        <div className="card-soft rounded-3xl bg-surface p-10 text-center text-muted">조건에 맞는 문제가 없어요.</div>
      ) : (
        <div className="space-y-4">
          {filtered.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
