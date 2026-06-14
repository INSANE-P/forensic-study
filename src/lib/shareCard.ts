// ──────────────────────────────────────────────────────────────────────────
// 자랑용 PNG 카드 생성 + 공유 헬퍼
//  - canvas로 티어 테마 카드를 그려 PNG Blob 생성.
//  - 공유 옵션: 이미지 저장 / 이미지 복사(클립보드) / 링크 복사 / 네이티브 공유.
//  - 외부 아바타가 CORS로 canvas를 오염시키면 아바타 없이 다시 그린다.
// ──────────────────────────────────────────────────────────────────────────
import { tierAt } from "./growth";

export type ShareInfo = {
  name: string;
  initial: string;
  avatarSrc?: string | null;
  level: number;
  tierName: string;
  xp: number;
  pctInStage: number;
  isMax: boolean;
};

export const SHARE_URL = "https://insane-p.github.io/forensic-study/";

function loadImage(src: string, cors: boolean): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (cors) img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function star(ctx: CanvasRenderingContext2D, cx: number, cy: number, r: number) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const rad = i % 2 === 0 ? r : r * 0.42;
    const a = (Math.PI / 5) * i - Math.PI / 2;
    const x = cx + rad * Math.cos(a);
    const y = cy + rad * Math.sin(a);
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

async function renderCard(info: ShareInfo, avatarImg: HTMLImageElement | null): Promise<Blob | null> {
  const W = 760;
  const H = 940;
  const t = tierAt(info.level);
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 배경
  const bg = ctx.createLinearGradient(0, 0, 0, H);
  bg.addColorStop(0, "#0b1024");
  bg.addColorStop(1, "#141a30");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, W, H);

  // 은은한 티어 글로우
  const glow = ctx.createRadialGradient(W / 2, 360, 40, W / 2, 360, 380);
  glow.addColorStop(0, `${t.color}55`);
  glow.addColorStop(1, "transparent");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);

  const cx = W / 2;
  ctx.textAlign = "center";

  // 상단 라벨
  ctx.fillStyle = "rgba(255,255,255,0.55)";
  ctx.font = "700 22px sans-serif";
  ctx.fillText("디지털 포렌식 · 성장 카드", cx, 86);

  // 아바타 프레임(티어 그라데이션 링)
  const cyA = 330;
  const r = 132;
  const ring = ctx.createLinearGradient(cx - r, cyA - r, cx + r, cyA + r);
  ring.addColorStop(0, t.accent);
  ring.addColorStop(1, t.color);
  ctx.fillStyle = ring;
  ctx.beginPath();
  ctx.arc(cx, cyA, r + 10, 0, Math.PI * 2);
  ctx.fill();

  // 아바타
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cyA, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.fillStyle = "#0b1024";
  ctx.fillRect(cx - r, cyA - r, r * 2, r * 2);
  if (avatarImg) {
    const s = Math.max((r * 2) / avatarImg.width, (r * 2) / avatarImg.height);
    const dw = avatarImg.width * s;
    const dh = avatarImg.height * s;
    ctx.drawImage(avatarImg, cx - dw / 2, cyA - dh / 2, dw, dh);
  } else {
    ctx.fillStyle = `${t.color}33`;
    ctx.fillRect(cx - r, cyA - r, r * 2, r * 2);
    ctx.fillStyle = "#fff";
    ctx.font = "800 130px sans-serif";
    ctx.textBaseline = "middle";
    ctx.fillText(info.initial, cx, cyA + 4);
    ctx.textBaseline = "alphabetic";
  }
  ctx.restore();

  // 엠블럼(별) — 하단 중앙
  const ey = cyA + r - 6;
  ctx.fillStyle = t.color;
  ctx.strokeStyle = "rgba(255,255,255,0.85)";
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.arc(cx, ey, 34, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = "#fff";
  star(ctx, cx, ey, 16);
  ctx.fill();

  // 이름
  ctx.fillStyle = "#ffffff";
  ctx.font = "800 46px sans-serif";
  ctx.fillText(info.name, cx, 560);

  // 등급
  ctx.fillStyle = t.accent;
  ctx.font = "800 34px sans-serif";
  ctx.fillText(`Lv${info.level} · ${info.tierName}`, cx, 610);

  // XP 바
  const barW = 480;
  const barX = cx - barW / 2;
  const barY = 666;
  ctx.fillStyle = "rgba(255,255,255,0.14)";
  roundRect(ctx, barX, barY, barW, 20, 10);
  ctx.fill();
  const grad = ctx.createLinearGradient(barX, 0, barX + barW, 0);
  grad.addColorStop(0, t.accent);
  grad.addColorStop(1, t.color);
  ctx.fillStyle = grad;
  roundRect(ctx, barX, barY, Math.max(20, (barW * (info.isMax ? 100 : info.pctInStage)) / 100), 20, 10);
  ctx.fill();

  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = "600 26px sans-serif";
  ctx.fillText(info.isMax ? `최고 등급 달성! · 누적 ${info.xp} XP` : `누적 경험치 ${info.xp} XP`, cx, 740);

  // 푸터
  ctx.fillStyle = "rgba(255,255,255,0.45)";
  ctx.font = "600 24px sans-serif";
  ctx.fillText("insane-p.github.io/forensic-study", cx, 866);

  return await new Promise<Blob | null>((resolve, reject) => {
    try {
      canvas.toBlob((b) => resolve(b), "image/png");
    } catch (e) {
      reject(e);
    }
  });
}

