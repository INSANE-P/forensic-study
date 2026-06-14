// 경험치 대시보드 — 누적 XP·다음 등급 진행·획득 내역
import { useGrowth } from "./GrowthProvider";
import TierEmblem from "./TierEmblem";

function SourceIcon({ name, color }: { name: string; color: string }) {
  const c = { viewBox: "0 0 24 24", className: "h-4 w-4", fill: "none", stroke: color, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const p: Record<string, React.ReactNode> = {
    check: <path d="M20 6 9 17l-5-5" />,
    retry: <path d="M3 12a9 9 0 1 0 3-6.7L3 8M3 4v4h4" />,
    week: <path d="m12 2 9 5-9 5-9-5 9-5zM3 12l9 5 9-5M3 17l9 5 9-5" />,
    trophy: <path d="M8 21h8M12 17v4M7 4h10v5a5 5 0 0 1-10 0zM7 6H4v1a3 3 0 0 0 3 3M17 6h3v1a3 3 0 0 1-3 3" />,
  };
  return <svg {...c}>{p[name]}</svg>;
}

const META: { key: string; icon: string; color: string }[] = [
  { key: "정답", icon: "check", color: "#12a594" },
  { key: "도전 (오답도 시도)", icon: "retry", color: "#6d5cf0" },
  { key: "주차 정복", icon: "week", color: "#8b5cf6" },
  { key: "전 범위 정복", icon: "trophy", color: "#e0a200" },
];

export default function XpDashboard() {
  const g = useGrowth();

  return (
    <section className="card-soft rounded-3xl bg-surface p-6">
      <div className="flex items-center gap-4">
        <TierEmblem level={g.level} size={48} />
        <div className="min-w-0 flex-1">
          <div className="text-xs font-bold text-muted">현재 등급</div>
          <div className="text-xl font-extrabold text-foreground">
            Lv{g.level} · {g.tier.name}
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-extrabold" style={{ color: g.tier.color }}>
            {g.xp.toLocaleString()}
          </div>
          <div className="text-xs font-bold text-muted">누적 XP</div>
        </div>
      </div>

      <div className="mt-5">
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
          <span style={{ color: g.tier.color }}>{g.tier.name}</span>
          <span className="text-muted">{g.isMax ? "최고 등급 달성! 🎉" : `다음 진화까지 ${g.toNext} XP`}</span>
          {!g.isMax && <span className="text-muted-strong">{g.nextTier?.name}</span>}
        </div>
        <div className="h-3 overflow-hidden rounded-full bg-border">
          <div
            className="h-full rounded-full transition-[width] duration-700"
            style={{ width: `${g.pctInStage}%`, background: `linear-gradient(90deg, ${g.tier.accent}, ${g.tier.color})` }}
          />
        </div>
      </div>

      <div className="mt-6">
        <div className="mb-2 text-xs font-bold text-muted-strong">경험치 획득 내역</div>
        <div className="overflow-hidden rounded-2xl border border-border">
          {META.map((m, i) => {
            const s = g.sources.find((x) => x.label === m.key);
            const xp = s?.xp ?? 0;
            const earned = xp > 0;
            return (
              <div key={m.key} className={`flex items-center gap-3 px-3.5 py-2.5 ${i > 0 ? "border-t border-border" : ""} ${earned ? "" : "opacity-45"}`}>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl" style={{ background: `${m.color}1a` }}>
                  <SourceIcon name={m.icon} color={m.color} />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-foreground">{m.key}</div>
                  <div className="text-xs font-medium text-muted">{s?.detail}</div>
                </div>
                <div className="shrink-0 text-sm font-extrabold" style={{ color: earned ? m.color : undefined }}>
                  +{xp}
                </div>
              </div>
            );
          })}
        </div>
        <p className="mt-2.5 text-xs font-medium text-muted">
          문제를 풀고 채점하면 바로 경험치가 올라요. 틀려도 시도하면 쌓이니 부담 없이 도전!
        </p>
      </div>
    </section>
  );
}
