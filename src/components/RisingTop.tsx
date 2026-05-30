import { HOUSEHOLDS } from "../lib/data";
import { weeklyDelta } from "../lib/history";
import { computeScore } from "../lib/scoring";
import type { Household } from "../lib/types";
import { TrendingUp } from "lucide-react";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

const RISING = RESIDUAL.map((h) => ({ h, delta: weeklyDelta(h) }))
  .filter((x) => x.delta > 0)
  .sort((a, b) => b.delta - a.delta)
  .slice(0, 5);

// 이번 주 급상승 TOP — 상승 추세는 개입 우선순위를 올린다 (plan 5.4).
export default function RisingTop({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-1.5 border-b border-slate-100 px-4 py-3 card-title">
        <TrendingUp size={16} className="text-red-500" />
        이번 주 급상승 TOP
      </div>
      <div className="divide-y divide-slate-100">
        {RISING.map(({ h, delta }) => (
          <button
            key={h.id}
            onClick={() => onSelect(h.id)}
            className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
              h.id === selectedId
                ? "bg-brand-50 ring-1 ring-inset ring-brand-200"
                : "hover:bg-slate-50"
            }`}
          >
            <span className="font-mono text-xs text-slate-500">{h.id}</span>
            <span className="text-xs text-slate-400">{h.dong}</span>
            <span className="ml-auto tabular-nums text-slate-600">{sc(h)}점</span>
            <span className="chip bg-red-100 text-red-700">+{delta}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
