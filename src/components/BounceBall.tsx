import { useEffect, useRef, useState } from "react";

export type BounceBallApi = { poke: () => void };

// ──────────────────────────────────────────────────────────────────────────
// 인터랙티브 바운스 캐릭터 (만든 사람 소개용)
// - 화면 밖에서 떨어져 통통 튀며 등장 / 탭=점프, 끌어서 놓으면=던지기
// - 움직이면 뒤로 데이터 입자 트레일이 흩뿌려짐
// - 멈추면 말풍선으로 한마디 (날아다닐 땐 숨김)
// - rAF 물리 루프, 쉴 때 정지. reduced-motion이면 정적.
// ──────────────────────────────────────────────────────────────────────────

const GREETING = "증거는 거짓말을 안 하죠. 눌러보거나 던져보세요!";
const LINES = [
  "또 던지셨네요? 어질어질 🌀",
  "이 정도 흔들림으론 해시값도 안 바뀌어요",
  "시험 전날의 막막함, 제가 좀 줄여볼게요",
  "한 문제 푸실 때마다 단서가 하나씩 모여요",
  "삭제해도 흔적은 남아요 — 저처럼요 😎",
  "처음엔 낯을 좀 가려요… 친해지면 장난꾸러기",
  "먼저 말 놓아주실래요?",
  "돋보기 들고 어디든 파헤쳐 드려요 🔍",
];

const GRAV = 0.7;
const REST = 0.8;
const FRICT = 0.985;
const N_TRAIL = 22;
const TINTS = ["rgba(56,189,248,.95)", "rgba(255,255,255,.95)", "rgba(224,162,0,.95)"];

type Particle = { el: HTMLDivElement; x: number; y: number; life: number };

