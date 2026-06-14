# CLAUDE.md

디지털 포렌식 과목 시험 공부용 정적 웹앱. **객관식 자동채점 + 서술형 셀프채점 + 시나리오 과제**를 한곳에서.
백엔드 없이 학습 상태를 `localStorage`에 저장한다. (dbsec·ml-study와 같은 origin이라 키를 `df.*`로 분리)

> **이 프로젝트의 제1원칙 — 콘텐츠와 UI를 분리한다.**
> 문제·개념·정리 텍스트는 **전부 `src/data/`** 안에만 둔다. 컴포넌트에 콘텐츠를 하드코딩하지 않는다.

> **제2원칙 — 콘텐츠 정확성.** 문제·정리는 시험 답이 걸린 내용이다. 근거는 교안(슬라이드)+수업 대본뿐이며,
> 자료에 없는 사실·수치·법조항을 추측해 채우지 않는다. 첫 강좌라 기출이 없으므로 **"기출/족보" 표현을 쓰지 않는다.**

## 작업 방식

- **끝내기 전 검증**: 변경 후 `npm run build`(타입체크 포함) 통과 확인. UI는 가능하면 preview로.
- **커밋·푸시는 요청받을 때만**. `main` push는 곧 배포(아래). 진행률은 push해도 초기화되지 않는다(localStorage).
- **언어**: 주석·UI 텍스트·커밋 메시지 모두 한국어.

## 명령어

- `npm run dev` — 개발 서버 (http://localhost:5173)
- `npm run build` — 타입체크(`tsc -b`) 후 프로덕션 빌드
- `npm run preview` — 빌드 결과 미리보기

## 구조

스택: **Vite · React 18 · TypeScript · Tailwind CSS v4 · react-router-dom(BrowserRouter)**. 경로 별칭 `@/` → `src/`.

```
src/
  data/            # ← 모든 콘텐츠는 여기에만
    types.ts                 # Question(하이브리드)·WeekMeta 등 타입
    weeks.ts                 # 주차 메타데이터(WEEKS, weekTitle)
    weekNotes.ts             # 주차별 정리(WEEK_NOTES)
    concepts.ts              # 용어(TERMS)·비교표(COMPARISONS)·개념카드(CONCEPT_CARDS)
    questions/generated.ts   # 전체 문제(GENERATED_QUESTIONS) + index.ts(ALL_QUESTIONS)
  components/      # QuestionCard(하이브리드)·SelfGrade·Markdown·Layout·캐릭터/성장 ...
  pages/           # Home·Study·WeekNotes·Concepts·Exam·WrongNote·Character·About·NotFound
  lib/             # storage, progressStore(Context), stats, autograde, growth, ui, shareCard
  styles/index.css # Tailwind + 디자인 토큰(포렌식 딥네이비+시안)
```

- **상태**: `lib/progressStore.tsx`(Context)가 들고 `lib/storage.ts`가 `localStorage`에 write-through.
- **주차**: 1~7, 9~14 (8주차 없음 — 중간고사 주).

## 문제 모델 (하이브리드 — 가장 중요)

`Question`은 `format`으로 분기한다 (`src/data/types.ts`):

- **`format: "choice"`** (객관식): `type("single"|"multi")` · `options[]` · `answers[](0-base)` · `explanation`. → 자동 채점.
- **`format: "essay"`** (서술형): `modelAnswer` · `grading{must,bonus?,synonyms?}` · `explanation?`. → 모범답안 펼침 + 셀프 채점(맞음/애매/틀림) + 키워드 보조 채점(`lib/autograde.ts`).
- **시나리오 과제**: `format:"essay"` + `scenario`(사건 브리핑 스토리 박스) + 다단계 prompt + 모범답안.

`id` 규칙: `wNN-qMM`(주차+일련번호, 중복 금지 — DEV 콘솔 경고). `topic`·`tags?`로 필터/검색.

콘텐츠는 `_extracted/`의 주차별 번들(교안 PDF 텍스트 + 대본)에서 주차별로 생성→`merge.cjs`로 검증·병합한다.

## Markdown (정리·모범답안·해설 공통, `components/Markdown.tsx`)

`**굵게**`, `` `코드` ``, ```` ```코드블록``` ````, `| 표 |`, `- 리스트`, `1. 순서`,
콜아웃 한 줄: `[정의] [암기] [시험] [주의] [팁]`.
**수식(KaTeX)은 지원하지 않는다** — `$`는 NTFS 메타파일명(`$MFT` 등) 리터럴로 표시된다.

## 디자인

- **포렌식 톤**: 수사/증거 무드. 라이트는 블루-그레이 쿨그레이, 다크는 딥 네이비. 포인트색 **시안(brand-blue=#0ea5e9)** + 앰버(증거 하이라이트). 마스코트는 돋보기 든 곰 탐정(`public/df-logo.*`).
- **다크모드 필수**: 표·콜아웃·텍스트 대비 충분히. 색은 시맨틱 토큰만 사용(`styles/index.css`의 `:root`/`.dark`/`@theme`).

## 주의점

- **배포**: `main` push → `.github/workflows/deploy.yml`이 GitHub Pages 자동 배포. 레포명 변경 시 `vite.config.ts`의 `REPO_NAME` 한 곳만.
- **라우팅**: BrowserRouter. 딥링크/새로고침은 `public/404.html` SPA 폴백. 해시 라우팅으로 바꾸지 말 것.
- 배포해도 사용자 `localStorage` 진행률은 초기화되지 않는다.
- `_extracted/`는 콘텐츠 생성용 작업물(gitignore). 교안·대본 원본은 저장소 밖(`Desktop/디지털포렌식 강의 교안 및 수업 대본`).
