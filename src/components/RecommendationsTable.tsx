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
            <div className="text-xs text-muted">${s.annual.toLocaleString()}/yr</div>
          </Card>
        ))}
      </div>

      <div className="space-y-3">
        {rows.map((r, i) => (
          <Card key={i}>
            <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
              <span className="font-semibold">{r.title}</span>
              <Badge color="purple">{r.proposed_by_agent}</Badge>
            </div>
            <div className="mb-2">
              <Badge color="blue">{mainCategoryFor(r.category)}</Badge>
              <Badge color="amber">{r.category}</Badge>
              <Badge color="green">{r.roadmap_horizon}</Badge>
              {r.is_duplicate && <Badge color="red">Possible Duplicate</Badge>}
            </div>
            <p className="text-sm text-foreground/90">{r.description}</p>
            {r.rationale && <p className="mt-1 text-xs text-muted">Rationale: {r.rationale}</p>}
            <div className="mt-3 grid grid-cols-2 gap-2 text-sm sm:grid-cols-5">
              <Metric label="Impact" value={`${r.prioritization.business_impact}/10`} />
              <Metric label="Effort" value={`${r.prioritization.implementation_effort}/10`} />
              <Metric label="ROI" value={`${r.prioritization.roi}/10`} />
              <Metric label="Confidence" value={`${Math.round(r.confidence_score * 100)}%`} />
              <Metric label="Annual Savings" value={`$${r.savings.annual_cost_savings.toLocaleString()}`} />
            </div>
            <div className="mt-2 text-xs text-muted">
              Step: {r.step_number ?? "Process-level"} | Complexity: {r.complexity} | Risk: {r.risk_level} | Source: {r.source_type}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted">{label}</div>
      <div className="font-semibold">{value}</div>
    </div>
  );
}
