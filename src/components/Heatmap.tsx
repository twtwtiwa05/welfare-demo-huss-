import { HOUSEHOLDS } from "../lib/data";
import { computeScore, riskBand, BAND_STYLES } from "../lib/scoring";
import type { Household } from "../lib/types";

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

export default function Heatmap() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4">
      <h4 className="mb-2 text-sm font-bold text-slate-700">
        행정동별 잔여 위험 밀집도
      </h4>
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {DONG_STATS.map((d) => {
          const band = riskBand(d.avg);
          const s = BAND_STYLES[band];
          return (
            <div
              key={d.dong}
              className={`rounded-lg border p-3 text-center ${s.bg} ${s.border}`}
            >
              <div className="text-sm font-bold text-slate-700">{d.dong}</div>
              <div className={`text-2xl font-bold tabular-nums ${s.text}`}>
                {d.avg}
              </div>
              <div className="text-[11px] text-slate-500">
                {d.count}가구 · 고위험 {d.highCount}
              </div>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-400">
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
    </div>
  );
}
