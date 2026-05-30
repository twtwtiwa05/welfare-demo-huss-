import { useEffect, useState } from "react";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore, riskBand, type Band } from "../lib/scoring";
import { caseLabel } from "../lib/caseLabels";
import type { Household } from "../lib/types";
import RiskBadge from "./RiskBadge";
import { X, MapPin, Users, AlertTriangle, TrendingUp } from "lucide-react";
import { weeklyDelta } from "../lib/history";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

// SVG 색 (Tailwind 클래스가 안 먹는 svg fill/stroke용)
const DOT: Record<Band, string> = {
  high: "#ef4444",
  mid: "#f59e0b",
  low: "#94a3b8",
};
const CELL_FILL: Record<Band, string> = {
  high: "#fef2f2",
  mid: "#fffbeb",
  low: "#f8fafc",
};
const CELL_STROKE: Record<Band, string> = {
  high: "#fca5a5",
  mid: "#fcd34d",
  low: "#cbd5e1",
};

// 6개 행정동의 모식(개념) 배치 — 실제 지리 좌표 아님. 3열 × 2행 구역도.
const DONG_ORDER = ["가동", "나동", "다동", "라동", "마동", "바동"];
const CELL = 120;
const PAD = 9;
function cellRect(i: number) {
  const col = i % 3;
  const row = Math.floor(i / 3);
  return { x: col * CELL + PAD, y: row * CELL + PAD, w: CELL - PAD * 2, h: CELL - PAD * 2 };
}

interface DongAgg {
  dong: string;
  list: Household[];
  avg: number;
  band: Band;
  high: number;
  rising: number;
}

const DONG_DATA: Record<string, DongAgg> = (() => {
  const map: Record<string, Household[]> = {};
  RESIDUAL.forEach((h) => (map[h.dong] ??= []).push(h));
  const out: Record<string, DongAgg> = {};
  for (const dong of DONG_ORDER) {
    const list = (map[dong] ?? []).slice().sort((a, b) => sc(b) - sc(a));
    const scores = list.map(sc);
    const avg = scores.length
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;
    out[dong] = {
      dong,
      list,
      avg,
      band: riskBand(avg),
      high: scores.filter((s) => s >= 65).length,
      rising: list.filter((h) => weeklyDelta(h) > 0).length,
    };
  }
  return out;
})();

// id 시드 기반 결정론적 산포 좌표 (0~1)
function seedOf(id: string) {
  const m = id.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}
function scatter(h: Household, idx: number) {
  const s = seedOf(h.id) + idx * 37;
  const a = ((s * 9301 + 49297) % 233280) / 233280;
  const b = ((s * 4096 + 150889) % 714025) / 714025;
  return { a, b };
}

