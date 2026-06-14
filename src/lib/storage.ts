// ──────────────────────────────────────────────────────────────────────────
// localStorage 기반 진행상황 관리 (백엔드 없음)
// ⚠️ DB·ML 사이트와 같은 origin(insane-p.github.io)이라 키를 df.* 로 분리한다.
// 객관식(자동채점) + 서술형(셀프채점)을 한 스토어에서 함께 다룬다.
// ──────────────────────────────────────────────────────────────────────────

/** 서술형 셀프 채점 결과 */
export type Grade = "correct" | "unsure" | "wrong";

/** 문제별 진행 상태 */
export type Progress = {
  // 객관식
  /** 사용자가 고른 보기 인덱스 */
  selected?: number[];
  /** 채점(정답 확인)을 눌렀는지 */
  checked?: boolean;
  /** 정답 여부 */
  correct?: boolean;
  // 서술형
  /** 사용자가 입력한 답(재방문 시 복원) */
  answer?: string;
  /** 서술형 셀프 채점 결과 */
  grade?: Grade;
  // 공통
  /** 즐겨찾기 */
  bookmark?: boolean;
  updatedAt: number;
};

type Store = Record<string, Progress>;

const KEY = "df.progress.v1";
const THEME_KEY = "df.theme";
const IDENTITY_KEY = "df.identity.v1";
const SEEN_LEVEL_KEY = "df.seenLevel.v1";

function read(): Store {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
}
function write(store: Store) {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
  } catch {
    /* 용량 초과 등 무시 */
  }
}

export function getAllProgress(): Store {
  return read();
}
export function getProgress(id: string): Progress | undefined {
  return read()[id];
}

/** 객관식 채점 결과 저장 (선택 보기 + 정답 여부) */
export function setResult(id: string, selected: number[], correct: boolean) {
  const store = read();
  store[id] = { ...store[id], selected, checked: true, correct, updatedAt: Date.now() };
  write(store);
}

/** 서술형 답안 저장(자동 저장) */
export function saveAnswer(id: string, answer: string) {
  const store = read();
  store[id] = { ...store[id], answer, updatedAt: Date.now() };
  write(store);
}

/** 서술형 셀프 채점 저장 */
export function setGrade(id: string, grade: Grade) {
  const store = read();
  store[id] = { ...store[id], grade, updatedAt: Date.now() };
  write(store);
}

export function setBookmark(id: string, bookmark: boolean) {
  const store = read();
  store[id] = { ...store[id], bookmark, updatedAt: Date.now() };
  write(store);
}

/** 한 문제 진행 초기화 (다시 풀기). 즐겨찾기는 유지 */
export function clearProgress(id: string) {
  const store = read();
  const bm = store[id]?.bookmark;
  if (bm) store[id] = { bookmark: true, updatedAt: Date.now() };
  else delete store[id];
  write(store);
}

/** 여러 문제에서 '입력한 답'만 비운다 (채점·즐겨찾기는 유지) */
export function clearAnswers(ids: string[]) {
  const store = read();
  let changed = false;
  for (const id of ids) {
    const p = store[id];
    if (p && p.answer) {
      store[id] = { ...p, answer: "", updatedAt: Date.now() };
      changed = true;
    }
  }
  if (changed) write(store);
}

export function resetAll() {
  write({});
  try {
    localStorage.removeItem(SEEN_LEVEL_KEY);
  } catch {
    /* 무시 */
  }
}

// ── 조사관(사용자) 아이덴티티 / 성장 ───────────────────────────────────────
export type Identity = { name?: string; github?: string; avatarUrl?: string };

export function getIdentity(): Identity {
  try {
    const raw = localStorage.getItem(IDENTITY_KEY);
    return raw ? (JSON.parse(raw) as Identity) : {};
  } catch {
    return {};
  }
}
export function setIdentity(id: Identity) {
  try {
    localStorage.setItem(IDENTITY_KEY, JSON.stringify(id));
  } catch {
    /* 무시 */
  }
}
export function getSeenLevel(): number {
  const v = Number(localStorage.getItem(SEEN_LEVEL_KEY));
  return Number.isFinite(v) && v > 0 ? v : 0;
}
export function setSeenLevel(level: number) {
  try {
    localStorage.setItem(SEEN_LEVEL_KEY, String(level));
  } catch {
    /* 무시 */
  }
}

// ── 테마 ────────────────────────────────────────────────────────────────
export type Theme = "light" | "dark";

export function getTheme(): Theme {
  const t = localStorage.getItem(THEME_KEY);
  if (t === "dark" || t === "light") return t;
  return document.documentElement.classList.contains("dark") ? "dark" : "light";
}
export function setTheme(theme: Theme) {
  localStorage.setItem(THEME_KEY, theme);
  document.documentElement.classList.toggle("dark", theme === "dark");
}
