// ──────────────────────────────────────────────────────────────────────────
// 홈 상단 성장 요약 — 누르면 "내 캐릭터" 페이지로.
//  - 미등록: 캐릭터 등록 유도 CTA
//  - 등록됨: 캐릭터 · 등급 · 다음 진화까지 XP 요약
// ──────────────────────────────────────────────────────────────────────────
import { Link } from "react-router-dom";
import { getIdentity, type Identity } from "@/lib/storage";
import { useGrowth } from "./GrowthProvider";
import GrowthAvatar from "./GrowthAvatar";

function avatarSrc(id: Identity): string | null {
  if (id.avatarUrl) return id.avatarUrl;
  if (id.github) return `https://github.com/${id.github}.png?size=200`;
  return null;
}
function displayName(id: Identity): string {
  return id.name?.trim() || id.github?.trim() || "내 캐릭터";
}

function Arrow() {
  return (
    <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

export default function GrowthWidget() {
  const g = useGrowth();
  const id = getIdentity();
  const configured = Boolean(id.name || id.github || id.avatarUrl);

  // 미등록 — 등록 유도 CTA
  if (!configured) {
    return (
      <Link to="/me" className="card-soft card-hover block rounded-3xl bg-surface p-6">
        <div className="flex items-center gap-5">
          <GrowthAvatar src={null} initial="나" level={g.level} size={84} />
          <div className="min-w-0 flex-1">
            <h2 className="text-lg font-extrabold text-foreground">나만의 캐릭터를 등록해 보세요</h2>
            <p className="mt-1 text-sm font-medium text-muted-strong">
              닉네임과 사진을 등록하면, 문제를 풀수록 캐릭터가 함께 성장하고 등급이 올라요.
            </p>
            <span className="mt-2.5 inline-flex items-center gap-1 rounded-xl bg-brand-blue px-3.5 py-1.5 text-sm font-bold text-white">
              캐릭터 등록하기 <Arrow />
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // 등록됨 — 성장 요약
  const src = avatarSrc(id);
  const name = displayName(id);
  const initial = name.charAt(0).toUpperCase();

  return (
    <Link to="/me" className="card-soft card-hover block rounded-3xl bg-surface p-6">
      <div className="flex items-center gap-5">
        <GrowthAvatar src={src} initial={initial} level={g.level} size={96} />

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-extrabold text-foreground">{name}</span>
            <span className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white" style={{ background: g.tier.color }}>
              Lv{g.level} · {g.tier.name}
            </span>
          </div>

          <div className="mt-2.5">
            <div className="mb-1 flex items-center justify-between text-xs font-semibold text-muted">
              <span>누적 {g.xp} XP</span>
              <span>{g.isMax ? "최고 등급 달성!" : `다음 진화까지 ${g.toNext} XP`}</span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full transition-[width] duration-700"
                style={{ width: `${g.pctInStage}%`, background: `linear-gradient(90deg, ${g.tier.accent}, ${g.tier.color})` }}
              />
            </div>
          </div>

          <div className="mt-2.5 flex items-center gap-1 text-xs font-bold text-brand-blue">
            내 캐릭터 놀이터 보러가기 <Arrow />
          </div>
        </div>
      </div>
    </Link>
  );
}
