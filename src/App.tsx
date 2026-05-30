import { useState } from "react";
import PipelineView from "./components/PipelineView";
import BeforeAfterView from "./components/BeforeAfterView";
import Dashboard from "./components/Dashboard";
import ProofBoundary from "./components/ProofBoundary";
import { GitBranch, LayoutDashboard, Sparkles } from "lucide-react";

type Tab = "pipeline" | "impact" | "dashboard";

export default function App() {
  const [tab, setTab] = useState<Tab>("pipeline");

  return (
    <div className="min-h-screen">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h1 className="text-xl font-bold text-slate-800">
                복지망 잔여 사각지대 발굴·모니터링{" "}
                <span className="text-brand-600">AI 에이전트</span>
              </h1>
              <p className="mt-0.5 text-sm text-slate-500">
                데이터로는 이기지 않는다 · 해석·특화·활용도로 보완한다 · 최종
                판단은 사람
              </p>
            </div>
            <nav className="flex gap-1 rounded-lg bg-slate-100 p-1">
              <TabButton
                active={tab === "pipeline"}
                onClick={() => setTab("pipeline")}
                icon={<GitBranch size={16} />}
                label="파이프라인"
              />
              <TabButton
                active={tab === "impact"}
                onClick={() => setTab("impact")}
                icon={<Sparkles size={16} />}
                label="활용도 ③"
              />
              <TabButton
                active={tab === "dashboard"}
                onClick={() => setTab("dashboard")}
                icon={<LayoutDashboard size={16} />}
                label="대시보드"
              />
            </nav>
          </div>
        </div>
      </header>

      {/* 증명 경계 패널 — 상설 */}
      <ProofBoundary />

      <main className="mx-auto max-w-6xl px-4 py-6">
        {tab === "pipeline" && <PipelineView />}
        {tab === "impact" && <BeforeAfterView />}
        {tab === "dashboard" && <Dashboard />}
      </main>
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
      className={`inline-flex items-center gap-2 rounded-md px-3 py-1.5 text-sm font-semibold transition-colors ${
        active
          ? "bg-white text-brand-700 shadow-sm"
          : "text-slate-500 hover:text-slate-700"
      }`}
    >
      {icon}
      {label}
    </button>
  );
}
