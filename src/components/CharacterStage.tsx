// ──────────────────────────────────────────────────────────────────────────
// 캐릭터 놀이터 — 캐릭터를 쓰다듬으면 통통 튀고 스파클과 함께 응원 한마디.
// 받침대 그림자 + 등급 테마 배경 + 정돈된 말풍선으로 차분하고 깔끔하게.
// ──────────────────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { getIdentity, type Identity } from "@/lib/storage";
import { useGrowth } from "./GrowthProvider";
import GrowthAvatar from "./GrowthAvatar";
import TierEmblem from "./TierEmblem";

const LINES = [
  "단서를 하나씩 따라가 보자!",
  "틀려도 괜찮아 — 수사는 계속된다",
  "조금만 더 풀면 다음 등급으로 진화각",
  "사소한 흔적도 놓치지 말자",
  "한 문제만 더 파헤쳐 볼래?",
  "오, 방금 결정적 증거를 찾은 듯?",
  "사건의 윤곽이 잡히는 중… 거의 다 왔어",
  "쓰다듬어 줘서 고마워, 수사력 +1",
  "증거는 거짓말 안 해. 같이 가자!",
];
const GLYPHS = ["0", "1", "🔍", "✦", "FF", "D8", "✓", "•"];

const CSS = `
@keyframes cs-bob { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-7px)} }
@keyframes cs-pop { 0%{transform:scale(1)} 28%{transform:scale(1.1)} 60%{transform:scale(.96)} 100%{transform:scale(1)} }
@keyframes cs-spark { 0%{opacity:0;transform:translate(var(--dx),0) scale(.3) rotate(0)} 18%{opacity:1} 100%{opacity:0;transform:translate(var(--dx),-118px) scale(1) rotate(var(--rot))} }
@keyframes cs-bubble { 0%{opacity:0;transform:translateY(6px) scale(.96)} 14%{opacity:1;transform:translateY(0) scale(1)} 86%{opacity:1} 100%{opacity:0} }
`;

function avatarSrc(id: Identity): string | null {
  if (id.avatarUrl) return id.avatarUrl;
  if (id.github) return `https://github.com/${id.github}.png?size=200`;
  return null;
}
function displayName(id: Identity): string {
  return id.name?.trim() || id.github?.trim() || "내 캐릭터";
}

type Spark = { id: number; dx: number; size: number; rot: number; color: string; glyph: string };

export default function CharacterStage() {
  const g = useGrowth();
  const id = getIdentity();
  const src = avatarSrc(id);
  const name = displayName(id);
  const initial = name.charAt(0).toUpperCase();

  const [sparks, setSparks] = useState<Spark[]>([]);
  const [bubble, setBubble] = useState<string | null>(null);
  const [pokeKey, setPokeKey] = useState(0);
  const seq = useRef(0);
  const bubbleTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function poke() {
    setPokeKey((k) => k + 1);
    const n = 5 + Math.floor(Math.random() * 3);
    const fresh: Spark[] = Array.from({ length: n }, () => ({
      id: ++seq.current,
      dx: Math.round((Math.random() - 0.5) * 120),
      size: 13 + Math.round(Math.random() * 12),
      rot: Math.round((Math.random() - 0.5) * 120),
      color: Math.random() > 0.5 ? g.tier.color : g.tier.accent,
      glyph: GLYPHS[Math.floor(Math.random() * GLYPHS.length)],
    }));
    setSparks((p) => [...p, ...fresh]);
    fresh.forEach((f) => setTimeout(() => setSparks((p) => p.filter((x) => x.id !== f.id)), 1150));

    setBubble(LINES[Math.floor(Math.random() * LINES.length)]);
    if (bubbleTimer.current) clearTimeout(bubbleTimer.current);
    bubbleTimer.current = setTimeout(() => setBubble(null), 2400);
  }

  return (
    <section
      className="card-soft relative overflow-hidden rounded-3xl p-6"
      style={{ background: `radial-gradient(120% 90% at 50% 0%, ${g.tier.color}1f, transparent 60%)` }}
    >
      <style>{CSS}</style>

      <div className="flex flex-col items-center">
        {/* 말풍선 */}
        <div className="flex h-14 items-end">
          {bubble && (
            <div
              key={pokeKey}
              className="relative rounded-2xl border border-border bg-surface px-4 py-2 text-sm font-bold text-foreground shadow-md"
              style={{ animation: "cs-bubble 2.4s ease-out forwards" }}
            >
              {bubble}
              <span className="absolute -bottom-[7px] left-1/2 h-3 w-3 -translate-x-1/2 rotate-45 border-b border-r border-border bg-surface" />
            </div>
          )}
        </div>

        {/* 캐릭터 무대 */}
        <div className="relative mt-2" style={{ width: 220, height: 210 }}>
          {/* 받침대 그림자 */}
          <div
            className="absolute left-1/2 -translate-x-1/2"
            style={{ bottom: 8, width: 132, height: 24, borderRadius: "50%", background: `radial-gradient(closest-side, ${g.tier.color}55, transparent)`, filter: "blur(2px)" }}
            aria-hidden="true"
          />
          {/* 캐릭터(클릭=쓰다듬기) */}
          <div className="absolute left-1/2 top-0 -translate-x-1/2" style={{ animation: "cs-bob 3s ease-in-out infinite" }}>
            <button type="button" onClick={poke} aria-label="캐릭터 쓰다듬기" className="relative block cursor-pointer rounded-full outline-none">
              <div key={pokeKey} style={{ animation: pokeKey ? "cs-pop 0.6s ease-out" : undefined }}>
                <GrowthAvatar src={src} initial={initial} level={g.level} size={172} />
              </div>
              {/* 증거 입자 (포렌식 글리프) */}
              <div className="pointer-events-none absolute inset-0">
                {sparks.map((s) => (
                  <span
                    key={s.id}
                    className="absolute left-1/2 top-1/2 font-mono font-extrabold"
                    style={{ color: s.color, fontSize: s.size, ["--dx" as string]: `${s.dx}px`, ["--rot" as string]: `${s.rot}deg`, animation: "cs-spark 1.15s ease-out forwards" }}
                  >
                    {s.glyph}
                  </span>
                ))}
              </div>
            </button>
          </div>
        </div>

        {/* 이름 / 등급 */}
        <div className="mt-1 flex items-center gap-2">
          <TierEmblem level={g.level} size={22} />
          <span className="text-lg font-extrabold text-foreground">{name}</span>
          <span className="rounded-full px-2 py-0.5 text-xs font-bold text-white" style={{ background: g.tier.color }}>
            Lv{g.level} · {g.tier.name}
          </span>
        </div>

        {/* 상호작용 버튼 */}
        <button
          onClick={poke}
          className="mt-4 inline-flex items-center gap-1.5 rounded-2xl border border-border bg-surface px-5 py-2.5 text-sm font-bold text-foreground shadow-sm transition hover:border-transparent hover:text-white active:translate-y-0.5"
          style={{ ["--hb" as string]: g.tier.color }}
          onMouseEnter={(e) => (e.currentTarget.style.background = g.tier.color)}
          onMouseLeave={(e) => (e.currentTarget.style.background = "")}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="currentColor" aria-hidden="true">
            <path d="M12 21 C12 21 4 14.5 4 9 C4 6.5 6 4.5 8.5 4.5 C10.1 4.5 11.3 5.5 12 6.6 C12.7 5.5 13.9 4.5 15.5 4.5 C18 4.5 20 6.5 20 9 C20 14.5 12 21 12 21 Z" />
          </svg>
          쓰다듬기
        </button>
      </div>
    </section>
  );
}
