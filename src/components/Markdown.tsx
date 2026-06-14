// ──────────────────────────────────────────────────────────────────────────
// 경량 마크다운 렌더러
// 지원: **굵게**, `인라인코드`, ```코드블록```, 표(| ... |), 줄바꿈, 리스트(- / 1.),
//       그리고 콜아웃 한 줄: [정의] [암기] [시험] [주의] [팁] 텍스트
// (외부 라이브러리 없이 데이터에 쓰인 문법만 처리해 번들을 가볍게 유지)
// ──────────────────────────────────────────────────────────────────────────
import { Fragment, type ReactNode } from "react";

/** 인라인: **굵게**, `코드` 처리 (포렌식은 수식이 없어 $ 는 NTFS 메타파일명 등 리터럴로 둔다) */
function renderInline(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g;
  const parts = text.split(regex);
  parts.forEach((part, i) => {
    if (!part) return;
    if (part.startsWith("**") && part.endsWith("**")) {
      // 굵게 내부의 수식·코드도 렌더되도록 재귀 처리
      nodes.push(<strong key={i}>{renderInline(part.slice(2, -2))}</strong>);
    } else if (part.startsWith("`") && part.endsWith("`")) {
      nodes.push(
        <code
          key={i}
          className="rounded bg-brand-blue-bg px-1.5 py-0.5 font-mono text-[0.85em] text-brand-ink dark:bg-brand-blue/20 dark:text-brand-blue-lighter"
        >
          {part.slice(1, -1)}
        </code>,
      );
    } else {
      nodes.push(<Fragment key={i}>{part}</Fragment>);
    }
  });
  return nodes;
}

// 콜아웃 스타일 (라이트/다크 모두 대비 확보)
const CALLOUT: Record<string, { label: string; cls: string }> = {
  정의: {
    label: "정의",
    cls: "border-brand-blue/40 bg-brand-blue-bg/70 text-brand-ink dark:bg-brand-blue/15 dark:text-blue-100",
  },
  암기: {
    label: "암기법",
    cls: "border-violet-300 bg-violet-50 text-violet-900 dark:border-violet-500/40 dark:bg-violet-500/15 dark:text-violet-100",
  },
  시험: {
    label: "시험 포인트",
    cls: "border-amber-300 bg-amber-50 text-amber-900 dark:border-amber-500/40 dark:bg-amber-500/15 dark:text-amber-100",
  },
  주의: {
    label: "주의",
    cls: "border-rose-300 bg-rose-50 text-rose-900 dark:border-rose-500/40 dark:bg-rose-500/15 dark:text-rose-100",
  },
  팁: {
    label: "TIP",
    cls: "border-emerald-300 bg-emerald-50 text-emerald-900 dark:border-emerald-500/40 dark:bg-emerald-500/15 dark:text-emerald-100",
  },
};

function renderTable(lines: string[], key: number): ReactNode {
  const splitRow = (line: string) =>
    line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
  const header = splitRow(lines[0]);
  const bodyLines = lines.slice(2);
  return (
    <div key={key} className="my-3 overflow-x-auto rounded-xl border border-border">
      <table className="w-full border-collapse text-sm">
        <thead>
          <tr>
            {header.map((h, i) => (
              <th
                key={i}
                className="border-b-2 border-border bg-surface-2 px-3 py-2 text-left font-bold text-foreground"
              >
                {renderInline(h)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {bodyLines.map((line, r) => (
            <tr key={r} className="odd:bg-surface even:bg-surface-2/50">
              {splitRow(line).map((c, i) => (
                <td
                  key={i}
                  className="border-t border-border px-3 py-2 align-top text-muted-strong"
                >
                  {renderInline(c)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 한 줄 인라인 렌더 (굵게·코드·수식). 보기·짧은 텍스트용 */
export function Inline({ content }: { content: string }) {
  return <>{renderInline(content)}</>;
}

export default function Markdown({
  content,
  className = "",
}: {
  content: string;
  className?: string;
}) {
  const lines = content.split("\n");
  const blocks: ReactNode[] = [];
  let i = 0;
  let key = 0;

  while (i < lines.length) {
    const line = lines[i];
    const trimmed = line.trim();

    // 콜아웃: [정의] [암기] [시험] [주의] [팁]
    const callout = trimmed.match(/^\[(정의|암기|시험|주의|팁)\]\s*(.*)$/);
    if (callout) {
      const { label, cls } = CALLOUT[callout[1]];
      blocks.push(
        <div key={key++} className={`my-3 rounded-xl border px-4 py-3 text-sm leading-relaxed ${cls}`}>
          <span className="mr-1.5 rounded-md bg-black/5 px-1.5 py-0.5 text-[0.7rem] font-extrabold dark:bg-white/10">
            {label}
          </span>
          {renderInline(callout[2])}
        </div>,
      );
      i++;
      continue;
    }

    // 코드블록 ```
    if (trimmed.startsWith("```")) {
      const code: string[] = [];
      i++;
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        code.push(lines[i]);
        i++;
      }
      i++;
      blocks.push(
        <pre
          key={key++}
          className="code-block my-3 overflow-x-auto rounded-xl border border-border bg-[#0d1117] p-3.5 text-[#c9d1d9]"
        >
          <code>{code.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // 표
    if (trimmed.startsWith("|")) {
      const tbl: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("|")) {
        tbl.push(lines[i]);
        i++;
      }
      if (tbl.length >= 2) {
        blocks.push(renderTable(tbl, key++));
        continue;
      }
    }

    // 순서 리스트 (1. 2. ...)
    if (/^\d+\.\s/.test(trimmed)) {
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s/, ""));
        i++;
      }
      blocks.push(
        <ol key={key++} className="my-2 list-decimal space-y-1 pl-5 marker:font-bold marker:text-muted">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    // 비순서 리스트 (-)
    if (trimmed.startsWith("- ")) {
      const items: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith("- ")) {
        items.push(lines[i].trim().slice(2));
        i++;
      }
      blocks.push(
        <ul key={key++} className="my-2 list-disc space-y-1 pl-5 marker:text-brand-blue">
          {items.map((it, idx) => (
            <li key={idx}>{renderInline(it)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    // 소제목 (### 또는 #### )
    if (/^#{2,4}\s/.test(trimmed)) {
      blocks.push(
        <h5 key={key++} className="mt-3 mb-1 text-sm font-extrabold text-foreground">
          {renderInline(trimmed.replace(/^#{2,4}\s/, ""))}
        </h5>,
      );
      i++;
      continue;
    }

    if (trimmed === "") {
      i++;
      continue;
    }

    blocks.push(
      <p key={key++} className="my-1.5">
        {renderInline(line)}
      </p>,
    );
    i++;
  }

  return <div className={`prose-answer ${className}`}>{blocks}</div>;
}
