import { useState } from "react";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore } from "../lib/scoring";
import { caseLabel } from "../lib/caseLabels";
import type { Household } from "../lib/types";
import RiskBadge from "./RiskBadge";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

// 잔여 고위험 후보 리스트 — 점수순, "등록 외만" 필터(plan 5.4).
export default function CandidateList({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const [onlyRegOut, setOnlyRegOut] = useState(false);

  const list = RESIDUAL.filter((h) => (onlyRegOut ? !h.registeredAlone : true)).sort(
    (a, b) => sc(b) - sc(a)
  );

  return (
    <div className="rounded-xl border border-slate-200 bg-white">
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2.5">
        <h4 className="text-sm font-bold text-slate-700">
          고위험 후보 ({list.length})
        </h4>
        <label className="flex cursor-pointer items-center gap-1.5 text-xs text-slate-600">
          <input
            type="checkbox"
            checked={onlyRegOut}
            onChange={(e) => setOnlyRegOut(e.target.checked)}
            className="accent-brand-600"
          />
          등록 외 대상만
        </label>
      </div>
      <div className="max-h-[28rem] divide-y divide-slate-50 overflow-auto">
        {list.map((h) => {
          const cl = caseLabel(h.caseType);
          return (
            <button
              key={h.id}
              onClick={() => onSelect(h.id)}
              className={`flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm transition-colors ${
                h.id === selectedId ? "bg-brand-50" : "hover:bg-slate-50"
              }`}
            >
              <span className="tabular-nums text-lg font-bold text-slate-800">
                {sc(h)}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <span className="font-mono text-xs text-slate-500">{h.id}</span>
                  <span className="text-xs text-slate-400">{h.dong}</span>
                  {!h.registeredAlone && (
                    <span className="rounded bg-slate-100 px-1 text-[10px] text-slate-500">
                      등록외
                    </span>
                  )}
                </div>
                {cl && (
                  <span className="text-[11px] font-semibold text-brand-600">
                    {cl.tag} · {cl.full}
                  </span>
                )}
              </div>
              <RiskBadge score={sc(h)} size="sm" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
