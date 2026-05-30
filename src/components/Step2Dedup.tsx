import { useState } from "react";
import { HOUSEHOLDS } from "../lib/data";
import { splitByHaengbok } from "../lib/dedup";
import { computeScore, riskBand, BAND_STYLES } from "../lib/scoring";
import SimBadge from "./SimBadge";
import { Play, RotateCcw } from "lucide-react";

const result = splitByHaengbok(HOUSEHOLDS);

// 2단계 — 통합·정합 + 행복e음 중복제거. 보완 레이어를 한눈에(5-A.3).
export default function Step2Dedup() {
  const [applied, setApplied] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => setApplied((v) => !v)}
          className={applied ? "btn-secondary" : "btn-primary"}
        >
          {applied ? <RotateCcw size={16} /> : <Play size={16} />}
          {applied ? "되돌리기" : "중복제거 실행"}
        </button>
        <SimBadge
          label="행복e음 플래그 = 시뮬레이션"
          title="실서비스에선 행복e음 연동으로 기포착 여부를 받지만, 데모에서는 우리가 임의 설정한 플래그입니다."
        />
      </div>

      {/* 카운터 */}
      <div className="grid grid-cols-3 gap-3">
        <Counter label="전체 가구" value={result.total} tone="neutral" />
        <Counter
          label="행복e음 기포착 (제외)"
          value={result.alreadyFound.length}
          tone={applied ? "muted" : "neutral"}
        />
        <Counter
          label="잔여 후보 (우리 분석 대상)"
          value={applied ? result.residual.length : result.total}
          tone={applied ? "brand" : "neutral"}
        />
      </div>

      {/* 가구 그리드 */}
      <div className="card card-pad">
        <div className="mb-3 text-sm text-slate-600">
          {applied ? (
            <>
              행복e음이 이미 포착한{" "}
              <span className="font-bold text-slate-500">
                {result.alreadyFound.length}건
              </span>
              을 제외하고,{" "}
              <span className="font-bold text-brand-700">
                잔여 {result.residual.length}건
              </span>
              에만 우리 분석을 적용합니다.
            </>
          ) : (
            <>전체 {result.total}가구. '중복제거 실행'을 누르면 기포착분이 빠집니다.</>
          )}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {HOUSEHOLDS.map((h) => {
            const removed = applied && h.haengbokFlagged;
            let cls = "bg-brand-200";
            if (applied) {
              if (h.haengbokFlagged) {
                cls = "bg-slate-200";
              } else {
                cls = BAND_STYLES[riskBand(computeScore(h.signals, h.profileGroup).score)].bar;
              }
            }
            return (
              <div
                key={h.id}
                title={`${h.id}${h.haengbokFlagged ? " · 행복e음 기포착" : " · 잔여"}`}
                className={`h-5 w-5 rounded-[5px] shadow-sm ring-1 ring-inset ring-black/5 transition-all duration-500 ${cls} ${
                  removed ? "scale-75 opacity-25" : "opacity-100"
                }`}
              />
            );
          })}
        </div>
        {applied && (
          <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-slate-100 pt-2 text-xs text-slate-500">
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-slate-200 opacity-40" /> 기포착(제외)
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-red-500" /> 잔여 고위험
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-amber-500" /> 잔여 주의
            </span>
            <span className="inline-flex items-center gap-1">
              <span className="h-3 w-3 rounded-sm bg-slate-400" /> 잔여 관찰
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function Counter({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "neutral" | "muted" | "brand";
}) {
  const toneCls =
    tone === "brand"
      ? "border-brand-300 bg-brand-50 text-brand-700 shadow-card"
      : tone === "muted"
        ? "border-slate-200 bg-slate-50 text-slate-400"
        : "border-slate-200 bg-white text-slate-700 shadow-card";
  return (
    <div
      className={`rounded-xl border p-3.5 text-center transition-all duration-500 ${toneCls}`}
    >
      <div className="text-3xl font-bold tabular-nums leading-none">{value}</div>
      <div className="mt-1.5 text-xs font-medium">{label}</div>
    </div>
  );
}
