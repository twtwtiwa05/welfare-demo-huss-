import { useState } from "react";
import { ShieldCheck, Check, X, ChevronDown, ChevronUp } from "lucide-react";

// ★ 증명 경계 패널 (5-A.3, 정직성 G) — 상설.
// SimBadge는 "이건 시뮬"이라고만 말한다. 이 패널은 한 발 더 나아가
// "이 데모가 증명하는 것 / 증명하지 않는 것"의 경계를 발표자가 선제적으로 밝힌다.
// 심사위원이 합성 데이터의 순환성을 공격하기 전에 자수하는 것이 정직성 무기의 본질.
export default function ProofBoundary() {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center gap-2 py-2 text-sm font-semibold text-slate-700"
        >
          <ShieldCheck size={16} className="text-brand-600" />
          이 데모가 증명하는 것 / 증명하지 않는 것
          <span className="ml-auto text-slate-400">
            {open ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </button>
        {open && (
          <div className="grid gap-3 pb-3 sm:grid-cols-2">
            <div className="rounded-lg border border-brand-200 bg-white p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-brand-700">
                <Check size={14} /> 증명하는 것
              </div>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>· 분석 파이프라인의 실제 작동</li>
                <li>· 위험 점수의 투명성·재현성 (슬라이더로 즉시 재계산)</li>
                <li>· 근거 리포트가 명단을 ‘행동’으로 바꾸는 UX</li>
              </ul>
            </div>
            <div className="rounded-lg border border-slate-300 bg-white p-3">
              <div className="mb-1.5 flex items-center gap-1.5 text-xs font-bold text-slate-500">
                <X size={14} /> 증명하지 않는 것
              </div>
              <ul className="space-y-1 text-sm text-slate-600">
                <li>· 발굴 정확도 · “몇 배 더 찾았다” 같은 수치</li>
                <li>· 실제 위험 예측력 (정답을 우리가 설계한 합성 데이터)</li>
                <li className="text-slate-400">
                  → 실데이터 파일럿에서만 검증 (기획서 6.2)
                </li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
