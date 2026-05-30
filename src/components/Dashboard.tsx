import { useState } from "react";
import Heatmap from "./Heatmap";
import CandidateList from "./CandidateList";
import CaseDetail from "./CaseDetail";
import RisingTop from "./RisingTop";
import { HOUSEHOLDS } from "../lib/data";
import { computeScore } from "../lib/scoring";
import type { Household } from "../lib/types";

const RESIDUAL = HOUSEHOLDS.filter((h) => !h.haengbokFlagged);
const sc = (h: Household) => computeScore(h.signals, h.profileGroup).score;
const DEFAULT_ID = [...RESIDUAL].sort((a, b) => sc(b) - sc(a))[0]?.id ?? "";

// 대시보드 — 기획서 3장 목업의 실동작 버전. 발굴 + 모니터링.
export default function Dashboard() {
  const [selectedId, setSelectedId] = useState(DEFAULT_ID);
  const selected = HOUSEHOLDS.find((h) => h.id === selectedId) ?? RESIDUAL[0];

  return (
    <div className="space-y-4">
      <Heatmap />
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="space-y-4">
          <RisingTop selectedId={selectedId} onSelect={setSelectedId} />
          <CandidateList selectedId={selectedId} onSelect={setSelectedId} />
        </div>
        <CaseDetail key={selected.id} household={selected} />
      </div>
    </div>
  );
}
