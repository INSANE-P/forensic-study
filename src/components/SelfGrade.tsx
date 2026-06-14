import type { Grade } from "@/lib/storage";
import { GRADE_LABEL } from "@/lib/ui";

const ORDER: Grade[] = ["correct", "unsure", "wrong"];

const ACTIVE: Record<Grade, string> = {
  correct: "bg-brand-green text-white",
  unsure: "bg-brand-amber text-white",
  wrong: "bg-brand-red text-white",
};

// 서술형 셀프 채점 버튼 그룹 (맞음 / 애매 / 틀림)
export default function SelfGrade({
  value,
  onChange,
}: {
  value?: Grade;
  onChange: (g: Grade) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-bold text-muted-strong">채점</span>
      <div className="flex gap-1.5">
        {ORDER.map((g) => {
          const active = value === g;
          return (
            <button
              key={g}
              onClick={() => onChange(g)}
              className={`rounded-xl px-3.5 py-2 text-sm font-bold transition-all active:scale-95 ${
                active ? ACTIVE[g] : "bg-surface-2 text-muted-strong hover:text-brand-blue"
              }`}
            >
              {GRADE_LABEL[g]}
            </button>
          );
        })}
      </div>
    </div>
  );
}
