import { useState } from "react";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore, riskBand, BAND_STYLES } from "../lib/scoring";
import type { Household } from "../lib/types";
import RegionMap from "./RegionMap";
import { Maximize2 } from "lucide-react";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

// 행정동별 잔여 고위험 밀집도 (div 그리드, Recharts 불필요).
interface DongStat {
  dong: string;
  avg: number;
  count: number;
  highCount: number;
}

const DONG_STATS: DongStat[] = Object.values(
  RESIDUAL.reduce<Record<string, Household[]>>((acc, h) => {
    (acc[h.dong] ??= []).push(h);
    return acc;
  }, {})
)
  .map((list) => {
    const scores = list.map(sc);
    const avg = Math.round(scores.reduce((a, b) => a + b, 0) / list.length);
    return {
      dong: list[0].dong,
      avg,
      count: list.length,
      highCount: scores.filter((s) => s >= 65).length,
    };
  })
  .sort((a, b) => b.avg - a.avg);

export default function Heatmap({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [mapOpen, setMapOpen] = useState(false);

  return (
    <div className="card card-pad">
      <div className="mb-3 flex items-center justify-between">
        <h4 className="card-title">행정동별 잔여 위험 밀집도</h4>
        <button
          onClick={() => setMapOpen(true)}
          className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-600 transition-all duration-200 hover:border-brand-300 hover:text-brand-700 hover:shadow-sm active:translate-y-px"
        >
          <Maximize2 size={13} /> 지도로 보기
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6">
        {DONG_STATS.map((d) => {
          const band = riskBand(d.avg);
          const s = BAND_STYLES[band];
          return (
            <button
              key={d.dong}
              onClick={() => setMapOpen(true)}
              title={`${d.dong} 지도에서 보기`}
              className={`rounded-xl border p-3 text-center shadow-card transition-transform duration-200 hover:-translate-y-0.5 hover:shadow-card-hover ${s.bg} ${s.border}`}
            >
              <div className="text-sm font-bold text-slate-700">{d.dong}</div>
              <div className={`mt-0.5 text-2xl font-bold tabular-nums leading-none ${s.text}`}>
                {d.avg}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                {d.count}가구 · 고위험 {d.highCount}
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 border-t border-slate-100 pt-2.5 text-[11px] text-slate-400">
        <span>색 = 동별 평균 위험 점수 구간</span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-red-500" /> 고위험
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-amber-500" /> 주의
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-sm bg-slate-400" /> 관찰
        </span>
      </div>

      <RegionMap
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        onSelect={onSelect}
      />
    </div>
  );
}
