"use client";

import { useMemo, useState } from "react";
import type { Recommendation } from "@/lib/types";
import { mainCategoryFor } from "@/lib/types";
import { Badge, Card } from "@/components/ui";

const MAIN_CATEGORIES = ["People", "Process", "Technology"] as const;

export function RecommendationsTable({ recommendations }: { recommendations: Recommendation[] }) {
  const [mainFilter, setMainFilter] = useState<Set<string>>(new Set(MAIN_CATEGORIES));

  const rows = useMemo(
    () => recommendations.filter((r) => mainFilter.has(mainCategoryFor(r.category))),
    [recommendations, mainFilter]
  );

  function toggleFilter(cat: string) {
    setMainFilter((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      return next;
    });
  }

  const summary = MAIN_CATEGORIES.map((cat) => {
    const items = recommendations.filter((r) => mainCategoryFor(r.category) === cat);
    return {
      cat,
      count: items.length,
      annual: items.reduce((sum, r) => sum + r.savings.annual_cost_savings, 0),
    };
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {MAIN_CATEGORIES.map((cat) => (
          <button
            key={cat}
            onClick={() => toggleFilter(cat)}
            className={`rounded-full border px-3 py-1 text-sm font-semibold transition ${
              mainFilter.has(cat)
                ? "border-brand-blue bg-brand-blue-light text-brand-blue-dark"
                : "border-border text-muted"
            }`}
          >
            {cat}
          </button>
        ))}
        <span className="ml-2 self-center text-sm text-muted">
          Showing {rows.length} of {recommendations.length}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {summary.map((s) => (
          <Card key={s.cat}>
            <div className="text-sm font-semibold">{s.cat}</div>
            <div className="text-xs text-muted">{s.count} recommendation(s)</div>
            <div className="text-xs text-muted">${s.annual.toLocaleString("en-US")}/yr</div>
          </Card>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-border">
        <table className="w-full text-sm">
          <thead className="bg-surface">
            <tr className="text-left">
              <Th>Title</Th>
              <Th>Category</Th>
              <Th>Horizon</Th>
              <Th>Step</Th>
              <Th>Agent</Th>
              <Th>Impact</Th>
              <Th>Effort</Th>
              <Th>ROI</Th>
              <Th>Confidence</Th>
              <Th>Annual Savings</Th>
              <Th>Flags</Th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-border align-top">
                <Td className="min-w-[220px]">
                  <div className="font-medium">{r.title}</div>
                  <div className="mt-0.5 line-clamp-2 text-xs text-muted" title={r.description}>
                    {r.description}
                  </div>
                </Td>
                <Td className="min-w-[150px]">
                  <Badge color="blue">{mainCategoryFor(r.category)}</Badge>
                  <Badge color="amber">{r.category}</Badge>
                </Td>
                <Td className="whitespace-nowrap">{r.roadmap_horizon}</Td>
                <Td>{r.step_number ?? "Process-level"}</Td>
                <Td className="whitespace-nowrap">{r.proposed_by_agent}</Td>
                <Td>{r.prioritization.business_impact}/10</Td>
                <Td>{r.prioritization.implementation_effort}/10</Td>
                <Td>{r.prioritization.roi}/10</Td>
                <Td>{Math.round(r.confidence_score * 100)}%</Td>
                <Td className="whitespace-nowrap">${r.savings.annual_cost_savings.toLocaleString("en-US")}</Td>
                <Td>{r.is_duplicate && <Badge color="red">Possible Duplicate</Badge>}</Td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="whitespace-nowrap px-3 py-2 font-semibold text-muted">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}