export default function RegionMap({
  open,
  onClose,
  onSelect,
}: {
  open: boolean;
  onClose: () => void;
  onSelect: (id: string) => void;
}) {
  const topDong =
    [...DONG_ORDER].sort((a, b) => DONG_DATA[b].avg - DONG_DATA[a].avg)[0] ??
    "가동";
  const [activeDong, setActiveDong] = useState(topDong);
  const [hoverDong, setHoverDong] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  const agg = DONG_DATA[activeDong];

  function pickHousehold(id: string) {
    onSelect(id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      role="dialog"
      aria-modal="true"
      aria-label="행정동 지도 대시보드"
    >
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative flex max-h-[88vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card-hover animate-popIn">
        {/* 헤더 */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-3.5">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
              <MapPin size={18} />
            </span>
            <div>
              <h3 className="text-base font-bold text-slate-800">
                행정동 위험 분포 지도
              </h3>
              <p className="text-xs text-slate-400">
                구역을 클릭해 동별 잔여 후보를 확인하세요 · 개념 지도(가상 행정동)
              </p>
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

        {/* 본문: 지도 + 동 패널 */}
        <div className="grid min-h-0 flex-1 gap-0 md:grid-cols-[1.4fr_1fr]">
          {/* ── 지도 ── */}
          <div className="min-h-0 overflow-auto bg-gradient-to-br from-slate-50 to-slate-100/60 p-5">
            <svg
              viewBox="0 0 360 240"
              className="h-auto w-full"
              style={{ maxHeight: "60vh" }}
            >
              {/* 장식 격자 (지도 톤) */}
              <g stroke="#e2e8f0" strokeWidth="0.5">
                {[60, 120, 180, 240, 300].map((x) => (
                  <line key={`v${x}`} x1={x} y1={0} x2={x} y2={240} />
                ))}
                {[60, 120, 180].map((y) => (
                  <line key={`h${y}`} x1={0} y1={y} x2={360} y2={y} />
                ))}
              </g>

              {DONG_ORDER.map((dong, i) => {
                const d = DONG_DATA[dong];
                const r = cellRect(i);
                const active = dong === activeDong;
                const hover = dong === hoverDong;
                return (
                  <g
                    key={dong}
                    onClick={() => setActiveDong(dong)}
                    onMouseEnter={() => setHoverDong(dong)}
                    onMouseLeave={() => setHoverDong(null)}
                    style={{ cursor: "pointer" }}
                  >
                    <rect
                      x={r.x}
                      y={r.y}
                      width={r.w}
                      height={r.h}
                      rx={12}
                      fill={CELL_FILL[d.band]}
                      stroke={active ? "#2f6bbf" : CELL_STROKE[d.band]}
                      strokeWidth={active ? 2.5 : hover ? 1.8 : 1}
                      style={{ transition: "all 0.2s" }}
                    />
                    {/* 가구 점 산포 */}
                    {d.list.map((h, idx) => {
                      const { a, b } = scatter(h, idx);
                      const cx = r.x + 14 + a * (r.w - 28);
                      const cy = r.y + 22 + b * (r.h - 38);
                      const band = riskBand(sc(h));
                      return (
                        <circle
                          key={h.id}
                          cx={cx}
                          cy={cy}
                          r={band === "high" ? 3.4 : 2.6}
                          fill={DOT[band]}
                          opacity={active || hover ? 0.95 : 0.7}
                          onClick={(e) => {
                            e.stopPropagation();
                            pickHousehold(h.id);
                          }}
                          style={{ transition: "opacity 0.2s" }}
                        >
                          <title>{`${h.id} · ${sc(h)}점`}</title>
                        </circle>
                      );
                    })}
                    {/* 라벨 */}
                    <text
                      x={r.x + 10}
                      y={r.y + 17}
                      fontSize="11"
                      fontWeight="700"
                      fill="#334155"
                    >
                      {dong}
                    </text>
                    <text
                      x={r.x + r.w - 10}
                      y={r.y + 17}
                      fontSize="12"
                      fontWeight="800"
                      textAnchor="end"
                      fill={DOT[d.band]}
                    >
                      {d.avg}
                    </text>
                  </g>
                );
              })}
            </svg>

            {/* 범례 */}
            <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-slate-400">
              <span>점 = 가구 · 색 = 위험 구간</span>
              <Legend color="#ef4444" label="고위험" />
              <Legend color="#f59e0b" label="주의" />
              <Legend color="#94a3b8" label="관찰" />
            </div>
          </div>

          {/* ── 선택 동 패널 ── */}
          <div className="flex min-h-0 flex-col border-t border-slate-100 md:border-l md:border-t-0">
            <div className="border-b border-slate-100 px-4 py-3">
              <div className="flex items-center gap-2">
                <h4 className="text-base font-bold text-slate-800">
                  {agg.dong}
                </h4>
                <span className="text-xs text-slate-400">
                  잔여 {agg.list.length}가구
                </span>
              </div>
              <div className="mt-2.5 grid grid-cols-3 gap-2">
                <MiniStat icon={<Users size={13} />} label="잔여" value={agg.list.length} />
                <MiniStat
                  icon={<AlertTriangle size={13} />}
                  label="고위험"
                  value={agg.high}
                  tone="danger"
                />
                <MiniStat
                  icon={<TrendingUp size={13} />}
                  label="급상승"
                  value={agg.rising}
                  tone="warn"
                />
              </div>
            </div>
            <div className="scroll-slim min-h-0 flex-1 divide-y divide-slate-100 overflow-auto">
              {agg.list.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-slate-400">
                  잔여 후보가 없습니다
                </div>
              )}
              {agg.list.map((h) => {
                const cl = caseLabel(h.caseType);
                return (
                  <button
                    key={h.id}
                    onClick={() => pickHousehold(h.id)}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors hover:bg-brand-50/60"
                  >
                    <span className="w-7 shrink-0 text-center tabular-nums text-lg font-bold text-slate-800">
                      {sc(h)}
                    </span>
                    <div className="min-w-0 flex-1">
                      <span className="font-mono text-xs text-slate-500">
                        {h.id}
                      </span>
                      {cl && (
                        <span className="ml-1.5 text-[11px] font-semibold text-brand-600">
                          {cl.tag}
                        </span>
                      )}
                    </div>
                    <RiskBadge score={sc(h)} size="sm" />
                  </button>
                );
              })}
            </div>
            <div className="border-t border-slate-100 px-4 py-2 text-center text-[11px] text-slate-400">
              가구를 클릭하면 케이스 상세로 이동합니다
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
      {label}
    </span>
  );
}

function MiniStat({
  icon,
  label,
  value,
  tone = "neutral",
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  tone?: "neutral" | "danger" | "warn";
}) {
  const c =
    tone === "danger"
      ? "text-red-600"
      : tone === "warn"
        ? "text-amber-600"
        : "text-slate-800";
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-50/60 p-2 text-center">
      <div className="flex items-center justify-center gap-1 text-[10px] font-medium text-slate-400">
        {icon}
        {label}
      </div>
      <div className={`mt-0.5 text-lg font-bold tabular-nums leading-none ${c}`}>
        {value}
      </div>
    </div>
  );
}
