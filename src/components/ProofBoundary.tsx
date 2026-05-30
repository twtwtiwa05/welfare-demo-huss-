import { useState } from "react";
import { ShieldCheck, Check, X, ChevronDown } from "lucide-react";

// ★ 증명 경계 패널 (5-A.3, 정직성 G) — 상설.
// SimBadge는 "이건 시뮬"이라고만 말한다. 이 패널은 한 발 더 나아가
// "이 데모가 증명하는 것 / 증명하지 않는 것"의 경계를 발표자가 선제적으로 밝힌다.
// 심사위원이 합성 데이터의 순환성을 공격하기 전에 자수하는 것이 정직성 무기의 본질.
export default function ProofBoundary() {
  const [open, setOpen] = useState(true);

  return (
    <div className="border-b border-slate-200/70 bg-slate-50/70 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4">
        <button
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          className="flex w-full items-center gap-2 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:text-brand-700"
        >
          <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
            <ShieldCheck size={15} />
          </span>
          이 데모가 증명하는 것 / 증명하지 않는 것
          <ChevronDown
            size={16}
            className={`ml-auto text-slate-400 transition-transform duration-300 ${
              open ? "rotate-180" : ""
            }`}
          />
        </button>
        <div
          className={`grid transition-all duration-300 ${
            open
              ? "grid-rows-[1fr] opacity-100"
              : "grid-rows-[0fr] opacity-0"
          }`}
        >
          <div className="overflow-hidden">
            <div className="grid gap-3 pb-3.5 sm:grid-cols-2">
              <BoundaryCard
                tone="prove"
                title="증명하는 것"
                items={[
                  "분석 파이프라인의 실제 작동",
                  "위험 점수의 투명성·재현성 (슬라이더로 즉시 재계산)",
                  "근거 리포트가 명단을 ‘행동’으로 바꾸는 UX",
                ]}
              />
              <BoundaryCard
                tone="disprove"
                title="증명하지 않는 것"
                items={[
                  "발굴 정확도 · “몇 배 더 찾았다” 같은 수치",
                  "실제 위험 예측력 (정답을 우리가 설계한 합성 데이터)",
                ]}
                footnote="→ 실데이터 파일럿에서만 검증 (기획서 6.2)"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function BoundaryCard({
  tone,
  title,
  items,
  footnote,
}: {
  tone: "prove" | "disprove";
  title: string;
  items: string[];
  footnote?: string;
}) {
  const prove = tone === "prove";
  return (
    <div
      className={`card card-pad !p-3.5 ${
        prove ? "border-brand-200" : "border-slate-200"
      }`}
    >
      <div
        className={`mb-2 flex items-center gap-1.5 text-xs font-bold ${
          prove ? "text-brand-700" : "text-slate-500"
        }`}
      >
        <span
          className={`flex h-5 w-5 items-center justify-center rounded-full ${
            prove
              ? "bg-brand-100 text-brand-700"
              : "bg-slate-100 text-slate-500"
          }`}
        >
          {prove ? <Check size={13} strokeWidth={3} /> : <X size={13} strokeWidth={3} />}
        </span>
        {title}
      </div>
      <ul className="space-y-1.5 text-sm text-slate-600">
        {items.map((t) => (
          <li key={t} className="flex gap-2">
            <span
              className={`mt-2 h-1 w-1 shrink-0 rounded-full ${
                prove ? "bg-brand-400" : "bg-slate-300"
              }`}
            />
            {t}
          </li>
        ))}
        {footnote && (
          <li className="pl-3 pt-0.5 text-xs text-slate-400">{footnote}</li>
        )}
      </ul>
    </div>
  );
}
