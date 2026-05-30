import { useState } from "react";
import { computeScore, BAND_STYLES, riskBand } from "../lib/scoring";
import { generateReason } from "../lib/reason";
import { caseLabel } from "../lib/caseLabels";
import { PROFILE_LABELS } from "../lib/profiles";
import type { Household } from "../lib/types";
import RiskBadge from "./RiskBadge";
import RiskTimeline from "./RiskTimeline";
import SimBadge from "./SimBadge";
import { Phone, Home, Eye, AlertTriangle, ListChecks } from "lucide-react";

type Action = "call" | "visit" | "watch";
const ACTIONS: { key: Action; label: string; icon: React.ReactNode }[] = [
  { key: "call", label: "전화 완료", icon: <Phone size={15} /> },
  { key: "visit", label: "방문 완료", icon: <Home size={15} /> },
  { key: "watch", label: "관찰", icon: <Eye size={15} /> },
];

// 케이스 상세 — 신호·점수·근거·권고·시계열 + 조치 '기록'(자동처리 아님, 원칙 4).
export default function CaseDetail({ household }: { household: Household }) {
  const [logged, setLogged] = useState<Action | null>(null);
  const { score, breakdown } = computeScore(household.signals, household.profileGroup);
  const reason = generateReason(household);
  const cl = caseLabel(household.caseType);
  const bandStyle = BAND_STYLES[riskBand(score)];

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-lg font-bold text-slate-800">
              {household.id}
            </span>
            {cl && (
              <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                {cl.tag}
              </span>
            )}
          </div>
          <div className="text-xs text-slate-500">
            {household.dong} · {household.ageBand} ·{" "}
            {household.sex === "F" ? "여" : "남"} ·{" "}
            {PROFILE_LABELS[household.profileGroup]}
          </div>
        </div>
        <div className="text-right">
          <div className={`text-3xl font-bold tabular-nums ${bandStyle.text}`}>
            {score}
          </div>
          <RiskBadge score={score} size="sm" />
        </div>
      </div>

      {/* 기여도 막대 */}
      <div className="space-y-1.5">
        {breakdown.map((b) => (
          <div key={b.key}>
            <div className="flex justify-between text-xs">
              <span className="text-slate-500">{b.label}</span>
              <span className="tabular-nums text-slate-600">
                {b.contribution.toFixed(1)}점
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded bg-slate-100">
              <div
                className={`h-full rounded ${bandStyle.bar}`}
                style={{ width: `${b.contribution}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* 근거 리포트 */}
      <div className="rounded-lg bg-slate-50 p-3">
        <div className="mb-1 flex items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500">AI 근거</span>
          <SimBadge />
        </div>
        <p className="text-sm leading-relaxed text-slate-800">{reason.rationale}</p>
        <div className="mt-1.5 flex flex-wrap gap-1">
          {reason.basisSignals.map((b) => (
            <span
              key={b}
              className="rounded bg-white px-1.5 py-0.5 text-[11px] text-slate-600 ring-1 ring-slate-200"
            >
              {b}
            </span>
          ))}
        </div>
      </div>

      {/* 권고 */}
      <div>
        <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-slate-500">
          <ListChecks size={13} /> 권고 액션
        </div>
        <ul className="space-y-1.5">
          {reason.recommendations.map((r, i) => (
            <li key={i} className="flex gap-2 text-sm">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-100 text-[11px] font-bold text-brand-700">
                {i + 1}
              </span>
              <span className="text-slate-700">
                <b>{r.action}</b> — <span className="text-slate-500">{r.detail}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* 반대 근거 */}
      {reason.counterEvidence && (
        <div className="flex gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-800">
          <AlertTriangle size={14} className="mt-0.5 shrink-0 text-amber-600" />
          <span>{reason.counterEvidence}</span>
        </div>
      )}

      {/* 시계열 */}
      <RiskTimeline household={household} />

      {/* 조치 기록 (자동처리 아님) */}
      <div className="border-t border-slate-100 pt-3">
        <div className="mb-1.5 text-xs font-semibold text-slate-500">
          담당자 조치 기록{" "}
          <span className="font-normal text-slate-400">
            — AI가 자동 처리하지 않습니다. 담당자가 기록만 합니다.
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          {ACTIONS.map((a) => (
            <button
              key={a.key}
              onClick={() => setLogged(a.key)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm font-semibold transition-colors ${
                logged === a.key
                  ? "border-brand-600 bg-brand-600 text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-brand-300"
              }`}
            >
              {a.icon}
              {a.label}
            </button>
          ))}
        </div>
        {logged && (
          <div className="mt-2 text-xs text-brand-700">
            ✓ ‘{ACTIONS.find((a) => a.key === logged)?.label}’ (으)로 기록되었습니다.
          </div>
        )}
      </div>
    </div>
  );
}
