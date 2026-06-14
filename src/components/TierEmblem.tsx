// 등급 엠블럼 — 증거 연결망(노드·관계) 모티프. 등급이 오를수록 망이 커진다(수사 범위 ↑).
import { useId } from "react";
import { tierAt } from "@/lib/growth";

// 육각형(플랫탑) — viewBox 48 x 52
const HEX = "M24 2 L44 14 L44 38 L24 50 L4 38 L4 14 Z";

// 티어별 신경망 레이어 구성 (열 = 레이어, 값 = 노드 수)
const LAYERS: Record<number, number[]> = {
  1: [1],
  2: [2],
  3: [3],
  4: [2, 3],
  5: [3, 3],
  6: [3, 4, 2],
};

function net(level: number) {
  const layers = LAYERS[level] ?? [1];
  const x0 = 13, x1 = 35, yTop = 14, yBot = 38;
  const cols = layers.map((n, ci) => {
    const x = layers.length === 1 ? 24 : x0 + ((x1 - x0) * ci) / (layers.length - 1);
    const ys = Array.from({ length: n }, (_, ni) => (n === 1 ? 26 : yTop + ((yBot - yTop) * ni) / (n - 1)));
    return ys.map((y) => ({ x, y }));
  });
  const edges: { x1: number; y1: number; x2: number; y2: number }[] = [];
  for (let i = 0; i < cols.length - 1; i++)
    for (const a of cols[i]) for (const b of cols[i + 1]) edges.push({ x1: a.x, y1: a.y, x2: b.x, y2: b.y });
  return { nodes: cols.flat(), edges };
}

export default function TierEmblem({ level, size = 34 }: { level: number; size?: number }) {
  const t = tierAt(level);
  const id = "te" + useId().replace(/:/g, "");
  const { nodes, edges } = net(t.level);
  const glow = t.level >= 5;

  return (
    <svg width={size} height={(size * 52) / 48} viewBox="0 0 48 52" className="shrink-0" aria-hidden="true">
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={t.accent} />
          <stop offset="1" stopColor={t.color} />
        </linearGradient>
        {glow && (
          <filter id={id + "g"}>
            <feGaussianBlur stdDeviation="0.7" />
          </filter>
        )}
      </defs>
      <path d={HEX} fill={`url(#${id})`} stroke="rgba(15,23,42,0.3)" strokeWidth="2" />
      <g stroke="rgba(255,255,255,0.7)" strokeWidth="1.1" filter={glow ? `url(#${id}g)` : undefined}>
        {edges.map((e, i) => (
          <line key={i} x1={e.x1} y1={e.y1} x2={e.x2} y2={e.y2} />
        ))}
      </g>
      <g fill="#fff">
        {nodes.map((n, i) => (
          <circle key={i} cx={n.x} cy={n.y} r="2.6" />
        ))}
      </g>
    </svg>
  );
}
