import type { Question } from "../types";
import { GENERATED_QUESTIONS } from "./generated";

export const ALL_QUESTIONS: Question[] = [...GENERATED_QUESTIONS];

if (import.meta.env.DEV) {
  const seen = new Set<string>();
  for (const q of ALL_QUESTIONS) {
    if (seen.has(q.id)) console.warn(`[questions] 중복 id: ${q.id}`);
    seen.add(q.id);
  }
}
