import { useMemo, useState } from "react";
import PipelineView from "./components/PipelineView";
import BeforeAfterView from "./components/BeforeAfterView";
import Dashboard from "./components/Dashboard";
import ProofBoundary from "./components/ProofBoundary";
import RiskBadge from "./components/RiskBadge";
import { CaseStateProvider } from "./lib/caseState";
import { HOUSEHOLDS } from "./lib/data";
import { computeScore } from "./lib/scoring";
import type { Household } from "./lib/types";
import {
  GitBranch,
  LayoutDashboard,
  Sparkles,
  ShieldCheck,
  Search,
  RefreshCw,
  Lock,
} from "lucide-react";

type Tab = "pipeline" | "impact" | "dashboard";

const TABS: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "pipeline", label: "파이프라인", icon: <GitBranch size={16} /> },
  { key: "impact", label: "활용도 ③", icon: <Sparkles size={16} /> },
  { key: "dashboard", label: "대시보드", icon: <LayoutDashboard size={16} /> },
];

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;

export default function App() {
  const [tab, setTab] = useState<Tab>("pipeline");
  const [selectedId, setSelectedId] = useState(
    [...RESIDUAL].sort((a, b) => sc(b) - sc(a))[0]?.id ?? ""
  );
  const [globalQuery, setGlobalQuery] = useState("");

  function gotoCase(id: string) {
    setSelectedId(id);
    setGlobalQuery(id);
    setTab("dashboard");
  }
  function searchTo(q: string) {
    setGlobalQuery(q);
    setTab("dashboard");
  }

  return (
    <CaseStateProvider>
      <div className="min-h-screen">
        <header className="sticky top-0 z-30 border-b border-slate-200/70 bg-white/85 shadow-header backdrop-blur-md">
          <div className="mx-auto max-w-6xl px-4">
            {/* 상단 줄: 로고 · 검색 · 시스템 chrome */}
            <div className="flex items-center gap-3 py-3">
              <div className="flex shrink-0 items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-800 text-white shadow-sm ring-1 ring-brand-700/20">
                  <ShieldCheck size={20} strokeWidth={2.2} />
                </div>
                <h1 className="hidden text-[16px] font-bold leading-tight text-slate-800 sm:block">
                  복지망 발굴·모니터링{" "}
                  <span className="text-brand-600">AI 에이전트</span>
                </h1>
              </div>

              <GlobalSearch onPick={gotoCase} onSubmit={searchTo} />

              <div className="hidden shrink-0 items-center gap-3 lg:flex">
                <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                  <RefreshCw size={12} /> 09:00 동기화
                </div>
                <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-semibold text-slate-500">
                  <Lock size={11} /> 조회·기록 권한
                </span>
                <div className="flex items-center gap-2 border-l border-slate-200 pl-3">
                  <div className="text-right leading-tight">
                    <div className="text-[13px] font-semibold text-slate-700">
                      행복동 행정복지센터
                    </div>
                    <div className="text-[11px] text-slate-400">복지정책과</div>
                  </div>
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-700 ring-1 ring-brand-200">
                    김
                  </div>
                </div>
              </div>
            </div>

            {/* 하단 줄: 탭 */}
            <nav
              className="flex gap-1 pb-2"
              role="tablist"
              aria-label="화면 전환"
            >
              {TABS.map((t) => (
                <TabButton
                  key={t.key}
                  active={tab === t.key}
                  onClick={() => setTab(t.key)}
                  icon={t.icon}
                  label={t.label}
                />
              ))}
            </nav>
          </div>
        </header>

        {tab !== "dashboard" && <ProofBoundary />}

        <main className="mx-auto max-w-6xl px-4 py-6">
          <div key={tab} className="animate-fadeIn">
            {tab === "pipeline" && <PipelineView />}
            {tab === "impact" && <BeforeAfterView />}
            {tab === "dashboard" && (
              <Dashboard
                selectedId={selectedId}
                onSelect={setSelectedId}
                globalQuery={globalQuery}
              />
            )}
          </div>
        </main>

        <footer className="mx-auto max-w-6xl px-4 pb-8 pt-2">
          <p className="text-center text-xs text-slate-400">
            공모전 발표용 인터랙티브 데모 · 합성 데이터 기반 · 발굴 성능 증명이
            아닌 파이프라인·UX 시연
          </p>
        </footer>
      </div>
    </CaseStateProvider>
  );
}

function GlobalSearch({
  onPick,
  onSubmit,
}: {
  onPick: (id: string) => void;
  onSubmit: (q: string) => void;
}) {
  const [q, setQ] = useState("");
  const [open, setOpen] = useState(false);

  const results = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return [];
    return RESIDUAL.filter((h) =>
      `${h.id} ${h.dong}`.toLowerCase().includes(k)
    )
      .sort((a, b) => sc(b) - sc(a))
      .slice(0, 6);
  }, [q]);

  return (
    <div className="relative mx-auto w-full max-w-md flex-1">
      <Search
        size={16}
        className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
      />
      <input
        value={q}
        onChange={(e) => {
          setQ(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onBlur={() => window.setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && q.trim()) {
            onSubmit(q.trim());
            setOpen(false);
            (e.target as HTMLInputElement).blur();
          }
          if (e.key === "Escape") setOpen(false);
        }}
        placeholder="대상자 ID·행정동 검색"
        className="w-full rounded-lg border border-slate-200 bg-slate-50/80 py-2 pl-9 pr-3 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:border-brand-400 focus-visible:bg-white"
      />
      {open && results.length > 0 && (
        <div className="absolute left-0 right-0 top-full z-50 mt-1.5 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-card-hover animate-popIn">
          {results.map((h) => (
            <button
              key={h.id}
              onMouseDown={(e) => {
                e.preventDefault();
                onPick(h.id);
                setQ("");
                setOpen(false);
              }}
              className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors hover:bg-brand-50/60"
            >
              <span className="w-7 shrink-0 text-center tabular-nums font-bold text-slate-800">
                {sc(h)}
              </span>
              <span className="font-mono text-xs text-slate-600">{h.id}</span>
              <span className="text-xs text-slate-400">{h.dong}</span>
              <span className="ml-auto">
                <RiskBadge score={sc(h)} size="sm" />
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      role="tab"
      aria-selected={active}
      className={`inline-flex items-center gap-2 rounded-lg px-3.5 py-1.5 text-sm font-semibold transition-all duration-200 ${
        active
          ? "bg-brand-50 text-brand-700 ring-1 ring-brand-200"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
