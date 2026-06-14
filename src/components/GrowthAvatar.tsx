// ──────────────────────────────────────────────────────────────────────────
// 성장 아바타 — 등록 이미지를 "등급 프레임"으로 감싸 게임 랭크처럼 보여준다.
//  - 프레임: 티어 색 그라데이션 링(레전드는 회전하는 무지개 conic)
//  - 오라: 상위 티어 글로우 + 반짝임
//  - 엠블럼: 하단 중앙 등급 방패
// 자라는 주체는 등록 이미지이고, 단계는 프레임/오라/엠블럼으로 표현한다.
// ──────────────────────────────────────────────────────────────────────────
import { useState } from "react";
import { tierAt } from "@/lib/growth";
import TierEmblem from "./TierEmblem";
import BrandLogo from "./BrandLogo";

function Sparkle({ style }: { style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 24 24" className="absolute animate-pulse" style={style} fill="#fde047" aria-hidden="true">
      <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
    </svg>
  );
}

export default function GrowthAvatar({
  src,
  initial,
  level,
  frameLevel,
  size = 120,
  celebrate = false,
  className = "",
}: {
  src?: string | null;
  initial: string;
  level: number;
  /** 프레임/엠블럼만 다른 레벨로(진화 연출용) */
  frameLevel?: number;
  size?: number;
  celebrate?: boolean;
  className?: string;
}) {
  const [failed, setFailed] = useState(false);
  const lv = frameLevel ?? level;
  const t = tierAt(lv);
  const isLegend = lv >= 6;
  const pad = Math.round(size * 0.045) + 2;

  const ringBg = isLegend
    ? "conic-gradient(from 0deg, #fbbf24, #f472b6, #818cf8, #34d399, #fb923c, #fbbf24)"
    : `linear-gradient(135deg, ${t.accent}, ${t.color})`;
  const glow = lv >= 4 ? `0 0 ${lv >= 6 ? 30 : 20}px ${t.color}${lv >= 6 ? "aa" : "66"}` : undefined;
  const emblemSize = Math.round(size * 0.32);

  return (
    <div className={`relative shrink-0 ${className}`} style={{ width: size, height: size + emblemSize * 0.2 }}>
      <div className={`relative ${celebrate ? "animate-bounce" : ""}`} style={{ width: size, height: size }}>
        {/* 회전 무지개(레전드) */}
        {isLegend && (
          <div
            className="absolute rounded-full"
            style={{ inset: -2, background: ringBg, animation: "spin 6s linear infinite", filter: "blur(1px)", opacity: 0.9 }}
            aria-hidden="true"
          />
        )}
        {/* 프레임 링 */}
        <div className="absolute inset-0 rounded-full" style={{ background: ringBg, boxShadow: glow }} aria-hidden="true" />
        {/* 아바타 */}
        <div className="absolute overflow-hidden rounded-full bg-surface" style={{ inset: pad }}>
          {failed ? (
            <div className="flex h-full w-full items-center justify-center bg-brand-blue/15 font-extrabold text-brand-blue" style={{ fontSize: size * 0.38 }}>
              {initial}
            </div>
          ) : src ? (
            <img src={src} alt="" draggable={false} onError={() => setFailed(true)} className="h-full w-full select-none object-cover" />
          ) : (
            <BrandLogo className="h-full w-full select-none object-cover" alt="" />
          )}
        </div>

        {/* 반짝임(최고 티어) */}
        {isLegend && (
          <>
            <Sparkle style={{ width: size * 0.16, height: size * 0.16, top: size * 0.04, right: -size * 0.03 }} />
            <Sparkle style={{ width: size * 0.11, height: size * 0.11, bottom: size * 0.12, left: -size * 0.03 }} />
          </>
        )}
      </div>

      {/* 등급 엠블럼 */}
      <div className="absolute left-1/2 -translate-x-1/2" style={{ bottom: 0 }}>
        <div className="drop-shadow">
          <TierEmblem level={lv} size={emblemSize} />
        </div>
      </div>
    </div>
  );
}
