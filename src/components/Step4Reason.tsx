import { computeScore } from "../lib/scoring";
import { generateReason } from "../lib/reason";
import { caseLabel } from "../lib/caseLabels";
import type { Household } from "../lib/types";
import RiskBadge from "./RiskBadge";
import SimBadge from "./SimBadge";
import { Sparkles, ListChecks, AlertTriangle, Quote } from "lucide-react";

// 4단계 — AI 근거 생성. (plan 0절 원칙 2)
// 점수는 3단계 투명 모형이 이미 계산했다. 여기서는 그 점수를 '설명'만 한다.
export default function Step4Reason({ household }: { household: Household }) {
  const { score } = computeScore(household.signals, household.profileGroup);
  const reason = generateReason(household);
  const cl = caseLabel(household.caseType);

  return (
    <div className="space-y-4">
      {/* 역할 분담 고지 */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50/80 px-4 py-2.5 text-sm leading-relaxed text-amber-800">
        <SimBadge />
        <span>
          실서비스에선 이 자리에 <b>LLM(예: Haiku 4.5급)</b>이 들어갑니다. 점수는
          LLM이 만들지 않습니다 — <b>점수는 투명 모형(3단계)</b>, LLM은 근거
          서술·권고만 담당합니다.
        </span>
      </div>

      <div className="card card-pad">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-slate-700">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
              <Sparkles size={16} />
            </span>
            {household.id} 근거 리포트
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-slate-500">
              위험 점수{" "}
              <span className="text-lg font-bold tabular-nums text-slate-800">
                {score}
              </span>
            </span>
            <RiskBadge score={score} size="sm" />
          </div>
        </div>

        {/* 근거 */}
        <div className="rounded-xl border-l-2 border-brand-300 bg-slate-50/80 p-3.5">
          <div className="mb-1.5 flex items-center gap-1.5 section-label">
            <Quote size={13} /> 근거
          </div>
          <p className="text-[15px] leading-relaxed text-slate-800">
            {reason.rationale}
          </p>
          {/* 출처 칩 — 근거가 기반한 신호 (환각 방어) */}
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-slate-400">근거 신호</span>
            {reason.basisSignals.map((b) => (
              <span
                key={b}
                className="rounded-md bg-white px-2 py-0.5 text-xs font-medium text-slate-600 shadow-sm ring-1 ring-slate-200"
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* 권고 */}
        <div className="mt-4">
          <div className="mb-2 flex items-center gap-1.5 section-label">
            <ListChecks size={13} /> 권고 액션
          </div>
          <ul className="space-y-2">
            {reason.recommendations.map((r, i) => (
              <li
                key={i}
                className="flex gap-2.5 rounded-xl border border-slate-200 p-3 transition-colors hover:border-brand-200 hover:bg-brand-50/40"
              >
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-brand-100 text-xs font-bold text-brand-700">
                  {i + 1}
                </span>
                <div>
                  <div className="text-sm font-semibold text-slate-800">
                    {r.action}
                  </div>
                  <div className="mt-0.5 text-xs leading-relaxed text-slate-500">
                    {r.detail}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* 반대 근거·불확실성 — 자동화 편향 방어 */}
        {reason.counterEvidence && (
          <div className="mt-4 flex gap-2.5 rounded-xl border border-amber-200 bg-amber-50/80 p-3.5">
            <AlertTriangle size={16} className="mt-0.5 shrink-0 text-amber-600" />
            <div>
              <div className="text-xs font-bold text-amber-700">
                반대 근거 · 불확실성
              </div>
              <p className="mt-0.5 text-sm leading-relaxed text-amber-800">
                {reason.counterEvidence}
              </p>
            </div>
          </div>
        )}

        <div className="mt-4 border-t border-slate-100 pt-3 text-xs leading-relaxed text-slate-400">
          ※ 근거·권고는 주어진 신호에만 기반합니다. AI는 사실 신호를
          새로 생성·추정하지 않으며, 최종 개입 결정은 담당자가 합니다.
          {cl && <> · {cl.tag} 케이스</>}
        </div>
      </div>
    </div>
  );
}
