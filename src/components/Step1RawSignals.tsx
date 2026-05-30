import { HOUSEHOLDS } from "../lib/data";
import { SIGNAL_META, SIGNAL_KEYS } from "../lib/scoring";
import { caseLabel } from "../lib/caseLabels";
import { PROFILE_LABELS } from "../lib/profiles";
import type { Household } from "../lib/types";
import SimBadge from "./SimBadge";
import { Zap, Activity, Mail, Phone, Users } from "lucide-react";

const ICONS: Record<string, React.ReactNode> = {
  power: <Zap size={18} />,
  medical: <Activity size={18} />,
  mail: <Mail size={18} />,
  telecom: <Phone size={18} />,
  isolation: <Users size={18} />,
};

const GT_LABEL: Record<string, string> = {
  high: "고위험",
  mid: "중위험",
  low: "저위험",
};

// 1단계 — 원시 신호 입력. 선택 가구의 신호를 카드로, 전체 가구를 표로.
export default function Step1RawSignals({
  selectedId,
  onSelect,
}: {
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  const selected =
    HOUSEHOLDS.find((h) => h.id === selectedId) ?? HOUSEHOLDS[0];
  const cl = caseLabel(selected.caseType);

  return (
    <div className="space-y-4">
      {/* 선택 가구 신호 카드 */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex flex-wrap items-center gap-x-3 gap-y-1">
          <span className="font-mono text-lg font-bold text-slate-800">
            {selected.id}
          </span>
          <span className="text-sm text-slate-500">
            {selected.dong} · {selected.ageBand} · {selected.sex === "F" ? "여" : "남"} ·{" "}
            {PROFILE_LABELS[selected.profileGroup]}
          </span>
          {cl && (
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
              {cl.tag} · {cl.full}
            </span>
          )}
          {!selected.registeredAlone && (
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
              등록상 동거(비1인가구)
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
          {SIGNAL_KEYS.map((key) => {
            const meta = SIGNAL_META[key];
            const raw = selected.signals[meta.field];
            const over = meta.threshold != null && raw >= meta.threshold;
            return (
              <div
                key={key}
                className={`rounded-lg border p-3 ${
                  over ? "border-red-300 bg-red-50" : "border-slate-200 bg-slate-50"
                }`}
              >
                <div
                  className={`flex items-center gap-1.5 text-xs font-semibold ${
                    over ? "text-red-600" : "text-slate-500"
                  }`}
                >
                  {ICONS[key]}
                  {meta.label}
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums text-slate-800">
                  {meta.format(raw)}
                </div>
                {meta.threshold != null && (
                  <div className="text-xs text-slate-400">
                    임계 {meta.format(meta.threshold)}
                    {over && (
                      <span className="ml-1 font-semibold text-red-600">초과</span>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2 text-xs text-slate-500">
          <span>
            설계된 정답:{" "}
            <span className="font-semibold text-slate-700">
              {GT_LABEL[selected.groundTruthRisk]}
            </span>
          </span>
          <SimBadge
            label="합성 정답"
            title="groundTruthRisk는 우리가 설계한 합성 데이터의 정답입니다. 화면 점수가 아니며, 발굴 성능 증명용도 아닙니다."
          />
        </div>
      </div>

      {/* 전체 가구 표 */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-2">
          <h4 className="text-sm font-bold text-slate-700">
            전체 합성 가구 {HOUSEHOLDS.length}건 (행 클릭 시 선택)
          </h4>
          <SimBadge label="합성 데이터" title="발굴 성능 증명이 아닌 UX·파이프라인 검증용" />
        </div>
        <div className="max-h-72 overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">ID</th>
                <th className="px-2 py-2 text-left">동</th>
                <th className="px-2 py-2 text-right">전력%</th>
                <th className="px-2 py-2 text-right">진료일</th>
                <th className="px-2 py-2 text-right">우편주</th>
                <th className="px-2 py-2 text-right">통신월</th>
                <th className="px-2 py-2 text-right">복지관</th>
                <th className="px-2 py-2 text-center">행복e음</th>
              </tr>
            </thead>
            <tbody>
              {HOUSEHOLDS.map((h) => (
                <Row
                  key={h.id}
                  h={h}
                  selected={h.id === selectedId}
                  onSelect={onSelect}
                />
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Row({
  h,
  selected,
  onSelect,
}: {
  h: Household;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <tr
      onClick={() => onSelect(h.id)}
      className={`cursor-pointer border-t border-slate-50 tabular-nums ${
        selected ? "bg-brand-50" : "hover:bg-slate-50"
      }`}
    >
      <td className="px-3 py-1.5 font-mono text-xs">{h.id}</td>
      <td className="px-2 py-1.5 text-slate-500">{h.dong}</td>
      <td className="px-2 py-1.5 text-right">{h.signals.powerDropPct}</td>
      <td className="px-2 py-1.5 text-right">{h.signals.daysSinceMedical}</td>
      <td className="px-2 py-1.5 text-right">{h.signals.mailUncollectedWeeks}</td>
      <td className="px-2 py-1.5 text-right">{h.signals.telecomOverdueMonths}</td>
      <td className="px-2 py-1.5 text-right">{h.signals.welfareCenterVisits6mo}</td>
      <td className="px-2 py-1.5 text-center">
        {h.haengbokFlagged ? (
          <span className="text-xs text-slate-400">기포착</span>
        ) : (
          <span className="text-xs font-semibold text-brand-600">잔여</span>
        )}
      </td>
    </tr>
  );
}
