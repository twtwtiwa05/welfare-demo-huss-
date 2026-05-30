import { useState } from "react";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore } from "../lib/scoring";
import { weeklyDelta } from "../lib/history";
import type { Household } from "../lib/types";
import { Users, AlertTriangle, TrendingUp, Gauge, ChevronRight } from "lucide-react";
import MetricDrilldown, { type MetricKey } from "./MetricDrilldown";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

// 운영 대시보드 상단 KPI 요약 — 현황 모니터링 지표(발굴 성능 주장 아님).
const SCORES = RESIDUAL.map(sc);
const TOTAL = RESIDUAL.length;
const HIGH = SCORES.filter((s) => s >= 65).length;
const RISING = RESIDUAL.filter((h) => weeklyDelta(h) > 0).length;
const AVG = Math.round(SCORES.reduce((a, b) => a + b, 0) / (TOTAL || 1));

interface Stat {
  key: MetricKey;
  label: string;
  value: number;
  unit: string;
  sub: string;
  icon: React.ReactNode;
  tone: "brand" | "danger" | "warn" | "neutral";
}

const STATS: Stat[] = [
  {
    key: "residual",
    label: "잔여 후보",
    value: TOTAL,
    unit: "건",
    sub: "행복e음 기포착 제외",
    icon: <Users size={18} />,
    tone: "brand",
  },
  {
    key: "high",
    label: "고위험",
    value: HIGH,
    unit: "건",
    sub: "위험 점수 65점 이상",
    icon: <AlertTriangle size={18} />,
    tone: "danger",
  },
  {
    key: "rising",
    label: "이번 주 급상승",
    value: RISING,
    unit: "건",
    sub: "전주 대비 점수 상승",
    icon: <TrendingUp size={18} />,
    tone: "warn",
  },
  {
    key: "avg",
    label: "평균 위험 점수",
    value: AVG,
    unit: "점",
    sub: "잔여 후보 전체 평균",
    icon: <Gauge size={18} />,
    tone: "neutral",
  },
];

const TONES: Record<Stat["tone"], { icon: string; value: string }> = {
  brand: { icon: "bg-brand-100 text-brand-700", value: "text-slate-800" },
  danger: { icon: "bg-red-100 text-red-600", value: "text-red-600" },
  warn: { icon: "bg-amber-100 text-amber-600", value: "text-amber-600" },
  neutral: { icon: "bg-slate-100 text-slate-500", value: "text-slate-800" },
};

export default function DashboardStats({
  onSelect,
}: {
  onSelect: (id: string) => void;
}) {
  const [active, setActive] = useState<MetricKey | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {STATS.map((s) => {
          const t = TONES[s.tone];
          return (
            <button
              key={s.key}
              onClick={() => setActive(s.key)}
              className="card card-pad group text-left transition-all duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-card-hover"
            >
              <div className="flex items-start justify-between">
                <span className="section-label">{s.label}</span>
                <span
                  className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.icon}`}
                >
                  {s.icon}
                </span>
              </div>
              <div
                className={`mt-2 text-3xl font-bold tabular-nums leading-none ${t.value}`}
              >
                {s.value}
                <span className="ml-1 text-base font-semibold text-slate-300">
                  {s.unit}
                </span>
              </div>
              <div className="mt-1.5 flex items-center justify-between">
                <span className="text-[11px] text-slate-400">{s.sub}</span>
                <span className="inline-flex items-center gap-0.5 text-[11px] font-semibold text-slate-300 transition-colors group-hover:text-brand-500">
                  상세 <ChevronRight size={12} />
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {active && (
        <MetricDrilldown
          metric={active}
          onClose={() => setActive(null)}
          onSelect={onSelect}
        />
      )}
    </>
  );
}
