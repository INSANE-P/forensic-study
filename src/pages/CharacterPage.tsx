// ──────────────────────────────────────────────────────────────────────────
// 내 캐릭터 — 등록 전엔 등록 안내/폼, 등록 후엔 놀이터 + 대시보드 + 자랑하기.
// 자랑하기는 카드 이미지를 미리보기로 보여준 뒤 저장/복사한다.
// ──────────────────────────────────────────────────────────────────────────
import { useRef, useState } from "react";
import { getIdentity, setIdentity, type Identity } from "@/lib/storage";
import { useGrowth } from "@/components/GrowthProvider";
import { makeShareCardBlob, copyImage, downloadBlob } from "@/lib/shareCard";
import CharacterStage from "@/components/CharacterStage";
import XpDashboard from "@/components/XpDashboard";
import EvolveModal from "@/components/EvolveModal";
import GrowthAvatar from "@/components/GrowthAvatar";

function avatarSrc(id: Identity): string | null {
  if (id.avatarUrl) return id.avatarUrl;
  if (id.github) return `https://github.com/${id.github}.png?size=200`;
  return null;
}
function displayName(id: Identity): string {
  return id.name?.trim() || id.github?.trim() || "내 캐릭터";
}

export default function CharacterPage() {
  const g = useGrowth();

  const [id, setId] = useState<Identity>(() => getIdentity());
  const [editing, setEditing] = useState(false);
  const [nameInput, setNameInput] = useState(id.name ?? "");
  const [avatarInput, setAvatarInput] = useState(id.avatarUrl ?? id.github ?? "");
  const [replay, setReplay] = useState(false);

  // 자랑 카드 미리보기
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);
  const shareBlob = useRef<Blob | null>(null);

  const configured = Boolean(id.name || id.github || id.avatarUrl);
  const src = avatarSrc(id);
  const name = displayName(id);
  const initial = name.charAt(0).toUpperCase();

  function save() {
    const v = avatarInput.trim();
    const next: Identity = {};
    const nm = nameInput.trim();
    if (nm) next.name = nm;
    if (v.startsWith("http")) next.avatarUrl = v;
    else if (v) next.github = v.replace(/^@/, "");
    setIdentity(next);
    setId(next);
    setEditing(false);
  }
  function clearIdentity() {
    setIdentity({});
    setId({});
    setNameInput("");
    setAvatarInput("");
  }

  async function openShare() {
    setGenerating(true);
    const b = await makeShareCardBlob({ name, initial, avatarSrc: src, level: g.level, tierName: g.tier.name, xp: g.xp, pctInStage: g.pctInStage, isMax: g.isMax });
    setGenerating(false);
    if (!b) {
      setShareMsg("카드 생성에 실패했어요");
      return;
    }
    shareBlob.current = b;
    setShareMsg(null);
    setShareUrl(URL.createObjectURL(b));
  }
  function closeShare() {
    if (shareUrl) URL.revokeObjectURL(shareUrl);
    setShareUrl(null);
    setShareMsg(null);
  }
  function flash(m: string) {
    setShareMsg(m);
    setTimeout(() => setShareMsg(null), 2200);
  }
  function doSave() {
    if (shareBlob.current) {
      const safe = (name || "내 캐릭터").replace(/[\\/:*?"<>|]/g, "").trim();
      downloadBlob(shareBlob.current, `${safe}의 성장 카드.png`);
      flash("이미지를 저장했어요!");
    }
  }
  async function doCopy() {
    if (shareBlob.current) flash((await copyImage(shareBlob.current)) ? "이미지를 복사했어요! 붙여넣기 해보세요" : "이 브라우저에선 복사가 안 돼요");
  }

  const inputCls = "w-full rounded-xl border border-border bg-surface px-3 py-2.5 text-sm text-foreground outline-none focus:border-brand-blue";

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">내 캐릭터</h1>
        <p className="mt-1 text-muted-strong">
          {configured ? "문제를 풀수록 함께 자라는 나만의 캐릭터예요. 쓰다듬어 주세요!" : "캐릭터를 등록하면 문제를 풀수록 함께 성장해요."}
        </p>
      </header>

      {!configured ? (
        /* 등록 전 — 등록 안내 + 폼 */
        <section className="card-soft rounded-3xl bg-surface p-6">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <GrowthAvatar src={null} initial="나" level={g.level} size={92} />
            <div className="flex-1">
              <h2 className="text-lg font-extrabold text-foreground">내 캐릭터를 등록해 주세요</h2>
              <p className="mt-1 text-sm text-muted-strong">닉네임과 사진(깃허브 아이디 또는 이미지 URL)을 등록하면 캐릭터가 생기고, 문제를 풀수록 등급이 올라요.</p>
            </div>
          </div>
          <div className="mt-5 space-y-2.5">
            <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="이름" className={inputCls} />
            <input value={avatarInput} onChange={(e) => setAvatarInput(e.target.value)} placeholder="깃허브 아이디 또는 이미지 URL" className={inputCls} />
            <button onClick={save} className="w-full rounded-xl bg-brand-blue py-2.5 text-sm font-extrabold text-white">캐릭터 등록</button>
          </div>
        </section>
      ) : (
        /* 등록 후 — 놀이터 + 액션 */
        <>
          <CharacterStage />

          <section className="card-soft rounded-3xl bg-surface p-5">
            <div className="flex flex-wrap items-center gap-2.5">
              <button onClick={() => setEditing((v) => !v)} className="rounded-2xl bg-brand-blue px-4 py-2 text-sm font-bold text-white">캐릭터 바꾸기</button>
              <button onClick={openShare} disabled={generating} className="rounded-2xl bg-surface-2 px-4 py-2 text-sm font-bold text-foreground hover:text-brand-blue disabled:opacity-60">
                {generating ? "카드 만드는 중…" : "자랑하기"}
              </button>
              <button onClick={() => setReplay(true)} disabled={g.level < 2} className="rounded-2xl bg-surface-2 px-4 py-2 text-sm font-bold text-foreground hover:text-brand-blue disabled:opacity-45">
                진화 연출 다시 보기
              </button>
              {!shareUrl && shareMsg && <span className="text-xs font-bold text-brand-green">{shareMsg}</span>}
            </div>

            {editing && (
              <div className="mt-3 space-y-2 rounded-2xl bg-surface-2 p-3">
                <input value={nameInput} onChange={(e) => setNameInput(e.target.value)} placeholder="이름" className={inputCls} />
                <input value={avatarInput} onChange={(e) => setAvatarInput(e.target.value)} placeholder="깃허브 아이디 또는 이미지 URL" className={inputCls} />
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs text-muted">이 이미지가 등급 프레임과 함께 성장해요.</span>
                  <div className="flex shrink-0 items-center gap-2">
                    <button onClick={clearIdentity} className="rounded-xl bg-surface px-3 py-1.5 text-sm font-bold text-muted-strong hover:text-brand-red">기본으로 되돌리기</button>
                    <button onClick={save} className="rounded-xl bg-brand-blue px-4 py-1.5 text-sm font-bold text-white">저장</button>
                  </div>
                </div>
              </div>
            )}
          </section>
        </>
      )}

      {/* 경험치 대시보드 */}
      <XpDashboard />

      {/* 자랑 카드 미리보기 */}
      {shareUrl && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-6 backdrop-blur-sm" onClick={closeShare}>
          <div className="w-full max-w-sm rounded-3xl bg-surface p-5 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-base font-extrabold text-foreground">자랑 카드</h3>
            <p className="mb-3 mt-0.5 text-xs text-muted">이 이미지를 저장하거나 복사해 친구에게 공유해 보세요.</p>
            <img src={shareUrl} alt="성장 카드 미리보기" className="mx-auto w-56 rounded-2xl shadow-md" />
            {shareMsg && <p className="mt-3 text-center text-xs font-bold text-brand-green">{shareMsg}</p>}
            <div className="mt-4 flex gap-2">
              <button onClick={doSave} className="flex-1 rounded-xl bg-brand-blue py-2.5 text-sm font-bold text-white">이미지 저장</button>
              <button onClick={doCopy} className="flex-1 rounded-xl bg-surface-2 py-2.5 text-sm font-bold text-foreground hover:text-brand-blue">이미지 복사</button>
            </div>
            <button onClick={closeShare} className="mt-2 w-full py-2 text-sm font-semibold text-muted hover:text-foreground">닫기</button>
          </div>
        </div>
      )}

      {/* 진화 다시 보기 */}
      {replay && (
        <EvolveModal fromLevel={Math.max(1, g.level - 1)} toLevel={g.level} name={name} avatarSrc={src} initial={initial} onClose={() => setReplay(false)} />
      )}
    </div>
  );
}
