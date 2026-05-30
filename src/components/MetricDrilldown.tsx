import { useEffect } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  CartesianGrid,
  Cell,
} from "recharts";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore, riskBand, BAND_CUTOFFS } from "../lib/scoring";
import { weeklyDelta } from "../lib/history";
import { caseLabel } from "../lib/caseLabels";
import type { Household } from "../lib/types";
import RiskBadge from "./RiskBadge";
import {
  X,
  Users,
  AlertTriangle,
  TrendingUp,
  Gauge,
} from "lucide-react";

export type MetricKey = "residual" | "high" | "rising" | "avg";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;
const byScore = (a: Household, b: Household) => sc(b) - sc(a);

const WEEKS = RESIDUAL[0]?.history.map((p) => p.week) ?? [];
const AVG_TREND = WEEKS.map((w, i) => {
  const vals = RESIDUAL.map((h) => h.history[i]?.score ?? 0);
  return { week: w, avg: Math.round(vals.reduce((a, b) => a + b, 0) / (vals.length || 1)) };
});

function dongBreakdown(list: Household[]) {
  const m: Record<string, number> = {};
  list.forEach((h) => (m[h.dong] = (m[h.dong] ?? 0) + 1));
  return Object.entries(m)
    .map(([dong, count]) => ({ dong, count }))
    .sort((a, b) => b.count - a.count);
}

const META: Record<
  MetricKey,
  { title: string; desc: string; icon: React.ReactNode; accent: string }
> = {
  residual: {
    title: "잔여 후보 전체",
    desc: "행복e음 기포착을 제외한 전체 분석 대상",
    icon: <Users size={18} />,
    accent: "text-brand-700 bg-brand-100",
  },
  high: {
    title: "고위험 케이스",
    desc: "위험 점수 65점 이상 — 우선 확인 대상",
    icon: <AlertTriangle size={18} />,
    accent: "text-red-600 bg-red-100",
  },
  rising: {
    title: "이번 주 급상승",
    desc: "전주 대비 점수가 오른 케이스와 분포",
    icon: <TrendingUp size={18} />,
    accent: "text-amber-600 bg-amber-100",
  },
  avg: {
    title: "평균 위험 점수 추이",
    desc: "잔여 후보 전체의 주차별 평균 점수",
    icon: <Gauge size={18} />,
    accent: "text-slate-700 bg-slate-100",
  },
};

