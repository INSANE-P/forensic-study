import { useState } from "react";
import { TERMS, COMPARISONS, CONCEPT_CARDS } from "@/data/concepts";
import Markdown, { Inline } from "@/components/Markdown";

type Tab = "terms" | "compare" | "cards";

export default function ConceptsPage() {
  const [tab, setTab] = useState<Tab>("terms");
  const [q, setQ] = useState("");

  const terms = TERMS.filter((t) => (t.term + (t.full ?? "") + t.desc).toLowerCase().includes(q.toLowerCase()));

  const TABS: { key: Tab; label: string }[] = [
    { key: "terms", label: `용어집 (${TERMS.length})` },
    { key: "compare", label: `비교표 (${COMPARISONS.length})` },
    { key: "cards", label: `개념 카드 (${CONCEPT_CARDS.length})` },
  ];

  return (
    <div className="space-y-5">
      <header>
        <h1 className="text-[1.6rem] font-extrabold tracking-tight text-foreground sm:text-2xl">개념 정리</h1>
        <p className="mt-1 text-muted-strong">헷갈리는 용어와 비교 포인트를 빠르게 점검해요.</p>
      </header>

      <div className="flex flex-wrap gap-1.5">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-xl px-3.5 py-1.5 text-sm font-bold transition-colors ${tab === t.key ? "bg-brand-blue text-white" : "bg-surface-2 text-muted-strong hover:text-brand-blue"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "terms" && (
        <>
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="용어 검색" className="w-full rounded-2xl border border-border bg-surface px-4 py-2.5 text-sm text-foreground outline-none focus:border-brand-blue" />
          <div className="grid gap-3 sm:grid-cols-2">
            {terms.map((t) => (
              <div key={t.term} className="card-soft rounded-2xl bg-surface p-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-base font-extrabold text-foreground"><Inline content={t.term} /></span>
                  {t.full && <span className="text-xs font-medium text-muted"><Inline content={t.full} /></span>}
                </div>
                <p className="mt-1 text-sm text-muted-strong"><Inline content={t.desc} /></p>
              </div>
            ))}
          </div>
        </>
      )}

      {tab === "compare" && (
        <div className="space-y-4">
          {COMPARISONS.map((c) => (
            <section key={c.id} className="card-soft rounded-3xl bg-surface p-5 sm:p-6">
              <h2 className="mb-2 text-lg font-extrabold text-foreground"><Inline content={c.title} /></h2>
              <div className="prose-answer text-foreground"><Markdown content={c.body} /></div>
            </section>
          ))}
        </div>
      )}

      {tab === "cards" && (
        <div className="space-y-4">
          {CONCEPT_CARDS.map((c) => (
            <section key={c.id} className="card-soft rounded-3xl bg-surface p-5 sm:p-6">
              <h2 className="mb-2 text-lg font-extrabold text-foreground"><Inline content={c.title} /></h2>
              <div className="prose-answer text-foreground"><Markdown content={c.body} /></div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
