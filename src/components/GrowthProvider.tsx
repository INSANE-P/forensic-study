// ──────────────────────────────────────────────────────────────────────────
// 성장 전역 Provider — 진행상황 변화를 감지해 즉각 피드백을 준다.
//  - 채점/작성으로 XP가 오르면 "+N XP" 토스트(어느 페이지든)
//  - 등급이 오르면 그 자리에서 진화 모달(+컨페티)
//  - useGrowth()로 현재 성장 상태를 공유(위젯·헤더 칩이 재계산 없이 사용)
// ──────────────────────────────────────────────────────────────────────────
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { ALL_QUESTIONS } from "@/data/questions";
import { useProgress } from "@/lib/progressStore";
import { computeGrowth, type Growth } from "@/lib/growth";
import { getIdentity, getSeenLevel, setSeenLevel, type Identity } from "@/lib/storage";
import EvolveModal from "./EvolveModal";

const GrowthCtx = createContext<Growth | null>(null);

export function useGrowth(): Growth {
  const c = useContext(GrowthCtx);
  if (!c) throw new Error("useGrowth must be used within GrowthProvider");
  return c;
}

function avatarSrc(id: Identity): string | null {
  if (id.avatarUrl) return id.avatarUrl;
  if (id.github) return `https://github.com/${id.github}.png?size=200`;
  return null;
}
function displayName(id: Identity): string {
  return id.name?.trim() || id.github?.trim() || "내 캐릭터";
}

type Evolve = { from: number; to: number; name: string; avatarSrc: string | null; initial: string };

export function GrowthProvider({ children }: { children: ReactNode }) {
  const { progress } = useProgress();
  const growth = useMemo(() => computeGrowth(ALL_QUESTIONS, progress), [progress]);

  const [toast, setToast] = useState<{ amount: number; key: number } | null>(null);
  const [evolve, setEvolve] = useState<Evolve | null>(null);

  const prevXp = useRef<number | null>(null);
  const toastKey = useRef(0);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 이미 연출한 레벨(StrictMode 이중 마운트에도 안전하도록 ref + "닫을 때" 저장)
  const handledLevel = useRef<number>(getSeenLevel());

  // XP 증가 → 토스트 (초기 마운트는 제외)
  useEffect(() => {
    if (prevXp.current === null) {
      prevXp.current = growth.xp;
      return;
    }
    const delta = growth.xp - prevXp.current;
    prevXp.current = growth.xp;
    if (delta > 0) {
      toastKey.current += 1;
      setToast({ amount: delta, key: toastKey.current });
      if (toastTimer.current) clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setToast(null), 1600);
    }
  }, [growth.xp]);

  // 등급 변화 처리. seenLevel은 모달을 "닫을 때" 저장해 StrictMode에 삼켜지지 않게 한다.
  useEffect(() => {
    // 최초 방문(seenLevel 미설정, 기존 사용자 포함): 현재 등급을 기준선으로 잡아
    // 갑작스런 환영 진화 팝업을 띄우지 않는다. 이후 등급이 오르면 그때부터 연출.
    if (handledLevel.current === 0) {
      handledLevel.current = growth.level;
      setSeenLevel(growth.level);
      return;
    }
    if (growth.level > handledLevel.current) {
      // 레벨 상승 → 진화 모달
      if (growth.level > 1) {
        const id = getIdentity();
        setEvolve({
          from: Math.max(1, handledLevel.current),
          to: growth.level,
          name: displayName(id),
          avatarSrc: avatarSrc(id),
          initial: displayName(id).charAt(0).toUpperCase(),
        });
      } else {
        setSeenLevel(1);
      }
      handledLevel.current = growth.level;
    } else if (growth.level < handledLevel.current) {
      // 초기화 등으로 레벨 하락 → 기준 재설정(다시 올리면 진화가 정상 표시됨)
      handledLevel.current = growth.level;
      setSeenLevel(growth.level);
    }
  }, [growth.level]);

  return (
    <GrowthCtx.Provider value={growth}>
      {children}

      {/* +XP 토스트 */}
      {toast && (
        <div key={toast.key} className="pointer-events-none fixed inset-x-0 bottom-8 z-[90] flex justify-center">
          <div
            className="flex items-center gap-1.5 rounded-full bg-brand-blue px-4 py-2 text-sm font-extrabold text-white shadow-lg"
            style={{ animation: "xp-rise 1.6s ease-out forwards" }}
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="#fde047" aria-hidden="true">
              <path d="M12 0 L14 10 L24 12 L14 14 L12 24 L10 14 L0 12 L10 10 Z" />
            </svg>
            +{toast.amount} XP
          </div>
          <style>{`@keyframes xp-rise{0%{opacity:0;transform:translateY(14px) scale(.9)}15%{opacity:1;transform:translateY(0) scale(1)}80%{opacity:1}100%{opacity:0;transform:translateY(-10px)}}`}</style>
        </div>
      )}

      {/* 진화 모달 */}
      {evolve && (
        <EvolveModal
          fromLevel={evolve.from}
          toLevel={evolve.to}
          name={evolve.name}
          avatarSrc={evolve.avatarSrc}
          initial={evolve.initial}
          onClose={() => {
            setSeenLevel(evolve.to);
            setEvolve(null);
          }}
        />
      )}
    </GrowthCtx.Provider>
  );
}