// 외부 이미지는 CORS 헤더가 없으면 canvas에서 못 쓰므로(깃허브 아바타 등),
// CORS를 열어주는 이미지 프록시(weserv)를 경유해 불러온다.
function proxied(u: string): string | null {
  if (u.startsWith("data:")) return null;
  const clean = u.replace(/^https?:\/\//i, "");
  return `https://images.weserv.nl/?url=${encodeURIComponent(clean)}`;
}

export async function makeShareCardBlob(info: ShareInfo): Promise<Blob | null> {
  // 후보 순서: ① 직접(CORS 허용/데이터 URL) → ② 프록시 경유 → ③ 아바타 없이
  const candidates: (string | null)[] = [];
  if (info.avatarSrc) {
    candidates.push(info.avatarSrc);
    candidates.push(proxied(info.avatarSrc));
  }
  for (const url of candidates) {
    if (!url) continue;
    const img = await loadImage(url, true).catch(() => null);
    if (!img) continue;
    try {
      const b = await renderCard(info, img);
      if (b) return b; // toBlob 성공 = 오염 없음 → 아바타 포함됨
    } catch {
      /* canvas 오염 → 다음 후보 */
    }
  }
  try {
    return await renderCard(info, null);
  } catch {
    return null;
  }
}

// ── 공유 동작들 ─────────────────────────────────────────────────────────────
export function canNativeShare(): boolean {
  const nav = navigator as Navigator & { canShare?: (d: { files: File[] }) => boolean };
  try {
    const probe = new File([new Blob()], "x.png", { type: "image/png" });
    return typeof nav.canShare === "function" && nav.canShare({ files: [probe] });
  } catch {
    return false;
  }
}

export async function nativeShareCard(blob: Blob, text: string): Promise<boolean> {
  const nav = navigator as Navigator & { share?: (d: { files?: File[]; title?: string; text?: string }) => Promise<void> };
  if (!nav.share) return false;
  try {
    await nav.share({ files: [new File([blob], "df-growth.png", { type: "image/png" })], title: "디지털 포렌식 공부", text });
    return true;
  } catch {
    return false;
  }
}

export async function copyImage(blob: Blob): Promise<boolean> {
  try {
    const Item = (window as unknown as { ClipboardItem?: typeof ClipboardItem }).ClipboardItem;
    if (!Item || !navigator.clipboard?.write) return false;
    await navigator.clipboard.write([new Item({ "image/png": blob })]);
    return true;
  } catch {
    return false;
  }
}

export function downloadBlob(blob: Blob, filename = "ml-growth.png") {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyLink(): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(SHARE_URL);
    return true;
  } catch {
    return false;
  }
}
