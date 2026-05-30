import { ChevronRight } from "lucide-react";

export interface StepDef {
  n: number;
  title: string;
}

// 단계 진행 바 (5-A.1) — 현재 단계 진청 / 지난 단계 연청 / 미래 회색.
// "지금 어디인지"가 항상 보인다. 클릭으로 점프도 허용(발표 유연성).
export default function StepProgressBar({
  steps,
  current,
  onSelect,
}: {
  steps: StepDef[];
  current: number;
  onSelect: (n: number) => void;
}) {
  return (
    <nav className="flex items-center gap-1 overflow-x-auto pb-1">
      {steps.map((s, i) => {
        const state =
          s.n === current ? "current" : s.n < current ? "done" : "future";
        const cls =
          state === "current"
            ? "bg-brand-600 text-white border-brand-600 shadow-sm"
            : state === "done"
              ? "bg-brand-50 text-brand-700 border-brand-200"
              : "bg-white text-slate-400 border-slate-200";
        return (
          <div key={s.n} className="flex items-center">
            <button
              onClick={() => onSelect(s.n)}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg border px-3 py-2 text-sm font-semibold transition-colors duration-300 ${cls}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs ${
                  state === "current"
                    ? "bg-white/20"
                    : state === "done"
                      ? "bg-brand-100"
                      : "bg-slate-100"
                }`}
              >
                {s.n}
              </span>
              {s.title}
            </button>
            {i < steps.length - 1 && (
              <ChevronRight
                size={18}
                className="mx-0.5 shrink-0 text-slate-300"
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
