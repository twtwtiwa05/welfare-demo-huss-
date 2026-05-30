// 케이스 상세의 '운영 메타' — 진짜 케이스 관리 화면처럼 보이게 하는 보조 필드.
// households.json엔 없는 값이므로 id에서 결정론적으로 생성한다(재현 가능, 합성).
// 개인정보는 마스킹해 표시한다 — 실제 행정 도구의 개인정보 보호 톤을 반영.

import type { Household } from "./types";

/** id의 숫자 부분을 시드로 사용 (예: "라-1894" → 1894) */
function seedOf(id: string): number {
  const m = id.match(/(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

export type Priority = "P1" | "P2" | "P3";

export interface CaseMeta {
  priority: Priority;
  priorityLabel: string;
  maskedPhone: string;
  maskedAddress: string;
  lastContactDays: number;
  managerNote: string;
}

const PRIORITY_LABEL: Record<Priority, string> = {
  P1: "긴급",
  P2: "주의",
  P3: "관찰",
};

export function priorityOf(score: number): Priority {
  if (score >= 65) return "P1";
  if (score >= 45) return "P2";
  return "P3";
}

/** 결정론적 운영 메타 생성 (모두 합성·마스킹) */
export function caseMeta(h: Household, score: number): CaseMeta {
  const s = seedOf(h.id);
  const priority = priorityOf(score);
  const last4 = String(s).padStart(4, "0").slice(-4);
  const block = (s % 90) + 10; // 10~99
  const lastContactDays = s % 47; // 0~46일 전

  return {
    priority,
    priorityLabel: PRIORITY_LABEL[priority],
    maskedPhone: `010-****-${last4}`,
    maskedAddress: `${h.dong} ${block}-** (상세주소 보호)`,
    lastContactDays,
    managerNote:
      lastContactDays > 30
        ? "장기 미접촉 — 우선 확인 필요"
        : "최근 접촉 이력 있음",
  };
}

export const PRIORITY_STYLE: Record<
  Priority,
  { chip: string; dot: string }
> = {
  P1: { chip: "bg-red-100 text-red-700 border-red-200", dot: "bg-red-500" },
  P2: {
    chip: "bg-amber-100 text-amber-700 border-amber-200",
    dot: "bg-amber-500",
  },
  P3: {
    chip: "bg-slate-100 text-slate-600 border-slate-200",
    dot: "bg-slate-400",
  },
};
