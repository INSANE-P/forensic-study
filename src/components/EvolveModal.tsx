// ──────────────────────────────────────────────────────────────────────────
// 진화 모달 — 포켓몬 진화 오마주.
// 어두운 화면 → 흰 실루엣이 점점 빨리 깜빡(차징) → 흰 섬광 → 새 모습 공개
// (회전하는 빛줄기 sunburst 배경). 콘페티 대신 광선 연출.
// ──────────────────────────────────────────────────────────────────────────
import { useEffect, useState } from "react";
import GrowthAvatar from "./GrowthAvatar";
import TierEmblem from "./TierEmblem";
import { tierAt } from "@/lib/growth";

const AV = 168;

const CSS = `
@keyframes evm-shake { 0%,100%{transform:translateX(-50%)} 25%{transform:translateX(calc(-50% - 4px)) rotate(-2deg)} 75%{transform:translateX(calc(-50% + 4px)) rotate(2deg)} }
@keyframes evm-charge {
  0%{opacity:0} 8%{opacity:.9} 12%{opacity:0}
  24%{opacity:.9} 28%{opacity:0} 40%{opacity:1} 43%{opacity:0}
  54%{opacity:1} 57%{opacity:0} 67%{opacity:1} 69%{opacity:0}
  78%{opacity:1} 80%{opacity:0} 88%{opacity:1} 90%{opacity:0}
  96%{opacity:1} 100%{opacity:1}
}
@keyframes evm-screen { 0%{opacity:0} 45%{opacity:1} 100%{opacity:0} }
@keyframes evm-rays { from{transform:rotate(0)} to{transform:rotate(360deg)} }
@keyframes evm-glow { 0%,100%{opacity:.5;transform:translate(-50%,-50%) scale(1)} 50%{opacity:1;transform:translate(-50%,-50%) scale(1.15)} }
@keyframes evm-pop { 0%{opacity:0;transform:translateY(8px) scale(.92)} 100%{opacity:1;transform:translateY(0) scale(1)} }
`;

export default function EvolveModal({
  fromLevel,
  toLevel,
  name,
  avatarSrc,
  initial,
  onClose,
}: {
  fromLevel: number;
  toLevel: number;
  name: string;
  avatarSrc?: string | null;
  initial: string;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState(0); // 0 빌드업 · 1 차징 · 2 섬광 · 3 공개
  const [frameLv, setFrameLv] = useState(fromLevel);

  const fromTier = tierAt(fromLevel);
  const toTier = tierAt(toLevel);

  useEffect(() => {
    const t = [
      setTimeout(() => setPhase(1), 800),
      setTimeout(() => setFrameLv(toLevel), 2150),
      setTimeout(() => setPhase(2), 2300),
      setTimeout(() => setPhase(3), 2800),
    ];
    return () => t.forEach(clearTimeout);
  }, [toLevel]);

  const building = phase === 0;
  const charging = phase === 1;
  const revealed = phase === 3;
  const showRays = phase >= 2;

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-[#05060c]/92 p-6"
      role="dialog"
      aria-modal="true"
      onClick={revealed ? onClose : undefined}
    >
      <style>{CSS}</style>

      <div className="flex flex-col items-center text-center" onClick={(e) => e.stopPropagation()}>
        {/* 무대 */}
        <div className="relative" style={{ width: 280, height: 220 }}>
          {/* 빛줄기(sunburst) */}
          <div
            className="absolute"
            style={{
              left: "50%",
              top: AV / 2,
              width: 340,
              height: 340,
              transform: "translate(-50%,-50%)",
              opacity: showRays ? 1 : 0,
              transition: "opacity 0.5s ease-out",
              WebkitMaskImage: "radial-gradient(circle, #000 18%, transparent 62%)",
              maskImage: "radial-gradient(circle, #000 18%, transparent 62%)",
            }}
            aria-hidden="true"
          >
            <div
              className="h-full w-full"
              style={{
                background: `repeating-conic-gradient(${toTier.accent} 0deg, ${toTier.accent} 5deg, transparent 5deg, transparent 13deg)`,
                animation: "evm-rays 9s linear infinite",
              }}
            />
          </div>

          {/* 글로우 */}
          <div
            className="absolute rounded-full blur-2xl"
            style={{
              left: "50%",
              top: AV / 2,
              width: 200,
              height: 200,
              background: `radial-gradient(circle, ${toTier.accent}cc, ${toTier.color}44 60%, transparent 75%)`,
              animation: "evm-glow 1.2s ease-in-out infinite",
            }}
            aria-hidden="true"
          />

          {/* 캐릭터 */}
          <div
            className="absolute"
            style={{ left: "50%", top: 0, transform: "translateX(-50%)", animation: building || charging ? "evm-shake 0.45s ease-in-out infinite" : undefined }}
          >
            <GrowthAvatar src={avatarSrc} initial={initial} level={toLevel} frameLevel={frameLv} size={AV} celebrate={revealed} />
          </div>

          {/* 흰 실루엣 차징 */}
          {charging && (
            <div
              className="absolute rounded-full bg-white"
              style={{ left: "50%", top: 0, transform: "translateX(-50%)", width: AV, height: AV, animation: "evm-charge 1.5s ease-in forwards" }}
              aria-hidden="true"
            />
          )}
        </div>

        {/* 텍스트 */}
        <div className="mt-5 min-h-[6rem]">
          {revealed ? (
            <div style={{ animation: "evm-pop 0.5s ease-out" }}>
              <p className="mb-2 text-xs font-bold uppercase tracking-[0.35em] text-white/55">진화 완료</p>
              <div className="flex items-center justify-center gap-2">
                <TierEmblem level={toLevel} size={28} />
                <span className="text-2xl font-extrabold" style={{ color: toTier.accent }}>
                  {toTier.name}
                </span>
              </div>
              <p className="mt-2 text-sm font-semibold text-white/65">
                {fromTier.name} <span className="mx-1 text-white/35">→</span> {toTier.name}
              </p>
              <p className="mt-1 text-sm text-white/55">{toTier.blurb}</p>
            </div>
          ) : (
            <p className="text-base font-bold text-white/85">{name || "내 캐릭터"}의 모습이…!</p>
          )}
        </div>

        {revealed && (
          <button
            onClick={onClose}
            className="mt-5 rounded-2xl bg-white px-10 py-2.5 text-sm font-extrabold text-[#0b1024] shadow-lg transition active:translate-y-0.5"
            style={{ animation: "evm-pop 0.5s ease-out" }}
          >
            확인
          </button>
        )}
      </div>

      {/* 전체 화면 섬광 */}
      {phase === 2 && (
        <div className="pointer-events-none fixed inset-0 bg-white" style={{ animation: "evm-screen 0.5s ease-in-out" }} aria-hidden="true" />
      )}
    </div>
  );
}
