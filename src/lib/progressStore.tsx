// ──────────────────────────────────────────────────────────────────────────
// 진행상황 전역 스토어 (React Context) — localStorage write-through
// 객관식(submit)과 서술형(saveAnswer/gradeEssay)을 함께 다룬다.
// ──────────────────────────────────────────────────────────────────────────
import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from "react";
import {
  getAllProgress,
  setResult as persistResult,
  saveAnswer as persistAnswer,
  setGrade as persistGrade,
  setBookmark as persistBookmark,
  clearProgress as persistClear,
  clearAnswers as persistClearAnswers,
  resetAll as persistResetAll,
  type Grade,
  type Progress,
} from "./storage";

type Store = Record<string, Progress>;

type Ctx = {
  progress: Store;
  /** 객관식 채점 */
  submit: (id: string, selected: number[], correct: boolean) => void;
  /** 서술형 답안 자동 저장 */
  saveAnswer: (id: string, answer: string) => void;
  /** 서술형 셀프 채점 */
  gradeEssay: (id: string, grade: Grade) => void;
  toggleBookmark: (id: string) => void;
  clearOne: (id: string) => void;
  clearAnswers: (ids: string[]) => void;
  resetAll: () => void;
};

const ProgressContext = createContext<Ctx | null>(null);

export function ProgressProvider({ children }: { children: ReactNode }) {
  const [progress, setProgress] = useState<Store>(() => getAllProgress());

  const submit = useCallback((id: string, selected: number[], correct: boolean) => {
    persistResult(id, selected, correct);
    setProgress((prev) => ({
      ...prev,
      [id]: { ...prev[id], selected, checked: true, correct, updatedAt: Date.now() },
    }));
  }, []);

  const saveAnswer = useCallback((id: string, answer: string) => {
    persistAnswer(id, answer);
    setProgress((prev) => ({
      ...prev,
      [id]: { ...prev[id], answer, updatedAt: Date.now() },
    }));
  }, []);

  const gradeEssay = useCallback((id: string, grade: Grade) => {
    persistGrade(id, grade);
    setProgress((prev) => ({
      ...prev,
      [id]: { ...prev[id], grade, updatedAt: Date.now() },
    }));
  }, []);

  const toggleBookmark = useCallback((id: string) => {
    setProgress((prev) => {
      const next = !prev[id]?.bookmark;
      persistBookmark(id, next);
      return { ...prev, [id]: { ...prev[id], bookmark: next, updatedAt: Date.now() } };
    });
  }, []);

  const clearOne = useCallback((id: string) => {
    persistClear(id);
    setProgress((prev) => {
      const bm = prev[id]?.bookmark;
      const next = { ...prev };
      if (bm) next[id] = { bookmark: true, updatedAt: Date.now() };
      else delete next[id];
      return next;
    });
  }, []);

  const clearAnswers = useCallback((ids: string[]) => {
    persistClearAnswers(ids);
    setProgress((prev) => {
      const next = { ...prev };
      for (const id of ids) {
        if (next[id]?.answer) next[id] = { ...next[id], answer: "", updatedAt: Date.now() };
      }
      return next;
    });
  }, []);

  const resetAll = useCallback(() => {
    persistResetAll();
    setProgress({});
  }, []);

  const value = useMemo(
    () => ({ progress, submit, saveAnswer, gradeEssay, toggleBookmark, clearOne, clearAnswers, resetAll }),
    [progress, submit, saveAnswer, gradeEssay, toggleBookmark, clearOne, clearAnswers, resetAll],
  );

  return <ProgressContext.Provider value={value}>{children}</ProgressContext.Provider>;
}

export function useProgress(): Ctx {
  const ctx = useContext(ProgressContext);
  if (!ctx) throw new Error("useProgress must be used within ProgressProvider");
  return ctx;
}
