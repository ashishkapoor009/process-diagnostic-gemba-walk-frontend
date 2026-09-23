"use client";

import { useMemo } from "react";
import type { ProcessStepDiagnostic, Recommendation } from "@/lib/types";
import { Badge } from "@/components/ui";

export function RecommendationsByStepTable({
  diagnostics,
  recommendations,
}: {
  diagnostics: ProcessStepDiagnostic[];
  recommendations: Recommendation[];
}) {
  const stepNameByNumber = useMemo(() => {
    const m = new Map<number, string>();
    for (const d of diagnostics) m.set(d.step_number, d.step_name);
    return m;
  }, [diagnostics]);

  const active = recommendations.filter((r) => !r.is_duplicate);

  const grouped = useMemo(() => {
    const groups = new Map<string, Recommendation[]>();
    for (const r of active) {
      const key = r.step_number != null ? String(r.step_number) : "process-level";
      if (!groups.has(key)) groups.set(key, []);
      groups.get(key)!.push(r);
    }
    return Array.from(groups.entries()).sort(([a], [b]) => {
      if (a === "process-level") return 1;
      if (b === "process-level") return -1;
      return Number(a) - Number(b);
    });
  }, [active]);

  if (grouped.length === 0) {
    return <p className="text-sm text-muted">No recommendations to map to process steps yet.</p>;
  }

  return (
    <div className="space-y-5">
      {grouped.map(([stepKey, recs]) => (
        <div key={stepKey}>
          <div className="mb-2 text-sm font-semibold">
            {stepKey === "process-level"
              ? "Process-level"
              : `Step ${stepKey}: ${stepNameByNumber.get(Number(stepKey)) ?? ""}`}
          </div>
          <div className="overflow-x-auto rounded-xl border border-border">
            <table className="w-full text-sm">
              <thead className="bg-surface">
                <tr className="text-left">
                  <Th>Recommendation</Th>
                  <Th>Problem Statement</Th>
                  <Th>Category</Th>
                  <Th>Horizon</Th>
                </tr>
              </thead>
              <tbody>
                {recs.map((r, i) => (
                  <tr key={i} className="border-t border-border align-top">
                    <Td className="font-medium">{r.title}</Td>
                    <Td>{r.problem_statement || <span className="text-muted">Not stated</span>}</Td>
                    <Td>
                      <Badge color="amber">{r.category}</Badge>
                    </Td>
                    <Td>{r.roadmap_horizon}</Td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 font-semibold text-muted">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