export default function BounceBall({
  avatarUrl,
  size = 96,
  className = "",
  onReady,
}: {
  avatarUrl: string;
  size?: number;
  className?: string;
  onReady?: (api: BounceBallApi) => void;
}) {
  const areaRef = useRef<HTMLDivElement>(null);
  const ballRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const bubbleRef = useRef<HTMLDivElement>(null);
  const trailRef = useRef<HTMLDivElement>(null);
  const particles = useRef<Particle[]>([]);
  const cursor = useRef(0);
  const lineIdx = useRef(0);
  const [imgError, setImgError] = useState(false);
  const [msg, setMsg] = useState("");
  const [msgKey, setMsgKey] = useState(0);
  const [typed, setTyped] = useState("");

  useEffect(() => {
    if (!msg) { setTyped(""); return; }
    if (s.current.reduce) { setTyped(msg); return; }
    setTyped("");
    let i = 0;
    const id = window.setInterval(() => {
      i++;
      setTyped(msg.slice(0, i));
      if (i >= msg.length) window.clearInterval(id);
    }, 40);
    return () => window.clearInterval(id);
  }, [msg, msgKey]);

  function talk(text?: string) {
    const t = text ?? LINES[lineIdx.current++ % LINES.length];
    setMsg(t);
    setMsgKey((k) => k + 1);
  }

  function poke() {
    const st = s.current;
    st.vy = -16;
    st.vx = (Math.random() - 0.5) * 8;
    setMsg("");
    if (st.reduce) talk();
    else { st.pending = "line"; start(); }
  }

  function render() {
    const area = areaRef.current, ball = ballRef.current, glow = glowRef.current;
    if (!area || !ball) return;
    const st = s.current;
    ball.style.transform = `translate(${st.x}px, ${st.y}px) scaleX(${1 + st.squash * 0.6}) scaleY(${1 - st.squash})`;
    if (glow) glow.style.transform = `translate(${st.x + size / 2}px, ${st.y + size / 2}px) translate(-50%, -50%)`;
    const bub = bubbleRef.current;
    if (bub) {
      const W = area.clientWidth;
      const bx = Math.max(46, Math.min(st.x + size / 2, W - 46));
      bub.style.transform = `translate(${bx}px, ${st.y - 6}px) translate(-50%, -100%)`;
    }
  }

  const s = useRef({
    x: 0, y: -size, vx: 1.2, vy: 2, squash: 0,
    dragging: false, grabX: 0, grabY: 0,
    lastX: 0, lastY: 0, lastT: 0, vtx: 0, vty: 0, moved: 0,
    raf: 0, running: false, reduce: false,
    pending: null as null | "greet" | "line",
  });

  function step() {
    const area = areaRef.current;
    if (!area) return;
    const st = s.current;
    const W = area.clientWidth, H = area.clientHeight;
    const floorY = H - size;
    if (!st.dragging) {
      st.vy += GRAV;
      st.x += st.vx;
      st.y += st.vy;
      if (st.x < 0) { st.x = 0; st.vx = -st.vx * REST; st.squash = Math.min(0.45, Math.abs(st.vx) * 0.03); }
      else if (st.x > W - size) { st.x = W - size; st.vx = -st.vx * REST; st.squash = Math.min(0.45, Math.abs(st.vx) * 0.03); }
      if (st.y > floorY) {
        st.y = floorY;
        if (Math.abs(st.vy) > 1) st.squash = Math.min(0.55, Math.abs(st.vy) * 0.04);
        st.vy = -st.vy * REST;
        st.vx *= FRICT;
        if (Math.abs(st.vy) < 1.3) st.vy = 0;
        if (Math.abs(st.vx) < 0.25) st.vx = 0;
      }
    }
    st.squash *= 0.85;

    const ps = particles.current;
    const speed = Math.hypot(st.vx, st.vy);
    if (ps.length && !st.dragging && speed > 1.6) {
      const p = ps[cursor.current++ % ps.length];
      p.x = st.x + size / 2 + (Math.random() - 0.5) * size * 0.5;
      p.y = st.y + size / 2 + (Math.random() - 0.5) * size * 0.5;
      p.life = 1;
    }
    let trailAlive = false;
    for (const p of ps) {
      if (p.life > 0) {
        p.life -= 0.045;
        const l = Math.max(0, p.life);
        if (l > 0) trailAlive = true;
        p.el.style.opacity = String(l * 0.95);
        p.el.style.transform = `translate(${p.x}px, ${p.y}px) translate(-50%, -50%) scale(${0.4 + l * 0.9})`;
      }
    }

    render();
    const physRest = !st.dragging && st.vy === 0 && Math.abs(st.vx) < 0.05 && st.y >= floorY - 0.5 && st.squash < 0.01;
    if (physRest && st.pending) {
      const p = st.pending;
      st.pending = null;
      talk(p === "greet" ? GREETING : undefined);
    }
    if (physRest && !trailAlive) { st.running = false; return; }
    st.raf = requestAnimationFrame(step);
  }

  function start() {
    const st = s.current;
    if (st.running || st.reduce) return;
    st.running = true;
    st.raf = requestAnimationFrame(step);
  }

  useEffect(() => {
    const area = areaRef.current;
    if (!area) return;
    const st = s.current;
    st.reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    onReady?.({ poke });
    const W = area.clientWidth, H = area.clientHeight;

    const trail = trailRef.current;
    if (trail) {
      trail.innerHTML = "";
      const arr: Particle[] = [];
      for (let i = 0; i < N_TRAIL; i++) {
        const el = document.createElement("div");
        const tint = TINTS[i % TINTS.length];
        el.style.cssText = `position:absolute;left:0;top:0;width:6px;height:6px;border-radius:9999px;background:#fff;box-shadow:0 0 7px 1px ${tint};opacity:0;will-change:transform,opacity;`;
        trail.appendChild(el);
        arr.push({ el, x: 0, y: 0, life: 0 });
      }
      particles.current = arr;
    }

    let greet = 0;
    if (st.reduce) {
      st.x = (W - size) / 2;
      st.y = H - size;
      st.vx = 0; st.vy = 0;
      render();
      greet = window.setTimeout(() => { talk(GREETING); render(); }, 700);
    } else {
      st.x = (W - size) / 2 + (Math.random() - 0.5) * 60;
      st.y = -size - 20;
      st.vx = (Math.random() - 0.5) * 3;
      st.vy = 3;
      st.pending = "greet";
      render();
      start();
    }
    const ro = new ResizeObserver(() => {
      const a = areaRef.current; if (!a) return;
      st.x = Math.max(0, Math.min(st.x, a.clientWidth - size));
      if (!st.running && st.y > a.clientHeight - size) st.y = a.clientHeight - size;
      render();
    });
    ro.observe(area);
    return () => {
      ro.disconnect();
      cancelAnimationFrame(st.raf);
      window.clearTimeout(greet);
      st.running = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [size]);

  function onDown(e: React.PointerEvent) {
    const area = areaRef.current; if (!area) return;
    const st = s.current;
    (e.target as Element).setPointerCapture?.(e.pointerId);
    const r = area.getBoundingClientRect();
    st.dragging = true;
    st.moved = 0;
    st.grabX = e.clientX - r.left - st.x;
    st.grabY = e.clientY - r.top - st.y;
    st.lastX = e.clientX; st.lastY = e.clientY; st.lastT = e.timeStamp;
    st.vx = 0; st.vy = 0;
    setMsg("");
    if (!st.reduce) start();
  }
  function onMove(e: React.PointerEvent) {
    const st = s.current;
    if (!st.dragging) return;
    const area = areaRef.current; if (!area) return;
    const r = area.getBoundingClientRect();
    st.moved += Math.abs(e.clientX - st.lastX) + Math.abs(e.clientY - st.lastY);
    const dt = Math.max(8, e.timeStamp - st.lastT);
    st.vtx = ((e.clientX - st.lastX) / dt) * 15;
    st.vty = ((e.clientY - st.lastY) / dt) * 15;
    st.lastX = e.clientX; st.lastY = e.clientY; st.lastT = e.timeStamp;
    st.x = Math.max(0, Math.min(e.clientX - r.left - st.grabX, area.clientWidth - size));
    st.y = e.clientY - r.top - st.grabY;
    if (st.reduce) render();
  }
  function onUp() {
    const st = s.current;
    if (!st.dragging) return;
    st.dragging = false;
    const clamp = (v: number) => Math.max(-30, Math.min(30, v));
    if (st.moved < 6) {
      st.vy = -15 - Math.random() * 4;
      st.vx = (Math.random() - 0.5) * 8;
    } else {
      st.vx = clamp(st.vtx);
      st.vy = clamp(st.vty);
    }
    if (st.reduce) talk();
    else { st.pending = "line"; start(); }
  }

  return (
    <div className={`flex min-h-0 flex-col ${className}`}>
      <div
        ref={areaRef}
        className="relative min-h-[24rem] w-full flex-1 touch-none select-none overflow-hidden rounded-3xl ring-1 ring-white/10"
        style={{
          background:
            "radial-gradient(circle at 50% 0%, #0e2a4a, #07101d 70%), repeating-linear-gradient(0deg, transparent 0 22px, rgba(56,189,248,0.08) 22px 23px), repeating-linear-gradient(90deg, transparent 0 22px, rgba(56,189,248,0.08) 22px 23px)",
        }}
      >
        {/* 스캐너 점 그리드 (증거 분석 화면 느낌) */}
        <div
          className="pointer-events-none absolute inset-0 z-0 opacity-60"
          style={{ backgroundImage: "radial-gradient(rgba(125,211,252,0.35) 1.4px, transparent 1.6px)", backgroundSize: "44px 44px" }}
        />
        {/* 비네팅 */}
        <div className="pointer-events-none absolute inset-0 z-[1] shadow-[inset_0_0_150px_55px_rgba(0,0,0,0.55)]" />

        {/* 트레일 */}
        <div ref={trailRef} className="pointer-events-none absolute inset-0 z-[5]" />

        {/* 말풍선 */}
        <div ref={bubbleRef} className="pointer-events-none absolute left-0 top-0 z-30 will-change-transform">
          <div
            key={msgKey}
            className={`relative w-max max-w-[16rem] rounded-2xl border-[3px] border-[#2a2a33] bg-white px-4 py-2.5 text-center text-[0.92rem] font-extrabold leading-snug text-[#1f2430] shadow-[0_4px_0_rgba(42,42,51,0.9)] transition-opacity duration-200 ${
              msg ? "dev-bubble-pop opacity-100" : "opacity-0"
            }`}
          >
            {msg ? (
              <>
                {typed}
                {typed.length < msg.length && <span className="ml-0.5 animate-pulse text-[#1f2430]/50">▌</span>}
              </>
            ) : (
              " "
            )}
            <span className="absolute -bottom-[9px] left-1/2 h-3.5 w-3.5 -translate-x-1/2 rotate-45 border-b-[3px] border-r-[3px] border-[#2a2a33] bg-white" />
          </div>
        </div>

        {/* 광채 */}
        <div
          ref={glowRef}
          className="pointer-events-none absolute left-0 top-0 z-[8] rounded-full bg-brand-blue-light/40 blur-2xl will-change-transform"
          style={{ width: size * 1.4, height: size * 1.4 }}
        />

        {/* 캐릭터 */}
        <div
          ref={ballRef}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="button"
          tabIndex={0}
          aria-label="캐릭터 — 누르면 통통 튀고, 끌어서 던질 수 있어요"
          onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); poke(); } }}
          className="absolute left-0 top-0 z-10 cursor-grab overflow-hidden rounded-full bg-surface shadow-[0_0_26px_rgba(139,123,243,0.6)] ring-2 ring-white/70 will-change-transform active:cursor-grabbing"
          style={{ width: size, height: size, transformOrigin: "bottom center" }}
        >
          {imgError ? (
            <div className="flex h-full w-full items-center justify-center bg-brand-blue/20 text-3xl">🔍</div>
          ) : (
            <img src={avatarUrl} alt="캐릭터" draggable={false} onError={() => setImgError(true)} className="pointer-events-none h-full w-full object-cover" />
          )}
        </div>
      </div>
    </div>
  );
}
