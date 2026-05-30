import { useState } from "react";
import StepProgressBar, { type StepDef } from "./StepProgressBar";
import Step1RawSignals from "./Step1RawSignals";
import Step2Dedup from "./Step2Dedup";
import Step3Score from "./Step3Score";
import Step4Reason from "./Step4Reason";
import Step5Priority from "./Step5Priority";
import RiskBadge from "./RiskBadge";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore } from "../lib/scoring";
import { thresholdMethod } from "../lib/priority";
import type { Household } from "../lib/types";
import { ChevronLeft, ChevronRight } from "lucide-react";

const STEPS: StepDef[] = [
  { n: 1, title: "원시 신호" },
  { n: 2, title: "정합·중복제거" },
  { n: 3, title: "투명 점수" },
  { n: 4, title: "AI 근거" },
  { n: 5, title: "우선순위" },
];

const STEP_GOAL: Record<number, string> = {
  1: "합성 가구의 위험 신호(전력·진료·우편·통신·고립)를 표로 확인합니다.",
  2: "행복e음이 이미 포착한 가구를 제거하고 '잔여' 후보만 남깁니다 (보완 레이어).",
  3: "가중합 공식으로 위험 점수를 산출합니다. 슬라이더로 즉시 재계산됩니다.",
  4: "산출된 점수와 신호를 받아 자연어 근거·권고를 생성합니다 (점수는 다시 계산하지 않음).",
  5: "임계값 방식과 조합 방식을 대조해, 조합이 추가로 건지는 케이스를 봅니다.",
};

const score = (h: Household) => computeScore(h.signals, h.profileGroup).score;
const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const byScoreDesc = (a: Household, b: Household) => score(b) - score(a);

// 발표 시연용 대표 케이스 빠른 선택 칩
interface Showcase {
  id: string;
  label: string;
}
const SHOWCASES: Showcase[] = [
  {
    id: RESIDUAL.filter((h) => h.caseType === "B").sort(byScoreDesc)[0]?.id,
    label: "유형 B · 임계미만 조합",
  },
  {
    id: RESIDUAL.filter((h) => h.caseType === "C").sort(byScoreDesc)[0]?.id,
    label: "유형 C · 중장년 특화",
  },
  {
    id: RESIDUAL.filter(
      (h) => h.groundTruthRisk === "low" && thresholdMethod(h.signals)
    )[0]?.id,
    label: "오탐 후보",
  },
  {
    id: RESIDUAL.filter((h) => h.caseType === null && score(h) >= 65).sort(
      byScoreDesc
    )[0]?.id,
    label: "일반 고위험",
  },
].filter((s) => s.id);

export default function PipelineView() {
  const [step, setStep] = useState(1);
  const [selectedId, setSelectedId] = useState(SHOWCASES[0].id);
  const selected =
    HOUSEHOLDS.find((h) => h.id === selectedId) ?? RESIDUAL[0];

  return (
    <div className="space-y-4">
      <StepProgressBar steps={STEPS} current={step} onSelect={setStep} />

      {/* 분석 대상 가구 빠른 선택 */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
        <span className="section-label">분석 대상</span>
        {SHOWCASES.map((sc) => (
          <button
            key={sc.id}
            onClick={() => setSelectedId(sc.id)}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-all duration-200 ${
              selectedId === sc.id
                ? "border-brand-600 bg-brand-600 text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-brand-300 hover:text-brand-700"
            }`}
          >
            {sc.label}
          </button>
        ))}
        <span className="ml-auto inline-flex items-center gap-2 text-sm">
          <span className="font-mono text-slate-500">{selected.id}</span>
          <RiskBadge score={score(selected)} size="sm" />
        </span>
      </div>

      {/* 단계 목표 */}
      <div className="flex items-start gap-2.5 rounded-xl border border-brand-100 bg-brand-50/60 px-4 py-2.5 text-sm text-slate-600">
        <span className="mt-px shrink-0 rounded-md bg-brand-600 px-2 py-0.5 text-xs font-bold text-white">
          STEP {step}
        </span>
        <span className="leading-relaxed">{STEP_GOAL[step]}</span>
      </div>

      {/* 단계 본문 */}
      <div key={step} className="animate-fadeIn">
        {step === 1 && (
          <Step1RawSignals selectedId={selectedId} onSelect={setSelectedId} />
        )}
        {step === 2 && <Step2Dedup />}
        {step === 3 && <Step3Score key={selected.id} household={selected} />}
        {step === 4 && <Step4Reason key={selected.id} household={selected} />}
        {step === 5 && <Step5Priority onSelect={setSelectedId} />}
      </div>

      {/* 이전/다음 */}
      <div className="flex items-center justify-between pt-2">
        <button
          onClick={() => setStep((s) => Math.max(1, s - 1))}
          disabled={step === 1}
          className="btn-secondary"
        >
          <ChevronLeft size={16} /> 이전
        </button>
        <span className="text-xs font-medium text-slate-400">
          {step} / {STEPS.length}
        </span>
        <button
          onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))}
          disabled={step === STEPS.length}
          className="btn-primary"
        >
          다음 <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
