import { useState } from "react";
import { ALL_QUESTIONS } from "@/data/questions";
import { useProgress } from "@/lib/progressStore";
import { isCorrect, isGraded } from "@/lib/stats";
import QuestionCard from "@/components/QuestionCard";

type Mode = "wrong" | "bookmark";

export default function WrongNotePage() {
  const { progress } = useProgress();
  const [mode, setMode] = useState<Mode>("wrong");

  const wrong = ALL_QUESTIONS.filter((q) => isGraded(q, progress[q.id]) && !isCorrect(q, progress[q.id]));
  const marked = ALL_QUESTIONS.filter((q) => progress[q.id]?.bookmark);
  const list = mode === "wrong" ? wrong : marked;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">오답노트</h1>
        <p className="mt-1 text-muted-strong">틀린 문제와 즐겨찾기한 문제를 모아 다시 풀어요.</p>
      </header>

      <div className="flex gap-1.5">
        <button onClick={() => setMode("wrong")} className={`rounded-xl px-3.5 py-1.5 text-sm font-bold ${mode === "wrong" ? "bg-brand-red text-white" : "bg-surface-2 text-muted-strong"}`}>틀린 문제 ({wrong.length})</button>
        <button onClick={() => setMode("bookmark")} className={`rounded-xl px-3.5 py-1.5 text-sm font-bold ${mode === "bookmark" ? "bg-brand-amber text-white" : "bg-surface-2 text-muted-strong"}`}>즐겨찾기 ({marked.length})</button>
      </div>

      {list.length === 0 ? (
        <div className="card-soft rounded-3xl bg-surface p-10 text-center text-muted">
          {mode === "wrong" ? "아직 틀린 문제가 없어요. 좋아요! 👍" : "즐겨찾기한 문제가 없어요. 별표로 모아보세요."}
        </div>
      ) : (
        <div className="space-y-4">
          {list.map((q, i) => (
            <QuestionCard key={q.id} q={q} index={i + 1} />
          ))}
        </div>
      )}
    </div>
  );
}
