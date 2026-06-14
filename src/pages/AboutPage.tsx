// ──────────────────────────────────────────────────────────────────────────
// 만든 사람 — "디지털 증거 분석 콘솔" 컨셉.
// 카툰 장비 케이싱 + 스캐너 화면(캐릭터가 통통 튐) + 조작 패널.
// 누르면 튀고, 끌어서 던질 수 있다.
// ──────────────────────────────────────────────────────────────────────────
import { useRef } from "react";
import BounceBall, { type BounceBallApi } from "@/components/BounceBall";

const GH_ID = "INSANE-P";
const PROFILE_URL = `https://github.com/${GH_ID}`;
const REPO_URL = `https://github.com/${GH_ID}/forensic-study`;
const AVATAR_URL = `https://github.com/${GH_ID}.png?size=240`;

const INK = "#0c2747"; // 외곽선 (로고 네이비 톤)

function Octocat({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.7.5.5 5.7.5 12c0 5.1 3.3 9.4 7.9 10.9.6.1.8-.2.8-.5v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.3-1.7-1.3-1.7-1.1-.7.1-.7.1-.7 1.2.1 1.8 1.2 1.8 1.2 1 1.8 2.7 1.3 3.4 1 .1-.7.4-1.3.7-1.6-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3.1 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.6 1.6.2 2.8.1 3.1.8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.6.8.5 4.6-1.5 7.9-5.8 7.9-10.9C23.5 5.7 18.3.5 12 .5z" />
    </svg>
  );
}

// 손그림 돋보기 도안 (수사 모티프)
function DoodleLens({ className, fill }: { className?: string; fill: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill={fill} stroke={INK} strokeWidth="2" strokeLinejoin="round" aria-hidden="true">
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M20 20l-4.6-4.6" strokeLinecap="round" />
    </svg>
  );
}

// 통통한 카툰 버튼 (두꺼운 외곽선 + 솔리드 그림자)
function CartoonBtn({
  as = "button",
  href,
  bg,
  label,
  rotate,
  onClick,
  children,
}: {
  as?: "button" | "a";
  href?: string;
  bg: string;
  label: string;
  rotate: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const cls = `relative inline-flex h-14 w-14 items-center justify-center rounded-full border-[3px] transition-transform active:translate-y-[3px] ${rotate}`;
  const style = { background: bg, borderColor: INK, boxShadow: `0 5px 0 ${INK}` } as React.CSSProperties;
  const inner = (
    <>
      <span className="pointer-events-none absolute left-2.5 top-2 h-2.5 w-4 -rotate-12 rounded-full bg-white/55" />
      {children}
    </>
  );
  return as === "a" ? (
    <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} title={label} className={cls} style={style}>
      {inner}
    </a>
  ) : (
    <button type="button" onClick={onClick} aria-label={label} title={label} className={cls} style={style}>
      {inner}
    </button>
  );
}

export default function AboutPage() {
  const api = useRef<BounceBallApi | null>(null);

  return (
    // 카툰 증거 분석 장비 케이싱
    <div
      className="relative flex min-h-[82vh] flex-col gap-3.5 rounded-[2rem] border-[4px] bg-[#d7e2ee] p-3.5 sm:p-5"
      style={{ borderColor: INK, boxShadow: `0 8px 0 rgba(12,39,71,0.18)` }}
    >
      {/* 헤더 */}
      <header className="flex items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-2">
          <DoodleLens className="h-6 w-6 -rotate-6" fill="#7dd3fc" />
          <h1 className="text-[1.45rem] font-extrabold tracking-tight sm:text-[1.6rem]" style={{ color: INK }}>
            만든 사람
          </h1>
        </div>
        <span className="rounded-md border-2 px-2 py-0.5 font-mono text-[0.7rem] font-extrabold" style={{ borderColor: INK, color: INK }}>
          CASE #DF-01
        </span>
      </header>

      {/* 스캐너 화면 — 분석 대상(캐릭터)이 떠다닌다 */}
      <div
        className="relative flex-1 overflow-hidden rounded-[1.6rem] border-[5px] bg-[#07101d]"
        style={{ borderColor: INK }}
      >
        <BounceBall avatarUrl={AVATAR_URL} className="h-full" onReady={(a) => (api.current = a)} />
        {/* 스캐너 오버레이 — 코너 라벨 + 사선 글린트 */}
        <div className="pointer-events-none absolute inset-0 z-[40]">
          <span className="absolute left-3 top-2.5 font-mono text-[0.62rem] font-bold tracking-widest text-brand-blue-lighter/70">
            ▸ EVIDENCE SCANNER
          </span>
          <span className="absolute bottom-2.5 right-3 font-mono text-[0.62rem] font-bold tracking-widest text-brand-blue-lighter/50">
            LIVE · 분석 중
          </span>
          <div className="absolute left-4 top-2 h-20 w-3 -rotate-[33deg] rounded-full bg-white/10" />
          <div className="absolute left-9 top-2 h-12 w-1.5 -rotate-[33deg] rounded-full bg-white/[0.07]" />
        </div>
      </div>

      {/* 소개 한 줄 */}
      <p className="px-1 text-center text-sm font-medium" style={{ color: INK }}>
        시험 전날의 막막함을 줄이려고 만들었어요 — 교안을 정리하고, 문제로 점검하고, 캐릭터로 동기부여까지.
      </p>

      {/* 조작 패널 */}
      <div
        className="flex items-center justify-center gap-5 rounded-[1.4rem] border-[4px] bg-[#c3d2e6] px-4 py-4"
        style={{ borderColor: INK }}
      >
        <CartoonBtn label="스캔 펄스 — 분석 대상 띄우기" bg="#0ea5e9" rotate="-rotate-3" onClick={() => api.current?.poke()}>
          <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill="none" stroke={INK} strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"><circle cx="10.5" cy="10.5" r="6.5" /><path d="M20 20l-4.6-4.6" /></svg>
        </CartoonBtn>
        <CartoonBtn as="a" href={PROFILE_URL} label="GitHub 프로필" bg="#eef2f8" rotate="rotate-2">
          <Octocat className="relative h-6 w-6" />
        </CartoonBtn>
        <CartoonBtn as="a" href={REPO_URL} label="이 프로젝트에 스타 주기" bg="#e0a200" rotate="-rotate-2">
          <svg viewBox="0 0 24 24" className="relative h-6 w-6" fill={INK}><path d="M12 2l2.9 6.3 6.9.8-5.1 4.7 1.4 6.8L12 17.8 5.9 20.6l1.4-6.8L2.2 9.1l6.9-.8z" /></svg>
        </CartoonBtn>
      </div>
    </div>
  );
}
