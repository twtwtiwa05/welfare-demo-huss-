import { ChevronRight, Check } from "lucide-react";

export interface StepDef {
  n: number;
  title: string;
}

// 단계 진행 바 (5-A.1) — 현재 단계 진청 / 지난 단계 연청+체크 / 미래 회색.
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
    <nav className="scroll-slim flex items-center gap-1 overflow-x-auto rounded-xl border border-slate-200/80 bg-white/70 p-1.5 shadow-card">
      {steps.map((s, i) => {
        const state =
          s.n === current ? "current" : s.n < current ? "done" : "future";
        const cls =
          state === "current"
            ? "bg-brand-600 text-white shadow-sm ring-1 ring-brand-700/20"
            : state === "done"
              ? "bg-brand-50 text-brand-700 hover:bg-brand-100"
              : "bg-transparent text-slate-400 hover:bg-slate-50";
        return (
          <div key={s.n} className="flex items-center">
            <button
              onClick={() => onSelect(s.n)}
              aria-current={state === "current" ? "step" : undefined}
              className={`flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-2 text-sm font-semibold transition-all duration-300 ${cls}`}
            >
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold transition-colors duration-300 ${
                  state === "current"
                    ? "bg-white/20 text-white"
                    : state === "done"
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-400"
                }`}
              >
                {state === "done" ? <Check size={13} strokeWidth={3} /> : s.n}
              </span>
              {s.title}
            </button>
            {i < steps.length - 1 && (
              <ChevronRight
                size={16}
                className={`mx-0.5 shrink-0 transition-colors duration-300 ${
                  s.n < current ? "text-brand-300" : "text-slate-300"
                }`}
                aria-hidden
              />
            )}
          </div>
        );
      })}
    </nav>
  );
}