export default function MetricDrilldown({
  metric,
  onClose,
  onSelect,
}: {
  metric: MetricKey;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const m = META[metric];

  function pick(id: string) {
    onSelect(id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label={m.title}
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[88vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover animate-popIn">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${m.accent}`}>
              {m.icon}
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">{m.title}</h3>
              <p className="text-xs text-slate-400">{m.desc}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="닫기"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X size={18} />
          </button>
        </div>

        <div className="scroll-slim min-h-0 flex-1 overflow-auto p-5">
          {metric === "residual" && <ResidualView onPick={pick} />}
          {metric === "high" && <HighView onPick={pick} />}
          {metric === "rising" && <RisingView onPick={pick} />}
          {metric === "avg" && <AvgView />}
        </div>
      </div>
    </div>
  );
}

// ── 공용: 케이스 행 ──
function CaseRow({
  h,
  onPick,
  right,
}: {
  h: Household;
  onPick: (id: string) => void;
  right?: React.ReactNode;
}) {
  const cl = caseLabel(h.caseType);
  return (
    <button
      onClick={() => onPick(h.id)}
      className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm transition-colors hover:bg-brand-50/60"
    >
      <span className="w-7 shrink-0 text-center tabular-nums text-lg font-bold text-slate-800">
        {sc(h)}
      </span>
      <div className="min-w-0 flex-1">
        <span className="font-mono text-xs text-slate-500">{h.id}</span>
        <span className="ml-1.5 text-xs text-slate-400">{h.dong}</span>
        {cl && (
          <span className="ml-1.5 text-[11px] font-semibold text-brand-600">
            {cl.tag}
          </span>
        )}
      </div>
      {right ?? <RiskBadge score={sc(h)} size="sm" />}
    </button>
  );
}

// ── 공용: 동별 분포 바 ──
function DongBars({ list, color }: { list: Household[]; color: string }) {
  const data = dongBreakdown(list);
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="space-y-1.5">
      {data.map((d) => (
        <div key={d.dong} className="flex items-center gap-2 text-xs">
          <span className="w-10 shrink-0 text-slate-500">{d.dong}</span>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${(d.count / max) * 100}%`, background: color }}
            />
          </div>
          <span className="w-8 shrink-0 text-right tabular-nums font-semibold text-slate-700">
            {d.count}건
          </span>
        </div>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <div className="mb-2 section-label">{children}</div>;
}

// ── 잔여 후보 전체 ──
function ResidualView({ onPick }: { onPick: (id: string) => void }) {
  const list = [...RESIDUAL].sort(byScore);
  return (
    <div className="space-y-4">
      <div>
        <SectionLabel>행정동별 분포</SectionLabel>
        <DongBars list={list} color="#2f6bbf" />
      </div>
      <div>
        <SectionLabel>전체 {list.length}건 (점수순)</SectionLabel>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {list.map((h) => (
            <CaseRow key={h.id} h={h} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 고위험 ──
function HighView({ onPick }: { onPick: (id: string) => void }) {
  const list = RESIDUAL.filter((h) => sc(h) >= 65).sort(byScore);
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-red-200 bg-red-50/60 px-4 py-3 text-sm text-red-700">
        65점 이상 <b className="tabular-nums">{list.length}건</b>이 고위험으로
        분류됩니다. 우선 확인 대상입니다.
      </div>
      <div>
        <SectionLabel>행정동별 고위험 분포</SectionLabel>
        <DongBars list={list} color="#ef4444" />
      </div>
      <div>
        <SectionLabel>고위험 명단 (점수순)</SectionLabel>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {list.map((h) => (
            <CaseRow key={h.id} h={h} onPick={onPick} />
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 급상승 ──
function RisingView({ onPick }: { onPick: (id: string) => void }) {
  const rising = RESIDUAL.map((h) => ({ h, delta: weeklyDelta(h) }))
    .filter((x) => x.delta > 0)
    .sort((a, b) => b.delta - a.delta);
  const barData = rising.slice(0, 8).map((x) => ({
    id: x.h.id,
    delta: x.delta,
  }));
  const risingDongs = dongBreakdown(rising.map((x) => x.h));

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-amber-200 bg-amber-50/60 px-4 py-3 text-sm text-amber-800">
        이번 주 <b className="tabular-nums">{rising.length}건</b>이 상승했습니다.
        상승폭 상위와 집중 행정동을 함께 봅니다.
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-slate-200 p-3">
          <SectionLabel>상승폭 TOP (이번 주 +점)</SectionLabel>
          <ResponsiveContainer width="100%" height={170}>
            <BarChart data={barData} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="id"
                tick={{ fontSize: 9, fill: "#94a3b8" }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={42}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(v: number) => [`+${v}점`, "상승폭"]}
                contentStyle={{ fontSize: 12, borderRadius: 10, border: "1px solid #e2e8f0" }}
                cursor={{ fill: "#f8fafc" }}
              />
              <Bar dataKey="delta" radius={[4, 4, 0, 0]} fill="#f59e0b" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-slate-200 p-3">
          <SectionLabel>급상승 집중 행정동</SectionLabel>
          <DongBars list={rising.map((x) => x.h)} color="#f59e0b" />
          {risingDongs[0] && (
            <p className="mt-2.5 text-xs text-slate-500">
              <b className="text-amber-700">{risingDongs[0].dong}</b>에 급상승이 가장
              집중돼 있습니다.
            </p>
          )}
        </div>
      </div>

      <div>
        <SectionLabel>급상승 명단 · 8주 추이</SectionLabel>
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {rising.map(({ h, delta }) => (
            <button
              key={h.id}
              onClick={() => {
                onPick(h.id);
              }}
              className="flex w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50/60"
            >
              <span className="font-mono text-xs text-slate-500">{h.id}</span>
              <span className="text-xs text-slate-400">{h.dong}</span>
              <div className="ml-auto h-8 w-24 shrink-0">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={h.history}>
                    <Line
                      type="monotone"
                      dataKey="score"
                      stroke="#f59e0b"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <span className="w-12 shrink-0 text-right tabular-nums text-xs font-bold text-amber-700">
                +{delta}
              </span>
              <RiskBadge score={sc(h)} size="sm" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── 평균 위험 점수 추이 ──
function AvgView() {
  const scores = RESIDUAL.map(sc);
  const bands = { high: 0, mid: 0, low: 0 };
  scores.forEach((s) => bands[riskBand(s)]++);
  const first = AVG_TREND[0]?.avg ?? 0;
  const last = AVG_TREND[AVG_TREND.length - 1]?.avg ?? 0;
  const trend = last - first;

  return (
    <div className="space-y-4">
      <div className="flex items-end justify-between rounded-xl border border-slate-200 bg-slate-50/60 px-4 py-3">
        <div>
          <div className="section-label">현재 평균</div>
          <div className="text-3xl font-bold tabular-nums leading-none text-slate-800">
            {last}
            <span className="ml-1 text-base text-slate-400">점</span>
          </div>
        </div>
        <div
          className={`text-sm font-semibold ${
            trend > 0 ? "text-red-600" : trend < 0 ? "text-emerald-600" : "text-slate-500"
          }`}
        >
          {WEEKS[0]} 대비 {trend > 0 ? `▲ +${trend}` : trend < 0 ? `▼ ${trend}` : "─ 0"}점
        </div>
      </div>

      <div className="rounded-xl border border-slate-200 p-3">
        <SectionLabel>주차별 평균 점수 (8주)</SectionLabel>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={AVG_TREND} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="week" tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={{ stroke: "#e2e8f0" }} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              formatter={(v: number) => [`${v}점`, "평균 위험 점수"]}
              contentStyle={{ fontSize: 13, borderRadius: 10, border: "1px solid #e2e8f0", boxShadow: "0 4px 16px rgba(15,23,42,0.10)" }}
              cursor={{ stroke: "#cbd5e1", strokeDasharray: "4 4" }}
            />
            <ReferenceLine y={BAND_CUTOFFS.high} stroke="#fca5a5" strokeDasharray="4 4" label={{ value: "고위험", fontSize: 11, fill: "#dc2626", position: "right" }} />
            <ReferenceLine y={BAND_CUTOFFS.mid} stroke="#fcd34d" strokeDasharray="4 4" label={{ value: "주의", fontSize: 11, fill: "#d97706", position: "right" }} />
            <Line type="monotone" dataKey="avg" stroke="#2f6bbf" strokeWidth={2.5} dot={{ r: 3, fill: "#2f6bbf" }} activeDot={{ r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div>
        <SectionLabel>현재 위험 구간 분포</SectionLabel>
        <div className="grid grid-cols-3 gap-2.5">
          <BandTile label="고위험" value={bands.high} color="text-red-600" />
          <BandTile label="주의" value={bands.mid} color="text-amber-600" />
          <BandTile label="관찰" value={bands.low} color="text-slate-500" />
        </div>
      </div>
    </div>
  );
}

function BandTile({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 text-center shadow-card">
      <div className={`text-2xl font-bold tabular-nums leading-none ${color}`}>{value}</div>
      <div className="mt-1.5 text-xs font-semibold text-slate-600">{label}</div>
    </div>
  );
}
