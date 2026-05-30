import { HOUSEHOLDS } from "../lib/data";
import { computeScore } from "../lib/scoring";
import { combinationMethod } from "../lib/priority";
import { generateReason } from "../lib/reason";
import { caseLabel } from "../lib/caseLabels";
import type { Household } from "../lib/types";
import RiskBadge from "./RiskBadge";
import { TrendingUp, ArrowDown } from "lucide-react";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

// 최근 한 주 점수 상승폭 (history 마지막 두 주 차이)
function weeklyDelta(h: Household): number {
  const n = h.history.length;
  if (n < 2) return 0;
  return h.history[n - 1].score - h.history[n - 2].score;
}

// 발굴 명단 상위 케이스 (조합 방식 발굴분, 점수순)
const SHORTLIST = RESIDUAL.filter((h) => combinationMethod(h))
  .sort((a, b) => sc(b) - sc(a))
  .slice(0, 7);

// ★ ③ 활용도 클라이맥스 (5-A.2의 F). 같은 명단, 다른 전달.
// 좌: 행복e음식 무미건조한 명단(점수만). 우: 근거·권고·급상승이 붙은 행동 가능한 카드.
export default function BeforeAfterView() {
  return (
    <div className="space-y-4">
      <div className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm text-slate-600">
        <span className="font-bold text-brand-700">③ 활용도</span> — 발굴 명단은
        이미 존재합니다. 문제는 인력이 부족한 현장에서 ‘이 목록 중 누구를, 왜,
        먼저’ 봐야 하는지가 빠져 있다는 것입니다. <b>데이터는 똑같습니다. 바뀌는
        건 담당자가 행동할 수 있느냐입니다.</b>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* BEFORE — 행복e음 방식 */}
        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="rounded-t-xl bg-slate-100 px-4 py-2.5">
            <div className="text-sm font-bold text-slate-600">
              기존 · 명단 통보
            </div>
            <div className="text-xs text-slate-400">
              점수순 목록은 있으나 “왜·무엇을 먼저”가 없음
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {SHORTLIST.map((h) => (
              <div
                key={h.id}
                className="flex items-center justify-between px-4 py-3 text-sm"
              >
                <span className="font-mono text-slate-500">{h.id}</span>
                <span className="tabular-nums font-bold text-slate-700">
                  {sc(h)}점
                </span>
              </div>
            ))}
          </div>
          <div className="px-4 py-3 text-center text-sm text-slate-400">
            “이 중 누구를 먼저 봐야 하나?”
          </div>
        </div>

        {/* AFTER — 우리 방식 */}
        <div className="rounded-xl border border-brand-300 bg-white">
          <div className="rounded-t-xl bg-brand-50 px-4 py-2.5">
            <div className="text-sm font-bold text-brand-700">
              우리 · 근거 + 우선순위 + 추적
            </div>
            <div className="text-xs text-slate-500">
              같은 명단에 ‘행동 가능한’ 정보를 더함
            </div>
          </div>
          <div className="divide-y divide-slate-100">
            {SHORTLIST.map((h) => {
              const reason = generateReason(h);
              const delta = weeklyDelta(h);
              const cl = caseLabel(h.caseType);
              return (
                <div key={h.id} className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-slate-500">
                      {h.id}
                    </span>
                    <RiskBadge score={sc(h)} size="sm" />
                    {cl && (
                      <span className="rounded bg-slate-100 px-1.5 py-0.5 text-[11px] font-semibold text-slate-600">
                        {cl.tag}
                      </span>
                    )}
                    {delta > 0 ? (
                      <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-semibold text-red-700">
                        <TrendingUp size={12} /> 이번 주 +{delta}점
                      </span>
                    ) : delta < 0 ? (
                      <span className="ml-auto inline-flex items-center gap-0.5 rounded-full bg-emerald-100 px-2 py-0.5 text-[11px] font-semibold text-emerald-700">
                        <ArrowDown size={12} /> {delta}점
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-1.5 text-sm leading-snug text-slate-700">
                    {reason.rationale}
                  </p>
                  <div className="mt-1.5 flex items-start gap-1.5 text-xs text-brand-700">
                    <span className="font-semibold">권고</span>
                    <span className="text-slate-600">
                      {reason.recommendations[0]?.action}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="px-4 py-3 text-center text-sm font-semibold text-brand-700">
            “급상승한 {SHORTLIST[0]?.id}부터, 이 근거로.”
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
        ※ 최종 전화·방문 결정은 담당자가 합니다. AI는 발굴·근거·우선순위까지만
        기여합니다 (책임 분리).
      </div>
    </div>
  );
}
