# 디지털 포렌식 시험 공부 노트

디지털 포렌식 과목 시험 대비용 정적 웹앱. **객관식 자동채점 + 서술형 셀프채점 + 시나리오 과제**를 한곳에서 풀고, 주차별 정리·개념을 함께 본다. 백엔드 없이 학습 상태를 브라우저(`localStorage`)에 저장한다.

## 기능

- **문제 풀이 (하이브리드)**
  - 객관식: 보기 선택 → 정답 확인(자동 채점) → 오답 정리 해설
  - 서술형: 답안 작성 → 모범답안 펼침 + 셀프 채점(맞음/애매/틀림) + 키워드 보조 채점
  - 시나리오 과제: 사건 브리핑 + 다단계 분석 서술
- **주차 정리 / 개념 정리**(용어·비교표·개념카드), **오답 노트**, **시험 모드**(랜덤 출제)
- 진행률·정답률, 캐릭터 성장(레벨·진급), 다크모드

## 개발

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # 타입체크 + 프로덕션 빌드
```

## 구조

`Vite · React 18 · TypeScript · Tailwind CSS v4 · react-router-dom`. 콘텐츠는 전부 `src/data/`에만, 렌더링은 `src/components`·`src/pages`. 자세한 규칙은 [CLAUDE.md](CLAUDE.md).

## 배포

`main` 브랜치 push 시 GitHub Actions(`.github/workflows/deploy.yml`)가 GitHub Pages로 자동 배포한다. 레포명이 바뀌면 `vite.config.ts`의 `REPO_NAME`만 수정하면 된다.
